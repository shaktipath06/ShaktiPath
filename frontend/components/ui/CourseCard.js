'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from './Button';
import Icon from './Icon';
import { cx, has, inr } from './utils';
import { useCart } from '@/components/shop/CartProvider';

/** Course card. "Enrol Now" adds the course to the cart; checkout follows once orders are built. */
export default function CourseCard({
  as: Heading = 'h3',
  id,
  slug,
  image,
  title,
  meta,
  metaIcon = 'circle-play',
  price,
  href,
  ctaLabel = 'Enrol Now',
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

  const add = () => {
    cart.add({ key: `course:${slug || id}`, kind: 'course', id, slug, name: title, price: Number(price) || 0, image, href });
    setAdded(true);
  };

  return (
    <article className={cx('sp', 'sp-ccard', className)} {...rest}>
      <Image className="sp-ccard__img" src={image} alt="" width={336} height={210} sizes="(max-width: 767px) 100vw, 260px" />
      <div className="sp-ccard__body">
        <Heading className="sp-ccard__title">{title}</Heading>
        {meta ? (
          <p className="sp-ccard__meta">
            <Icon name={metaIcon || 'circle-play'} size={16} />
            {meta}
          </p>
        ) : null}
        {has(price) ? <p className="sp-ccard__price">{inr(price)}</p> : null}
        <Button size="sm" fullWidth icon={added ? 'check' : undefined} onClick={add} ariaLabel={`${ctaLabel}: ${title}`}>
          {added ? 'Added to Cart' : ctaLabel}
        </Button>
      </div>
    </article>
  );
}
