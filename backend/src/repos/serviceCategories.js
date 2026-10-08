import { query } from '../db.js';

export async function listServiceCategories({ homeOnly = false } = {}) {
  return query(
    `SELECT id, slug, name, description, image_url, link_path FROM service_categories
     ${homeOnly ? 'WHERE show_on_home = 1' : ''} ORDER BY sort_order ASC, id ASC`,
  );
}
