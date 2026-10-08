# ShaktiPath by TantraTalk

Website for ShaktiPath: Tantric consultations, bookings, a shop and courses. This repository holds the
whole project so everything can be changed in one place:

```
Tantrik/
├── frontend/   Next.js 16 website (JavaScript, App Router)          -> http://localhost:3000
├── backend/    Express 5 API on MySQL 8 (Node.js, JavaScript)       -> http://localhost:4000
├── package.json  Scripts that run both apps together (npm run dev)
└── README.md   This guide
```

The design reference files (client mockups, spec PDF, exported artifact) are in `Documetns of Tantrik/`.
The approved design is the Claude Design canvas **"ShaktiPath Website"** (five artboards: 1. Home,
2. Find a Tantric, 3. Tantric Profile, 4. Book Your Session, 5. Shop); its components and tokens come from
the **"ShaktiPath"** design-system canvas and are ported into `frontend/styles/shaktipath.css` and
`frontend/components/ui/`.

Status: **all five pages of the approved design are built** and read their records from the local MySQL
database through the API:

| Page | Route | Design artboard |
| --- | --- | --- |
| Home | `/` | 1. Home |
| Find a Tantric | `/consult` (filters in the URL, e.g. `/consult?specialty=protection&city=Varanasi`) | 2. Find a Tantric |
| Tantric Profile | `/tantrics/<slug>` (e.g. `/tantrics/acharya-rudranath`) | 3. Tantric Profile |
| Book Your Session | `/book?tantric=<slug>&service=<id>&date=YYYY-MM-DD&time=HH:MM`, then `/book/confirmation/<ref>` | 4. Book Your Session |
| Shop | `/shop` (e.g. `/shop?category=mala&sort=price_asc`) | 5. Shop |

Every other link in the header and footer (Learn, Transform, About, Blog, Contact, Help, the legal pages,
Login, Sign Up, Proceed to Checkout, View My Bookings) opens a branded "coming soon" page until that page
is built. No payment gateway, e-mail or SMS sending, checkout or user accounts exist yet (see section 9).

## 1. Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 20 or newer (24 is installed) | https://nodejs.org |
| npm | 10 or newer | comes with Node |
| MySQL | 8.0 (installed as Windows service `MySQL80`, port 3306) | MySQL Workbench is installed too |

## 2. First-time setup (local)

Open a terminal in this folder (`C:\Users\kumar\OneDrive\Desktop\Tantrik`).

```bash
# 1. Install dependencies for the root scripts, the backend and the frontend
npm run install:all

# 2. Backend environment: copy the example and fill in your MySQL root password
copy backend\.env.example backend\.env        # (macOS/Linux: cp backend/.env.example backend/.env)
#    open backend\.env and set DB_PASSWORD="<your MySQL root password>" (keep the quotes)

# 3. Create the database, tables and sample content
npm run db:setup

# 4. Frontend environment (defaults already point at http://localhost:4000)
copy frontend\.env.example frontend\.env.local

# 5. Run the API and the website together
npm run dev
```

On this machine steps 2 to 4 are already done: `backend/.env` holds the MySQL password, the `shaktipath`
database exists, and `frontend/.env.local` exists. Just run `npm run dev` and open http://localhost:3000.
The API answers at http://localhost:4000/api/health (it should say `"db": "connected"`) and
http://localhost:4000/api/home.

You can also run each app on its own: `npm run dev:backend` and `npm run dev:frontend`, or `npm run dev`
inside `backend/` or `frontend/`.

If you set the database up before 9 October 2026, run `npm run db:setup` once more: the seed now also
updates the two service-tile links (`/consult?category=rituals-pujas`, `/consult?category=sadhana-programs`)
that the Find a Tantric page filters on.

### If MySQL is not reachable

With `USE_SAMPLE_FALLBACK=true` in `backend/.env`, the API serves built-in sample content for the home
page (the same rows as `backend/db/seed.sql`) and prints a warning when it cannot reach MySQL. The home page
also falls back to sample content if the API itself is not running; the other pages show an "unavailable
right now" panel instead, so the problem is visible. Both fallbacks are for development only; the local
`.env` has it set to `false`, and production should keep it `false`.

### MySQL tips (Windows)

