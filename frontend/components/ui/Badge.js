import Icon from './Icon';
import { cx } from './utils';

const BADGE_ICON = { verified: 'badge-check', experience: 'award' };

/** tone: verified | experience | tag | discount | count | success | warning */
export default function Badge({ tone = 'tag', icon, label, className, children, ...rest }) {
  const iconName = icon === undefined ? BADGE_ICON[tone] : icon;
  return (
    <span className={cx('sp', 'sp-badge', `sp-badge--${tone}`, className)} {...rest}>
      {iconName ? <Icon name={iconName} size={16} /> : null}
      {children || label || (tone === 'verified' ? 'Verified' : '')}
    </span>
  );
}
