'use client';

import Button from '@/components/ui/Button';
import styles from './not-found.module.css';

// Branded error boundary for the inner pages (an API or database failure that is not a plain 404).
export default function ErrorPage({ error, reset }) {
  if (typeof console !== 'undefined' && error) console.error(error);
  return (
    <main id="main" className={styles.main}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Something went wrong</p>
        <h1 className={styles.title}>This page could not be loaded</h1>
        <p className={styles.text}>
          Please try again in a moment. If the problem continues, the API or the database may be unavailable.
        </p>
        <div className={styles.actions}>
          <Button onClick={() => reset()} arrow>
            Try Again
          </Button>
          <Button href="/" variant="secondary">
            Back to Home
          </Button>
        </div>
      </div>
    </main>
  );
}
