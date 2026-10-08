// Helpers for pages that read `searchParams` (a plain object whose values are strings or arrays of strings)
// and build links that keep the current filters.

export function first(v) {
  return Array.isArray(v) ? v[0] : v;
}

/** Every value of a repeated or comma-separated parameter, trimmed, without empties. */
export function many(v) {
  if (v == null || v === '') return [];
  return (Array.isArray(v) ? v : [v])
    .flatMap((s) => String(s).split(','))
    .map((s) => s.trim())
    .filter(Boolean);
}

export function text(v, max = 120) {
  const s = first(v);
  return s == null ? undefined : String(s).trim().slice(0, max) || undefined;
}

export function num(v) {
  const s = first(v);
  if (s == null || s === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export function int(v, fallback = 1) {
  const n = Number.parseInt(first(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Keeps only the given keys of a searchParams object (strings or arrays), dropping empty values. */
export function pick(params, keys) {
  const out = {};
  for (const key of keys) {
    const v = params[key];
    if (v == null || v === '') continue;
    if (Array.isArray(v)) {
      const list = v.map((s) => String(s)).filter(Boolean);
      if (list.length) out[key] = list;
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

/** Builds "/path?x=1&tag=a&tag=b" from a base path, the current params and overrides (undefined removes a key). */
export function hrefWith(basePath, params = {}, overrides = {}) {
  const merged = { ...params, ...overrides };
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null || value === '') continue;
    for (const v of Array.isArray(value) ? value : [value]) sp.append(key, String(v));
  }
  const s = sp.toString();
  return s ? `${basePath}?${s}` : basePath;
}
