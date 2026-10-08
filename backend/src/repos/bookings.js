import { getPool, query } from '../db.js';
import { HttpError } from '../lib/validate.js';
import { getSlotsForDate } from './availability.js';
import { findCouponByCode, validateCoupon } from './coupons.js';
import { getSettingNumber } from './settings.js';

const BOOKING_SELECT = `SELECT b.*, t.slug AS tantric_slug, t.display_name AS tantric_name, t.photo_url AS tantric_photo,
  c.code AS coupon_code
  FROM bookings b JOIN tantrics t ON t.id = b.tantric_id LEFT JOIN coupons c ON c.id = b.coupon_id`;

function makeRef() {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SP-${stamp}-${rand}`;
}

export async function getBookingByRef(ref) {
  const rows = await query(`${BOOKING_SELECT} WHERE b.booking_ref = ? LIMIT 1`, [ref]);
  return rows[0] || null;
}

/**
 * Creates a pending booking after checking the practitioner, the service, the slot and the coupon.
 * Payment is recorded separately (payments table) once a gateway is connected.
 */
export async function createBooking(input) {
  const [tantric] = await query('SELECT id, display_name, is_active FROM tantrics WHERE slug = ? LIMIT 1', [input.tantricSlug]);
  if (!tantric || !tantric.is_active) throw new HttpError(404, 'Practitioner not found');

  const [service] = await query(
    'SELECT id, title, price, duration_minutes, mode FROM services WHERE id = ? AND tantric_id = ? AND is_active = 1 LIMIT 1',
    [input.serviceId, tantric.id],
  );
  if (!service) throw new HttpError(400, 'This service is not offered by the practitioner');

  const slots = await getSlotsForDate(tantric.id, input.date);
  const slot = slots.find((s) => s.time === input.time);
  if (!slot) throw new HttpError(400, "That time is outside the practitioner's hours");
  if (!slot.available) {
    throw new HttpError(409, slot.reason === 'booked' ? 'That time has just been booked. Please choose another slot.' : 'That time has already passed');
  }

  const fee = Number(service.price);
  const taxPercent = await getSettingNumber('booking.tax_percent', 0);

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const exec = async (sql, params) => (await conn.query(sql, params))[0];

    let coupon = null;
    let discount = 0;
    if (input.couponCode) {
      coupon = await findCouponByCode(input.couponCode, exec, { lock: true });
      const check = validateCoupon(coupon, { amount: fee, appliesTo: 'bookings' });
      if (!check.ok) throw new HttpError(400, check.reason);
      discount = check.discount;
    }
    const tax = Math.round((fee - discount) * taxPercent) / 100;
    const total = Math.round((fee - discount + tax) * 100) / 100;

    let ref = null;
    for (let attempt = 0; attempt < 3 && !ref; attempt += 1) {
      const candidate = makeRef();
      try {
        await exec(
          `INSERT INTO bookings (booking_ref, user_id, tantric_id, service_id, service_title, booking_date, start_time,
             duration_minutes, mode, customer_name, customer_email, customer_phone, purpose, fee, discount, tax, total,
             coupon_id, consent_terms, consent_age, marketing_opt_in)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            candidate,
            input.userId ?? null,
            tantric.id,
            service.id,
            service.title,
            input.date,
            `${input.time}:00`,
            Number(service.duration_minutes) || slot.durationMinutes || 30,
            input.mode || service.mode,
            input.customer.name,
            input.customer.email,
            input.customer.phone,
            input.purpose ?? null,
            fee,
            discount,
            tax,
            total,
            coupon ? coupon.id : null,
            input.consent.terms ? 1 : 0,
            input.consent.age ? 1 : 0,
            input.consent.marketing ? 1 : 0,
          ],
        );
        ref = candidate;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' && /slot_lock/.test(err.message)) {
          throw new HttpError(409, 'That time has just been booked. Please choose another slot.');
        }
        if (err.code === 'ER_DUP_ENTRY' && /booking_ref/.test(err.message)) continue;
        throw err;
      }
    }
    if (!ref) throw new Error('Could not allocate a booking reference');

    if (coupon) await exec('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
    await conn.commit();
    return getBookingByRef(ref);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
