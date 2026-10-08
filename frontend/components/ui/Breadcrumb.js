import Link from 'next/link';
import Icon from './Icon';
import { cx, isInternalHref, labelOf, list } from './utils';

/** items: strings or { label, href }; the last item is the current page. tone: light | dark. */
export default function Breadcrumb({ items, tone }) {
  const crumbs = list(items);
  return (
    <nav className={cx('sp', 'sp-crumbs', tone === 'dark' && 'sp-crumbs--dark')} aria-label="Breadcrumb">
      <ol>
        {crumbs.map((item, i) => {
          const label = labelOf(item);
          const last = i === crumbs.length - 1;
          const href = (item && item.href) || '#';
          const Tag = isInternalHref(href) ? Link : 'a';
          return (
            <li key={i}>
              {last ? <span aria-current="page">{label}</span> : <Tag href={href}>{label}</Tag>}
              {last ? null : <Icon name="chevron-right" size={16} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
