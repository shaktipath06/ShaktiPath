import { Suspense } from 'react';
import Form from 'next/form';
import Link from 'next/link';
import ApiUnavailable from '@/components/site/ApiUnavailable';
import ShowMore from '@/components/site/ShowMore';
import SortSelect from '@/components/site/SortSelect';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import ChoiceGroup from '@/components/ui/ChoiceGroup';
import Hero from '@/components/ui/Hero';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import RangeSlider from '@/components/ui/RangeSlider';
import Rating from '@/components/ui/Rating';
import SearchBar from '@/components/ui/SearchBar';
import Select from '@/components/ui/Select';
import TantricCard from '@/components/ui/TantricCard';
import { cx } from '@/components/ui/utils';
import {
  CONSULT,
  EXPERIENCE_OPTIONS,
  EXPERTISE_VISIBLE,
  LANGUAGE_OPTIONS,
  PRICE_RANGE,
  RATING_OPTIONS,
  SORT_OPTIONS,
} from '@/content/consult';
import { getCities, getServiceCategories, getSpecialties, isUnavailable, searchTantrics } from '@/lib/api';
import { first, hrefWith, int, many, num, pick, text } from '@/lib/query';
import FilterLayout from './FilterLayout';
import page from '@/styles/page.module.css';
import styles from './page.module.css';

export const metadata = {
  title: CONSULT.title,
  description: CONSULT.subtitle,
};

// Query parameters this page understands (everything else in the URL is ignored).
const PARAM_KEYS = ['q', 'city', 'specialty', 'category', 'exp', 'language', 'minPrice', 'maxPrice', 'minRating', 'sort', 'page'];

/** Reads the URL into the filters the API understands. */
function parseParams(sp) {
  const exp = many(sp.exp).filter((v) => EXPERIENCE_OPTIONS.some((o) => o.value === v));
  const ranges = EXPERIENCE_OPTIONS.filter((o) => exp.includes(o.value));
  const ratings = many(sp.minRating)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const sortValue = first(sp.sort);
  return {
    q: text(sp.q, 100),
    city: text(sp.city, 80),
    specialty: many(sp.specialty),
    category: text(sp.category, 80),
    exp,
    language: many(sp.language).filter((l) => LANGUAGE_OPTIONS.includes(l)),
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    minRating: ratings.length ? Math.min(...ratings) : undefined,
    minYears: ranges.length ? Math.min(...ranges.map((o) => o.min)) : undefined,
    maxYears: ranges.length && ranges.every((o) => o.max != null) ? Math.max(...ranges.map((o) => o.max)) : undefined,
    sort: SORT_OPTIONS.some((o) => o.value === sortValue) ? sortValue : 'rating',
    page: Math.max(1, int(sp.page, 1)),
  };
}

export default function ConsultPage({ searchParams }) {
  return (
    <main id="main">
      <Hero
        variant="banner"
        image={CONSULT.image}
        breadcrumb={[{ label: 'Home', href: '/' }, CONSULT.title]}
        title={CONSULT.title}
        subtitle={CONSULT.subtitle}
        mantra={CONSULT.mantra}
        aside={CONSULT.aside}
      />
      <section aria-label="Search results" className={cx(page.section, styles.section)}>
        {/* One GET form holds the search field, the sort select and every filter: submitting navigates to /consult?... */}
        <Form action="/consult" className={page.wrap}>
          <FilterLayout
            results={
              <Suspense fallback={<ResultsSkeleton />}>
                <Results searchParams={searchParams} />
              </Suspense>
            }
            filters={
              <Suspense fallback={<FiltersSkeleton />}>
                <Filters searchParams={searchParams} />
              </Suspense>
            }
          />
        </Form>
      </section>
    </main>
  );
}

async function Results({ searchParams }) {
  const sp = await searchParams;
  const p = parseParams(sp);
  let data;
  let categoryName = null;
  try {
    [data, categoryName] = await Promise.all([
      searchTantrics({
        q: p.q,
        city: p.city,
        specialty: p.specialty,
        category: p.category,
        minRating: p.minRating,
        minPrice: p.minPrice,
        maxPrice: p.maxPrice,
        minYears: p.minYears,
        maxYears: p.maxYears,
        language: p.language,
        sort: p.sort,
        page: p.page,
        limit: CONSULT.pageSize,
      }),
      p.category
        ? getServiceCategories()
            .then((items) => (items.find((c) => c.slug === p.category) || {}).name || p.category)
            .catch(() => p.category)
        : null,
    ]);
  } catch (err) {
    if (isUnavailable(err)) return <ApiUnavailable what="The practitioner list" />;
    throw err;
  }
  const keep = pick(sp, PARAM_KEYS.filter((k) => k !== 'page'));
  const total = Number(data.total) || 0;

  return (
    <>
      <div className={styles.searchBox}>
        <SearchBar asForm={false} id="search" label="Search tantrics" placeholder={CONSULT.searchPlaceholder} defaultValue={p.q || ''} />
      </div>
      <div className={styles.head}>
        <h2 className={styles.count}>{`${total} ${total === 1 ? 'Tantric' : 'Tantrics'} Found`}</h2>
        <SortSelect key={p.sort} options={SORT_OPTIONS} value={p.sort} />
      </div>
      {p.category ? (
        <p className={styles.context}>
          Showing practitioners who offer
          <Badge tone="tag">{categoryName}</Badge>
          <Link href={hrefWith('/consult', keep, { category: undefined })}>Show all practitioners</Link>
          <input type="hidden" name="category" value={p.category} />
        </p>
      ) : null}
      {data.items.length ? (
        <div className={styles.grid}>
          {data.items.map((t) => (
            <TantricCard
              key={t.slug}
              variant="detailed"
              name={t.name}
              image={t.image}
              rating={t.rating}
              reviews={t.reviews}
              verified={t.verified}
              tags={(t.tags || []).slice(0, 3)}
              years={t.years}
              location={t.location}
              price={t.price}
              href={t.href}
            />
          ))}
        </div>
      ) : (
        <div className={page.empty}>
          <h3 className={page.h5}>{CONSULT.emptyTitle}</h3>
          <p className={page.small}>{CONSULT.emptyText}</p>
        </div>
      )}
      <Pagination page={data.page} total={data.pages} basePath="/consult" params={keep} />
    </>
  );
}

