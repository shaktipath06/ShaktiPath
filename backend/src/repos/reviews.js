import { query } from '../db.js';

export async function listReviews({ featured = false, tantricSlug = null, limit = 10 } = {}) {
  const where = ["r.status = 'published'"];
  const params = [];
  if (featured) where.push('r.is_featured = 1');
  if (tantricSlug) {
    where.push('t.slug = ?');
    params.push(tantricSlug);
  }
  params.push(Number(limit));
  return query(
    `SELECT r.id, r.author_name, r.avatar_url, r.rating, r.quote, r.is_verified_booking, r.created_at,
            t.display_name AS tantric_name, t.slug AS tantric_slug
     FROM reviews r LEFT JOIN tantrics t ON t.id = r.tantric_id
     WHERE ${where.join(' AND ')}
     ORDER BY r.is_featured DESC, r.created_at DESC LIMIT ?`,
    params,
  );
}
