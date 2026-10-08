// Small request-validation helpers. Throw HttpError for a 4xx response; the error handler formats it.

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    if (details) this.details = details;
  }
}

export function isEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

/** Returns a normalised phone number (10-digit Indian number or +country format) or null. */
export function normalizePhone(v) {
  let s = String(v ?? '')
    .trim()
    .replace(/[\s()-]/g, '');
  if (/^\+91\d{10}$/.test(s)) s = s.slice(3);
  if (/^0\d{10}$/.test(s)) s = s.slice(1);
  if (/^\d{10}$/.test(s)) return s;
  if (/^\+\d{8,15}$/.test(s)) return s;
  return null;
}

export function isIsoDate(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
}

export function isTime(v) {
  return typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}

/** Trimmed text or null; enforces required/max. */
export function text(v, { max = 500, required = false, name = 'This field' } = {}) {
  const s = v == null ? '' : String(v).trim();
  if (required && !s) throw new HttpError(400, `${name} is required`);
  if (s.length > max) throw new HttpError(400, `${name} must be at most ${max} characters`);
  return s || null;
}

export function toInt(v, fallback) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function toNum(v) {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function isTrue(v) {
  return v === true || v === 1 || v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/** Query-string value that may be repeated (?a=x&a=y) or comma-separated (?a=x,y). */
export function toList(v) {
  if (v == null || v === '') return [];
  const arr = Array.isArray(v) ? v : String(v).split(',');
  return arr.map((s) => String(s).trim()).filter(Boolean);
}
