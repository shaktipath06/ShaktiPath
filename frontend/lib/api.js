// Server-side access to the Express API (backend/). Runs in Server Components and Server Actions only:
// the browser never calls the API directly, so API_URL stays private and CORS is not involved.
//
// Caching (Next.js 16 Cache Components)
//   * getCached(): the response is cached with 'use cache'. Successful answers and "not found" answers keep
//     for a few minutes (cacheLife('minutes')); other failures (API down, 5xx) only for seconds, so a
//     recovering API is noticed quickly. The cached function never throws: it returns an envelope and the
//     error is raised outside the cache scope (a throw inside 'use cache' is not cached, which makes the
//     second render phase of a request miss the cache).
//   * getFresh() and post(): never cached. Used for anything that depends on "now" or writes data
//     (time slots, coupon previews, bookings). Call them from Server Actions or from components under <Suspense>.
//   * The home page keeps its sample-content fallback (SAMPLE_HOME) for development; the other pages show an
//     "unavailable" message instead, so a database or API problem is visible.
import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { connection } from 'next/server';
import { SAMPLE_HOME } from '@/content/sample-home';

const API_URL = (process.env.API_URL || 'http://localhost:4000').replace(/\/+$/, '');

/** Error with the HTTP status of the API response (0 when the API could not be reached at all). */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    if (details) this.details = details;
  }
}

export const isNotFound = (err) => Boolean(err) && err.status === 404;
export const isUnavailable = (err) => Boolean(err) && (err.status === 0 || err.status === 503);

/** Builds "?a=1&b=x,y" from a plain object; empty values are skipped and arrays are comma-joined. */
export function qs(params = {}) {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === false) continue;
    if (Array.isArray(value)) {
      if (value.length) out.set(key, value.join(','));
      continue;
    }
    out.set(key, value === true ? '1' : String(value));
  }
  const s = out.toString();
  return s ? `?${s}` : '';
}

async function request(path, init) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { accept: 'application/json', ...((init && init.headers) || {}) },
    });
  } catch (err) {
    throw new ApiError(0, `The API at ${API_URL} is not reachable (${err.message})`);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, (body && body.error) || `${path} responded ${res.status}`, body && body.details);
  }
  return body;
}

/** Like request(), but returns { ok, body } or { ok: false, status, message, details } instead of throwing. */
async function requestEnvelope(path) {
  try {
    return { ok: true, body: await request(path) };
  } catch (err) {
    return { ok: false, status: Number(err.status) || 0, message: err.message, details: err.details || null };
  }
}

async function getCachedEnvelope(path) {
  'use cache';
  cacheTag('api', path);
  const result = await requestEnvelope(path);
  cacheLife(result.ok || result.status === 404 ? 'minutes' : 'seconds');
  return result;
}

async function getCached(path) {
  const result = await getCachedEnvelope(path);
  if (!result.ok) throw new ApiError(result.status, result.message, result.details);
  return result.body;
}

function getFresh(path) {
  return request(path);
}

function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
}

// ------------------------------------------------------------------ home

/** Everything the home page lists: top tantrics, service tiles and featured reviews. */
export const getHomeData = cache(async () => {
  try {
    const data = await getCached('/api/home');
    return { ...data, source: 'api' };
  } catch (err) {
    await connection();
    console.warn(`[api] ${API_URL}/api/home is not reachable (${err.message}). Showing sample content.`);
    return { ...SAMPLE_HOME, source: 'sample' };
  }
});

// ----------------------------------------------------------- practitioners

/**
 * Find a Tantric results: { items, total, page, limit, pages }.
 * params: q, city, specialty[], category, minRating, minPrice, maxPrice, minYears, maxYears, language[],
 * mode, sort, page, limit, featured.
 */
export function searchTantrics(params = {}) {
  return getCached(`/api/tantrics${qs(params)}`);
}

/** Full profile payload (throws ApiError 404 when the slug is unknown). */
export function getTantric(slug) {
  return getCached(`/api/tantrics/${encodeURIComponent(slug)}`);
}

/** Bookable times for one day: { date, slots: [{ time, label, durationMinutes, available, reason }] }. Never cached. */
export function getSlots(slug, date) {
  return getFresh(`/api/tantrics/${encodeURIComponent(slug)}/slots${qs({ date })}`);
}

export async function getSpecialties() {
  return (await getCached('/api/specialties')).items;
}

export async function getCities() {
  return (await getCached('/api/cities')).items;
}

/** Public site settings (footer text, support hours, booking tax and cancellation window, shop rules). */
export async function getSettings() {
  return (await getCached('/api/settings')).settings;
}

/** Service groups (Online Consultation, Rituals & Pujas, ...), used to name the `category` filter. */
export async function getServiceCategories() {
  return (await getCached('/api/services/categories')).items;
}

// ------------------------------------------------------------------ shop

export async function getShopCategories() {
  return (await getCached('/api/shop/categories')).items;
}

/** params: category[], featured, bestSeller, minPrice, maxPrice, minRating, q, sort, page, limit. */
export function getProducts(params = {}) {
  return getCached(`/api/shop/products${qs(params)}`);
}

export function getProduct(slug) {
  return getCached(`/api/shop/products/${encodeURIComponent(slug)}`);
}

export async function getCourses(params = {}) {
  return (await getCached(`/api/shop/courses${qs(params)}`)).items;
}

export function getCourse(slug) {
  return getCached(`/api/shop/courses/${encodeURIComponent(slug)}`);
}

// -------------------------------------------------------------- bookings

/** Coupon preview: { coupon, amount, total }. Never cached. */
export function previewCoupon(code, amount, appliesTo = 'bookings') {
  return getFresh(`/api/coupons/${encodeURIComponent(code)}${qs({ amount, for: appliesTo })}`);
}

/** Creates a pending booking; resolves to { booking }. 400 for validation errors, 409 when the slot was just taken. */
export function createBooking(body) {
  return post('/api/bookings', body);
}

/** Booking by public reference, for the confirmation page. Never cached. */
export async function getBooking(ref) {
  return (await getFresh(`/api/bookings/${encodeURIComponent(ref)}`)).booking;
}
