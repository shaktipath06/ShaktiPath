'use client';

import { useEffect, useRef, useState } from 'react';
import { cx, labelOf, list } from './utils';

/**
 * Tab strip that jumps to sections of the same page. `items` are { label, href: '#section-id' }.
 * The active tab follows the section in view and the arrow keys move between tabs.
 */
export default function SectionTabs({ items, label = 'Sections', className }) {
  const tabs = list(items).map((it) => (typeof it === 'string' ? { label: it, href: `#${it.toLowerCase()}` } : it));
  const [active, setActive] = useState(tabs[0] ? tabs[0].href : null);
  const box = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;
    const targets = tabs.map((t) => document.getElementById(String(t.href).replace(/^#/, ''))).filter(Boolean);
    if (!targets.length) return undefined;
    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : null));
        let best = null;
        for (const t of targets) {
          const top = visible.get(t.id);
          if (top != null && (best == null || top < best.top)) best = { id: t.id, top };
        }
        if (best) setActive(`#${best.id}`);
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: [0, 0.2] },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.map((t) => t.href).join('|')]);

  const onKey = (e) => {
    const idx = tabs.findIndex((t) => t.href === active);
    const n = tabs.length;
    let next = null;
    if (e.key === 'ArrowRight') next = (idx + 1) % n;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    if (next === null) return;
    e.preventDefault();
    const links = box.current ? box.current.querySelectorAll('a') : [];
    if (links[next]) links[next].focus();
    setActive(tabs[next].href);
  };

  return (
    <nav className={cx('sp', 'sp-tabs', className)} aria-label={label} ref={box} onKeyDown={onKey}>
      {tabs.map((t) => {
        const on = t.href === active;
        return (
          <a
            key={t.href}
            href={t.href}
            className={cx('sp-tabs__tab', on && 'is-active')}
            aria-current={on ? 'location' : undefined}
            onClick={() => setActive(t.href)}
          >
            {labelOf(t)}
          </a>
        );
      })}
    </nav>
  );
}
