'use client';

import { useState } from 'react';
import { cx, inr } from './utils';

/**
 * Two-thumb price range. Inside a GET form, `minName` and `maxName` add hidden inputs that are submitted only
 * when the thumbs have moved away from the ends, so untouched sliders do not clutter the URL.
 */
export default function RangeSlider({
  label = 'Price range',
  min = 0,
  max = 50000,
  step = 500,
  low,
  high,
  minName,
  maxName,
  plus = true,
  onChange,
  className,
}) {
  const span = max > min ? max - min : 1;
  const clamp = (x) => Math.min(max, Math.max(min, x));
  const [v, setV] = useState([
    low != null && low !== '' ? clamp(Number(low)) : min,
    high != null && high !== '' ? clamp(Number(high)) : max,
  ]);
  const update = (a, b) => {
    setV([a, b]);
    if (onChange) onChange({ low: a, high: b });
  };
  const pct = (x) => ((x - min) / span) * 100;
  const minOnTop = v[0] > min + span / 2;
  const text = String(label).toLowerCase();
  const atMax = v[1] >= max && plus;

  return (
    <div className={cx('sp', 'sp-range', className)} role="group" aria-label={label}>
      <div className="sp-range__track">
        <div className="sp-range__fill" style={{ left: `${pct(v[0])}%`, right: `${100 - pct(v[1])}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={v[0]}
          style={{ zIndex: minOnTop ? 3 : 1 }}
          aria-label={`Minimum ${text}`}
          aria-valuetext={inr(v[0])}
          onChange={(e) => update(Math.min(Number(e.target.value), v[1]), v[1])}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={v[1]}
          style={{ zIndex: 2 }}
          aria-label={`Maximum ${text}`}
          aria-valuetext={inr(v[1]) + (atMax ? ' or more' : '')}
          onChange={(e) => update(v[0], Math.max(Number(e.target.value), v[0]))}
        />
      </div>
      <div className="sp-range__values">
        <span>{inr(v[0])}</span>
        <span>{inr(v[1]) + (atMax ? '+' : '')}</span>
      </div>
      {minName ? <input type="hidden" name={minName} value={v[0]} disabled={v[0] <= min} /> : null}
      {maxName ? <input type="hidden" name={maxName} value={v[1]} disabled={v[1] >= max} /> : null}
    </div>
  );
}
