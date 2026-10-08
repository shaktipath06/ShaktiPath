import Icon from './Icon';
import { cx, list } from './utils';

/**
 * Native select with the design-system chrome. `options` are strings or { value, label }.
 * Uncontrolled by default (`defaultValue`); controlled when `value` and `onChange` are given.
 */
export default function Select({
  id,
  name,
  label,
  options = [],
  placeholder,
  defaultValue,
  value,
  onChange,
  inline = false,
  required = false,
  disabled = false,
  ariaLabel,
  className,
  ...rest
}) {
  const selectId = id || name;
  const controlled = onChange && value != null;
  return (
    <div className={cx('sp', 'sp-select', inline && 'sp-select--inline', className)} {...rest}>
      {label ? (
        <label htmlFor={selectId} className="sp-field__label">
          {label}
          {required ? (
            <span className="sp-field__req" aria-hidden="true">
              {' *'}
            </span>
          ) : null}
        </label>
      ) : null}
      <div className="sp-select__box">
        <select
          id={selectId}
          name={name}
          required={required}
          disabled={disabled}
          onChange={onChange}
          className="sp-select__el"
          aria-label={label ? undefined : ariaLabel || placeholder}
          {...(controlled ? { value } : { defaultValue: defaultValue != null ? defaultValue : placeholder ? '' : undefined })}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {list(options).map((o, i) => {
            const obj = o !== null && typeof o === 'object';
            const v = obj ? o.value : o;
            const l = obj ? (o.label != null ? o.label : o.value) : o;
            return (
              <option key={i} value={v}>
                {l}
              </option>
            );
          })}
        </select>
        <Icon name="chevron-down" size={20} className="sp-select__chev" />
      </div>
    </div>
  );
}
