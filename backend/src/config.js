// Central configuration. Everything comes from environment variables (see .env.example).
import 'dotenv/config';

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
      ssl: u.searchParams.get('ssl') === 'true' || u.searchParams.get('sslaccept') === 'strict',
    };
  } catch {
    console.warn('DATABASE_URL is not a valid URL; ignoring it.');
    return {};
  }
}

const fromUrl = env.DATABASE_URL ? parseDatabaseUrl(env.DATABASE_URL) : {};
const nodeEnv = env.NODE_ENV || 'development';
const useSsl = env.DB_SSL === 'true' || fromUrl.ssl === true;

export const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(env.PORT) || 4000,
  corsOrigins: (env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  db: {
    host: env.DB_HOST || fromUrl.host || '127.0.0.1',
    port: Number(env.DB_PORT) || fromUrl.port || 3306,
    user: env.DB_USER || fromUrl.user || 'root',
    password: env.DB_PASSWORD ?? fromUrl.password ?? '',
    database: env.DB_NAME || fromUrl.database || 'shaktipath',
    ssl: useSsl ? { rejectUnauthorized: true } : undefined,
  },
  // In development the API serves sample content when MySQL is down, unless told otherwise.
  // In production it has to be switched on explicitly.
  useSampleFallback:
    env.USE_SAMPLE_FALLBACK === 'true' || (nodeEnv !== 'production' && env.USE_SAMPLE_FALLBACK !== 'false'),
};
