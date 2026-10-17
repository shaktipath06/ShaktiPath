// Central configuration. Everything comes from environment variables (see .env.example).
import 'dotenv/config';
import fs from 'node:fs';

const env = process.env;

function parseDatabaseUrl(url) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: Number(u.port) || 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ''),
      ssl:
        u.searchParams.get('ssl') === 'true' ||
        u.searchParams.get('sslaccept') === 'strict' ||
        // Aiven's Service URI carries ?ssl-mode=REQUIRED
        /^(required|verify_ca|verify_identity)$/i.test(u.searchParams.get('ssl-mode') || u.searchParams.get('sslmode') || ''),
    };
  } catch {
    console.warn('DATABASE_URL is not a valid URL; ignoring it.');
    return {};
  }
}

/**
 * Hosts whose certificates are signed by a private CA (Aiven) need that CA to verify the server.
 * DB_SSL_CA holds either the PEM text itself (the ca.pem from the provider's console, newlines may be
 * written as "\n" when pasted on one line) or a path to the file.
 */
function readSslCa(value) {
  if (!value) return undefined;
  const text = String(value).trim();
  if (text.includes('-----BEGIN')) return text.replace(/\\n/g, '\n');
  try {
    return fs.readFileSync(text, 'utf8');
  } catch {
    console.warn(`DB_SSL_CA is neither a certificate nor a readable file (${text}); ignoring it.`);
    return undefined;
  }
}

const fromUrl = env.DATABASE_URL ? parseDatabaseUrl(env.DATABASE_URL) : {};
const urlSet = Boolean(fromUrl.host);
const nodeEnv = env.NODE_ENV || 'development';
const useSsl = env.DB_SSL === 'true' || fromUrl.ssl === true;
const sslCa = useSsl ? readSslCa(env.DB_SSL_CA) : undefined;

export const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(env.PORT) || 4000,
  corsOrigins: (env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  // DATABASE_URL, when set and valid, is the whole connection and wins over the DB_* fields (so a cloud
  // URL can be dropped into a .env that still lists the local MySQL fields).
  db: {
    host: urlSet ? fromUrl.host : env.DB_HOST || '127.0.0.1',
    port: urlSet ? fromUrl.port : Number(env.DB_PORT) || 3306,
    user: urlSet ? fromUrl.user || 'root' : env.DB_USER || 'root',
    password: urlSet ? fromUrl.password : env.DB_PASSWORD ?? '',
    database: urlSet ? fromUrl.database || 'shaktipath' : env.DB_NAME || 'shaktipath',
    ssl: useSsl ? { rejectUnauthorized: true, ...(sslCa ? { ca: sslCa } : {}) } : undefined,
  },
  // In development the API serves sample content when MySQL is down, unless told otherwise.
  // In production it has to be switched on explicitly.
  useSampleFallback:
    env.USE_SAMPLE_FALLBACK === 'true' || (nodeEnv !== 'production' && env.USE_SAMPLE_FALLBACK !== 'false'),
};
