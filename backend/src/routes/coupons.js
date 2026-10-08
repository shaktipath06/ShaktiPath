import { Router } from 'express';
import { couponItem } from '../lib/format.js';
import { HttpError, toNum } from '../lib/validate.js';
import { findCouponByCode, validateCoupon } from '../repos/coupons.js';

const router = Router();

/** GET /api/coupons/WELCOME10?amount=2500&for=bookings : preview a coupon before paying. */
router.get('/:code', async (req, res) => {
  const amount = toNum(req.query.amount);
  if (amount == null || amount < 0) throw new HttpError(400, 'amount is required');
  const appliesTo = req.query.for === 'orders' ? 'orders' : 'bookings';
  const coupon = await findCouponByCode(String(req.params.code));
  const check = validateCoupon(coupon, { amount, appliesTo });
  if (!check.ok) throw new HttpError(400, check.reason);
  res.json({ coupon: couponItem(coupon, check.discount), amount, total: Math.round((amount - check.discount) * 100) / 100 });
});

export default router;
