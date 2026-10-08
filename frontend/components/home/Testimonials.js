// "What Our Users Say": featured reviews from the API.
import ReviewCard from '@/components/ui/ReviewCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { cx } from '@/components/ui/utils';
import { SECTIONS } from '@/content/home';
import { getHomeData } from '@/lib/api';
import styles from '@/app/page.module.css';

function Frame({ children }) {
  return (
    <section aria-labelledby="reviews-title" className={cx(styles.section, styles.bgWhite)}>
      <div className={cx(styles.wrap, styles.stack)}>
        <SectionHeader id="reviews-title" title={SECTIONS.reviews.title} href={SECTIONS.reviews.href} />
        <div className={styles.reviews}>{children}</div>
      </div>
    </section>
  );
}

export default async function Testimonials() {
  const { reviews } = await getHomeData();
  return (
    <Frame>
      {reviews.map((r, i) => (
        <ReviewCard
          key={r.id ?? `${r.name}-${i}`}
          name={r.name}
          avatar={r.avatar}
          rating={r.rating}
          quote={r.quote}
          verifiedBooking={r.verifiedBooking}
        />
      ))}
    </Frame>
  );
}

export function TestimonialsSkeleton() {
  return (
    <Frame>
      {[0, 1, 2].map((i) => (
        <div key={i} className={styles.skeletonReview} aria-hidden="true" />
      ))}
    </Frame>
  );
}
