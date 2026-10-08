import Avatar from './Avatar';
import Rating from './Rating';
import { cx, has } from './utils';

/** A seeker's review. variant: card (cream panel) | inline (no frame, for carousels). */
export default function ReviewCard({ name, quote, avatar, rating, date, verifiedBooking = false, variant = 'card', className, ...rest }) {
  const inline = variant === 'inline';
  return (
    <figure className={cx('sp', 'sp-review', inline && 'sp-review--inline', className)} {...rest}>
      <Avatar src={avatar} name={name} alt="" size={inline ? 48 : 56} />
      {has(quote) ? <blockquote className="sp-review__quote">{`“${quote}”`}</blockquote> : null}
      <figcaption className="sp-review__head">
        <span className="sp-review__name">{name}</span>
        {has(rating) ? <Rating value={rating} /> : null}
        {date ? <span className="sp-review__date">{date}</span> : null}
        {verifiedBooking ? <span className="sp-review__verified">Verified booking</span> : null}
      </figcaption>
    </figure>
  );
}