- Service not running: `services.msc`, find `MySQL80`, Start.
- Browse the data: MySQL Workbench, connection `root@localhost:3306`, schema `shaktipath`.
- Prefer a dedicated user instead of root? Run in Workbench, then use it in `backend/.env`:
  ```sql
  CREATE USER 'shaktipath'@'localhost' IDENTIFIED BY 'choose-a-strong-password';
  GRANT ALL PRIVILEGES ON shaktipath.* TO 'shaktipath'@'localhost';
  FLUSH PRIVILEGES;
  ```
  (`npm run db:setup` creates the `shaktipath` database itself when the user may create databases;
  otherwise create it first: `CREATE DATABASE shaktipath CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`.)
- Start over: `DROP DATABASE shaktipath;` in Workbench, then `npm run db:setup` again.

## 3. How the pieces fit

```
Browser  ->  Next.js (frontend)  ->  Express API (backend)  ->  MySQL
             renders the pages       GET /api/home, /api/tantrics ...   tables in backend/db/schema.sql
             Server Actions          POST /api/bookings, /api/coupons
```

- The website never talks to MySQL directly, and the browser never calls the API directly. Server
  Components call the API through `frontend/lib/api.js`; the interactive parts (loading time slots for a
  date, previewing a coupon, submitting a booking) go through Server Actions in `frontend/lib/actions.js`,
  which call the same API on the server. `API_URL` therefore stays private and CORS is not involved.
- Lists and profiles are cached for a few minutes (`'use cache'`, `cacheLife('minutes')`); time slots,
  coupon previews and bookings are never cached.
- Copy (headlines, trust points, filter labels, notices, button text) lives in `frontend/content/`
  (`home.js`, `consult.js`, `profile.js`, `book.js`, `shop.js`, `site.js`). Records (practitioners,
  services, time slots, reviews, products, courses, coupons, bookings) live in MySQL and come through the API.
- The design system (colours, type, spacing, 45 ported components) lives in `frontend/styles/shaktipath.css`
  and `frontend/components/ui/`. Build new pages from these components; do not restyle them from outside.
- Filters are part of the URL. The Find a Tantric and Shop pages are plain GET forms (`next/form`):
  `/consult?specialty=protection&language=Hindi&sort=experience&page=2` can be shared, bookmarked and
  linked to from anywhere (the home page tiles do this).
- The shopping cart is kept in the browser (`localStorage`, `frontend/components/shop/CartProvider.js`)
  until checkout and orders exist on the API.

### What each page does

**Find a Tantric (`/consult`)**: banner, search box, "N Tantrics Found", sort, a 4-column grid of detailed
practitioner cards and pagination; the sidebar filters are City, Expertise (with practitioner counts),
Experience, Language, Price Range and Rating. URL parameters: `q`, `city`, `specialty` (repeatable),
`category` (a service-category slug: the home page's "Rituals & Pujas" and "Sadhana Programs" tiles link
here), `exp` (`0-5`, `5-10`, `10`), `language` (repeatable), `minPrice`, `maxPrice`, `minRating`, `sort`
(`rating`, `popular`, `experience`, `price_asc`, `price_desc`), `page`. Reads `GET /api/tantrics`,
`/api/specialties`, `/api/cities`, `/api/services/categories`.

**Tantric Profile (`/tantrics/<slug>`)**: breadcrumb with Share and Save, identity card (photo, "Available
this week" when the next 14 days have an open slot, gallery thumbnails, name, verified mark, rating,
location, four stat tiles, Consult Now, Add to Favourite), About with the mission quote, Services Offered
(each Book button goes to `/book` with that service), Gallery, Certifications & Achievements, Reviews &
Ratings (average, star bars, one review at a time), Similar Tantrics, and a sidebar with the Book Your
Session panel (service, calendar, time slots that reload per day, Proceed to Booking), the Need Guidance
card and Areas of Expertise (each links to the matching filter). An unknown slug shows the 404 page.
Reads `GET /api/tantrics/:slug` and `/api/tantrics/:slug/slots`.

