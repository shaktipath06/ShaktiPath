import { Suspense } from 'react';
import Link from 'next/link';
import { io } from 'next/cache';
import ApiUnavailable from '@/components/site/ApiUnavailable';
import BookingForm from '@/components/booking/BookingForm';
import { BookBanner, PromiseSection } from '@/components/booking/BookingSections';
import SectionHeader from '@/components/ui/SectionHeader';
import Stepper from '@/components/ui/Stepper';
import TantricCard from '@/components/ui/TantricCard';
import { cx } from '@/components/ui/utils';
import { BOOK } from '@/content/book';
import { getSettings, getSlots, getTantric, isNotFound, isUnavailable, searchTantrics } from '@/lib/api';
import { isIsoDate, isTime, languagesLabel, plusLabel, sessionModesLabel, todayIst } from '@/lib/format';
import { int, text } from '@/lib/query';
import page from '@/styles/page.module.css';
import styles from './page.module.css';

export const metadata = {
  title: BOOK.title,
  description: BOOK.subtitle,
};

const BASE_CRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Find a Tantric', href: '/consult' },
];

/**
 * /book?tantric=<slug>&service=<id>&date=YYYY-MM-DD&time=HH:MM&coupon=CODE
 * Without `tantric` the page offers the featured practitioners to choose from.
 */
export default function BookPage({ searchParams }) {
  return (
    <main id="main">
      <Suspense fallback={<BookBanner crumbs={[...BASE_CRUMBS, BOOK.title]} />}>
        <BannerFor searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<BookingSkeleton />}>
        <BookingContent searchParams={searchParams} />
      </Suspense>
      <PromiseSection />
    </main>
  );
}

async function BannerFor({ searchParams }) {
  const sp = await searchParams;
  const slug = text(sp.tantric, 120);
  let crumbs = [...BASE_CRUMBS, BOOK.title];
  if (slug) {
    try {
      const t = await getTantric(slug);
      crumbs = [...BASE_CRUMBS, { label: t.name, href: t.href }, 'Book Session'];
    } catch {
      // Keep the generic breadcrumb; the booking section reports the problem.
    }
  }
  return <BookBanner crumbs={crumbs} />;
}

async function BookingContent({ searchParams }) {
  const sp = await searchParams;
  const slug = text(sp.tantric, 120);
  if (!slug) return <ChooseTantric />;

  let t;
  try {
    t = await getTantric(slug);
  } catch (err) {
    if (isNotFound(err)) return <ChooseTantric notice="We could not find that practitioner. Please choose one below." />;
    if (isUnavailable(err)) {
      return (
        <section className={page.section}>
          <div className={page.wrap}>
            <ApiUnavailable what="Booking" />
          </div>
        </section>
      );
    }
    throw err;
  }

  const serviceId = int(sp.service, 0);
  const service = t.services.find((s) => s.id === serviceId) || t.services[0] || null;
  if (!service) {
    return (
      <section className={page.section}>
        <div className={cx(page.wrap, page.stack)}>
          <div className={page.empty}>
            <h2 className={page.h5}>{BOOK.noServices}</h2>
            <p className={page.small}>
              <Link href={t.href}>Back to {t.name}&apos;s profile</Link> or <Link href="/consult">find another practitioner</Link>.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // The default date and the slots depend on the clock: request-time only.
  await io();
  const today = todayIst();
  const requested = text(sp.date, 10);
  const date =
    requested && isIsoDate(requested) && requested >= today
      ? requested
      : t.availableFrom && t.availableFrom >= today
        ? t.availableFrom
        : today;
  let slots = [];
  try {
    ({ slots } = await getSlots(slug, date));
  } catch {
    slots = [];
  }
  const wanted = text(sp.time, 5);
  const time = wanted && isTime(wanted) && slots.some((s) => s.time === wanted && s.available) ? wanted : null;

  let settings = {};
  try {
    settings = await getSettings();
  } catch {
    settings = {};
  }
  const taxPercent = Number(settings['booking.tax_percent']) || 0;
  const cancelHours = Number(settings['booking.cancel_hours']) || 0;
  const supportEmail = settings['support.email'];
  const infoItems = [
    ...BOOK.info,
    cancelHours ? `You can reschedule up to ${cancelHours} hours before the session.` : null,
    supportEmail ? `${BOOK.supportLine} at ${supportEmail}.` : `${BOOK.supportLine} through the Contact Us page.`,
  ].filter(Boolean);

  const languages = t.languages || [];
  const stats = [
    t.years ? { icon: 'award', value: t.years, label: 'Experience' } : null,
    t.consultationsCount ? { icon: 'users', value: plusLabel(t.consultationsCount), label: 'Consultations' } : null,
    languages.length
      ? { icon: 'languages', value: `${languages.length} ${languages.length === 1 ? 'Language' : 'Languages'}`, label: languagesLabel(languages) }
      : null,
    { icon: 'video', value: sessionModesLabel(t.sessionModes), label: 'Sessions' },
  ].filter(Boolean);

  return (
    <BookingForm
      tantric={{
        slug: t.slug,
        name: t.name,
        specialty: t.specialty,
        image: t.image,
        profileImage: t.profileImage,
        rating: t.rating,
        reviewCount: t.reviewCount,
        verified: t.verified,
        location: t.location,
      }}
      service={service}
      initialDate={date}
      initialSlots={slots}
      initialTime={time}
      today={today}
      taxPercent={taxPercent}
      infoItems={infoItems}
      stats={stats}
      couponCode={text(sp.coupon, 40)}
    />
  );
}

async function ChooseTantric({ notice }) {
  let items = [];
  try {
    ({ items } = await searchTantrics({ featured: 1, limit: 8 }));
  } catch (err) {
    if (isUnavailable(err)) {
      return (
        <section className={page.section}>
          <div className={page.wrap}>
            <ApiUnavailable what="Booking" />
          </div>
        </section>
      );
    }
    throw err;
  }
  return (
    <section aria-labelledby="choose-title" className={cx(page.section, styles.section)}>
      <div className={cx(page.wrap, styles.stack)}>
        <div className={styles.stepperBox}>
          <Stepper steps={BOOK.steps} current={1} />
        </div>
        {notice ? (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        ) : null}
        <SectionHeader size="md" id="choose-title" title={BOOK.chooseTitle} subtitle={BOOK.chooseSubtitle} href="/consult" actionLabel={BOOK.chooseAction} />
        <div className={styles.chooseGrid}>
          {items.map((t) => (
            <TantricCard
              key={t.slug}
              name={t.name}
              specialty={t.specialty}
              image={t.image}
              rating={t.rating}
              reviews={t.reviews}
              verified={t.verified}
              ctaLabel="Book Now"
              href={`/book?tantric=${encodeURIComponent(t.slug)}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingSkeleton() {
  return (
    <section className={cx(page.section, styles.section)} aria-busy="true" aria-label="Loading booking">
      <div className={cx(page.wrap, styles.stack)}>
        <div className={page.skeleton} style={{ height: 96 }} />
        <div className={styles.layout}>
          <div className={page.skeleton} style={{ gridArea: 'card', height: 520 }} />
          <div className={page.skeleton} style={{ gridArea: 'form', height: 760 }} />
          <div className={page.skeleton} style={{ gridArea: 'summary', height: 600 }} />
        </div>
      </div>
    </section>
  );
}
