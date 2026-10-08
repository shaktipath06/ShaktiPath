import { query } from '../db.js';

/** All settings, or only the given keys, as a plain object. */
export async function getSettings(keys) {
  const where = keys && keys.length ? ` WHERE setting_key IN (${keys.map(() => '?').join(',')})` : '';
  const rows = await query(`SELECT setting_key, setting_value FROM site_settings${where}`, keys || []);
  return Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]));
}

export async function getSetting(key, fallback = null) {
  const rows = await query('SELECT setting_value FROM site_settings WHERE setting_key = ? LIMIT 1', [key]);
  return rows.length ? rows[0].setting_value : fallback;
}

export async function getSettingNumber(key, fallback = 0) {
  const v = await getSetting(key, null);
  const n = Number(v);
  return v == null || v === '' || !Number.isFinite(n) ? fallback : n;
}
