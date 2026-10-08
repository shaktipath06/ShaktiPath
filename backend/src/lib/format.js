// Shapes database rows into the JSON the site consumes. Numbers come from the records; the
// "320+" style label is computed here, never typed in.
import { dateLabel, timeLabel } from './time.js';

export function reviewCountLabel(count) {
  const n = Number(count) || 0;
  if (n < 100) return String(n);
  return `${Math.floor(n / 10) * 10}+`;
}

export function toNumber(v) {
  return v == null ? null : Number(v);
}

function parseJson(v, fallback) {
  if (v == null) return fallback;
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------- practitioners

export function tantricCard(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.display_name,
    specialty: row.headline || '',
    image: row.photo_url,
    rating: toNumber(row.rating_avg) ?? 0,
    reviewCount: Number(row.rating_count) || 0,
    reviews: reviewCountLabel(row.rating_count),
    verified: Boolean(row.is_verified),
    city: row.city,
    state: row.state,
    location: [row.city, row.state].filter(Boolean).join(', ') || null,
    yearsExperience: row.years_experience == null ? null : Number(row.years_experience),
    years: row.years_experience == null ? null : `${Number(row.years_experience)}+ Years`,
    price: toNumber(row.base_price),
    tags: row.tags ? String(row.tags).split('|').filter(Boolean) : undefined,
    href: `/tantrics/${row.slug}`,
  };
}

export function tantricDetail(row, extras = {}) {
  return {
    ...tantricCard(row),
    profileImage: row.profile_photo_url || row.photo_url,
    bio: row.bio,
    missionQuote: row.mission_quote,
    consultationsCount: Number(row.consultations_count) || 0,
    languages: parseJson(row.languages, []),
    sessionModes: typeof row.session_modes === 'string' ? row.session_modes.split(',').filter(Boolean) : [],
    ...extras,
  };
}

export function specialtyItem(row) {
  const out = { id: row.id, slug: row.slug, name: row.name, icon: row.icon };
  if (row.tantric_count != null) out.count = Number(row.tantric_count);
  return out;
}

export function photoItem(row) {
  return { id: row.id, image: row.image_url, alt: row.alt_text || '' };
}

export function certificationItem(row) {
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    year: row.year == null ? null : Number(row.year),
    icon: row.icon,
  };
}

/** Counts per star, 5 down to 1, from GROUP BY rating rows. */
export function ratingDistribution(rows) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of rows) counts[Number(r.rating)] = Number(r.n) || 0;
  return [5, 4, 3, 2, 1].map((star) => counts[star]);
}

// ------------------------------------------------------------------- services

export function serviceCategoryTile(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image_url,
    href: row.link_path || '/consult',
  };
}

export function serviceItem(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: toNumber(row.price),
    unit: row.unit,
    durationMinutes: row.duration_minutes == null ? null : Number(row.duration_minutes),
    mode: row.mode,
    image: row.image_url,
  };
}

// -------------------------------------------------------------------- reviews

export function reviewItem(row) {
  return {
    id: row.id,
    name: row.author_name,
    avatar: row.avatar_url,
    rating: Number(row.rating) || 0,
    quote: row.quote,
    verifiedBooking: Boolean(row.is_verified_booking),
    date: row.created_at,
    reply: row.reply_text ? { text: row.reply_text, date: row.replied_at } : null,
    tantric: row.tantric_slug ? { slug: row.tantric_slug, name: row.tantric_name } : null,
  };
}

// ----------------------------------------------------------------------- shop

export function productCategoryItem(row) {
  const out = { id: row.id, slug: row.slug, name: row.name, image: row.image_url, icon: row.icon };
  if (row.product_count != null) out.count = Number(row.product_count) || 0;
  return out;
}

export function productCard(row) {
  const price = Number(row.price);
  const mrp = row.mrp == null ? null : Number(row.mrp);
  const discountPercent = mrp && mrp > price && price > 0 ? Math.min(99, Math.round((1 - price / mrp) * 100)) : 0;
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    subtitle: row.subtitle,
    price,
    mrp,
    discountPercent,
    discount: discountPercent ? `${discountPercent}% OFF` : null,
    image: row.image_url,
    rating: toNumber(row.rating_avg) ?? 0,
    reviewCount: Number(row.rating_count) || 0,
    reviews: reviewCountLabel(row.rating_count),
    inStock: Number(row.stock_qty) > 0,
    featured: Boolean(row.is_featured),
    bestSeller: Boolean(row.is_best_seller),
    category: row.category_slug ? { slug: row.category_slug, name: row.category_name } : null,
    href: `/shop/products/${row.slug}`,
  };
}

export function productDetail(row) {
  return { ...productCard(row), description: row.description, gallery: parseJson(row.gallery, []), stockQty: Number(row.stock_qty) || 0 };
}

export function courseCard(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    level: row.level,
    meta: row.meta_label,
    metaIcon: row.meta_icon || 'circle-play',
    modulesCount: row.modules_count == null ? null : Number(row.modules_count),
    price: toNumber(row.price),
    mrp: toNumber(row.mrp),
    image: row.image_url,
    instructor: row.instructor_slug ? { slug: row.instructor_slug, name: row.instructor_name } : null,
    href: `/shop/courses/${row.slug}`,
  };
}

// ------------------------------------------------------------------- bookings

export function bookingItem(row) {
  const time = String(row.start_time).slice(0, 5);
  return {
    ref: row.booking_ref,
    status: row.status,
    date: row.booking_date,
    dateLabel: dateLabel(row.booking_date),
    time,
    timeLabel: timeLabel(time),
    durationMinutes: Number(row.duration_minutes) || 0,
    timezone: row.timezone,
    mode: row.mode,
    service: row.service_title,
    tantric: { slug: row.tantric_slug, name: row.tantric_name, image: row.tantric_photo },
    customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone },
    purpose: row.purpose,
    fee: Number(row.fee),
    discount: Number(row.discount) || 0,
    tax: Number(row.tax) || 0,
    total: Number(row.total),
    couponCode: row.coupon_code || null,
    paymentMethod: row.payment_method,
    meetingLink: row.meeting_link,
    createdAt: row.created_at,
  };
}

export function couponItem(coupon, discount) {
  return {
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discount_type,
    discountValue: Number(coupon.discount_value),
    maxDiscount: toNumber(coupon.max_discount),
    minAmount: Number(coupon.min_amount) || 0,
    appliesTo: coupon.applies_to,
    discount,
  };
}
