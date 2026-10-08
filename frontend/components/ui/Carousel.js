'use client';

import { useEffect, useRef, useState } from 'react';
import IconButton from './IconButton';
import { cx, reducedMotion } from './utils';

/** Horizontal scroll-snap track with previous/next buttons (hidden on phones, where it swipes). */
export default function Carousel({ label = 'Carousel', className, children, ...rest }) {
  const track = useRef(null);
  const [ends, setEnds] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    const update = () =>
      setEnds({ start: el.scrollLeft <= 1, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 });
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const move = (dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <div className={cx('sp', 'sp-carousel', className)} role="region" aria-label={label} {...rest}>
      <IconButton
        icon="chevron-left"
        variant="outline"
        label="Scroll left"
        className="sp-carousel__prev"
        onClick={() => move(-1)}
        toggle={false}
        disabled={ends.start}
      />
      <div className="sp-carousel__track" ref={track}>
        {children}
      </div>
      <IconButton
        icon="chevron-right"
        variant="outline"
        label="Scroll right"
        className="sp-carousel__next"
        onClick={() => move(1)}
        toggle={false}
        disabled={ends.end}
      />
    </div>
  );
}
