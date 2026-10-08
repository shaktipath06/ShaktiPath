import { Suspense } from 'react';
import Form from 'next/form';
import Link from 'next/link';
import ApiUnavailable from '@/components/site/ApiUnavailable';
import SortSelect from '@/components/site/SortSelect';
import Button from '@/components/ui/Button';
import Carousel from '@/components/ui/Carousel';
import CartSummary from '@/components/ui/CartSummary';
import CategoryItem from '@/components/ui/CategoryItem';
import Checkbox from '@/components/ui/Checkbox';
import ChoiceGroup from '@/components/ui/ChoiceGroup';
import CourseCard from '@/components/ui/CourseCard';
import Hero from '@/components/ui/Hero';
import Pagination from '@/components/ui/Pagination';
import ProductCard from '@/components/ui/ProductCard';
import RangeSlider from '@/components/ui/RangeSlider';
import Rating from '@/components/ui/Rating';
import SectionHeader from '@/components/ui/SectionHeader';
import TextField from '@/components/ui/TextField';
import { cx } from '@/components/ui/utils';
import { PRODUCT_SORT_OPTIONS, SHOP, SHOP_PRICE_RANGE, SHOP_RATING_OPTIONS } from '@/content/shop';
import { getCourses, getProducts, getShopCategories, isUnavailable } from '@/lib/api';
import { first, int, many, num, pick, text } from '@/lib/query';
import ShopLayout from './ShopLayout';
import page from '@/styles/page.module.css';
import styles from './page.module.css';

export const metadata = {
  title: `${SHOP.title} ${SHOP.accent}`,
  description: SHOP.subtitle,
};

const PARAM_KEYS = ['category', 'q', 'minPrice', 'maxPrice', 'minRating', 'sort', 'page'];

function parseParams(sp) {
  const ratings = many(sp.minRating)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const sortValue = first(sp.sort);
  return {
    category: many(sp.category),
    q: text(sp.q, 100),
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    minRating: ratings.length ? Math.min(...ratings) : undefined,
    sort: PRODUCT_SORT_OPTIONS.some((o) => o.value === sortValue) ? sortValue : 'popular',
    sortGiven: Boolean(sortValue),
    page: Math.max(1, int(sp.page, 1)),
  };
}

const isFiltered = (p) =>
  p.category.length > 0 || Boolean(p.q) || p.minPrice != null || p.maxPrice != null || p.minRating != null || p.sortGiven || p.page > 1;

const productProps = (pr) => ({
  id: pr.id,
  slug: pr.slug,
  name: pr.name,
  subtitle: pr.subtitle,
  image: pr.image,
  price: pr.price,
  mrp: pr.mrp,
  discount: pr.discount,
  rating: pr.rating,
  reviews: pr.reviews,
  href: pr.href,
});

const courseProps = (c) => ({
  id: c.id,
  slug: c.slug,
  image: c.image,
  title: c.title,
  meta: c.meta,
  metaIcon: c.metaIcon,
  price: c.price,
  href: c.href,
});

export default function ShopPage({ searchParams }) {
  return (
    <main id="main">
      <Hero
        variant="banner"
        image={SHOP.image}
        title={SHOP.title}
        accent={SHOP.accent}
        accentInline
        subtitle={SHOP.subtitle}
        trust={SHOP.trust}
        trustLayout="plain"
        showcaseImage
      />
      <section aria-label="Categories" className={cx(page.section, styles.catSection)}>
        <div className={cx(page.wrap, styles.cats)}>
          <Suspense fallback={<CategoriesSkeleton />}>
            <Categories searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
      <section aria-label="Products" className={cx(page.section, styles.productsSection)}>
        {/* One GET form holds the product search and every filter: submitting navigates to /shop?... */}
        <Form action="/shop" className={page.wrap}>
          <ShopLayout
            products={
              <Suspense fallback={<ProductsSkeleton />}>
                <ShopContent searchParams={searchParams} />
              </Suspense>
            }
            cart={<CartSummary id="cart" note={SHOP.cartNote} />}
            filters={
              <Suspense fallback={<FiltersSkeleton />}>
                <ShopFilters searchParams={searchParams} />
              </Suspense>
            }
          />
        </Form>
      </section>
    </main>
  );
}

async function Categories({ searchParams }) {
  const sp = await searchParams;
  const p = parseParams(sp);
  let categories = [];
  try {
    categories = await getShopCategories();
  } catch {
    return null;
  }
  const onlyThis = (slug) => p.category.length === 1 && p.category[0] === slug;
  return categories.map((c) => (
    <CategoryItem
      key={c.slug}
      image={c.image}
      icon={c.icon || 'flower-2'}
      label={c.name}
      active={p.category.includes(c.slug)}
      href={onlyThis(c.slug) ? '/shop' : `/shop?category=${encodeURIComponent(c.slug)}`}
    />
  ));
}

