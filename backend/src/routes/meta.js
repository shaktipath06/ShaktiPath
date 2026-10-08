// Lookup data for filters and page chrome: specialties, cities and public site settings.
import { Router } from 'express';
import { withSample } from '../lib/fallback.js';
import { specialtyItem } from '../lib/format.js';
import { getSettings } from '../repos/settings.js';
import { listSpecialties } from '../repos/specialties.js';
import { listCities } from '../repos/tantrics.js';

const router = Router();

router.get('/specialties', async (req, res) => {
  const items = await withSample('meta.specialties', async () => (await listSpecialties()).map(specialtyItem), []);
  res.json({ items });
});

router.get('/cities', async (req, res) => {
  const items = await withSample(
    'meta.cities',
    async () => (await listCities()).map((r) => ({ name: r.city, count: Number(r.n) })),
    [],
  );
  res.json({ items });
});

const PUBLIC_SETTING_PREFIXES = ['footer.', 'support.', 'app.', 'booking.cancel_hours', 'booking.tax_percent', 'shop.'];

/** Public site settings only (footer text, support hours, store links, booking tax and cancellation window, shop rules). */
router.get('/settings', async (req, res) => {
  const all = await withSample('meta.settings', () => getSettings(), {});
  const settings = Object.fromEntries(
    Object.entries(all).filter(([key]) => PUBLIC_SETTING_PREFIXES.some((p) => key.startsWith(p))),
  );
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ settings });
});

export default router;
