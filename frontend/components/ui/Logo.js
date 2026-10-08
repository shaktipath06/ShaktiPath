import Image from 'next/image';
import { cx } from './utils';

// The client's final logo (trishul rising from a lotus) in the lockups cut for the site.
const LOGOS = {
  primary: { src: '/images/logos/shaktipath-horizontal.webp', w: 663, h: 240 },
  reversed: { src: '/images/logos/shaktipath-horizontal-gold.webp', w: 663, h: 240 },
  stacked: { src: '/images/logos/shaktipath-stacked.webp', w: 448, h: 520 },
  'stacked-reversed': { src: '/images/logos/shaktipath-stacked-gold.webp', w: 448, h: 520 },
  mark: { src: '/images/logos/shaktipath-mark.webp', w: 145, h: 360 },
  'mark-reversed': { src: '/images/logos/shaktipath-mark-gold.webp', w: 145, h: 360 },
};

/**
 * variant: primary (full colour, light grounds) | reversed (gold, dark grounds) | stacked | stacked-reversed | mark | mark-reversed
 */
export default function Logo({ variant = 'primary', height = 48, alt = 'ShaktiPath by TantraTalk', className, priority = false, ...rest }) {
  const logo = LOGOS[variant] || LOGOS.primary;
  const width = Math.round((height * logo.w) / logo.h);
  return (
    <Image
      className={cx('sp-logo', className)}
      src={logo.src}
      alt={alt}
      width={width}
      height={height}
      style={{ height: `${height}px`, width: 'auto' }}
      priority={priority}
      {...rest}
    />
  );
}
