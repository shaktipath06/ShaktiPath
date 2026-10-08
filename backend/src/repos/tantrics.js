import { query } from '../db.js';

const CARD_COLS = `t.id, t.slug, t.display_name, t.headline, t.photo_url, t.city, t.state, t.years_experience,
  t.base_price, t.rating_avg, t.rating_count, t.is_verified,
  (SELECT GROUP_CONCAT(s.name ORDER BY ts.sort_order SEPARATOR '|') FROM tantric_specialties ts
     JOIN specialties s ON s.id = ts.specialty_id WHERE ts.tantric_id = t.id) AS tags`;

const SORTS = {
  featured: 't.is_featured DESC, t.featured_order ASC, t.rating_avg DESC, t.rating_count DESC',
  rating: 't.rating_avg DESC, t.rating_count DESC',
  popular: 't.rating_count DESC, t.rating_avg DESC',
  experience: 't.years_experience DESC, t.rating_avg DESC',
  price_asc: 't.base_price ASC, t.rating_avg DESC',
  price_desc: 't.base_price DESC, t.rating_avg DESC',
};
export const TANTRIC_SORTS = Object.keys(SORTS);

/**
 * Filters for the "Find a Tantric" page. All optional:
 * featured, city, specialties (slugs), category (service category slug, e.g. "rituals-pujas"),
 * minRating, minPrice, maxPrice, minYears, maxYears, languages (["Hindi", "English"], any match),
 * mode ("online" | "offline"), q (free text).
 */
function buildWhere(f = {}) {
  const where = ['t.is_active = 1'];
  const params = [];
  if (f.featured) where.push('t.is_featured = 1');
  if (f.city) {
    where.push('t.city = ?');
    params.push(f.city);
  }
  if (f.specialties && f.specialties.length) {
    where.push(
      `t.id IN (SELECT ts.tantric_id FROM tantric_specialties ts JOIN specialties s ON s.id = ts.specialty_id
                WHERE s.slug IN (${f.specialties.map(() => '?').join(',')}))`,
    );
    params.push(...f.specialties);
  }
  if (f.category) {
    // Practitioners who offer at least one active service in this service category.
    where.push(
      `t.id IN (SELECT sv.tantric_id FROM services sv JOIN service_categories sc ON sc.id = sv.category_id
                WHERE sc.slug = ? AND sv.is_active = 1 AND sv.tantric_id IS NOT NULL)`,
    );
    params.push(f.category);
  }
  if (f.minRating != null) {
    where.push('t.rating_avg >= ?');
    params.push(f.minRating);
  }
  if (f.minPrice != null) {
    where.push('t.base_price >= ?');
    params.push(f.minPrice);
  }
  if (f.maxPrice != null) {
    where.push('t.base_price <= ?');
    params.push(f.maxPrice);
  }
  if (f.minYears != null) {
    where.push('t.years_experience >= ?');
    params.push(f.minYears);
  }
  if (f.maxYears != null) {
    where.push('t.years_experience < ?');
    params.push(f.maxYears);
  }
  const languages = f.languages && f.languages.length ? f.languages : f.language ? [f.language] : [];
  if (languages.length) {
    where.push(`(${languages.map(() => "JSON_SEARCH(t.languages, 'one', ?) IS NOT NULL").join(' OR ')})`);
    params.push(...languages);
  }
  if (f.mode) {
    where.push('FIND_IN_SET(?, t.session_modes) > 0');
    params.push(f.mode);
  }
  if (f.q) {
    where.push('(t.display_name LIKE ? OR t.headline LIKE ? OR t.bio LIKE ?)');
    const like = `%${f.q}%`;
    params.push(like, like, like);
  }
  return { where: where.join(' AND '), params };
}

export async function listTantrics({ limit = 12, offset = 0, sort, ...filters } = {}) {
  const { where, params } = buildWhere(filters);
  const order = SORTS[sort] || (filters.featured ? SORTS.featured : SORTS.rating);
  return query(
    `SELECT ${CARD_COLS} FROM tantrics t WHERE ${where} ORDER BY ${order}, t.id ASC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)],
  );
}

export async function countTantrics(filters = {}) {
  const { where, params } = buildWhere(filters);
  const [row] = await query(`SELECT COUNT(*) AS n FROM tantrics t WHERE ${where}`, params);
  return Number(row.n);
}

export async function getTantricBySlug(slug) {
  const rows = await query(
    `SELECT ${CARD_COLS}, t.profile_photo_url, t.bio, t.mission_quote, t.consultations_count, t.languages, t.session_modes
     FROM tantrics t WHERE t.slug = ? AND t.is_active = 1 LIMIT 1`,
    [slug],
  );
  return rows[0] || null;
}

export async function listSpecialtiesFor(tantricId) {
  return query(
    `SELECT s.id, s.slug, s.name, s.icon FROM specialties s
     JOIN tantric_specialties ts ON ts.specialty_id = s.id
     WHERE ts.tantric_id = ? ORDER BY ts.sort_order ASC, s.name ASC`,
    [tantricId],
  );
}

export async function listServicesFor(tantricId) {
  return query(
    `SELECT id, title, description, price, unit, duration_minutes, mode, image_url
     FROM services WHERE tantric_id = ? AND is_active = 1 ORDER BY sort_order ASC, id ASC`,
    [tantricId],
  );
}

export async function listPhotosFor(tantricId) {
  return query('SELECT id, image_url, alt_text FROM tantric_photos WHERE tantric_id = ? ORDER BY sort_order ASC, id ASC', [
    tantricId,
  ]);
}

export async function listCertificationsFor(tantricId) {
  return query(
    'SELECT id, title, issuer, year, icon FROM tantric_certifications WHERE tantric_id = ? ORDER BY sort_order ASC, id ASC',
    [tantricId],
  );
}

export async function ratingDistributionFor(tantricId) {
  return query(
    "SELECT rating, COUNT(*) AS n FROM reviews WHERE tantric_id = ? AND status = 'published' GROUP BY rating",
    [tantricId],
  );
}

/** Practitioners who share at least one specialty, most overlap first. */
export async function listSimilar(tantricId, limit = 5) {
  return query(
    `SELECT ${CARD_COLS}, COUNT(*) AS shared FROM tantrics t
     JOIN tantric_specialties ts ON ts.tantric_id = t.id
     WHERE t.is_active = 1 AND t.id <> ?
       AND ts.specialty_id IN (SELECT specialty_id FROM tantric_specialties WHERE tantric_id = ?)
     GROUP BY t.id ORDER BY shared DESC, t.rating_avg DESC, t.rating_count DESC LIMIT ?`,
    [tantricId, tantricId, Number(limit)],
  );
}

export async function listCities() {
  return query(
    'SELECT city, COUNT(*) AS n FROM tantrics WHERE is_active = 1 AND city IS NOT NULL GROUP BY city ORDER BY n DESC, city ASC',
  );
}
