import { createApp } from './app.js';
import { config } from './config.js';
import { pingDb, closeDb } from './db.js';

const app = createApp();

const server = app.listen(config.port, async () => {
  console.log(`ShaktiPath API listening on http://localhost:${config.port} (${config.nodeEnv})`);
  const ok = await pingDb();
  if (ok) {
    console.log(`MySQL connected: ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}`);
  } else {
    console.warn(
      `MySQL not reachable at ${config.db.host}:${config.db.port} (database "${config.db.database}"). ` +
        (config.useSampleFallback
          ? 'Serving built-in sample content until it is available. Check backend/.env and run "npm run db:setup".'
          : 'Requests that need the database will return 503.'),
    );
  }
});

function shutdown() {
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
