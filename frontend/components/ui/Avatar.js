'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cx } from './utils';

/** Round photo with an initials fallback when the image is missing or fails to load. */
export default function Avatar({ src, name, alt, size = 56, className, ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const initials = String(name || '?')
    .trim()
    .split(/\s+/)
    .map((w) => Array.from(w)[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const style = { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.38)}px` };
  const decorative = alt === '';

  if (src && failedSrc !== src) {
    return (
      <Image
        className={cx('sp', 'sp-avatar', className)}
        src={src}
        alt={alt != null ? alt : name || ''}
        width={size}
        height={size}
        style={style}
        onError={() => setFailedSrc(src)}
        {...rest}
      />
    );
  }
  return (
    <span
      className={cx('sp', 'sp-avatar', 'sp-avatar--initials', className)}
      style={style}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name || 'User'}
      aria-hidden={decorative ? 'true' : undefined}
      {...rest}
    >
      {initials}
    </span>
  );
}
