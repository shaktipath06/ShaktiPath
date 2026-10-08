'use client';

import { cx } from './utils';

/**
 * Time-slot buttons from the API's slot list: [{ time: '11:00', label: '11:00 AM', available, reason }].
 * `value` is the selected `time`; unavailable slots stay visible but cannot be chosen.
 */
export default function TimeSlots({
  slots = [],
  value,
  onChange,
  label = 'Choose a time',
  emptyText = 'No times available for this date.',
  loading = false,
  className,
}) {
  if (loading) {
    return (
      <p className="sp sp-slots__empty" role="status">
        Checking available times…
      </p>
    );
  }
  if (!slots.length) {
    return (
      <p className="sp sp-slots__empty" role="status">
        {emptyText}
      </p>
    );
  }
  return (
    <div className={cx('sp', 'sp-slots', className)} role="group" aria-label={label}>
      {slots.map((s) => {
        const on = s.time === value;
        const off = s.available === false;
        const why = off ? (s.reason === 'booked' ? 'Already booked' : 'This time has passed') : undefined;
        return (
          <button
            key={s.time}
            type="button"
            aria-disabled={off ? 'true' : undefined}
            aria-pressed={on}
            title={why}
            className={cx('sp-slots__slot', on && 'is-selected', off && 'is-disabled')}
            onClick={() => {
              if (!off && onChange) onChange(s.time, s);
            }}
          >
            {s.label}
            {why ? <span className="sp-visually-hidden">{` (${why.toLowerCase()})`}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
