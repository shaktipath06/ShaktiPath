import Image from 'next/image';
import Badge from './Badge';
import Button from './Button';
import Icon from './Icon';
import IconButton from './IconButton';
import Rating from './Rating';
import { cx, has, inr, labelOf, list } from './utils';

/**
 * Practitioner card. variant: compact (carousels) | detailed (search results) | mini (sidebars).
 * Numbers (rating, reviews, price) come from the record; the card never invents them.
 */
export default function TantricCard({
  variant = 'compact',
  as: Heading = 'h3',
  name,
  specialty,
  image,
  rating,
  reviews,
  verified = false,
  tags = [],
  years,
  location,
  price,
  unit,
  favorite,
  ctaLabel,
  href = '#',
  onFavoriteChange,
  onCtaClick,
  className,
  ...rest
}) {
  const alt = [name, specialty].filter(Boolean).join(' - ');
  const cta = ctaLabel || (variant === 'compact' ? 'Book Now' : 'View Profile');
  const hasRating = Number(rating) > 0;
  const hasPrice = has(price);
  const detailed = variant === 'detailed';
  const mini = variant === 'mini';
  const tagList = list(tags);

  return (
    <article className={cx('sp', 'sp-tcard', `sp-tcard--${variant}`, className)} {...rest}>
      <div className="sp-tcard__media">
        <Image src={image} alt={alt} fill sizes="(max-width: 767px) 100vw, 320px" />
        {verified ? (
          <span className="sp-tcard__verified">
            <Badge tone="verified">Verified</Badge>
          </span>
        ) : null}
        <span className="sp-tcard__fav">
          <IconButton
            icon="heart"
            variant="overlay"
            label={`Save ${name}`}
            pressed={has(favorite) ? Boolean(favorite) : undefined}
            onToggle={onFavoriteChange}
          />
        </span>
        {detailed && hasRating ? (
          <span className="sp-tcard__score">
            <Rating value={rating} count={reviews} stars={1} tone="dark" />
          </span>
        ) : null}
      </div>
      <div className="sp-tcard__body">
        <Heading className="sp-tcard__name">{name}</Heading>
        {!detailed && specialty ? <p className="sp-tcard__spec">{specialty}</p> : null}
        {!detailed && hasRating ? <Rating value={rating} count={reviews} stars={1} /> : null}
        {detailed && tagList.length ? (
          <div className="sp-tcard__tags">
            {tagList.map((t, i) => (
              <Badge key={i} tone="tag">
                {labelOf(t)}
              </Badge>
            ))}
          </div>
        ) : null}
        {detailed ? (
          <div className="sp-tcard__meta">
            {years ? (
              <span>
                <Icon name="award" size={16} />
                {years}
              </span>
            ) : null}
            {location ? (
              <span>
                <Icon name="map-pin" size={16} />
                {location}
              </span>
            ) : null}
          </div>
        ) : null}
        {detailed && hasPrice ? (
          <p className="sp-tcard__price">
            <strong>{inr(price)}</strong>
            {` / ${unit || 'session'}`}
          </p>
        ) : null}
        <Button href={href} fullWidth size={mini ? 'sm' : 'md'} onClick={onCtaClick} ariaLabel={`${cta}: ${name}`}>
          {cta}
        </Button>
      </div>
    </article>
  );
}
