// Vercel entrypoint. Vercel's zero-config Express builder runs the default export of the first file among
// app.js, index.js, server.js, src/app.js, src/index.js and src/server.js that imports "express" as a single
// Vercel Function, so this file has to be the one that wins (and the import below is what it looks for).
// Everything else (npm start, Render, a VPS) keeps using src/server.js, which listens on a port.
import 'express';
import { createApp } from './src/app.js';

export default createApp();
