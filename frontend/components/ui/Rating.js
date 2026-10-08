import { ICONS } from './icons';
import { cx, has } from './utils';

const STAR = ICONS.star;

function StarRow({ n, size, className }) {
  const stars = [];
  for (let i = 0; i < n; i += 1) {
    stars.push(
      <svg
        key={i}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: STAR }}
      />,
    );
  }
  return <span className={className}>{stars}</span>;
}

function Stars({ value, count = 5, size = 16 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const gap = 2;
  const whole = Math.floor(v);
  const px =
    count === 1
      ? v > 0
        ? size
        : 0
      : whole >= count
        ? count * size + (count - 1) * gap
        : whole * (size + gap) + (v - whole) * size;
  return (
    <span className="sp-stars" style={{ '--sp-star': `${size}px` }}>
      <StarRow n={count} size={size} className="sp-stars__base" />
      <span className="sp-stars__fill" style={{ width: `${Math.round(px * 100) / 100}px` }}>
        <StarRow n={count} size={size} className="sp-stars__row" />
      </span>
    </span>
  );
}

/**
 * Display-only rating: "4.8 (320+)". `stars` 5 shows a row, 1 shows a single star.
 */
export default function Rating({ value, count, countSuffix, stars = 5, size, showValue = true, tone, className, ...rest }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const px = size === 'lg' ? 20 : 16;
  const countText = has(count) ? `(${count}${countSuffix ? ` ${countSuffix}` : ''})` : '';
  return (
    <span
      className={cx('sp', 'sp-rating', size === 'lg' && 'sp-rating--lg', tone === 'dark' && 'sp-rating--dark', className)}
      role="img"
      aria-label={`Rated ${v.toFixed(1)} out of 5${has(count) ? `, ${count} reviews` : ''}`}
      {...rest}
    >
      <Stars value={v} size={px} count={Number(stars) === 1 ? 1 : 5} />
      {showValue ? (
        <span className="sp-rating__value" aria-hidden="true">
          {v.toFixed(1)}
        </span>
      ) : null}
      {countText ? (
        <span className="sp-rating__count" aria-hidden="true">
          {countText}
        </span>
      ) : null}
    </span>
  );
}
