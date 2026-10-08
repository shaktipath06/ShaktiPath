import Button from './Button';
import Icon from './Icon';
import { cx, labelOf, list } from './utils';

/**
 * Tan "Important Information" panel with a tick list, or (tone="support") the rose "Need Guidance?" card
 * with a Chat with Us button.
 */
export default function Notice({
  as: Heading = 'h2',
  id,
  tone,
  icon,
  title,
  subtitle,
  body,
  items,
  href = '#',
  ctaLabel = 'Chat with Us',
  className,
  children,
  ...rest
}) {
  const titleId = id || (tone === 'support' ? 'support-notice-title' : 'notice-title');
  if (tone === 'support') {
    return (
      <aside className={cx('sp', 'sp-notice', 'sp-notice--support', className)} aria-labelledby={titleId} {...rest}>
        <div className="sp-notice__head">
          <span className="sp-notice__disc">
            <Icon name={icon || 'headset'} size={24} />
          </span>
          <div>
            <Heading id={titleId} className="sp-notice__title">
              {title || 'Need Guidance?'}
            </Heading>
            <p className="sp-notice__sub">{subtitle || 'Talk to our team'}</p>
          </div>
        </div>
        <p className="sp-notice__body">{body || 'Get help with booking, services or any questions.'}</p>
        <Button variant="secondary" icon="message-circle" fullWidth size="sm" href={href}>
          {ctaLabel}
        </Button>
      </aside>
    );
  }
  const rows = list(items);
  return (
    <aside className={cx('sp', 'sp-notice', className)} aria-labelledby={titleId} {...rest}>
      <Heading id={titleId} className="sp-notice__title">
        <Icon name={icon || 'info'} size={20} />
        {title || 'Important Information'}
      </Heading>
      {rows.length ? (
        <ul className="sp-notice__list">
          {rows.map((t, i) => (
            <li key={i}>
              <Icon name="circle-check" size={20} />
              <span>{labelOf(t)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {children}
    </aside>
  );
}
