'use server';

// Server Actions used by the interactive parts of the booking flow. They run on the server, call the
// Express API through lib/api.js and return plain objects to the client components that invoked them.
import { redirect } from 'next/navigation';
import { createBooking, getSlots, previewCoupon } from './api';
import { isIsoDate } from './format';

/** Time slots for a practitioner on one day; the date picker calls this when the date changes. */
export async function fetchSlots(slug, date) {
  if (typeof slug !== 'string' || !isIsoDate(date)) return { date, slots: [] };
  try {
    return await getSlots(slug, date);
  } catch (err) {
    return { date, slots: [], error: 'Could not load the available times. Please try again.' };
  }
}

/** "Apply Coupon" preview for a booking amount. */
export async function applyCoupon(code, amount) {
  const clean = String(code || '')
    .trim()
    .toUpperCase();
  if (!clean) return { ok: false, error: 'Enter a coupon code first.' };
  try {
    const result = await previewCoupon(clean, Number(amount) || 0, 'bookings');
    return {
      ok: true,
      code: result.coupon.code,
      description: result.coupon.description,
      discount: result.discount,
      total: result.total,
    };
  } catch (err) {
    const known = err && err.status && err.status < 500;
    return { ok: false, error: known ? err.message : 'We could not check the coupon right now. Please try again.' };
  }
}

/**
 * Submits the Book Your Session form (used with useActionState). On success the browser is redirected to
 * the confirmation page; otherwise { error, slotTaken } is returned for the form to display.
 */
export async function submitBooking(prevState, formData) {
  const text = (key) => String(formData.get(key) || '').trim();
  const flag = (key) => formData.get(key) === 'yes';

  const body = {
    tantricSlug: text('tantricSlug'),
    serviceId: Number(text('serviceId')) || 0,
    date: text('date'),
    time: text('time'),
    customer: { name: text('name'), email: text('email'), phone: text('phone') },
    purpose: text('purpose') || undefined,
    couponCode: text('couponCode') || undefined,
    consent: { terms: flag('terms'), age: flag('age'), marketing: flag('marketing') },
  };

  if (!isIsoDate(body.date) || !body.time) {
    return { error: 'Please choose a date and a time for your session.' };
  }
  if (!body.consent.terms || !body.consent.age) {
    return { error: 'Please accept the Terms & Conditions and confirm you are 18 or older.' };
  }

  let booking;
  try {
    ({ booking } = await createBooking(body));
  } catch (err) {
    const known = err && err.status && err.status < 500;
    const slotTaken = Boolean(err && err.status === 409);
    // The slot went while the form was open: send back the day's current slots so the form can refresh them.
    let slots;
    if (slotTaken) {
      try {
        ({ slots } = await getSlots(body.tantricSlug, body.date));
      } catch {
        slots = undefined;
      }
    }
    return {
      error: known ? err.message : 'We could not save your booking right now. Please try again in a moment.',
      slotTaken,
      date: body.date,
      slots,
      at: Date.now(),
    };
  }
  redirect(`/book/confirmation/${encodeURIComponent(booking.ref)}`);
}
