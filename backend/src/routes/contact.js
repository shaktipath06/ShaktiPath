import { Router } from 'express';
import { HttpError, isEmail, normalizePhone, text } from '../lib/validate.js';
import { createContactMessage } from '../repos/contact.js';

const router = Router();

/** POST /api/contact { name, email, phone?, subject?, message } : stores a Contact Us message. */
router.post('/', async (req, res) => {
  const body = req.body || {};
  const name = text(body.name, { max: 120, required: true, name: 'Name' });
  if (!isEmail(body.email)) throw new HttpError(400, 'A valid email address is required');
  const phone = body.phone ? normalizePhone(body.phone) : null;
  if (body.phone && !phone) throw new HttpError(400, 'Please enter a valid phone number');
  const message = text(body.message, { max: 4000, required: true, name: 'Message' });
  if (message.length < 10) throw new HttpError(400, 'Please write a few more words in your message');
  const result = await createContactMessage({
    name,
    email: String(body.email).trim().toLowerCase(),
    phone,
    subject: text(body.subject, { max: 160 }),
    message,
  });
  res.status(201).json({ ok: true, id: result.id });
});

export default router;
