# ShaktiPath frontend (Next.js)

The public website, built with Next.js 16 (App Router, JavaScript, Cache Components) and the ShaktiPath
design system. See the [project README](../README.md) for setup, what each page does, the API contract,
the working conventions and deployment.

```bash
npm install
cp .env.example .env.local   # API_URL=http://localhost:4000
npm run dev                  # http://localhost:3000 (the API must be running on API_URL)
npm run build && npm start   # production build; the build also enforces the Cache Components rules
npm run lint
```

## Pages

| Route | File | What it shows |
| --- | --- | --- |
| `/` | `app/page.js` | Home: hero, trust strip, Why Choose, top tantrics, services, how it works, app band, reviews |
| `/consult` | `app/consult/page.js` | Find a Tantric: search, filters (GET form), results grid, pagination |
| `/tantrics/[slug]` | `app/tantrics/[slug]/page.js` | Tantric profile with the Book Your Session sidebar |
| `/book` | `app/book/page.js` | Book Your Session (`?tantric=&service=&date=&time=&coupon=`); without `tantric`, a practitioner chooser |
| `/book/confirmation/[ref]` | `app/book/confirmation/[ref]/page.js` | Booking Received card and summary after a booking is created |
| `/shop` | `app/shop/page.js` | Shop: categories, featured, best sellers, courses, cart and filters (GET form) |
| any other URL | `app/not-found.js` | Branded "coming soon / not found" page |
| server error | `app/error.js` | Branded error boundary with Try Again |

## Where things live

| Path | What |
| --- | --- |
| `app/layout.js` | Root layout: fonts (next/font/local), metadata, cart provider, header (inside `<Suspense>`, see below) and footer |
| `app/*/page.module.css` | Page grids and bands for each page; `styles/page.module.css` holds the shared section, panel, heading and skeleton classes |
| `app/consult/FilterLayout.js`, `app/shop/ShopLayout.js` | Client wrappers that fold the filter sidebar behind a button on phones |
| `components/ui/` | The design-system components ported from the ShaktiPath bundle (45 files: Button, Hero, TantricCard, DatePicker, TimeSlots, Stepper, BookingSummary, PaymentMethods, ProductCard, CartSummary, ...). Same props as the bundle where practical; photos go through `next/image` |
| `components/site/` | `SiteHeader` (props only), `RoutedHeader` (reads the route for it), `SiteFooter`, `ApiUnavailable`, `SortSelect`, `ShowMore` |
| `components/home/` | Home page sections that read from the API |
| `components/profile/` | `BookingPanel` (service, calendar, slots), `ReviewsCarousel`, `ProfileActions` (Share, Save, Add to Favourite) |
| `components/booking/` | `BookingForm` (the whole interactive booking section) and `BookingSections` (banner, promise, after-booking steps) |
| `components/shop/CartProvider.js` | Client-side cart in `localStorage` (`useCart()`), mounted in the root layout |
| `content/` | Copy per page: `site.js`, `home.js`, `consult.js`, `profile.js`, `book.js`, `shop.js`; `sample-home.js` is the home page's development fallback |
| `lib/api.js` | Server-side API client: cached GETs (`'use cache'`, minutes) for lists and profiles, uncached calls for slots, coupons and bookings, `ApiError` with the HTTP status |
| `lib/actions.js` | Server Actions (`'use server'`): `fetchSlots`, `applyCoupon`, `submitBooking` |
| `lib/format.js` | IST dates, times, relative dates, mode and language labels, review-count labels |
| `lib/query.js` | `searchParams` helpers (`first`, `many`, `num`, `pick`) and `hrefWith()` for links that keep the current filters |
| `styles/shaktipath.css` | Design tokens and component styles (do not restyle components from outside) |
| `public/images/` | Logos and placeholder photos cropped from the client mockups |
| `app/fonts/` | Inter, Tinos and Tiro Devanagari Hindi (woff2) |

## Conventions that keep the build green

- `params` and `searchParams` are promises. Await them inside a component that is wrapped in `<Suspense>`
  (every page has `*Skeleton` fallbacks); the banner and other static parts stay outside so they are part of
  the static shell.
- `'use cache'` functions (in `lib/api.js`) take plain, serialisable arguments and never read request
  data. Anything that depends on "now" (time slots) or writes (bookings) is uncached and lives in a
  Server Action or a Suspense-wrapped component.
- Client Components (`'use client'`) are only the interactive pieces: calendar, slots, forms, cart,
  carousels, toggles. They receive plain data as props; functions never cross from a Server Component.
- `usePathname()` is request-time data, so `RoutedHeader` is rendered inside `<Suspense>` in the layout with
  a plain `SiteHeader` as the fallback (otherwise dynamic routes such as `/tantrics/[slug]` fail to build).
- React 19 lint rules are on: no `setState` inside `useEffect` bodies (the cart uses
  `useSyncExternalStore`; the booking form reacts inside its action), and no `Date.now()` during render
  (`lib/format.js` reads the clock instead).
- Filters are URL parameters submitted by a GET form (`next/form`); links that change one parameter use
  `hrefWith()` so the others survive. Pagination, sort and category links all work without JavaScript, and
  so does the booking form: it posts straight to the `submitBooking` Server Action (React renders the
  progressive-enhancement fields), so keep the Server Action itself as the form's `action`.
- Expected API failures never throw inside a `'use cache'` scope: `lib/api.js` caches a result envelope and
  raises `ApiError` outside it. (A throw inside the cache is not stored, and the second render phase of a
  request then fails with "unexpected cache miss".)
- `notFound()` from inside a streamed section gives a soft 404 (status 200); see the project README.
- Copy comes from `content/`; records come from the API. Nothing numeric is typed into a component.
