import { cx, has } from './utils';

const slug = (v) =>
  String(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Checkbox with its label and an optional count, e.g. "Kali Sadhana (45)". The id derives from name and value. */
export default function Checkbox({
  id,
  name,
  value,
  label,
  children,
  count,
  defaultChecked,
  checked,
  onChange,
  disabled = false,
  required = false,
  className,
}) {
  const boxId = id || `${name || 'check'}-${slug(value != null ? value : label || '')}`;
  const controlled = onChange && checked !== undefined;
  return (
    <div className={cx('sp', 'sp-check', className)}>
      <input
        id={boxId}
        type="checkbox"
        className="sp-check__box"
        name={name}
        value={value}
        disabled={disabled}
        required={required}
        onChange={onChange}
        {...(controlled ? { checked: Boolean(checked) } : { defaultChecked: Boolean(defaultChecked) })}
      />
      <label htmlFor={boxId} className="sp-check__label">
        {children || label}
        {has(count) ? <span className="sp-check__count">{` (${count})`}</span> : null}
      </label>
    </div>
  );
}
