'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon';
import { cx } from './utils';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parse = (iso) => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m: m - 1, d };
};
const toIso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/**
 * Month calendar (keyboard grid: arrows, Home, End, PageUp, PageDown). All dates are 'YYYY-MM-DD'.
 * `value` is the selected date, `min`/`max` bound what can be chosen, `today` marks today (pass the IST date).
 */
export default function DatePicker({ value, min, max, today, onChange, label = 'Choose a date', className }) {
  const selected = parse(value);
  const lo = parse(min);
  const hi = parse(max);
  const tod = parse(today);
  const start = selected || tod || lo || { y: new Date().getFullYear(), m: new Date().getMonth() };
  const [ym, setYm] = useState({ y: start.y, m: start.m });
  const [focusDay, setFocusDay] = useState(null);
  const grid = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (focusDay == null || !grid.current) return;
    const el = grid.current.querySelector(`[data-day="${focusDay}"]`);
    if (el) el.focus();
  }, [focusDay, ym]);

  const first = new Date(ym.y, ym.m, 1).getDay();
  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const monthIndex = ym.y * 12 + ym.m;
  const prevOff = Boolean(lo) && monthIndex <= lo.y * 12 + lo.m;
  const nextOff = Boolean(hi) && monthIndex >= hi.y * 12 + hi.m;
  const isDisabled = (d) => {
    const iso = toIso(ym.y, ym.m, d);
    return Boolean(min && iso < min) || Boolean(max && iso > max);
  };
  const isToday = (d) => Boolean(tod) && tod.y === ym.y && tod.m === ym.m && tod.d === d;
  const isSelected = (d) => Boolean(selected) && selected.y === ym.y && selected.m === ym.m && selected.d === d;

  const move = (k) => {
    let m = ym.m + k;
    let y = ym.y;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setYm({ y, m });
    return { y, m };
  };
  const choose = (d) => {
    if (onChange) onChange(toIso(ym.y, ym.m, d));
  };
  const activeDay =
    focusDay ||
    (selected && selected.y === ym.y && selected.m === ym.m ? selected.d : tod && tod.y === ym.y && tod.m === ym.m ? tod.d : 1);

  const onKey = (e) => {
    const d = Number(e.target.getAttribute('data-day'));
    if (!d) return;
    let next = null;
    if (e.key === 'ArrowRight') next = d + 1;
    else if (e.key === 'ArrowLeft') next = d - 1;
    else if (e.key === 'ArrowDown') next = d + 7;
    else if (e.key === 'ArrowUp') next = d - 7;
    else if (e.key === 'Home') next = d - ((first + d - 1) % 7);
    else if (e.key === 'End') next = d + (6 - ((first + d - 1) % 7));
    else if (e.key === 'PageUp') {
      e.preventDefault();
      const a = move(-1);
      setFocusDay(Math.min(d, new Date(a.y, a.m + 1, 0).getDate()));
      return;
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      const b = move(1);
      setFocusDay(Math.min(d, new Date(b.y, b.m + 1, 0).getDate()));
      return;
    }
    if (next === null) return;
    e.preventDefault();
    if (next < 1) {
      const pm = move(-1);
      setFocusDay(new Date(pm.y, pm.m + 1, 0).getDate() + next);
    } else if (next > days) {
      move(1);
      setFocusDay(next - days);
    } else {
      setFocusDay(next);
    }
  };

  const cells = [];
  for (let i = 0; i < first; i += 1) cells.push(null);
  for (let d = 1; d <= days; d += 1) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const rows = [];
  for (let r = 0; r < cells.length; r += 7) rows.push(cells.slice(r, r + 7));

  return (
    <div className={cx('sp', 'sp-cal', className)} role="group" aria-labelledby={titleId} aria-label={label}>
      <div className="sp-cal__head">
        <button
          type="button"
          className={cx('sp-cal__nav', prevOff && 'is-disabled')}
          aria-label="Previous month"
          aria-disabled={prevOff ? 'true' : undefined}
          onClick={() => {
            if (!prevOff) {
              move(-1);
              setFocusDay(null);
            }
          }}
        >
          <Icon name="chevron-left" size={20} />
        </button>
        <span id={titleId} className="sp-cal__title" aria-live="polite">
          {`${MONTHS[ym.m]} ${ym.y}`}
        </span>
        <button
          type="button"
          className={cx('sp-cal__nav', nextOff && 'is-disabled')}
          aria-label="Next month"
          aria-disabled={nextOff ? 'true' : undefined}
          onClick={() => {
            if (!nextOff) {
              move(1);
              setFocusDay(null);
            }
          }}
        >
          <Icon name="chevron-right" size={20} />
        </button>
      </div>
      <div className="sp-cal__grid" role="grid" aria-labelledby={titleId} ref={grid} onKeyDown={onKey}>
        <div className="sp-cal__row" role="row">
          {DOW.map((w) => (
            <span key={w} role="columnheader" className="sp-cal__dow" abbr={w} title={w}>
              {w.charAt(0)}
            </span>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} className="sp-cal__row" role="row">
            {row.map((c, ci) => {
              if (!c) return <span key={`e${ci}`} role="gridcell" aria-hidden="true" className="sp-cal__empty" />;
              const disabled = isDisabled(c);
              const tod2 = isToday(c);
              const on = isSelected(c);
              return (
                <span key={c} role="gridcell" aria-selected={on}>
                  <button
                    type="button"
                    data-day={c}
                    tabIndex={c === activeDay ? 0 : -1}
                    aria-disabled={disabled ? 'true' : undefined}
                    aria-label={`${c} ${MONTHS[ym.m]} ${ym.y}${tod2 ? ', today' : ''}${disabled ? ', unavailable' : ''}`}
                    className={cx('sp-cal__day', on && 'is-selected', tod2 && 'is-today', disabled && 'is-disabled')}
                    onClick={() => {
                      if (!disabled) {
                        setFocusDay(c);
                        choose(c);
                      }
                    }}
                  >
                    {c}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
