import Link from 'next/link';
import Icon from './Icon';
import { cx, isInternalHref } from './utils';

const ICON_PX = { lg: 20, md: 20, sm: 16, xs: 16 };

/**
 * variant: primary | secondary | ghost | gold | outline-light | burgundy. size: lg | md | sm | xs.
 * With `href` it renders a link (next/link for site routes); otherwise a <button>.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  arrow = false,
  fullWidth = false,
  href,
  type = 'button',
  disabled = false,
  ariaLabel,
  onClick,
  className,
  children,
  ...rest
}) {
  const content = (
    <>
      {icon ? <Icon name={icon} size={ICON_PX[size]} /> : null}
      <span className="sp-btn__label">{children}</span>
      {iconRight || arrow ? <Icon name={iconRight || 'arrow-right'} size={ICON_PX[size]} className="sp-btn__arrow" /> : null}
    </>
  );
  const cls = cx('sp', 'sp-btn', `sp-btn--${variant}`, `sp-btn--${size}`, fullWidth && 'sp-btn--block', className);

  if (href && !disabled) {
    const Tag = isInternalHref(href) ? Link : 'a';
    return (
      <Tag className={cls} href={href} onClick={onClick} aria-label={ariaLabel} {...rest}>
        {content}
      </Tag>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick} aria-label={ariaLabel} {...rest}>
      {content}
    </button>
  );
}
