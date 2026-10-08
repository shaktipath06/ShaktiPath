import Icon from './Icon';
import { cx, labelOf, list } from './utils';

export const BOOKING_STEPS = ['Select Service & Date', 'Add Details', 'Payment', 'Confirmation'];

/** Booking progress: numbered dots joined by a line; `current` is 1-based. */
export default function Stepper({ steps = BOOKING_STEPS, current = 1, label = 'Booking progress', className, ...rest }) {
  const cur = Number(current) || 1;
  return (
    <ol className={cx('sp', 'sp-stepper', className)} aria-label={label} {...rest}>
      {list(steps).map((step, i) => {
        const n = i + 1;
        const state = n < cur ? 'done' : n === cur ? 'current' : 'todo';
        return (
          <li key={i} className={`sp-stepper__step is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="sp-stepper__dot">{state === 'done' ? <Icon name="check" size={16} /> : n}</span>
            <span className="sp-stepper__label">{labelOf(step)}</span>
            {state === 'done' ? <span className="sp-visually-hidden"> (completed)</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
