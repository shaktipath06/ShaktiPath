'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';
import { cx, has, isInternalHref } from './utils';

// State seeded from a prop that re-syncs when the prop changes; an undefined prop keeps it uncontrolled.
function useSynced(prop, initial) {
  const [value, setValue] = useState(prop !== undefined ? prop : initial);
  const [prev, setPrev] = useState(prop);
  if (prev !== prop) {
    setPrev(prop);
    if (prop !== undefined) setValue(prop);
  }
  return [value, setValue];
}

/**
 * Round icon button. variant: soft | plain | plain-light | overlay | outline. A heart toggles (saved state)
 * unless `toggle` says otherwise.
 */
export default function IconButton({
  icon,
  label,
  variant = 'soft',
  size = 'md',
  pressed,
  toggle,
  badge,
  disabled = false,
  ariaLabel,
  href,
  onClick,
  onToggle,
  className,
  ...rest
}) {
  const toggles = toggle !== undefined && toggle !== null ? Boolean(toggle) : icon === 'heart';
  const [on, setOn] = useSynced(pressed !== undefined ? Boolean(pressed) : undefined, false);
  const cls = cx(
    'sp',
    'sp-ibtn',
    `sp-ibtn--${variant}`,
    `sp-ibtn--${size}`,
    on && toggles && 'is-on',
    disabled && 'is-disabled',
    className,
  );
  const px = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const a11yLabel = ariaLabel || label || icon;

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (toggles) {
      setOn(!on);
      if (onToggle) onToggle(!on);
    }
    if (onClick) onClick(e);
  };

  const content = (
    <>
      <Icon name={icon} size={px} filled={on && toggles} />
      {has(badge) && Number(badge) !== 0 ? <span className="sp-ibtn__badge">{badge}</span> : null}
    </>
  );

  if (href) {
    const Tag = isInternalHref(href) ? Link : 'a';
    return (
      <Tag className={cls} href={href} onClick={handleClick} aria-label={a11yLabel} {...rest}>
        {content}
      </Tag>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      onClick={handleClick}
      aria-label={a11yLabel}
      aria-pressed={toggles ? on : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
