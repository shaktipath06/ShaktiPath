// Creates the database (if allowed), applies db/schema.sql and inserts db/seed.sql.
// Usage: npm run db:setup           (schema + sample data)
//        npm run db:schema          (schema only)
//        npm run db:seed            (sample data only)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { config } from '../src/config.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const seedOnly = process.argv.includes('--seed-only');
const schemaOnly = process.argv.includes('--schema-only');

async function main() {
  const { database, ...conn } = config.db;

  const admin = await mysql.createConnection({ ...conn, multipleStatements: true });
  try {
    await admin.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Database "${database}" is ready.`);
  } catch (err) {
    if (err.code === 'ER_DBACCESS_DENIED_ERROR' || err.code === 'ER_SPECIFIC_ACCESS_DENIED_ERROR') {
      console.warn(`No permission to create databases; assuming "${database}" already exists.`);
    } else {
      throw err;
    }
  } finally {
    await admin.end();
  }

  const db = await mysql.createConnection({ ...conn, database, multipleStatements: true });
  try {
    if (!seedOnly) {
      await db.query(await fs.readFile(path.join(here, '..', 'db', 'schema.sql'), 'utf8'));
      console.log('Schema applied (db/schema.sql).');
    }
    if (!schemaOnly) {
      await db.query(await fs.readFile(path.join(here, '..', 'db', 'seed.sql'), 'utf8'));
      console.log('Sample data inserted (db/seed.sql).');
    }
    const [[counts]] = await db.query(
      `SELECT (SELECT COUNT(*) FROM tantrics) AS tantrics,
              (SELECT COUNT(*) FROM service_categories) AS service_categories,
              (SELECT COUNT(*) FROM reviews) AS reviews,
              (SELECT COUNT(*) FROM products) AS products,
              (SELECT COUNT(*) FROM courses) AS courses`,
    );
    console.log('Row counts:', counts);
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error('db:setup failed:', err.message);
  if (err.code === 'ER_ACCESS_DENIED_ERROR') console.error('Check DB_USER and DB_PASSWORD in backend/.env');
  if (err.code === 'ECONNREFUSED') console.error('Is MySQL running? On Windows: services.msc, then start "MySQL80".');
  process.exit(1);
});
