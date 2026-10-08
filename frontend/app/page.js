import { Suspense } from 'react';
import Button from '@/components/ui/Button';
import FeatureCard from '@/components/ui/FeatureCard';
import Hero from '@/components/ui/Hero';
import ProcessSteps from '@/components/ui/ProcessSteps';
import TrustItem from '@/components/ui/TrustItem';
import { cx } from '@/components/ui/utils';
import DownloadApp from '@/components/home/DownloadApp';
import ExploreServices, { ExploreServicesSkeleton } from '@/components/home/ExploreServices';
import Testimonials, { TestimonialsSkeleton } from '@/components/home/Testimonials';
import TopTantrics, { TopTantricsSkeleton } from '@/components/home/TopTantrics';
import { HERO, SECTIONS, TRUST_STRIP, WHY_CHOOSE } from '@/content/home';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main id="main">
      <Hero variant="home" {...HERO} />

      <section aria-label="Why seekers trust ShaktiPath" className={cx(styles.section, styles.bgWhite, styles.trustStrip)}>
        <div className={cx(styles.wrap, styles.trust)}>
          {TRUST_STRIP.map((item) => (
            <TrustItem key={item.title} icon={item.icon} title={item.title} description={item.description} />
          ))}
        </div>
      </section>

      <section aria-labelledby="why-title" className={cx(styles.section, styles.bgCream)}>
        <div className={cx(styles.wrap, styles.why)}>
          <div className={styles.whyIntro}>
            <h2 id="why-title" className={styles.h2}>
              {WHY_CHOOSE.title} <span className={styles.accent}>{WHY_CHOOSE.accent}</span>
            </h2>
            <p className={styles.whyLead}>{WHY_CHOOSE.lead}</p>
            <p className={styles.whyText}>{WHY_CHOOSE.text}</p>
            <Button arrow href={WHY_CHOOSE.ctaHref}>
              {WHY_CHOOSE.ctaLabel}
            </Button>
          </div>
          {WHY_CHOOSE.features.map((feature) => (
            <FeatureCard
              key={feature.title}
              image={feature.image}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      <Suspense fallback={<TopTantricsSkeleton />}>
        <TopTantrics />
      </Suspense>

      <Suspense fallback={<ExploreServicesSkeleton />}>
        <ExploreServices />
      </Suspense>

      <section aria-labelledby="how-title" className={cx(styles.section, styles.bgCream)}>
        <div className={cx(styles.wrap, styles.how)}>
          <h2 id="how-title" className={cx(styles.h2, styles.h2Section, styles.center)}>
            {SECTIONS.howItWorks.title}
          </h2>
          <ProcessSteps />
        </div>
      </section>

      <DownloadApp />

      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>
    </main>
  );
}
