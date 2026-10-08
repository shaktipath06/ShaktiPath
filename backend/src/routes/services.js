import { Router } from 'express';
import { withSample } from '../lib/fallback.js';
import { serviceCategoryTile } from '../lib/format.js';
import { listServiceCategories } from '../repos/serviceCategories.js';
import { sample } from '../data/sample.js';

const router = Router();

router.get('/categories', async (req, res) => {
  const homeOnly = req.query.home === '1' || req.query.home === 'true';
  const items = await withSample(
    'services.categories',
    async () => (await listServiceCategories({ homeOnly })).map(serviceCategoryTile),
    sample.serviceCategories,
  );
  res.json({ items });
});

export default router;