async function ShopContent({ searchParams }) {
  const sp = await searchParams;
  const p = parseParams(sp);
  if (!isFiltered(p)) return <DefaultSections />;

  const keep = pick(sp, PARAM_KEYS.filter((k) => k !== 'page'));
  const wantsCourses = p.category.includes('courses');
  const productCategories = p.category.filter((c) => c !== 'courses');
  const onlyCourses = wantsCourses && productCategories.length === 0;

  let products = { items: [], total: 0, page: 1, pages: 1 };
  let courses = [];
  try {
    [products, courses] = await Promise.all([
      onlyCourses
        ? products
        : getProducts({
            category: productCategories,
            q: p.q,
            minPrice: p.minPrice,
            maxPrice: p.maxPrice,
            minRating: p.minRating,
            sort: p.sort,
            page: p.page,
            limit: SHOP.pageSize,
          }),
      wantsCourses ? getCourses({ limit: 50 }) : [],
    ]);
  } catch (err) {
    if (isUnavailable(err)) return <ApiUnavailable what="The product list" />;
    throw err;
  }

  // Courses have no search API of their own, so the text and price filters are applied here.
  const needle = p.q ? p.q.toLowerCase() : null;
  const courseList = courses.filter(
    (c) =>
      (!needle || String(c.title).toLowerCase().includes(needle)) &&
      (p.minPrice == null || Number(c.price) >= p.minPrice) &&
      (p.maxPrice == null || Number(c.price) <= p.maxPrice),
  );
  const total = (Number(products.total) || 0) + courseList.length;

  return (
    <div className={styles.results}>
      <div className={styles.head}>
        <h2 className={styles.count}>{`${total} ${total === 1 ? 'Item' : 'Items'} Found`}</h2>
        <SortSelect key={p.sort} options={PRODUCT_SORT_OPTIONS} value={p.sort} />
      </div>
      <p className={styles.context}>
        {p.q ? `Search: “${p.q}”` : 'Filtered results'}
        <Link href="/shop">Clear all filters</Link>
      </p>
      {products.items.length ? (
        <div className={styles.grid}>
          {products.items.map((pr) => (
            <ProductCard key={pr.slug} {...productProps(pr)} />
          ))}
        </div>
      ) : null}
      {courseList.length ? (
        <div className={page.stack}>
          <SectionHeader size="md" id="course-results-title" title={SHOP.sections.courseResults} actionLabel="" />
          <div className={styles.grid}>
            {courseList.map((c) => (
              <CourseCard key={c.slug} {...courseProps(c)} />
            ))}
          </div>
        </div>
      ) : null}
      {!products.items.length && !courseList.length ? (
        <div className={page.empty}>
          <h3 className={page.h5}>{SHOP.emptyTitle}</h3>
          <p className={page.small}>{SHOP.emptyText}</p>
        </div>
      ) : null}
      <Pagination page={products.page} total={products.pages} basePath="/shop" params={keep} />
    </div>
  );
}

async function DefaultSections() {
  let featured;
  let bestSellers;
  let courses;
  try {
    [featured, bestSellers, courses] = await Promise.all([
      getProducts({ featured: 1, limit: 4 }),
      getProducts({ bestSeller: 1, limit: 4 }),
      getCourses({ featured: 1, limit: 8 }),
    ]);
  } catch (err) {
    if (isUnavailable(err)) return <ApiUnavailable what="The shop" />;
    throw err;
  }
  const grid = (items) => (
    <div className={styles.grid}>
      {items.map((pr) => (
        <ProductCard key={pr.slug} {...productProps(pr)} />
      ))}
    </div>
  );
  return (
    <>
      <div className={page.stack}>
        <SectionHeader size="md" id="featured-title" title={SHOP.sections.featured} href="/shop?sort=popular" />
        {grid(featured.items)}
      </div>
      <div className={page.stack}>
        <SectionHeader size="md" id="best-title" title={SHOP.sections.bestSellers} href="/shop?sort=rating" />
        {grid(bestSellers.items)}
      </div>
      {courses.length ? (
        <div className={page.stack}>
          <SectionHeader size="md" id="courses-title" title={SHOP.sections.courses} href="/shop?category=courses" />
          <div className={styles.carouselPad}>
            <Carousel label="Popular courses">
              {courses.map((c) => (
                <CourseCard key={c.slug} {...courseProps(c)} />
              ))}
            </Carousel>
          </div>
        </div>
      ) : null}
    </>
  );
}

async function ShopFilters({ searchParams }) {
  const sp = await searchParams;
  const p = parseParams(sp);
  const categories = await getShopCategories().catch(() => []);
  return (
    <>
      <div className={styles.filtersHead}>
        <h2 id="filters-title" className={styles.filtersTitle}>
          Filters
        </h2>
        <Link href="/shop" className={styles.reset}>
          Reset Filters
        </Link>
      </div>
      <TextField id="shop-q" name="q" type="search" label="Search products" placeholder={SHOP.searchPlaceholder} defaultValue={p.q || ''} />
      <ChoiceGroup title="Category">
        {categories.map((c) => (
          <Checkbox key={c.slug} name="category" value={c.slug} label={c.name} count={c.count} defaultChecked={p.category.includes(c.slug)} />
        ))}
      </ChoiceGroup>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Price Range</h3>
        <RangeSlider
          label="Price"
          min={SHOP_PRICE_RANGE.min}
          max={SHOP_PRICE_RANGE.max}
          step={SHOP_PRICE_RANGE.step}
          low={p.minPrice}
          high={p.maxPrice}
          minName="minPrice"
          maxName="maxPrice"
        />
      </div>
      <div className={styles.group}>
        <ChoiceGroup title="Rating">
          {SHOP_RATING_OPTIONS.map((r) => (
            <Checkbox key={r.value} name="minRating" value={String(r.value)} defaultChecked={p.minRating === r.value}>
              <span className={styles.ratingLabel}>
                <Rating value={r.value} showValue={false} />
                {r.label}
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

function CategoriesSkeleton() {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className={styles.catSkel} aria-hidden="true" />);
}

function ProductsSkeleton() {
  return (
    <div className={page.stack} aria-busy="true" aria-label="Loading products">
      <div className={page.skeletonLine} style={{ width: 220 }} />
      <div className={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.skelCard} />
        ))}
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[160, 220, 200, 180, 220].map((w, i) => (
        <div key={i} className={page.skeletonLine} style={{ width: w, maxWidth: '100%' }} />
      ))}
    </div>
  );
}
