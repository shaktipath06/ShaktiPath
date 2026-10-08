import { query } from '../db.js';

export async function createContactMessage({ userId = null, name, email, phone, subject, message }) {
  const result = await query(
    'INSERT INTO contact_messages (user_id, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, name, email, phone, subject, message],
  );
  return { id: result.insertId };
}
