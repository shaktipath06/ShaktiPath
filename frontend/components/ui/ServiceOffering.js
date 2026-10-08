import Image from 'next/image';
import Button from './Button';
import { cx, inr } from './utils';

/** A service on the profile page: photo, title, description, price and a Book button. */
export default function ServiceOffering({
  as: Heading = 'h3',
  image,
  title,
  description,
  price,
  unit,
  href = '#',
  ctaLabel = 'Book',
  className,
  ...rest
}) {
  return (
    <article className={cx('sp', 'sp-offer', className)} {...rest}>
      {image ? <Image className="sp-offer__img" src={image} alt="" width={96} height={96} /> : null}
      <div className="sp-offer__body">
        <Heading className="sp-offer__title">{title}</Heading>
        {description ? <p className="sp-offer__desc">{description}</p> : null}
        <div className="sp-offer__foot">
          <p className="sp-offer__price">
            <strong>{inr(price)}</strong>
            {unit ? ` / ${unit}` : ''}
          </p>
          <Button size="sm" href={href} ariaLabel={`${ctaLabel}: ${title}`}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
