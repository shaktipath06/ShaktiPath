import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { io } from 'next/cache';
import { notFound } from 'next/navigation';
import ApiUnavailable from '@/components/site/ApiUnavailable';
import BookingPanel from '@/components/profile/BookingPanel';
import { FavouriteButton, ShareSaveBar } from '@/components/profile/ProfileActions';
import ReviewsCarousel from '@/components/profile/ReviewsCarousel';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Notice from '@/components/ui/Notice';
import Quote from '@/components/ui/Quote';
import Rating from '@/components/ui/Rating';
import RatingSummary from '@/components/ui/RatingSummary';
import SectionHeader from '@/components/ui/SectionHeader';
import SectionTabs from '@/components/ui/SectionTabs';
import ServiceOffering from '@/components/ui/ServiceOffering';
import StatItem from '@/components/ui/StatItem';
import TantricCard from '@/components/ui/TantricCard';
import TrustItem from '@/components/ui/TrustItem';
import { cx, inr } from '@/components/ui/utils';
import { PROFILE } from '@/content/profile';
import { getSlots, getTantric, isNotFound, isUnavailable } from '@/lib/api';
import {
  durationLabel,
  languagesLabel,
  plusLabel,
  relativeDate,
  reviewCountLabel,
  sessionModesLabel,
  todayIst,
} from '@/lib/format';
import page from '@/styles/page.module.css';
import styles from './page.module.css';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const t = await getTantric(slug);
    return {
      title: `${t.name}: ${t.specialty}`,
      description: t.bio || `${t.name}, ${t.specialty}, ${t.location}. Book a consultation on ShaktiPath.`,
      openGraph: { images: [{ url: t.profileImage || t.image, alt: t.name }] },
    };
  } catch {
    return { title: 'Tantric Profile' };
  }
}

export default function ProfilePage({ params }) {
  return (
    <main id="main">
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile params={params} />
      </Suspense>
    </main>
  );
}

const bookHref = (slug, serviceId) => `/book?tantric=${encodeURIComponent(slug)}${serviceId ? `&service=${serviceId}` : ''}`;

