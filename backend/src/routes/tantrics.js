import { Router } from 'express';
import { withSample } from '../lib/fallback.js';
import {
  certificationItem,
  photoItem,
  ratingDistribution,
  reviewItem,
  serviceItem,
  specialtyItem,
  tantricCard,
  tantricDetail,
} from '../lib/format.js';
import { HttpError, isIsoDate, text, toInt, toList, toNum } from '../lib/validate.js';
import { getSlotsForDate, nextAvailableDate } from '../repos/availability.js';
import { listReviews } from '../repos/reviews.js';
import {
  TANTRIC_SORTS,
  countTantrics,
  getTantricBySlug,
  listCertificationsFor,
  listPhotosFor,
  listServicesFor,
  listSimilar,
  listSpecialtiesFor,
  listTantrics,
  ratingDistributionFor,
} from '../repos/tantrics.js';
import { sample } from '../data/sample.js';

const router = Router();

/**
 * GET /api/tantrics?featured=1&city=Varanasi&specialty=kali-sadhana,protection&category=rituals-pujas
 *   &minRating=4.5&minPrice=1000&maxPrice=3000&minYears=10&language=Hindi,English&mode=online&q=kali
 *   &sort=rating|popular|experience|price_asc|price_desc&page=1&limit=12
 * `specialty` and `language` accept comma-separated values or repeated parameters (any match).
 */
router.get('/', async (req, res) => {
  const q = req.query;
  const filters = {
    featured: q.featured === '1' || q.featured === 'true',
    city: text(q.city, { max: 80 }),
    specialties: toList(q.specialty).slice(0, 20),
    category: text(q.category, { max: 80 }),
    minRating: toNum(q.minRating),
    minPrice: toNum(q.minPrice),
    maxPrice: toNum(q.maxPrice),
    minYears: toNum(q.minYears),
    maxYears: toNum(q.maxYears),
    languages: toList(q.language)
      .map((l) => text(l, { max: 40 }))
      .filter(Boolean)
      .slice(0, 10),
    mode: ['online', 'offline'].includes(q.mode) ? q.mode : undefined,
    q: text(q.q, { max: 100 }),
  };
  const sort = TANTRIC_SORTS.includes(q.sort) ? q.sort : undefined;
  const limit = Math.min(50, Math.max(1, toInt(q.limit, 12)));
  const page = Math.max(1, toInt(q.page, 1));

  const data = await withSample(
    'tantrics.list',
    async () => {
      const [rows, total] = await Promise.all([
        listTantrics({ ...filters, sort, limit, offset: (page - 1) * limit }),
        countTantrics(filters),
      ]);
      return { items: rows.map(tantricCard), total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
    },
    () => ({ items: sample.tantrics.slice(0, limit), total: sample.tantrics.length, page: 1, limit, pages: 1 }),
  );
  res.json(data);
});

/** GET /api/tantrics/:slug : the full profile page payload. */
router.get('/:slug', async (req, res) => {
  const slug = String(req.params.slug);
  const data = await withSample(
    'tantrics.detail',
    async () => {
      const row = await getTantricBySlug(slug);
      if (!row) return null;
      const [specialties, services, photos, certifications, distribution, reviews, similar, availableFrom] = await Promise.all([
        listSpecialtiesFor(row.id),
        listServicesFor(row.id),
        listPhotosFor(row.id),
        listCertificationsFor(row.id),
        ratingDistributionFor(row.id),
        listReviews({ tantricSlug: slug, limit: 10 }),
        listSimilar(row.id, 5),
        nextAvailableDate(row.id, 14),
      ]);
      return tantricDetail(row, {
        specialties: specialties.map(specialtyItem),
        services: services.map(serviceItem),
        photos: photos.map(photoItem),
        certifications: certifications.map(certificationItem),
        ratingDistribution: ratingDistribution(distribution),
        reviews: reviews.map(reviewItem),
        similar: similar.map(tantricCard),
        availableFrom,
      });
    },
    () => sample.tantrics.find((t) => t.slug === slug) || null,
  );
  if (!data) throw new HttpError(404, 'Tantric not found');
  res.json(data);
});

/** GET /api/tantrics/:slug/slots?date=YYYY-MM-DD : bookable times for one day. */
router.get('/:slug/slots', async (req, res) => {
  const date = String(req.query.date || '');
  if (!isIsoDate(date)) throw new HttpError(400, 'date must be YYYY-MM-DD');
  const row = await getTantricBySlug(String(req.params.slug));
  if (!row) throw new HttpError(404, 'Tantric not found');
  const slots = await getSlotsForDate(row.id, date);
  res.json({ date, slots });
});

export default router;
