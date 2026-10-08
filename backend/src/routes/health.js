import { Router } from 'express';
import { pingDb } from '../db.js';
import { config } from '../config.js';

const router = Router();

router.get('/', async (req, res) => {
  const dbOk = await pingDb();
  res.json({
    ok: true,
    service: 'shaktipath-api',
    env: config.nodeEnv,
    db: dbOk ? 'connected' : 'unavailable',
    sampleFallback: config.useSampleFallback,
    time: new Date().toISOString(),
  });
});

export default router;
