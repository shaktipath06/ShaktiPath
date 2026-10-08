import Icon from './Icon';
import { cx } from './utils';

/** Round icon medallion with a value and a label, e.g. "15+ Years / Experience". */
export default function StatItem({ icon = 'award', value, label, className, ...rest }) {
  return (
    <div className={cx('sp', 'sp-stat', className)} {...rest}>
      <span className="sp-stat__icon">
        <Icon name={icon} size={24} />
      </span>
      <span className="sp-stat__value">{value}</span>
      {label ? <span className="sp-stat__label">{label}</span> : null}
    </div>
  );
}
