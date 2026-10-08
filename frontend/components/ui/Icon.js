import { ICONS } from './icons';
import { cx } from './utils';

// Friendly aliases for icon names used in the design.
const ALIASES = {
  cart: 'shopping-cart',
  close: 'x',
  'check-circle': 'circle-check',
  support: 'headset',
  bank: 'landmark',
  play: 'circle-play',
  'play-circle': 'circle-play',
  filter: 'sliders-horizontal',
  grid: 'layout-grid',
  home: 'house',
  help: 'circle-help',
  verified: 'badge-check',
  location: 'map-pin',
  time: 'clock',
  date: 'calendar',
  chat: 'message-circle',
  lotus: 'flower-2',
  diya: 'flame',
  experience: 'award',
  course: 'graduation-cap',
  share: 'share-2',
  trash: 'trash-2',
};

export const ICON_NAMES = Object.keys(ICONS);

/**
 * Line icon on a 24px grid. Decorative by default (aria-hidden); pass `label` to make it meaningful.
 */
export default function Icon({
  name,
  size = 24,
  label,
  filled = false,
  strokeWidth = 2,
  color,
  className,
  style,
  ...rest
}) {
  const key = ALIASES[name] || name;
  const body = ICONS[key] || ICONS['circle-help'];
  return (
    <svg
      className={cx('sp-icon', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
      style={color ? { color, ...style } : style}
      dangerouslySetInnerHTML={{ __html: body }}
      {...rest}
    />
  );
}
