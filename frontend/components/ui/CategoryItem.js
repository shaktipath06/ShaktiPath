import Image from 'next/image';
import Link from 'next/link';
import Icon from './Icon';
import { cx, isInternalHref } from './utils';

/** Round category thumbnail with a label (the shop's category row). */
export default function CategoryItem({ image, icon = 'flower-2', label, href = '#', active = false, className, ...rest }) {
  const Tag = isInternalHref(href) ? Link : 'a';
  return (
    <Tag className={cx('sp', 'sp-cat', active && 'is-active', className)} href={href} aria-current={active ? 'true' : undefined} {...rest}>
      <span className="sp-cat__circle">{image ? <Image src={image} alt="" width={80} height={80} /> : <Icon name={icon} size={32} />}</span>
      <span className="sp-cat__label">{label}</span>
    </Tag>
  );
}
