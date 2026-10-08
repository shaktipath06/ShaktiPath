'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Badge from './Badge';
import Button from './Button';
import IconButton from './IconButton';
import Rating from './Rating';
import { cx, has, inr } from './utils';
import { useCart } from '@/components/shop/CartProvider';

/**
 * Shop product card. "Add to Cart" puts the product in the client-side cart (components/shop/CartProvider).
 * Prices, the discount label and ratings come from the product record; the card never invents them.
 */
export default function ProductCard({
  as: Heading = 'h3',
  id,
  slug,
  name,
  subtitle,
  image,
  price,
  mrp,
  discount,
  rating,
  reviews,
  href,
  favorite,
  onFavoriteChange,
  ctaLabel = 'Add to Cart',
  className,
  ...rest
}) {
  const cart = useCart();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return undefined;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  const p = Number(price);
  const m = mrp == null ? null : Number(mrp);
  const pct = m && m > p && p > 0 ? Math.min(99, Math.round((1 - p / m) * 100)) : 0;
  const off = has(discount) ? (typeof discount === 'number' ? `${discount}% OFF` : String(discount)) : pct ? `${pct}% OFF` : '';
  const fullName = subtitle ? `${name} ${subtitle}` : name;

  const add = () => {
    cart.add({ key: `product:${slug || id}`, kind: 'product', id, slug, name: fullName, price: p, image, href });
    setAdded(true);
  };

  return (
    <article className={cx('sp', 'sp-pcard', className)} {...rest}>
      <div className="sp-pcard__media">
        <Image src={image} alt={name || ''} fill sizes="(max-width: 767px) 50vw, 280px" />
        {off ? (
          <span className="sp-pcard__off">
            <Badge tone="discount" icon={null}>
              {off}
            </Badge>
          </span>
        ) : null}
        <span className="sp-pcard__fav">
          <IconButton
            icon="heart"
            variant="overlay"
            label={`Save ${fullName}`}
            pressed={has(favorite) ? Boolean(favorite) : undefined}
            onToggle={onFavoriteChange}
          />
        </span>
      </div>
      <div className="sp-pcard__body">
        <Heading className="sp-pcard__name">
          {name}
          {subtitle ? <span className="sp-pcard__sub">{subtitle}</span> : null}
        </Heading>
        {Number(rating) > 0 ? <Rating value={rating} count={reviews} stars={1} /> : null}
        <div className="sp-pcard__price">
          <strong>{inr(price)}</strong>
          {m && m > p && p > 0 ? (
            <s>
              <span className="sp-visually-hidden">Was </span>
              {inr(m)}
            </s>
          ) : null}
        </div>
        <Button icon={added ? 'check' : 'shopping-cart'} size="sm" fullWidth onClick={add} ariaLabel={`${ctaLabel}: ${fullName}`}>
          {added ? 'Added to Cart' : ctaLabel}
        </Button>
      </div>
    </article>
  );
}