async function Profile({ params }) {
  const { slug } = await params;
  let t;
  try {
    t = await getTantric(slug);
  } catch (err) {
    // The static shell has already been sent, so an unknown slug shows the not-found page with status 200
    // (a soft 404). A real 404 status would need the check to run before streaming, e.g. in proxy.js.
    if (isNotFound(err)) notFound();
    if (isUnavailable(err)) {
      return (
        <section className={page.section}>
          <div className={page.wrap}>
            <ApiUnavailable what="This profile" />
          </div>
        </section>
      );
    }
    throw err;
  }

  // Today's date, the slots and the "2 weeks ago" labels depend on the clock: request-time only.
  await io();
  const today = todayIst();
  const date = t.availableFrom && t.availableFrom >= today ? t.availableFrom : today;
  let slots = [];
  try {
    ({ slots } = await getSlots(t.slug, date));
  } catch {
    slots = [];
  }
  const reviews = (t.reviews || []).map((r) => ({ ...r, dateLabel: relativeDate(r.date) }));
  const reviewLabel = reviewCountLabel(t.reviewCount);
  const languages = t.languages || [];
  const stats = [
    t.years ? { icon: 'award', value: t.years, label: 'Experience' } : null,
    t.consultationsCount ? { icon: 'users', value: plusLabel(t.consultationsCount), label: 'Consultations' } : null,
    languages.length
      ? { icon: 'languages', value: `${languages.length} ${languages.length === 1 ? 'Language' : 'Languages'}`, label: languagesLabel(languages) }
      : null,
    { icon: 'video', value: sessionModesLabel(t.sessionModes), label: 'Sessions' },
  ].filter(Boolean);
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Find a Tantric', href: '/consult' }, t.name];
  const firstService = t.services[0];

  return (
    <>
      <div className={styles.crumbBar}>
        <div className={cx(page.wrap, styles.crumbRow)}>
          <Breadcrumb items={crumbs} />
          <ShareSaveBar name={t.name} />
        </div>
      </div>

      <section aria-label="Practitioner profile" className={cx(page.section, styles.top)}>
        <div className={cx(page.wrap, styles.layout)}>
          <div className={styles.mainCol}>
            <article aria-labelledby="profile-name" className={styles.identity} id="about">
              <div className={styles.media}>
                <div className={styles.photo}>
                  <Image src={t.profileImage || t.image} alt={`${t.name} - ${t.specialty}`} fill sizes="(max-width: 767px) 100vw, 260px" priority />
                  {t.availableFrom ? (
                    <span className={styles.available}>
                      <span className={styles.dot} aria-hidden="true" />
                      {PROFILE.availableLabel}
                    </span>
                  ) : null}
                </div>
                {t.photos.length ? (
                  <div className={styles.thumbs}>
                    {t.photos.slice(0, 4).map((p) => (
                      <a key={p.id} className={styles.thumb} href="#gallery" aria-label={`Open the gallery: ${p.alt || t.name}`}>
                        <Image src={p.image} alt="" fill sizes="80px" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className={styles.identityText}>
                <h1 id="profile-name" className={styles.name}>
                  {t.name}
                  {t.verified ? (
                    <span className={styles.verified}>
                      <Icon name="badge-check" size={24} label="Verified practitioner" />
                    </span>
                  ) : null}
                </h1>
                <p className={styles.headline}>{t.specialty}</p>
                {t.rating > 0 ? <Rating value={t.rating} count={reviewLabel} countSuffix="reviews" size="lg" /> : null}
                {t.location ? (
                  <p className={styles.location}>
                    <span className={styles.pin}>
                      <Icon name="map-pin" size={20} />
                    </span>
                    {t.location}
                  </p>
                ) : null}
                <div className={styles.stats}>
                  {stats.map((s) => (
                    <StatItem key={s.label} icon={s.icon} value={s.value} label={s.label} />
                  ))}
                </div>
                <div className={styles.ctas}>
                  <Button icon="video" fullWidth href={bookHref(t.slug, firstService && firstService.id)}>
                    {PROFILE.consultLabel}
                  </Button>
                  <FavouriteButton label={PROFILE.favouriteLabel} savedLabel={PROFILE.favouritedLabel} />
                </div>
              </div>
            </article>

            <div className={styles.about}>
              <SectionTabs items={PROFILE.tabs} label="Profile sections" />
              <h2 className={page.h4}>{`About ${t.name}`}</h2>
              <p className={styles.bio}>{t.bio || `${t.name} has not added a biography yet.`}</p>
              {t.missionQuote ? <Quote text={t.missionQuote} author={t.name} /> : null}
            </div>

            <div id="services" className={styles.block}>
              <SectionHeader size="md" id="services-title" title={PROFILE.sections.services} actionLabel="" />
              {t.services.length ? (
                <div className={styles.offers}>
                  {t.services.map((s) => (
                    <ServiceOffering
                      key={s.id}
                      image={s.image}
                      title={s.title}
                      description={s.description}
                      price={s.price}
                      unit={s.unit || durationLabel(s.durationMinutes)}
                      href={bookHref(t.slug, s.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className={page.text}>This practitioner has not listed bookable services yet.</p>
              )}
            </div>

            {t.photos.length ? (
              <div id="gallery" className={styles.block}>
                <SectionHeader size="md" id="gallery-title" title={PROFILE.sections.gallery} actionLabel="" />
                <div className={styles.gallery}>
                  {t.photos.map((p) => (
                    <div key={p.id} className={styles.galleryItem}>
                      <Image src={p.image} alt={p.alt || ''} fill sizes="(max-width: 767px) 50vw, 240px" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside id="book-session" aria-label="Booking and support" className={styles.sideCol}>
            <BookingPanel
              slug={t.slug}
              services={t.services}
              initialDate={date}
              initialSlots={slots}
              today={today}
              title={PROFILE.bookPanelTitle}
              proceedLabel={PROFILE.proceedLabel}
            />
            <Notice tone="support" {...PROFILE.support} />
            {t.specialties.length ? (
              <div className={styles.expertise}>
                <h2 className={styles.expertiseTitle}>{PROFILE.sections.expertise}</h2>
                <ul className={styles.expertiseList}>
                  {t.specialties.map((s) => (
                    <li key={s.slug}>
                      <span className={styles.expertiseIcon}>
                        <Icon name={s.icon} size={20} />
                      </span>
                      <Link href={`/consult?specialty=${encodeURIComponent(s.slug)}`}>{s.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <section aria-label="Certifications and reviews" className={cx(page.section, styles.lower)}>
        <div className={cx(page.wrap, styles.lowerStack)}>
          {t.certifications.length ? (
            <div id="certifications" className={styles.block}>
              <SectionHeader size="md" id="certs-title" title={PROFILE.sections.certifications} actionLabel="" />
              <div className={styles.certs}>
                {t.certifications.map((c) => (
                  <div key={c.id} className={styles.cert}>
                    <TrustItem icon={c.icon} title={c.title} description={[c.issuer, c.year].filter(Boolean).join(', ')} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div id="reviews" className={styles.block}>
            <SectionHeader size="md" id="reviews-title" title={PROFILE.sections.reviews} actionLabel="" />
            <div className={styles.reviews}>
              <div className={page.panel}>
                <RatingSummary average={t.rating} total={reviewLabel} distribution={t.ratingDistribution} />
              </div>
              <ReviewsCarousel reviews={reviews} emptyText={PROFILE.reviewsEmpty} />
            </div>
          </div>
        </div>
      </section>

      {t.similar.length ? (
        <section aria-labelledby="similar-title" className={cx(page.section, page.bgWhite)}>
          <div className={cx(page.wrap, page.stack)}>
            <SectionHeader id="similar-title" size="md" title={PROFILE.sections.similar} href="/consult" />
            <div className={styles.similar}>
              {t.similar.map((s) => (
                <TantricCard
                  key={s.slug}
                  variant="mini"
                  name={s.name}
                  specialty={s.specialty}
                  image={s.image}
                  rating={s.rating}
                  reviews={s.reviews}
                  href={s.href}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {t.price != null ? (
        <div className={styles.bookBar}>
          <span>
            From <strong>{inr(t.price)}</strong> / session
          </span>
          <Button size="sm" arrow href="#book-session">
            {PROFILE.bookBarLabel}
          </Button>
        </div>
      ) : null}
    </>
  );
}

function ProfileSkeleton() {
  return (
    <section className={cx(page.section, styles.top)} aria-busy="true" aria-label="Loading profile">
      <div className={cx(page.wrap, styles.layout)}>
        <div className={styles.mainCol}>
          <div className={cx(page.skeleton, styles.skelTop)} />
          <div className={page.skeleton} style={{ height: 200 }} />
        </div>
        <div className={styles.sideCol}>
          <div className={page.skeleton} style={{ height: 520 }} />
        </div>
      </div>
    </section>
  );
}
