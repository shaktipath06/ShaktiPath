import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { notFound, errorHandler } from './middleware/errors.js';
import healthRouter from './routes/health.js';
import homeRouter from './routes/home.js';
import tantricsRouter from './routes/tantrics.js';
import servicesRouter from './routes/services.js';
import reviewsRouter from './routes/reviews.js';
import shopRouter from './routes/shop.js';
import bookingsRouter from './routes/bookings.js';
import couponsRouter from './routes/coupons.js';
import contactRouter from './routes/contact.js';
import metaRouter from './routes/meta.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));

  app.get('/', (req, res) => {
    res.json({
      name: 'ShaktiPath API',
      endpoints: [
        'GET /api/health',
        'GET /api/home',
        'GET /api/tantrics?city=&specialty=&category=&minRating=&minPrice=&maxPrice=&minYears=&maxYears=&language=&mode=&q=&sort=&page=',
        'GET /api/tantrics/:slug',
        'GET /api/tantrics/:slug/slots?date=YYYY-MM-DD',
        'GET /api/specialties',
        'GET /api/cities',
        'GET /api/settings',
        'GET /api/services/categories',
        'GET /api/reviews?featured=1&tantric=',
        'GET /api/shop/categories',
        'GET /api/shop/products?category=&featured=1&bestSeller=1&sort=',
        'GET /api/shop/products/:slug',
        'GET /api/shop/courses',
        'GET /api/shop/courses/:slug',
        'GET /api/coupons/:code?amount=&for=bookings|orders',
        'POST /api/bookings',
        'GET /api/bookings/:ref',
        'POST /api/contact',
      ],
    });
  });
  app.use('/api/health', healthRouter);
  app.use('/api/home', homeRouter);
  app.use('/api/tantrics', tantricsRouter);
  app.use('/api/services', servicesRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/shop', shopRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/coupons', couponsRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api', metaRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
