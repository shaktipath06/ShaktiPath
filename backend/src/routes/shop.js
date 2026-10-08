import { Router } from 'express';
import { withSample } from '../lib/fallback.js';
import { courseCard, productCard, productCategoryItem, productDetail } from '../lib/format.js';
import { HttpError, text, toInt, toList, toNum } from '../lib/validate.js';
import {
  PRODUCT_SORTS,
  countProducts,
  getCourseBySlug,
  getProductBySlug,
  listCourses,
  listProductCategories,
  listProducts,
} from '../repos/shop.js';

const router = Router();

router.get('/categories', async (req, res) => {
  const items = await withSample('shop.categories', async () => (await listProductCategories()).map(productCategoryItem), []);
  res.json({ items });
});

/** GET /api/shop/products?category=mala,crystals&featured=1&bestSeller=1&minPrice=&maxPrice=&minRating=&q=&sort=&page=&limit= */
router.get('/products', async (req, res) => {
  const q = req.query;
  const filters = {
    categories: toList(q.category).slice(0, 12),
    featured: q.featured === '1' || q.featured === 'true',
    bestSeller: q.bestSeller === '1' || q.bestSeller === 'true',
    minPrice: toNum(q.minPrice),
    maxPrice: toNum(q.maxPrice),
    minRating: toNum(q.minRating),
    q: text(q.q, { max: 100 }),
  };
  const sort = PRODUCT_SORTS.includes(q.sort) ? q.sort : undefined;
  const limit = Math.min(50, Math.max(1, toInt(q.limit, 12)));
  const page = Math.max(1, toInt(q.page, 1));
  const data = await withSample(
    'shop.products',
    async () => {
      const [rows, total] = await Promise.all([
        listProducts({ ...filters, sort, limit, offset: (page - 1) * limit }),
        countProducts(filters),
      ]);
      return { items: rows.map(productCard), total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
    },
    { items: [], total: 0, page: 1, limit, pages: 1 },
  );
  res.json(data);
});

router.get('/products/:slug', async (req, res) => {
  const row = await getProductBySlug(String(req.params.slug));
  if (!row) throw new HttpError(404, 'Product not found');
  res.json(productDetail(row));
});

router.get('/courses', async (req, res) => {
  const featured = req.query.featured === '1' || req.query.featured === 'true';
  const limit = Math.min(50, Math.max(1, toInt(req.query.limit, 12)));
  const items = await withSample('shop.courses', async () => (await listCourses({ featured, limit })).map(courseCard), []);
  res.json({ items });
});

router.get('/courses/:slug', async (req, res) => {
  const row = await getCourseBySlug(String(req.params.slug));
  if (!row) throw new HttpError(404, 'Course not found');
  res.json(courseCard(row));
});

export default router;
