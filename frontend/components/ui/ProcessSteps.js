import Icon from './Icon';
import { cx, list } from './utils';

export const DEFAULT_STEPS = [
  { icon: 'search', title: 'Find a Tantric', description: 'Browse and choose your practitioner' },
  { icon: 'calendar', title: 'Book a Session', description: 'Select a date and time' },
  { icon: 'credit-card', title: 'Make Payment', description: 'Pay by UPI, card or net banking' },
  { icon: 'sparkles', title: 'Get Guidance', description: 'Receive your practitioner’s guidance' },
];

/** Numbered "How It Works" steps with icon medallions and dashed connectors. */
export default function ProcessSteps({ steps = DEFAULT_STEPS, numbered = true, className, ...rest }) {
  const items = list(steps).map((s) => (typeof s === 'string' || typeof s === 'number' ? { title: String(s) } : s || {}));
  return (
    <ol className={cx('sp', 'sp-steps', className)} style={{ '--sp-steps': items.length }} {...rest}>
      {items.map((s, i) => (
        <li key={i} className="sp-steps__item">
          <span className="sp-steps__medal">
            <Icon name={s.icon || 'check'} size={24} />
          </span>
          <span className="sp-steps__title">{`${numbered ? `${i + 1}. ` : ''}${s.title || ''}`}</span>
          {s.description ? <span className="sp-steps__desc">{s.description}</span> : null}
        </li>
      ))}
    </ol>
  );
}
