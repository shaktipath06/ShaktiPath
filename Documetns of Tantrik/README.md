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

The design reference files (mockups, spec PDF, exported artifact) stay in this folder as well.

Status: the **home page** is built and matches the approved design (Claude Design canvas page "1. Home").
Every other link in the header and footer opens a branded "coming soon" page until that page is built.

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
#    open backend\.env and set DB_PASSWORD=<your MySQL root password>

# 3. Create the database, tables and sample content
npm run db:setup

# 4. Frontend environment (defaults already point at http://localhost:4000)
copy frontend\.env.example frontend\.env.local

# 5. Run the API and the website together
npm run dev
```

Then open http://localhost:3000. The API answers at http://localhost:4000/api/health and
http://localhost:4000/api/home.

You can also run each app on its own: `npm run dev:backend` and `npm run dev:frontend`, or `npm run dev`
inside `backend/` or `frontend/`.

### If MySQL is not set up yet

The site still runs. In development the API serves built-in sample content (the same rows as
`backend/db/seed.sql`) and prints a warning when it cannot reach MySQL. The website also falls back to
sample content if the API itself is not running. Both fallbacks are for development only; in production
set `USE_SAMPLE_FALLBACK=false` so a database problem is visible instead of hidden.

### MySQL tips (Windows)

- Service not running: `services.msc`, find `MySQL80`, Start.
- Forgot the root password: open MySQL Workbench, or reset it with the MySQL documentation steps.
- Prefer a dedicated user instead of root? Run in Workbench, then use it in `backend/.env`:
  ```sql
  CREATE USER 'shaktipath'@'localhost' IDENTIFIED BY 'choose-a-strong-password';
  GRANT ALL PRIVILEGES ON shaktipath.* TO 'shaktipath'@'localhost';
  FLUSH PRIVILEGES;
  ```
  (`npm run db:setup` creates the `shaktipath` database itself when the user may create databases;
  otherwise create it first: `CREATE DATABASE shaktipath CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`.)

## 3. How the pieces fit

```
Browser  ->  Next.js (frontend)  ->  Express API (backend)  ->  MySQL
             renders the pages       GET /api/home, /api/tantrics ...   tables in backend/db/schema.sql
```

- The website never talks to MySQL directly. Server Components in Next.js call the API
  (`frontend/lib/api.js`), cache the response for a few minutes and render the page.
- Copy (headlines, trust points, how-it-works steps, footer text) lives in `frontend/content/`.
  Records (practitioners, service tiles, reviews, products) live in MySQL and come through the API.
- The design system (colours, type, spacing, 20 ported components) lives in `frontend/styles/shaktipath.css`
  and `frontend/components/ui/`. Build new pages from these components; do not restyle them from outside.

### API endpoints

| Method and path | Returns |
| --- | --- |
| `GET /api/health` | `{ ok, db: "connected" \| "unavailable", ... }` |
| `GET /api/home` | `{ tantrics[6], serviceCategories[6], reviews[3] }` for the home page |
| `GET /api/tantrics?featured=1&limit=6&page=1` | `{ items, total, page, limit }` |
| `GET /api/tantrics/:slug` | One practitioner with specialties, services and reviews |
| `GET /api/services/categories?home=1` | `{ items }` |
| `GET /api/reviews?featured=1&limit=3&tantric=slug` | `{ items }` |

### Database tables (backend/db/schema.sql)

| Table | Purpose |
| --- | --- |
| `users` | Accounts for seekers (customers), tantrics and admins (`role` column) |
| `tantrics`, `specialties`, `tantric_specialties` | Practitioner profiles, their expertise tags, rating summary, featured flag |
| `service_categories` | The "Explore Our Services" tiles and the service groups |
| `services` | What each practitioner offers and charges |
| `bookings` | Session bookings with date, time, payment and consent fields |
| `product_categories`, `products`, `courses` | Shop |
| `orders`, `order_items` | Shop orders |
| `reviews` | Practitioner and product reviews; `is_featured` picks the home page ones |
| `site_settings` | Editable text such as the footer legal lines and support hours |

Ratings and review counts are stored on the record and formatted by the API (`320+`), never typed into
the pages. `npm run db:setup` is safe to re-run; `npm run db:schema` and `npm run db:seed` run one half.

## 4. Environment variables

**backend/.env** (see `backend/.env.example`)

| Variable | Meaning |
| --- | --- |
| `PORT` | API port, default 4000 |
| `CORS_ORIGIN` | Comma-separated site origins allowed to call the API |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `DB_SSL` | `true` for cloud MySQL that requires TLS (TiDB Cloud, Aiven) |
| `DATABASE_URL` | Alternative to the `DB_*` fields: `mysql://user:password@host:3306/shaktipath` |
| `USE_SAMPLE_FALLBACK` | `true` serves sample content when MySQL is down; set `false` in production |

