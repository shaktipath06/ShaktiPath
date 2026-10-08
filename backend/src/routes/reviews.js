import { Router } from 'express';
import { withSample } from '../lib/fallback.js';
import { reviewItem } from '../lib/format.js';
import { listReviews } from '../repos/reviews.js';
import { sample } from '../data/sample.js';

const router = Router();

router.get('/', async (req, res) => {
  const featured = req.query.featured === '1' || req.query.featured === 'true';
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const tantricSlug = req.query.tantric ? String(req.query.tantric) : null;
  const items = await withSample(
    'reviews.list',
    async () => (await listReviews({ featured, tantricSlug, limit })).map(reviewItem),
    () => sample.reviews.slice(0, limit),
  );
  res.json({ items });
});

export default router;
