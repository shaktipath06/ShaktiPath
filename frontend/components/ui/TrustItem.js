import Icon from './Icon';
import { cx } from './utils';

/** Icon medallion with a title and short description. tone: light | dark. layout: row | stack. */
export default function TrustItem({ icon = 'shield-check', title, description, tone, layout, className, ...rest }) {
  return (
    <div
      className={cx('sp', 'sp-trust', tone === 'dark' && 'sp-trust--dark', layout === 'stack' && 'sp-trust--stack', className)}
      {...rest}
    >
      <span className="sp-trust__icon">
        <Icon name={icon} size={24} />
      </span>
      <span className="sp-trust__text">
        <span className="sp-trust__title">{title}</span>
        {description ? <span className="sp-trust__desc">{description}</span> : null}
      </span>
    </div>
  );
}
