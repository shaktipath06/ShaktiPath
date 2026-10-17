'use client';

import { cx } from './utils';

/**
 * Time-slot buttons from the API's slot list: [{ time: '11:00', label: '11:00 AM', available, reason }].
 * `value` is the selected `time`; unavailable slots stay visible but cannot be chosen. When no slot on the day
 * can be chosen (all passed or booked) a status line says so, since the struck-through buttons alone left
 * people wondering why nothing could be selected.
 */
export default function TimeSlots({
  slots = [],
  value,
  onChange,
  label = 'Choose a time',
  emptyText = 'No times available for this date.',
  passedText = 'All times on this day have passed. Please choose another date.',
  bookedText = 'All times on this day are booked. Please choose another date.',
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
  const anyOpen = slots.some((s) => s.available !== false);
  const allPassed = !anyOpen && slots.every((s) => s.reason === 'past');
  return (
    <>
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
      {anyOpen ? null : (
        <p className="sp sp-slots__empty" role="status">
          {allPassed ? passedText : bookedText}
        </p>
      )}
    </>
  );
}
