// "Explore Our Services": the six service tiles from the API.
import SectionHeader from '@/components/ui/SectionHeader';
import ServiceTile from '@/components/ui/ServiceTile';
import { cx } from '@/components/ui/utils';
import { SECTIONS } from '@/content/home';
import { getHomeData } from '@/lib/api';
import styles from '@/app/page.module.css';

function Frame({ children }) {
  return (
    <section aria-labelledby="services-title" className={cx(styles.section, styles.bgWhite, styles.servicesSection)}>
      <div className={cx(styles.wrap, styles.stack)}>
        <SectionHeader id="services-title" title={SECTIONS.services.title} href={SECTIONS.services.href} />
        <div className={styles.services}>{children}</div>
      </div>
    </section>
  );
}

export default async function ExploreServices() {
  const { serviceCategories } = await getHomeData();
  return (
    <Frame>
      {serviceCategories.map((c) => (
        <ServiceTile key={c.slug} image={c.image} title={c.name} href={c.href} />
      ))}
    </Frame>
  );
}

export function ExploreServicesSkeleton() {
  return (
    <Frame>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={styles.skeletonTile} aria-hidden="true" />
      ))}
    </Frame>
  );
}