**Book Your Session (`/book`)**: `tantric` is required; without it the page offers the featured
practitioners. Steps: 1 Select Date, 2 Select Time (slots reload when the date changes; past and booked
slots stay visible but cannot be chosen), 3 Add Your Details (name, e-mail, mobile, purpose, consent
checkboxes), the Booking Summary with Apply Coupon (`GET /api/coupons/:code`), 4 Payment Method, Pay Now.
Submitting runs the `submitBooking` Server Action, which calls `POST /api/bookings` and redirects to
`/book/confirmation/<ref>`; a slot taken in the meantime (`409`) reloads the times with a message. The
confirmation page shows the Booking Received card (reference, date, time, amount due, Add to Calendar as
a Google Calendar link) and the summary, and marks the booking as **pending payment** because no gateway is
connected yet. Prices, GST (`booking.tax_percent`) and the cancellation window (`booking.cancel_hours`)
come from the API and `site_settings`.

**Shop (`/shop`)**: banner with trust points, the category row (click a category to filter, click it again
to clear), Featured Products, Best Sellers and Popular Spiritual Courses, with the cart and the filters
(search, categories with product counts, price range, rating) beside them. With any filter active the
page shows one result grid with pagination; selecting "Courses" lists courses (filtered by the search text
and price on the page, since courses have no search API). Add to Cart and Enrol Now put items in the
browser cart; Proceed to Checkout is still a "coming soon" page. URL parameters: `category` (repeatable),
`q`, `minPrice`, `maxPrice`, `minRating`, `sort` (`popular`, `rating`, `price_asc`, `price_desc`,
`newest`), `page`. Reads `GET /api/shop/categories`, `/api/shop/products`, `/api/shop/courses`.

**Header**: on the Find a Tantric, profile and shop pages the header carries a search field (an icon below
1360px); the cart button appears on the shop and whenever the cart holds something.

### API endpoints

| Method and path | Returns |
| --- | --- |
| `GET /api/health` | `{ ok, db: "connected" \| "unavailable", ... }` |
| `GET /api/home` | `{ tantrics[6], serviceCategories[6], reviews[3] }` for the home page |
| `GET /api/tantrics?city=&specialty=&category=&minRating=&minPrice=&maxPrice=&minYears=&maxYears=&language=&mode=&q=&sort=&page=` | Search results `{ items, total, page, limit, pages }` for Find a Tantric (`specialty` and `language` accept comma-separated values, any match; `category` is a service-category slug) |
| `GET /api/tantrics/:slug` | Full profile: specialties, services, photos, certifications, rating distribution, reviews, similar practitioners, `availableFrom` |
| `GET /api/tantrics/:slug/slots?date=YYYY-MM-DD` | Bookable time slots for a day |
| `GET /api/specialties`, `GET /api/cities`, `GET /api/settings` | Filter lists (with practitioner counts) and public site settings |
| `GET /api/services/categories?home=1` | Service groups |
| `GET /api/reviews?featured=1&tantric=slug` | Published reviews |
| `GET /api/shop/categories` (with product counts), `GET /api/shop/products?category=a,b&featured=1&bestSeller=1&minPrice=&maxPrice=&minRating=&q=&sort=&page=`, `GET /api/shop/products/:slug`, `GET /api/shop/courses?featured=1`, `GET /api/shop/courses/:slug` | Shop |
| `GET /api/coupons/:code?amount=&for=bookings` | Coupon preview ("Apply Coupon") |
| `POST /api/bookings`, `GET /api/bookings/:ref` | Create a pending booking (checks the slot and coupon) and read it back |
| `POST /api/contact` | Store a Contact Us message |

Request and response shapes are documented in [backend/README.md](backend/README.md).

### Database tables (backend/db/schema.sql)

| Group | Tables | Purpose |
| --- | --- | --- |
| Accounts | `users`, `auth_tokens`, `user_addresses` | Seekers, tantrics and admins (`role`), login/reset tokens, saved addresses |
| Practitioners | `tantrics`, `specialties`, `tantric_specialties`, `tantric_photos`, `tantric_certifications` | Profiles, expertise tags, gallery, certifications |
| Availability | `availability_rules`, `availability_overrides` | Weekly hours per practitioner and date exceptions; time slots are computed from these plus live bookings |
| Services and bookings | `service_categories`, `services`, `bookings`, `coupons`, `payments` | Service tiles, what each practitioner offers, bookings (a generated `slot_lock` column prevents double booking), discount codes, gateway payments |
| Shop | `product_categories`, `products`, `courses`, `cart_items`, `orders`, `order_items` | Catalogue, carts, orders |
| Reviews and favourites | `reviews`, `favorites` | Practitioner and product reviews (`is_featured` picks the home page ones), saved items |
| Support and settings | `contact_messages`, `site_settings` | Contact form messages, editable footer text, support hours, tax and shipping rules |

