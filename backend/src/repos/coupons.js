import { query } from '../db.js';

/** Finds a coupon by code (case-insensitive). `exec` lets a transaction pass its own connection. */
export async function findCouponByCode(code, exec = query, { lock = false } = {}) {
  const rows = await exec(`SELECT * FROM coupons WHERE code = ? LIMIT 1${lock ? ' FOR UPDATE' : ''}`, [
    String(code).trim().toUpperCase(),
  ]);
  return rows[0] || null;
}

export function computeDiscount(coupon, amount) {
  const value = Number(coupon.discount_value);
  let discount = coupon.discount_type === 'percent' ? (amount * value) / 100 : value;
  if (coupon.max_discount != null) discount = Math.min(discount, Number(coupon.max_discount));
  discount = Math.min(discount, amount);
  return Math.round(discount * 100) / 100;
}

/**
 * Checks a coupon against an amount and a context ('bookings' | 'orders').
 * Returns { ok: true, discount } or { ok: false, reason }.
 */
export function validateCoupon(coupon, { amount, appliesTo }) {
  if (!coupon) return { ok: false, reason: 'This coupon code is not valid' };
  if (!coupon.is_active) return { ok: false, reason: 'This coupon is no longer active' };
  // DATETIME columns are stored and returned in IST (the pool sets the session time zone).
  const now = Date.now();
  const ist = (s) => Date.parse(`${String(s).replace(' ', 'T')}+05:30`);
  if (coupon.starts_at && ist(coupon.starts_at) > now) return { ok: false, reason: 'This coupon is not active yet' };
  if (coupon.ends_at && ist(coupon.ends_at) < now) return { ok: false, reason: 'This coupon has expired' };
  if (coupon.usage_limit != null && Number(coupon.used_count) >= Number(coupon.usage_limit)) {
    return { ok: false, reason: 'This coupon has been fully redeemed' };
  }
  if (coupon.applies_to !== 'both' && coupon.applies_to !== appliesTo) {
    return { ok: false, reason: `This coupon applies to ${coupon.applies_to} only` };
  }
  if (amount < Number(coupon.min_amount)) {
    return { ok: false, reason: `This coupon needs a minimum amount of ₹${Number(coupon.min_amount).toLocaleString('en-IN')}` };
  }
  return { ok: true, discount: computeDiscount(coupon, amount) };
}
