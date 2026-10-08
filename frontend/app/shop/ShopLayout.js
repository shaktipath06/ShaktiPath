'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { cx } from '@/components/ui/utils';
import { useCart } from '@/components/shop/CartProvider';
import styles from './page.module.css';

/** Product column beside the cart and filters; on phones the filters fold behind a "Filters" button. */
export default function ShopLayout({ products, cart, filters }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  return (
    <div className={styles.layout}>
      <div className={styles.products}>
        <div className={styles.filterbar}>
          <Button
            variant="secondary"
            size="sm"
            icon="sliders-horizontal"
            aria-expanded={open}
            aria-controls="shop-filters"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button variant="secondary" size="sm" icon="shopping-cart" href="#cart">
            {`Cart (${count})`}
          </Button>
        </div>
        {products}
      </div>
      <aside aria-label="Cart and filters" className={styles.aside}>
        {cart}
        <div id="shop-filters" className={cx(styles.filters, open && styles.filtersOpen)} aria-labelledby="filters-title">
          {filters}
        </div>
      </aside>
    </div>
  );
}
