import Link from 'next/link';
import Icon from './Icon';
import { cx } from './utils';
import { hrefWith } from '@/lib/query';

/**
 * Page links that keep the current query string: `basePath` plus `params` (the page's searchParams) with
 * `page` replaced. Renders nothing when there is a single page.
 */
export default function Pagination({ page = 1, total = 1, basePath, params = {}, className }) {
  const pages = Math.max(0, Math.floor(Number(total)) || 0);
  if (pages < 2) return null;
  const current = Math.min(Math.max(1, Math.floor(Number(page)) || 1), pages);
  const href = (n) => hrefWith(basePath, params, { page: n > 1 ? n : undefined });

  const items = [];
  if (pages <= 7) {
    for (let i = 1; i <= pages; i += 1) items.push(i);
  } else {
    let lo = Math.max(2, Math.min(current - 1, pages - 4));
    let hi = Math.min(pages - 1, Math.max(current + 1, 5));
    if (lo === 3) lo = 2;
    if (hi === pages - 2) hi = pages - 1;
    items.push(1);
    if (lo > 2) items.push('gap-l');
    for (let j = lo; j <= hi; j += 1) items.push(j);
    if (hi < pages - 1) items.push('gap-r');
    items.push(pages);
  }

  const arrow = (dir, label, icon) => {
    const off = dir < 0 ? current === 1 : current === pages;
    if (off) {
      return (
        <span className="sp-pager__btn is-disabled" aria-disabled="true" aria-label={label}>
          <Icon name={icon} size={20} />
        </span>
      );
    }
    return (
      <Link className="sp-pager__btn" href={href(current + dir)} aria-label={label} rel={dir < 0 ? 'prev' : 'next'}>
        <Icon name={icon} size={20} />
      </Link>
    );
  };

  return (
    <nav className={cx('sp', 'sp-pager', className)} aria-label="Pagination">
      {arrow(-1, 'Previous page', 'chevron-left')}
      {items.map((n) => {
        if (typeof n === 'string') {
          return (
            <span key={n} className="sp-pager__gap" aria-hidden="true">
              …
            </span>
          );
        }
        if (n === current) {
          return (
            <span key={n} className="sp-pager__btn is-current" aria-current="page" aria-label={`Page ${n}`}>
              {n}
            </span>
          );
        }
        return (
          <Link
            key={n}
            className={cx('sp-pager__btn', n !== 1 && n !== pages && 'sp-pager__btn--aux')}
            href={href(n)}
            aria-label={`Page ${n}`}
          >
            {n}
          </Link>
        );
      })}
      {arrow(1, 'Next page', 'chevron-right')}
    </nav>
  );
}
