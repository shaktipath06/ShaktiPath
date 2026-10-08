import Link from 'next/link';
import Icon from './Icon';
import { cx, isInternalHref } from './utils';

/**
 * Section title with an optional subtitle and a "View All" action. Pass actionLabel="" to hide the action.
 * size: md | sm (default is the 32px section title). as: h1 | h2 | h3.
 */
export default function SectionHeader({
  id,
  title,
  accent,
  subtitle,
  actionLabel,
  actionAriaLabel,
  href = '#',
  size,
  tone,
  as: Tag = 'h2',
  className,
  ...rest
}) {
  const label = actionLabel || 'View All';
  const ActionTag = isInternalHref(href) ? Link : 'a';
  return (
    <div className={cx('sp', 'sp-shead', tone === 'dark' && 'sp-shead--dark', size && `sp-shead--${size}`, className)} {...rest}>
      <div className="sp-shead__text">
        <Tag id={id} className="sp-shead__title">
          {title}
          {accent ? <span className="sp-shead__accent"> {accent}</span> : null}
        </Tag>
        {subtitle ? <p className="sp-shead__sub">{subtitle}</p> : null}
      </div>
      {actionLabel === '' ? null : (
        <ActionTag
          className="sp-shead__action"
          href={href}
          aria-label={actionAriaLabel || (title ? `${label}: ${title}` : undefined)}
        >
          {label}
          <Icon name="arrow-right" size={20} />
        </ActionTag>
      )}
    </div>
  );
}