Ratings, review counts and discount percentages are stored on the record and formatted by the API
(`320+`, `25% OFF`), never typed into the pages. `npm run db:setup` is safe to re-run; `npm run db:schema`
and `npm run db:seed` run one half. The sample content (`db/seed.sql`) is labelled as placeholder data.

## 4. Environment variables

**backend/.env** (see `backend/.env.example`)

| Variable | Meaning |
| --- | --- |
| `PORT` | API port, default 4000 |
| `CORS_ORIGIN` | Comma-separated site origins allowed to call the API (only needed if a browser app calls it; the website calls it server-side) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection (quote the password if it contains `#` or spaces) |
| `DB_SSL` | `true` for cloud MySQL that requires TLS (TiDB Cloud, Aiven) |
| `DATABASE_URL` | Alternative to the `DB_*` fields: `mysql://user:password@host:3306/shaktipath` |
| `USE_SAMPLE_FALLBACK` | `true` serves sample content when MySQL is down; keep `false` once the database exists |

**frontend/.env.local** (see `frontend/.env.example`)

| Variable | Meaning |
| --- | --- |
| `API_URL` | Where the website reaches the API (server-side), for example `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used for metadata |

## 5. Working on the pages (read before changing code)

- **Next.js 16 with Cache Components.** Read `frontend/AGENTS.md` and the docs it points to
  (`frontend/node_modules/next/dist/docs/`) before writing Next.js code; several APIs differ from older
  versions. The rules that matter most here: `params` and `searchParams` are promises (`await` them);
  anything that reads them or fetches uncached data must sit under a `<Suspense>` boundary with a
  fallback (each page has skeletons for this); a function marked `'use cache'` must not read request data
  and must take serialisable arguments (see `frontend/lib/api.js`); `usePathname()` in the header is
  wrapped in `<Suspense>` in `app/layout.js` for the same reason.
- **Data goes through `frontend/lib/api.js`.** Add a helper there instead of calling `fetch` in a page.
  Cached helpers for lists and profiles, uncached ones for slots, coupons and bookings. API errors are
  `ApiError`s with the HTTP status: pages call `notFound()` on 404 and show `ApiUnavailable` when the API
  is down (status 0 or 503).
- **Writes go through Server Actions** (`frontend/lib/actions.js`, `'use server'`), called from Client
  Components; they validate, call the API and return plain objects or `redirect()`.
- **URL parameters are the state** of the Find a Tantric and Shop pages. Each page has a `parseParams()`
  that turns `searchParams` into API filters; the filter sidebar is a GET form whose field names are the
  URL parameter names. Add a filter by adding a field, a line in `parseParams()` and, if needed, an API
  filter in `backend/src/repos/`.
- **Copy lives in `frontend/content/`**, records in MySQL. Do not type names, ratings, prices or counts
  into components.
- **Components:** the ported design-system components are in `frontend/components/ui/` (one file each,
  same props as the design-system bundle where practical). Page-specific pieces live in
  `frontend/components/profile/`, `frontend/components/booking/`, `frontend/components/shop/` and the
  page folders. Page layout classes live in each page's `page.module.css`; shared ones in
  `frontend/styles/page.module.css`.
- **Dates and money:** the API and the pages use IST dates (`YYYY-MM-DD`) and 24-hour times (`HH:MM`);
  `frontend/lib/format.js` turns them into labels ("8 October 2026", "11:00 AM - 11:30 AM (30 mins)") and
  `inr()` in `components/ui/utils.js` formats rupees with Indian grouping.
- **Before you finish:** run `npm run lint` and `npm run build` in `frontend/` (the build enforces the
  Cache Components rules), then open each changed page with the API running.
- **Browser cart:** `components/shop/CartProvider.js` keeps the cart in `localStorage`
  (`shaktipath.cart.v1`). When checkout is built, replace its storage with the API (`cart_items`, `orders`).
- **Soft 404s:** an unknown practitioner slug or booking reference shows the branded not-found page, but with
  HTTP status 200, because the page's static shell is streamed before the API answers. A real 404 status
  would need the check before rendering (a `proxy.js` lookup, or `generateStaticParams` with
  `dynamicParams = false` once the practitioner list is fixed).
- **Checking a change without a browser:** `curl` the page and grep for its headings, and post the
  booking form the way a browser without JavaScript would (React renders `$ACTION_*` hidden fields; re-post
  them with the visible fields as `multipart/form-data` and expect a `303` to the confirmation page).

## 6. Deploying

Deploy in this order: database, then API, then website. Each step gives you a value the next one needs.

### 6.1 Where to get a MySQL database (free or very cheap)

Prices and limits change; these were checked in October 2026, verify on the provider's page before choosing.

| Option | Cost | Good to know |
| --- | --- | --- |
| **TiDB Cloud Starter** (MySQL-compatible, serverless) | Free monthly quota per organisation; pay only beyond it | Up to five free clusters per organisation. Works with this project's schema. TLS is required: set `DB_SSL=true`. Gives you a host, port 4000, user and password. [Cluster tiers](https://docs.pingcap.com/tidbcloud/select-cluster-tier) |
| **Aiven for MySQL, free plan** (real MySQL 8) | Free, no time limit | One free service per type per organisation: 1 CPU, 1 GB RAM, 1 GB disk, backups included. Unused services may be powered off after a notice. TLS required (`DB_SSL=true`). [Free tier docs](https://aiven.io/docs/products/mysql/concepts/mysql-free-tier), [free plan limits](https://aiven.io/docs/platform/concepts/free-plan) |
| **Railway MySQL** | New accounts get a one-time $5 trial credit for 30 days; the Hobby plan is $5/month and includes $5 of usage | One-click MySQL service, no sleep. Best if the API is also on Railway. [Pricing overview](https://thesoftwarescout.com/railway-pricing-2026-plans-costs-is-it-worth-it/) |
| **Your own small VPS** (Node + MySQL on one server) | A few dollars a month | Most control, most maintenance: you install MySQL, Node, Nginx and backups yourself. |

Not recommended: PlanetScale no longer has a free tier, and "free MySQL hosting" sites aimed at students are
not suitable for a client site. Keep the local MySQL for development only.

Once you have the host, user and password, apply the schema and sample data from your computer:

```bash
# in backend/, with the cloud connection in .env (or DATABASE_URL=... and DB_SSL=true)
npm run db:setup
```

Before launch, replace the sample content with real records (see section 8) and keep `db:seed` out of
production.

### 6.2 Hosting the API (backend/)

| Option | Cost | Good to know |
| --- | --- | --- |
| **Render, free web service** | Free (750 instance hours per month per workspace) | 512 MB RAM. Spins down after 15 minutes without traffic and takes about a minute to wake, so the first visitor after a quiet spell waits. Fine for a demo; move to the paid Starter tier for always-on. [Render free tier article](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026.md) |
| **Railway** | $5/month Hobby (includes $5 usage) | No sleeping; MySQL can live in the same project. |
| **Your own VPS** | A few dollars a month | Run with PM2 behind Nginx. |

Render setup: new Web Service from this repository, root directory `backend`, build command `npm install`,
start command `npm start`, and these environment variables: `NODE_ENV=production`, `PORT` (Render sets
it), `DATABASE_URL` or the `DB_*` fields, `DB_SSL=true` (for TiDB or Aiven),
`CORS_ORIGIN=https://your-site-domain`, `USE_SAMPLE_FALLBACK=false`. Check `https://<api-host>/api/health`
shows `"db": "connected"`.

