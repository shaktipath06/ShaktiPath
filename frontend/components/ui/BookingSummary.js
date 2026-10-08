import Image from 'next/image';
import Icon from './Icon';
import { cx, has, inr } from './utils';

/**
 * Booking summary panel: practitioner, service, date, time, mode, fee lines and the total.
 * `coupon` is an optional node (the coupon field) shown inside an "Apply Coupon" disclosure.
 */
export default function BookingSummary({
  as: Heading = 'h2',
  title = 'Booking Summary',
  image,
  name,
  service,
  date,
  time,
  mode,
  modeIcon = 'video',
  fee,
  feeLabel = 'Session Fee',
  discount,
  discountLabel = 'Coupon discount',
  tax,
  taxLabel = 'GST',
  total,
  coupon,
  note,
  className,
  ...rest
}) {
  const computedTotal = has(total) ? Number(total) : Number(fee || 0) - Number(discount || 0) + Number(tax || 0);
  return (
    <aside className={cx('sp', 'sp-bsum', className)} aria-label={title} {...rest}>
      <Heading className="sp-bsum__title">{title}</Heading>
      {name || service ? (
        <div className="sp-bsum__who">
          {image ? <Image src={image} alt="" width={64} height={56} /> : null}
          <div>
            {name ? <p className="sp-bsum__name">{name}</p> : null}
            {service ? <p className="sp-bsum__svc">{service}</p> : null}
          </div>
        </div>
      ) : null}
      {date || time || mode ? (
        <ul className="sp-bsum__facts">
          {date ? (
            <li>
              <Icon name="calendar" size={20} />
              {date}
            </li>
          ) : null}
          {time ? (
            <li>
              <Icon name="clock" size={20} />
              {time}
            </li>
          ) : null}
          {mode ? (
            <li>
              <Icon name={modeIcon} size={20} />
              {mode}
            </li>
          ) : null}
        </ul>
      ) : null}
      {has(fee) ? (
        <div className="sp-bsum__line">
          <span>{feeLabel}</span>
          <span>{inr(fee)}</span>
        </div>
      ) : null}
      {Number(discount) > 0 ? (
        <div className="sp-bsum__line">
          <span>{discountLabel}</span>
          <span>{`- ${inr(discount)}`}</span>
        </div>
      ) : null}
      {Number(tax) > 0 ? (
        <div className="sp-bsum__line">
          <span>{taxLabel}</span>
          <span>{inr(tax)}</span>
        </div>
      ) : null}
      {coupon ? (
        <details className="sp-bsum__coupon">
          <summary>
            Apply Coupon
            <Icon name="chevron-down" size={20} />
          </summary>
          {coupon}
        </details>
      ) : null}
      {has(total) || has(fee) ? (
        <div className="sp-bsum__total">
          <span>Total Amount</span>
          <strong>{inr(computedTotal)}</strong>
        </div>
      ) : null}
      {note ? <p className="sp-bsum__note">{note}</p> : null}
    </aside>
  );
}
