'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { cx } from '@/components/ui/utils';
import styles from './page.module.css';

/** Results column plus the filter sidebar; on phones the sidebar folds behind a "Filters" button. */
export default function FilterLayout({ results, filters }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.layout}>
      <div className={styles.results}>
        <div className={styles.filterbar}>
          <Button
            variant="secondary"
            size="sm"
            icon="sliders-horizontal"
            aria-expanded={open}
            aria-controls="filters"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Hide Filters' : 'Filters'}
          </Button>
        </div>
        {results}
      </div>
      <aside id="filters" className={cx(styles.aside, open && styles.asideOpen)} aria-labelledby="filters-title">
        {filters}
      </aside>
    </div>
  );
}
