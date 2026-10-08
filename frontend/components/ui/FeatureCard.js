import Image from 'next/image';
import Icon from './Icon';
import { cx } from './utils';

/** "Why Choose ShaktiPath" card: photo with an icon medal, title and one-line description. */
export default function FeatureCard({ as: Heading = 'h3', image, title, description, icon = 'shield-check', className, ...rest }) {
  return (
    <article className={cx('sp', 'sp-feature', className)} {...rest}>
      <div className="sp-feature__media">
        <Image src={image} alt="" width={290} height={174} sizes="(max-width: 767px) 100vw, 220px" />
        <span className="sp-feature__medal">
          <Icon name={icon} size={24} />
        </span>
      </div>
      <Heading className="sp-feature__title">{title}</Heading>
      {description ? <p className="sp-feature__desc">{description}</p> : null}
    </article>
  );
}
