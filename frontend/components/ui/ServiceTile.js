import Image from 'next/image';
import Link from 'next/link';
import Icon from './Icon';
import { cx, isInternalHref } from './utils';

/** Photographic service tile with a title and an Explore button, from the client mockups. */
export default function ServiceTile({ image, title, ctaLabel = 'Explore', href = '#', className, ...rest }) {
  const Tag = isInternalHref(href) ? Link : 'a';
  return (
    <Tag className={cx('sp', 'sp-stile', className)} href={href} {...rest}>
      <Image src={image} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 1024px) 33vw, 200px" />
      <span className="sp-stile__shade" aria-hidden="true" />
      <span className="sp-stile__body">
        <span className="sp-stile__title">{title}</span>
        <span className="sp-stile__cta">
          {ctaLabel}
          <Icon name="arrow-right" size={16} />
        </span>
      </span>
    </Tag>
  );
}
