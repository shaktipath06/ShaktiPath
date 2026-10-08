import Rating from './Rating';
import { cx, has, list } from './utils';

/**
 * "4.9 out of 5" with the 5-to-1 star bars. `distribution` is counts per star from 5 down to 1 (the API's
 * ratingDistribution); `average` and `total` come from the practitioner record.
 */
export default function RatingSummary({ average, total, distribution = [], className }) {
  const dist = list(distribution).map((x) => Math.max(0, Number(x) || 0));
  while (dist.length && dist.length < 5) dist.push(0);
  const sum = dist.reduce((s, x) => s + x, 0);
  let avg = has(average) ? Number(average) : sum ? dist.reduce((s, x, i) => s + x * (5 - i), 0) / sum : NaN;
  if (Number.isNaN(avg)) return null;
  avg = Math.max(0, Math.min(5, avg));
  return (
    <div className={cx('sp', 'sp-rsum', className)}>
      <div className="sp-rsum__score">
        <span className="sp-rsum__avg">{avg.toFixed(1)}</span>
        <span className="sp-rsum__outof">out of 5</span>
        <Rating value={avg} showValue={false} size="lg" />
        {has(total) ? <span className="sp-rsum__based">{`Based on ${total} reviews`}</span> : null}
      </div>
      {dist.length ? (
        <dl className="sp-rsum__bars">
          {dist.slice(0, 5).map((count, i) => {
            const stars = 5 - i;
            const w = sum ? Math.round((count / sum) * 100) : 0;
            return (
              <div key={stars} className="sp-rsum__row">
                <dt>{`${stars} Star`}</dt>
                <dd>
                  <span className="sp-rsum__track" aria-hidden="true">
                    <span style={{ width: `${w}%` }} />
                  </span>
                  <span className="sp-rsum__pct">{`${w}%`}</span>
                </dd>
              </div>
            );
          })}
        </dl>
      ) : null}
    </div>
  );
}
