// "Meet Our Top Tantrics": featured practitioners from the API in a scroll-snap carousel.
import Carousel from '@/components/ui/Carousel';
import SectionHeader from '@/components/ui/SectionHeader';
import TantricCard from '@/components/ui/TantricCard';
import { cx } from '@/components/ui/utils';
import { SECTIONS } from '@/content/home';
import { getHomeData } from '@/lib/api';
import styles from '@/app/page.module.css';

function Frame({ children }) {
  return (
    <section aria-labelledby="top-title" className={cx(styles.section, styles.bgWhite, styles.topTantrics)}>
      <div className={cx(styles.wrap, styles.stack)}>
        <SectionHeader
          id="top-title"
          title={SECTIONS.topTantrics.title}
          subtitle={SECTIONS.topTantrics.subtitle}
          href={SECTIONS.topTantrics.href}
        />
        <div className={styles.carouselPad}>{children}</div>
      </div>
    </section>
  );
}

export default async function TopTantrics() {
  const { tantrics } = await getHomeData();
  return (
    <Frame>
      <Carousel label="Top tantrics">
        {tantrics.map((t) => (
          <TantricCard
            key={t.slug}
            name={t.name}
            specialty={t.specialty}
            image={t.image}
            rating={t.rating}
            reviews={t.reviews}
            href={t.href}
          />
        ))}
      </Carousel>
    </Frame>
  );
}

export function TopTantricsSkeleton() {
  return (
    <Frame>
      <div className={styles.skeletonRow} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    </Frame>
  );
}
