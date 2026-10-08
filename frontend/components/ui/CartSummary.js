'use client';

import Image from 'next/image';
import Button from './Button';
import IconButton from './IconButton';
import QuantityStepper from './QuantityStepper';
import { cx, inr } from './utils';
import { useCart } from '@/components/shop/CartProvider';

/** "Your Cart" panel bound to the client-side cart: lines with quantity steppers, subtotal and checkout. */
export default function CartSummary({
  as: Heading = 'h2',
  cartHref = '#cart',
  checkoutHref = '/checkout',
  note,
  emptyText = 'Your cart is empty.',
  ctaLabel = 'Proceed to Checkout',
  className,
  ...rest
}) {
  const { items, subtotal, setQty, remove } = useCart();
  return (
    <aside className={cx('sp', 'sp-cart', className)} aria-label="Your cart" {...rest}>
      <div className="sp-cart__head">
        <Heading className="sp-cart__title">{`Your Cart (${items.length})`}</Heading>
        <a href={cartHref} className="sp-cart__view">
          View Cart
        </a>
      </div>
      {items.length ? (
        <ul className="sp-cart__items">
          {items.map((it) => (
            <li key={it.key}>
              {it.image ? <Image src={it.image} alt="" width={56} height={56} /> : <span aria-hidden="true" />}
              <div className="sp-cart__info">
                <p className="sp-cart__name">{it.name}</p>
                <p className="sp-cart__price">{inr(it.price)}</p>
              </div>
              <QuantityStepper value={it.qty} size="sm" label={`Quantity of ${it.name}`} onChange={(n) => setQty(it.key, n)} />
              <IconButton
                icon="trash-2"
                variant="plain"
                size="sm"
                label={`Remove ${it.name}`}
                toggle={false}
                className="sp-cart__remove"
                onClick={() => remove(it.key)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="sp-cart__empty">{emptyText}</p>
      )}
      <div className="sp-cart__sub">
        <span>Subtotal</span>
        <strong>{inr(subtotal)}</strong>
      </div>
      {note ? <p className="sp-cart__note">{note}</p> : null}
      <Button fullWidth arrow href={items.length ? checkoutHref : undefined} disabled={!items.length}>
        {ctaLabel}
      </Button>
    </aside>
  );
}
