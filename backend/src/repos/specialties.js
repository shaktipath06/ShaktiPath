import { query } from '../db.js';

/** Every specialty with the number of active practitioners offering it (for the filter counts). */
export async function listSpecialties() {
  return query(
    `SELECT s.id, s.slug, s.name, s.icon, COUNT(t.id) AS tantric_count
     FROM specialties s
     LEFT JOIN tantric_specialties ts ON ts.specialty_id = s.id
     LEFT JOIN tantrics t ON t.id = ts.tantric_id AND t.is_active = 1
     GROUP BY s.id, s.slug, s.name, s.icon, s.sort_order
     ORDER BY s.sort_order ASC, s.name ASC`,
  );
}