async function Filters({ searchParams }) {
  const sp = await searchParams;
  const p = parseParams(sp);
  const [specialties, cities] = await Promise.all([getSpecialties().catch(() => []), getCities().catch(() => [])]);
  // Checked specialties always stay visible; the rest fold behind "Show More".
  const ordered = [...specialties].sort((a, b) => Number(p.specialty.includes(b.slug)) - Number(p.specialty.includes(a.slug)));
  const visible = ordered.slice(0, EXPERTISE_VISIBLE);
  const hidden = ordered.slice(EXPERTISE_VISIBLE);
  const specialtyBox = (s) => (
    <Checkbox key={s.slug} name="specialty" value={s.slug} label={s.name} count={s.count} defaultChecked={p.specialty.includes(s.slug)} />
  );

  return (
    <>
      <div className={styles.asideHead}>
        <h2 id="filters-title" className={styles.asideTitle}>
          <Icon name="sliders-horizontal" size={20} />
          Filters
        </h2>
        <Button variant="ghost" size="sm" icon="rotate-ccw" href="/consult">
          Reset Filters
        </Button>
      </div>
      <Select
        label="City / Location"
        name="city"
        id="city"
        options={[{ value: '', label: 'All cities' }, ...cities.map((c) => ({ value: c.name, label: `${c.name} (${c.count})` }))]}
        defaultValue={p.city || ''}
      />
      <div className={styles.group}>
        <ChoiceGroup title="Expertise">
          {visible.map(specialtyBox)}
          {hidden.length ? (
            <ShowMore count={hidden.length} className={styles.more}>
              {hidden.map(specialtyBox)}
            </ShowMore>
          ) : null}
        </ChoiceGroup>
      </div>
      <div className={styles.group}>
        <ChoiceGroup title="Experience" columns={2}>
          {EXPERIENCE_OPTIONS.map((o) => (
            <Checkbox key={o.value} name="exp" value={o.value} label={o.label} defaultChecked={p.exp.includes(o.value)} />
          ))}
        </ChoiceGroup>
      </div>
      <div className={styles.group}>
        <ChoiceGroup title="Language" columns={2}>
          {LANGUAGE_OPTIONS.map((l) => (
            <Checkbox key={l} name="language" value={l} label={l} defaultChecked={p.language.includes(l)} />
          ))}
        </ChoiceGroup>
      </div>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>
          Price Range <span>(per session)</span>
        </h3>
        <RangeSlider
          label="Price per session"
          min={PRICE_RANGE.min}
          max={PRICE_RANGE.max}
          step={PRICE_RANGE.step}
          low={p.minPrice}
          high={p.maxPrice}
          minName="minPrice"
          maxName="maxPrice"
        />
      </div>
      <div className={styles.group}>
        <ChoiceGroup title="Rating">
          {RATING_OPTIONS.map((r) => (
            <Checkbox key={r} name="minRating" value={String(r)} defaultChecked={p.minRating === r}>
              <span className={styles.ratingLabel}>
                <Rating value={r} showValue={false} />
                {`${r.toFixed(1)} & above`}
              </span>
            </Checkbox>
          ))}
        </ChoiceGroup>
      </div>
      <Button type="submit" fullWidth>
        Apply Filters
      </Button>
    </>
  );
}

function ResultsSkeleton() {
  return (
    <>
      <div className={styles.searchBox}>
        <div className={page.skeleton} style={{ height: 48 }} aria-hidden="true" />
      </div>
      <div className={styles.head}>
        <div className={page.skeletonLine} style={{ width: 180 }} aria-hidden="true" />
      </div>
      <div className={styles.grid} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={styles.skelCard} />
        ))}
      </div>
    </>
  );
}

function FiltersSkeleton() {
  return (
    <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[160, 220, 200, 180, 220, 160].map((w, i) => (
        <div key={i} className={page.skeletonLine} style={{ width: w, maxWidth: '100%' }} />
      ))}
    </div>
  );
}
