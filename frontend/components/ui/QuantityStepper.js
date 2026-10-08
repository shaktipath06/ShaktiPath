'use client';

import { useState } from 'react';
import Icon from './Icon';
import { cx } from './utils';

/** Minus / count / plus control. Controlled when `value` and `onChange` are given. */
export default function QuantityStepper({ value, min = 1, max = 99, label = 'Quantity', size, onChange, className }) {
  const clamp = (n) => Math.min(max, Math.max(min, Number(n) || min));
  const [inner, setInner] = useState(clamp(value != null ? value : min));
  const controlled = onChange && value != null;
  const v = controlled ? clamp(value) : inner;
  const name = String(label).toLowerCase();
  const to = (n) => {
    const next = clamp(n);
    if (next === v) return;
    if (!controlled) setInner(next);
    if (onChange) onChange(next);
  };
  const btn = (dir, verb, icon) => {
    const off = dir < 0 ? v <= min : v >= max;
    return (
      <button
        type="button"
        aria-label={`${verb} ${name}`}
        aria-disabled={off ? 'true' : undefined}
        className={off ? 'is-disabled' : undefined}
        onClick={() => {
          if (!off) to(v + dir);
        }}
      >
        <Icon name={icon} size={16} />
      </button>
    );
  };
  return (
    <div className={cx('sp', 'sp-qty', size === 'sm' && 'sp-qty--sm', className)} role="group" aria-label={label}>
      {btn(-1, 'Decrease', 'minus')}
      <output aria-live="polite">{v}</output>
      {btn(1, 'Increase', 'plus')}
    </div>
  );
}
