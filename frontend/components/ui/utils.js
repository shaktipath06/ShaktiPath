// Small helpers shared by the ShaktiPath components (ported from the design system bundle).

/** Join class names, skipping falsy values. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function has(v) {
  return v !== undefined && v !== null && v !== '';
}

/** Accept a single item or an array; null and '' become []. */
export function list(v) {
  if (Array.isArray(v)) return v;
  return v == null || v === '' ? [] : [v];
}

/** Text of a list item that may be a string, number or an object with label/title/text/name. */
export function labelOf(x) {
  if (typeof x === 'string' || typeof x === 'number') return String(x);
  return (x && (x.label || x.title || x.text || x.name)) || '';
}

/** Indian rupee formatting: 1,19,999 grouping; decimals only when present; free text passes through. */
export function inr(v) {
  if (!has(v)) return '';
  if (typeof v === 'number' && !Number.isFinite(v)) return '';
  const s = String(v)
    .trim()
    .replace(/^(?:₹|Rs\.?|INR)\s*/i, '')
    .replace(/\s*\/-$/, '');
  if (!/^-?\d[\d,]*(?:\.\d+)?$/.test(s)) return String(v);
  const n = Number(s.replace(/,/g, ''));
  return (
    (n < 0 ? '-' : '') +
    '₹' +
    Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
  );
}

export function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Internal links go through next/link; anchors and external URLs use a plain <a>. */
export function isInternalHref(href) {
  return typeof href === 'string' && href.startsWith('/');
}
