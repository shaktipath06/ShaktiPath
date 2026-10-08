import { query } from '../db.js';

const PRODUCT_COLS = `p.id, p.slug, p.sku, p.name, p.subtitle, p.price, p.mrp, p.image_url, p.rating_avg, p.rating_count,
  p.stock_qty, p.is_featured, p.is_best_seller, c.slug AS category_slug, c.name AS category_name`;

const SORTS = {
  popular: 'p.is_best_seller DESC, p.rating_count DESC, p.rating_avg DESC',
  rating: 'p.rating_avg DESC, p.rating_count DESC',
  price_asc: 'p.price ASC',
  price_desc: 'p.price DESC',
  newest: 'p.created_at DESC',
};
export const PRODUCT_SORTS = Object.keys(SORTS);

/** Categories with the number of active products in each (the filter counts). Courses are counted from the courses table. */
export async function listProductCategories() {
  return query(
    `SELECT c.id, c.slug, c.name, c.image_url, c.icon,
            CASE WHEN c.slug = 'courses' THEN (SELECT COUNT(*) FROM courses k WHERE k.is_active = 1)
                 ELSE (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) END AS product_count
     FROM product_categories c ORDER BY c.sort_order ASC, c.name ASC`,
  );
}

function buildWhere(f = {}) {
  const where = ['p.is_active = 1'];
  const params = [];
  const categories = f.categories && f.categories.length ? f.categories : f.category ? [f.category] : [];
  if (categories.length) {
    where.push(`c.slug IN (${categories.map(() => '?').join(',')})`);
    params.push(...categories);
  }
  if (f.featured) where.push('p.is_featured = 1');
  if (f.bestSeller) where.push('p.is_best_seller = 1');
  if (f.minPrice != null) {
    where.push('p.price >= ?');
    params.push(f.minPrice);
  }
  if (f.maxPrice != null) {
    where.push('p.price <= ?');
    params.push(f.maxPrice);
  }
  if (f.minRating != null) {
    where.push('p.rating_avg >= ?');
    params.push(f.minRating);
  }
  if (f.q) {
    where.push('(p.name LIKE ? OR p.subtitle LIKE ? OR p.description LIKE ?)');
    const like = `%${f.q}%`;
    params.push(like, like, like);
  }
  return { where: where.join(' AND '), params };
}

export async function listProducts({ limit = 12, offset = 0, sort, ...filters } = {}) {
  const { where, params } = buildWhere(filters);
  const order = SORTS[sort] || SORTS.popular;
  return query(
    `SELECT ${PRODUCT_COLS} FROM products p LEFT JOIN product_categories c ON c.id = p.category_id
     WHERE ${where} ORDER BY ${order}, p.id ASC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)],
  );
}

export async function countProducts(filters = {}) {
  const { where, params } = buildWhere(filters);
  const [row] = await query(
    `SELECT COUNT(*) AS n FROM products p LEFT JOIN product_categories c ON c.id = p.category_id WHERE ${where}`,
    params,
  );
  return Number(row.n);
}

export async function getProductBySlug(slug) {
  const rows = await query(
    `SELECT ${PRODUCT_COLS}, p.description, p.gallery FROM products p LEFT JOIN product_categories c ON c.id = p.category_id
     WHERE p.slug = ? AND p.is_active = 1 LIMIT 1`,
    [slug],
  );
  return rows[0] || null;
}

export async function listCourses({ featured = false, limit = 12 } = {}) {
  return query(
    `SELECT k.id, k.slug, k.title, k.description, k.level, k.meta_label, k.meta_icon, k.modules_count, k.price, k.mrp, k.image_url,
            t.slug AS instructor_slug, t.display_name AS instructor_name
     FROM courses k LEFT JOIN tantrics t ON t.id = k.instructor_id
     WHERE k.is_active = 1 ${featured ? 'AND k.is_featured = 1' : ''}
     ORDER BY k.sort_order ASC, k.id ASC LIMIT ?`,
    [Number(limit)],
  );
}

export async function getCourseBySlug(slug) {
  const rows = await query(
    `SELECT k.id, k.slug, k.title, k.description, k.level, k.meta_label, k.meta_icon, k.modules_count, k.price, k.mrp, k.image_url,
            t.slug AS instructor_slug, t.display_name AS instructor_name
     FROM courses k LEFT JOIN tantrics t ON t.id = k.instructor_id WHERE k.slug = ? AND k.is_active = 1 LIMIT 1`,
    [slug],
  );
  return rows[0] || null;
}
