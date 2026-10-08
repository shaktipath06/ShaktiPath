# ShaktiPath backend (Express + MySQL)

The JSON API the website reads from and writes to. Node 20+, Express 5, `mysql2`.
See the [project README](../README.md) for the full setup and deployment guide.

```bash
npm install
cp .env.example .env         # fill in DB_PASSWORD (quote it if it contains # or spaces)
npm run db:setup             # creates the database, applies db/schema.sql, inserts db/seed.sql
npm run dev                  # http://localhost:4000 (restarts on file changes)
npm start                    # production
```

## Endpoints

| Method and path | Purpose |
| --- | --- |
| `GET /api/health` | `{ ok, db: "connected" \| "unavailable", ... }` |
| `GET /api/home` | `{ tantrics[6], serviceCategories[6], reviews[3] }` for the home page |
| `GET /api/tantrics` | Search. Query: `city`, `specialty` (slugs, comma-separated or repeated, any match), `category` (service-category slug, e.g. `rituals-pujas`: practitioners offering a service in it), `minRating`, `minPrice`, `maxPrice`, `minYears` (inclusive), `maxYears` (exclusive), `language` (comma-separated or repeated, any match), `mode=online\|offline`, `q`, `sort=rating\|popular\|experience\|price_asc\|price_desc`, `page`, `limit`, `featured=1` |
| `GET /api/tantrics/:slug` | Profile: specialties, services, photos, certifications, rating distribution, reviews, similar practitioners, `availableFrom` (first day in the next 14 with an open slot, or null) |
| `GET /api/tantrics/:slug/slots?date=YYYY-MM-DD` | Bookable times for a day (past and booked slots are returned with `available: false` and a `reason`) |
| `GET /api/specialties` | Specialties with practitioner counts (filter sidebar) |
| `GET /api/cities` | Cities with practitioner counts |
| `GET /api/settings` | Public site settings: `footer.*`, `support.*`, `app.*`, `booking.cancel_hours`, `booking.tax_percent`, `shop.*` |
| `GET /api/services/categories?home=1` | Service groups (their `href` is where the home page tile links, e.g. `/consult?category=rituals-pujas`) |
| `GET /api/reviews?featured=1&tantric=slug&limit=` | Published reviews |
| `GET /api/shop/categories` | Shop categories with the number of active products in each (`count`; the Courses category counts courses) |
| `GET /api/shop/products` | Query: `category` (slugs, comma-separated or repeated), `featured=1`, `bestSeller=1`, `minPrice`, `maxPrice`, `minRating`, `q`, `sort=popular\|rating\|price_asc\|price_desc\|newest`, `page`, `limit` |
| `GET /api/shop/products/:slug` | Product detail |
| `GET /api/shop/courses?featured=1` and `GET /api/shop/courses/:slug` | Courses |
| `GET /api/coupons/:code?amount=2500&for=bookings\|orders` | Preview a coupon ("Apply Coupon") |
| `POST /api/bookings` | Create a pending booking (body below). Returns `201 { booking }`; `409` when the slot was just taken |
| `GET /api/bookings/:ref` | Booking by public reference (confirmation page) |
| `POST /api/contact` | Store a Contact Us message `{ name, email, phone?, subject?, message }` |

`POST /api/bookings` body:

```json
{
  "tantricSlug": "acharya-rudranath",
  "serviceId": 1,
  "date": "2026-10-13",
  "time": "11:00",
  "customer": { "name": "Anchal Rawat", "email": "anchal@example.com", "phone": "98765 43210" },
  "purpose": "optional note",
  "couponCode": "WELCOME10",
  "consent": { "terms": true, "age": true, "marketing": false }
}
```

Validation errors return `400 { "error": "..." }`. The booking is created with `status: "pending"`; payment
confirmation is a separate step (the `payments` table is ready for a gateway such as Razorpay), and the
website calls this endpoint from a Server Action, never from the browser.

## Layout

| Path | What |
| --- | --- |
| `src/server.js` | Starts the HTTP server |
| `src/app.js` | Express app: security headers, CORS, logging, routes, error handling |
| `src/config.js` | Environment variables (also accepts `DATABASE_URL`) |
| `src/db.js` | MySQL connection pool (session time zone pinned to IST) |
| `src/routes/` | HTTP handlers and request validation |
| `src/repos/` | SQL queries: `tantrics`, `availability` (slot computation), `bookings` (transaction), `coupons`, `shop`, `reviews`, `specialties`, `settings`, `contact` |
| `src/lib/format.js` | Row-to-JSON shaping (the "320+" label and "25% OFF" are computed here) |
| `src/lib/validate.js`, `src/lib/time.js` | Validation helpers; IST date and time helpers |
| `src/lib/fallback.js`, `src/data/sample.js` | Sample-content fallback for development when MySQL is down |
| `db/schema.sql` | Tables (see the project README for the list) |
| `db/seed.sql` | Sample rows matching the approved design, safe to re-run (it also corrects the service-tile links on databases seeded before the Find a Tantric page existed) |
| `scripts/db-setup.js` | Applies schema and seed using the `.env` connection |
