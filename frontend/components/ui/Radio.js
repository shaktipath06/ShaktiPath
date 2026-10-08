import { cx } from './utils';

const slug = (v) =>
  String(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Radio button with a label and an optional description line. */
export default function Radio({
  id,
  name,
  value,
  label,
  children,
  description,
  defaultChecked,
  checked,
  onChange,
  disabled = false,
  className,
}) {
  const dotId = id || `${name || 'radio'}-${slug(value != null ? value : label || '')}`;
  const controlled = onChange && checked !== undefined;
  return (
    <div className={cx('sp', 'sp-radio', className)}>
      <input
        id={dotId}
        type="radio"
        className="sp-radio__dot"
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        {...(controlled ? { checked: Boolean(checked) } : { defaultChecked: Boolean(defaultChecked) })}
      />
      <label htmlFor={dotId} className="sp-radio__label">
        {children || label}
        {description ? <span className="sp-radio__desc">{description}</span> : null}
      </label>
    </div>
  );
}
