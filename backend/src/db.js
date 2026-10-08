// MySQL connection pool (mysql2). One pool per process; all queries go through query().
import mysql from 'mysql2/promise';
import { config } from './config.js';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...config.db,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: 'Z',
      dateStrings: true,
      supportBigNumbers: true,
      decimalNumbers: true,
    });
    // Bookings and timestamps are in Indian Standard Time regardless of where the server runs.
    pool.on('connection', (conn) => {
      conn.query("SET time_zone = '+05:30'");
    });
  }
  return pool;
}

/** Run a parameterised query and return the rows. */
export async function query(sql, params = []) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

/** True when the database answers a trivial query. */
export async function pingDb() {
  try {
    await getPool().query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
