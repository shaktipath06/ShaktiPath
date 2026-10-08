import { config } from '../config.js';

const warned = new Set();

/**
 * Load from the database. If that fails and the sample fallback is enabled (development),
 * return the built-in sample content instead so the site keeps rendering. In production the
 * caller gets a 503.
 */
export async function withSample(name, loadFromDb, sample) {
  try {
    return await loadFromDb();
  } catch (err) {
    if (!config.useSampleFallback) {
      const e = new Error('Database unavailable');
      e.status = 503;
      e.cause = err;
      throw e;
    }
    if (!warned.has(name)) {
      warned.add(name);
      console.warn(`[sample-fallback] ${name}: ${err.code || err.message}. Serving sample content.`);
    }
    return typeof sample === 'function' ? sample() : sample;
  }
}
