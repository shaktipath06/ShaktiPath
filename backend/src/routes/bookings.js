import { Router } from 'express';
import { bookingItem } from '../lib/format.js';
import { nowInIst } from '../lib/time.js';
import { HttpError, isEmail, isIsoDate, isTime, isTrue, normalizePhone, text, toInt } from '../lib/validate.js';
import { createBooking, getBookingByRef } from '../repos/bookings.js';

const router = Router();

/**
 * POST /api/bookings
 * {
 *   "tantricSlug": "acharya-rudranath", "serviceId": 1, "date": "2026-10-13", "time": "11:00",
 *   "customer": { "name": "Anchal Rawat", "email": "anchal@example.com", "phone": "98765 43210" },
 *   "purpose": "optional note", "couponCode": "WELCOME10",
 *   "consent": { "terms": true, "age": true, "marketing": false }
 * }
 * Creates a pending booking; payment is confirmed separately.
 */
router.post('/', async (req, res) => {
  const body = req.body || {};
  const customer = body.customer || {};
  const consent = body.consent || {};

  const tantricSlug = text(body.tantricSlug, { max: 120, required: true, name: 'tantricSlug' });
  const serviceId = toInt(body.serviceId, 0);
  if (!serviceId) throw new HttpError(400, 'serviceId is required');
  if (!isIsoDate(body.date)) throw new HttpError(400, 'date must be YYYY-MM-DD');
  if (body.date < nowInIst().date) throw new HttpError(400, 'date must be today or later');
  if (!isTime(body.time)) throw new HttpError(400, 'time must be HH:MM (24-hour)');

  const name = text(customer.name, { max: 120, required: true, name: 'Full name' });
  if (name.length < 2) throw new HttpError(400, 'Full name is too short');
  if (!isEmail(customer.email)) throw new HttpError(400, 'A valid email address is required');
  const phone = normalizePhone(customer.phone);
  if (!phone) throw new HttpError(400, 'A valid mobile number is required');
  if (!isTrue(consent.terms)) throw new HttpError(400, 'You must accept the Terms & Conditions and Privacy Policy');
  if (!isTrue(consent.age)) throw new HttpError(400, 'You must confirm you are 18 years of age or older');

  const booking = await createBooking({
    tantricSlug,
    serviceId,
    date: body.date,
    time: body.time,
    customer: { name, email: String(customer.email).trim().toLowerCase(), phone },
    purpose: text(body.purpose, { max: 2000 }),
    couponCode: text(body.couponCode, { max: 40 }),
    mode: ['video', 'audio', 'in_person', 'remote_ritual'].includes(body.mode) ? body.mode : undefined,
    consent: { terms: true, age: true, marketing: isTrue(consent.marketing) },
    userId: null,
  });
  res.status(201).json({ booking: bookingItem(booking) });
});

/** GET /api/bookings/:ref : the confirmation page payload. */
router.get('/:ref', async (req, res) => {
  const row = await getBookingByRef(String(req.params.ref).toUpperCase());
  if (!row) throw new HttpError(404, 'Booking not found');
  res.json({ booking: bookingItem(row) });
});

export default router;