**frontend/.env.local** (see `frontend/.env.example`)

| Variable | Meaning |
| --- | --- |
| `API_URL` | Where the website reaches the API (server-side), for example `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used for metadata |

## 5. Deploying

Deploy in this order: database, then API, then website. Each step gives you a value the next one needs.

### 5.1 Where to get a MySQL database (free or very cheap)

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

Before launch, replace the sample content with real records (see section 7) and keep `db:seed` out of
production.

### 5.2 Hosting the API (backend/)

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

### 5.3 Hosting the website (frontend/)

| Option | Cost | Good to know |
| --- | --- | --- |
| **Vercel** (makers of Next.js) | Hobby is free but **for personal, non-commercial projects only**; a client site needs Pro at $20 per user per month | Best Next.js support, zero configuration. [Hobby plan terms](https://conductatlas.com/platform/vercel/vercel-terms-of-service/provision/CA-P-048642/hobby-plan-personal-non-commercial-use-only/), [plan limits](https://deploywise.dev/blog/vercel-free-tier-limits-2026) |
| **Render, web service** | Free tier with the same spin-down as above, or Starter for always-on | Root directory `frontend`, build `npm install && npm run build`, start `npm start`. |
| **Netlify** | Free plan: 300 credits per month, hard limit; sites pause when credits run out | Fine for a preview, risky for a live client site. [Netlify free plan limits](https://netli.fyi/blog/netlify-free-plan-limits-2026) |
| **Your own VPS** | A few dollars a month | `npm run build` then `npm start` under PM2, Nginx in front with HTTPS. |

Environment variables for the website: `API_URL=https://<api-host>` and
`NEXT_PUBLIC_SITE_URL=https://<site-domain>`. The build calls the API once to prerender the home page, so
deploy the API first (if it is unreachable during the build, the data sections simply render at request
time instead).

Suggested near-zero-cost combination for the first launch: TiDB Cloud Starter or Aiven (database) +
Render free (API) + Render free (website). Upgrade the API and website to always-on tiers when the
client is ready to spend a little each month, or move everything onto one small VPS.

### 5.4 Domain and HTTPS

Point the domain at the website host (each provider shows the DNS records to add). Render, Vercel and
Netlify issue HTTPS certificates automatically. Put the API on a subdomain such as `api.<domain>` and
update `API_URL` and `CORS_ORIGIN` to the final URLs.

## 6. Everyday commands

| Command (run in this folder) | What it does |
| --- | --- |
| `npm run dev` | Starts API and website together with live reload |
| `npm run build` | Production build of the website |
| `npm run start` | Runs both apps in production mode (after `npm run build`) |
| `npm run lint` | ESLint for the website |
| `npm run db:setup` | Creates tables and inserts sample content |

Inside `backend/` and `frontend/` there are smaller READMEs describing their folders.

## 7. Before the site goes live

- Replace the sample practitioners, reviews, products and courses in MySQL with real, consented records
  (`backend/db/seed.sql` is placeholder content from the design, labelled as such).
- Fill the bracketed footer text in `frontend/content/site.js` and `site_settings`: legal entity, address,
  CIN, GSTIN, Grievance Officer, real support hours.
- Decide what "Verified" means operationally and publish the "How We Verify Practitioners" page.
- Replace the photos cropped from the mockups with real photographs, and the QR / store placeholders with
  official store badges once the apps are published.
- Set `USE_SAMPLE_FALLBACK=false` in production.
- Set up MySQL backups (Aiven includes them; TiDB Cloud and Railway have their own).

## 8. What comes next

Remaining pages from the design: Find a Tantric, Tantric Profile, Book Your Session, Shop. Then, from the
to-do list: admin section, login and registration for customers and tantrics, customer and tantric
profile pages, and the admin page. The `users` table and the `role` column are already in the schema for
that work.
