import Hero from '@/components/ui/Hero';
import ProcessSteps from '@/components/ui/ProcessSteps';
import TrustItem from '@/components/ui/TrustItem';
import { cx } from '@/components/ui/utils';
import { BOOK } from '@/content/book';
import page from '@/styles/page.module.css';
import styles from '@/app/book/page.module.css';

/** The booking pages' banner with trust tiles. */
export function BookBanner({ crumbs, title = BOOK.title, subtitle = BOOK.subtitle }) {
  return (
    <Hero
      variant="banner"
      image={BOOK.image}
      breadcrumb={crumbs}
      title={title}
      subtitle={subtitle}
      trust={BOOK.trust}
      trustLayout="tiles"
      showcaseImage
    />
  );
}

/** "Our Promise" tiles and the "What Happens After Booking?" steps. */
export function PromiseSection({ promise = true, after = true }) {
  return (
    <section aria-label="Our promise" className={cx(page.section, page.bgWhite)}>
      <div className={cx(page.wrap, styles.after)}>
        {promise ? (
          <>
            <h2 className={styles.h3}>{BOOK.promiseTitle}</h2>
            <div className={styles.promise}>
              {BOOK.promise.map((p) => (
                <TrustItem key={p.title} layout="stack" icon={p.icon} title={p.title} />
              ))}
            </div>
          </>
        ) : null}
        {after ? (
          <>
            <h2 className={styles.h3}>{BOOK.afterTitle}</h2>
            <ProcessSteps steps={BOOK.afterSteps} />
          </>
        ) : null}
      </div>
    </section>
  );
}
