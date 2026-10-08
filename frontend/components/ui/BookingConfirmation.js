import Button from './Button';
import Icon from './Icon';
import { cx, has, inr } from './utils';

/** Green-tick confirmation card with the booking facts and follow-up actions. */
export default function BookingConfirmation({
  id = 'confirmation-title',
  title = 'Booking Received',
  message = 'Your session has been booked.',
  bookingId,
  date,
  time,
  amount,
  amountLabel = 'Amount',
  method,
  calendarHref,
  bookingsHref = '/account/bookings',
  note = 'You will receive a confirmation email and SMS shortly.',
  className,
  children,
  ...rest
}) {
  const rows = [
    ['Booking ID', bookingId],
    ['Date', date],
    ['Time', time],
    [amountLabel, has(amount) ? inr(amount) : null],
    ['Payment Method', method],
  ].filter((r) => has(r[1]));
  return (
    <section className={cx('sp', 'sp-confirm', className)} aria-labelledby={id} {...rest}>
      <span className="sp-confirm__disc">
        <Icon name="check" size={32} strokeWidth={3} />
      </span>
      <h2 id={id} className="sp-confirm__title">
        {title}
      </h2>
      <p className="sp-confirm__lead">{message}</p>
      {rows.length ? (
        <dl className="sp-confirm__rows">
          {rows.map((r) => (
            <div key={r[0]}>
              <dt>{r[0]}</dt>
              <dd>{r[1]}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children}
      <div className="sp-confirm__actions">
        {calendarHref ? (
          <Button variant="secondary" icon="calendar-check" size="sm" fullWidth href={calendarHref}>
            Add to Calendar
          </Button>
        ) : null}
        <Button variant="secondary" size="sm" fullWidth href={bookingsHref}>
          View My Bookings
        </Button>
      </div>
      {note ? <p className="sp-confirm__note">{note}</p> : null}
    </section>
  );
}
