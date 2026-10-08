import Button from '@/components/ui/Button';
import styles from './not-found.module.css';

export const metadata = {
  title: 'Page not available yet',
};

// Shown for any route that does not exist yet (the header and footer links point at pages
// still to be built) as well as for genuine wrong URLs.
export default function NotFound() {
  return (
    <main id="main" className={styles.main}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Coming soon</p>
        <h1 className={styles.title}>This page is not available yet</h1>
        <p className={styles.text}>
          The home page, Find a Tantric, practitioner profiles, session booking and the shop are ready; the rest of the site is
          being built. Please head back to the home page or find a practitioner.
        </p>
        <div className={styles.actions}>
          <Button href="/" arrow>
            Back to Home
          </Button>
          <Button href="/consult" variant="secondary">
            Find a Tantric
          </Button>
        </div>
      </div>
    </main>
  );
}
