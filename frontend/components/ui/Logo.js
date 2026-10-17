import Image from 'next/image';
import { cx } from './utils';

// The client's final logo (trishul rising from a lotus) in the lockups cut for the site. Each file is cut from the
// 1254px master at its native resolution (the wordmark is never upscaled), so the browser has real detail to show
// when the page is zoomed. The gold "reversed" versions share the colour versions' alpha, filled with --gold-500.
const LOGOS = {
  primary: { src: '/images/logos/shaktipath-horizontal.webp', w: 1168, h: 423 },
  reversed: { src: '/images/logos/shaktipath-horizontal-gold.webp', w: 1168, h: 423 },
  stacked: { src: '/images/logos/shaktipath-stacked.webp', w: 965, h: 1120 },
  'stacked-reversed': { src: '/images/logos/shaktipath-stacked-gold.webp', w: 965, h: 1120 },
  mark: { src: '/images/logos/shaktipath-mark.webp', w: 341, h: 848 },
  'mark-reversed': { src: '/images/logos/shaktipath-mark-gold.webp', w: 341, h: 848 },
};

/**
 * variant: primary (full colour, light grounds) | reversed (gold, dark grounds) | stacked | stacked-reversed | mark | mark-reversed
 * height: rendered height in CSS px (the width follows the lockup's ratio).
 * sizes: the rendered CSS width as an image `sizes` string, when CSS overrides the width derived from `height`.
 *
 * `sizes` makes next/image emit a width-based srcset (128w, 256w, 384w, 640w ... up to the file's own size) instead
 * of just 1x/2x of `width`, so browser zoom and high-DPI screens get a sharper file; quality 100 keeps the edges
 * clean (allowed in next.config.mjs `images.qualities`).
 */
export default function Logo({ variant = 'primary', height = 48, alt = 'ShaktiPath by TantraTalk', className, priority = false, sizes, ...rest }) {
  const logo = LOGOS[variant] || LOGOS.primary;
  const width = Math.round((height * logo.w) / logo.h);
  return (
    <Image
      className={cx('sp-logo', className)}
      src={logo.src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes || `${width}px`}
      quality={100}
      style={{ height: `${height}px`, width: 'auto' }}
      priority={priority}
      {...rest}
    />
  );
}