### 6.3 Hosting the website (frontend/)

| Option | Cost | Good to know |
| --- | --- | --- |
| **Vercel** (makers of Next.js) | Hobby is free but **for personal, non-commercial projects only**; a client site needs Pro at $20 per user per month | Best Next.js support, zero configuration. [Hobby plan terms](https://conductatlas.com/platform/vercel/vercel-terms-of-service/provision/CA-P-048642/hobby-plan-personal-non-commercial-use-only/), [plan limits](https://deploywise.dev/blog/vercel-free-tier-limits-2026) |
| **Render, web service** | Free tier with the same spin-down as above, or Starter for always-on | Root directory `frontend`, build `npm install && npm run build`, start `npm start`. |
| **Netlify** | Free plan: 300 credits per month, hard limit; sites pause when credits run out | Fine for a preview, risky for a live client site. [Netlify free plan limits](https://netli.fyi/blog/netlify-free-plan-limits-2026) |
| **Your own VPS** | A few dollars a month | `npm run build` then `npm start` under PM2, Nginx in front with HTTPS. |

Environment variables for the website: `API_URL=https://<api-host>` and
`NEXT_PUBLIC_SITE_URL=https://<site-domain>`. The build calls the API once to prerender the home page, so
deploy the API first (if it is unreachable during the build, the data sections simply render at request
time instead). The other pages always fetch at request time, so the API must be reachable from the website
host while the site runs.

Suggested near-zero-cost combination for the first launch: TiDB Cloud Starter or Aiven (database) +
Render free (API) + Render free (website). Upgrade the API and website to always-on tiers when the
client is ready to spend a little each month, or move everything onto one small VPS.

### 6.4 Domain and HTTPS

Point the domain at the website host (each provider shows the DNS records to add). Render, Vercel and
Netlify issue HTTPS certificates automatically. Put the API on a subdomain such as `api.<domain>` and
update `API_URL` and `CORS_ORIGIN` to the final URLs.

## 7. Everyday commands

| Command (run in this folder) | What it does |
| --- | --- |
| `npm run dev` | Starts API and website together with live reload |
| `npm run build` | Production build of the website (also checks the Cache Components rules) |
| `npm run start` | Runs both apps in production mode (after `npm run build`) |
| `npm run lint` | ESLint for the website |
| `npm run db:setup` | Creates tables and inserts sample content (safe to re-run) |

Inside `backend/` and `frontend/` there are smaller READMEs describing their folders.

## 8. Before the site goes live

- Replace the sample practitioners, reviews, products and courses in MySQL with real, consented records
  (`backend/db/seed.sql` is placeholder content from the design, labelled as such). The sample reviews are
  two per practitioner at most, so the star bars on the profile page reflect those few rows while the
  headline rating still comes from the record's `rating_avg`/`rating_count`; real reviews make both agree.
- Fill the bracketed footer text in `frontend/content/site.js` and `site_settings`: legal entity, address,
  CIN, GSTIN, Grievance Officer, real support hours, `support.email` (the booking page prints it).
- Check every claim on the pages against reality before launch: "Trusted by 5000+ Seekers" and "Worldwide
  Shipping" on the shop banner, "You will receive a confirmation email and SMS" on the booking page (no
  e-mail or SMS is sent yet), "Secure Payments" (no gateway yet). All of this copy is in `frontend/content/`.
- Decide what "Verified" means operationally and publish the "How We Verify Practitioners" page.
- Replace the photos cropped from the mockups with real photographs, and the QR / store placeholders with
  official store badges once the apps are published.
- Connect a payment gateway (the `payments` table is ready) before taking real bookings or orders; until
  then every booking stays `pending` and the confirmation page says "Amount Due".
- Send booking confirmations by e-mail/SMS (nothing is sent today), and publish the Terms, Privacy and
  Refund pages that the consent checkboxes link to.
- Set `USE_SAMPLE_FALLBACK=false` in production.
- Set up MySQL backups (Aiven includes them; TiDB Cloud and Railway have their own).

## 9. What comes next

The design's five pages are done. Remaining work, roughly in order of value:

1. **Checkout and orders**: cart API (`cart_items`), checkout page, `POST /api/orders`, shipping and tax
   from `site_settings`; then product and course detail pages (`/shop/products/<slug>`,
   `/shop/courses/<slug>`, the API for both already exists).
2. **Payment gateway** (Razorpay or similar) for bookings and orders, writing to `payments` and moving
   bookings from `pending` to `confirmed`; e-mail/SMS confirmations and the session link.
3. From the to-do list: login and registration for seekers and tantrics (`users`, `auth_tokens`), the
   seeker account (My Bookings, favourites, saved addresses), the tantric dashboard (services, availability
   rules, bookings) and the admin section (verification, content, orders).
4. The remaining pages linked from the header and footer: Learn, Transform, About, Blog, Contact (the
   `POST /api/contact` endpoint exists), Help Center, How We Verify Practitioners, Terms, Privacy, Refund
   Policy.
