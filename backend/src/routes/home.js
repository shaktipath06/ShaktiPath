// Everything the home page needs in one round trip.
import { Router } from 'express';
import { withSample } from '../lib/fallback.js';
import { tantricCard, serviceCategoryTile, reviewItem } from '../lib/format.js';
import { listTantrics } from '../repos/tantrics.js';
import { listServiceCategories } from '../repos/serviceCategories.js';
import { listReviews } from '../repos/reviews.js';
import { sample } from '../data/sample.js';

const router = Router();

router.get('/', async (req, res) => {
  const [tantrics, serviceCategories, reviews] = await Promise.all([
    withSample(
      'home.tantrics',
      async () => (await listTantrics({ featured: true, limit: 6 })).map(tantricCard),
      sample.tantrics,
    ),
    withSample(
      'home.serviceCategories',
      async () => (await listServiceCategories({ homeOnly: true })).map(serviceCategoryTile),
      sample.serviceCategories,
    ),
    withSample(
      'home.reviews',
      async () => (await listReviews({ featured: true, limit: 3 })).map(reviewItem),
      sample.reviews,
    ),
  ]);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ tantrics, serviceCategories, reviews });
});

export default router;
