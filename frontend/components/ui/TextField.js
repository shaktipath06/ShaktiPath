import Icon from './Icon';
import { cx } from './utils';

/**
 * Labelled input or textarea. Uncontrolled by default; controlled when `value` and `onChange` are given.
 * `actionLabel` adds an inline button (for "Apply" on a coupon field); use it from a Client Component.
 * Pass `id` when the field is rendered more than once on a page (it falls back to `name`).
 */
export default function TextField({
  id,
  name,
  label,
  type = 'text',
  required = false,
  optional = false,
  multiline = false,
  rows = 4,
  placeholder,
  helper,
  error,
  prefix,
  inputMode,
  autoComplete,
  maxLength,
  defaultValue,
  value,
  onChange,
  onBlur,
  disabled = false,
  readOnly = false,
  actionLabel,
  onAction,
  actionDisabled = false,
  ariaLabel,
  className,
  ...rest
}) {
  const fieldId = id || name;
  const helpId = error || helper ? `${fieldId}-help` : undefined;
  const controlled = onChange && value != null;
  const common = {
    id: fieldId,
    name,
    placeholder,
    required,
    disabled,
    readOnly,
    autoComplete,
    maxLength,
    onChange,
    onBlur,
    'aria-label': label ? undefined : ariaLabel || placeholder,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': helpId,
    className: 'sp-field__input',
    ...(controlled ? { value } : { defaultValue }),
  };
  return (
    <div className={cx('sp', 'sp-field', error && 'is-invalid', className)} {...rest}>
      {label ? (
        <label htmlFor={fieldId} className="sp-field__label">
          {label}
          {required ? (
            <span className="sp-field__req" aria-hidden="true">
              {' *'}
            </span>
          ) : null}
          {optional ? <span className="sp-field__opt"> (Optional)</span> : null}
        </label>
      ) : null}
      <div className={cx('sp-field__control', multiline && 'is-multiline')}>
        {prefix ? <span className="sp-field__prefix">{prefix}</span> : null}
        {multiline ? <textarea rows={Number(rows) || 4} {...common} /> : <input type={type} inputMode={inputMode} {...common} />}
        {actionLabel ? (
          <button
            type="button"
            className="sp-field__action"
            disabled={actionDisabled}
            onClick={(e) => {
              if (onAction) onAction(e.currentTarget.parentNode.querySelector('.sp-field__input').value, e);
            }}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {error || helper ? (
        <p id={helpId} className={cx('sp-field__help', error && 'is-error')}>
          {error ? <Icon name="info" size={16} /> : null}
          {error || helper}
        </p>
      ) : null}
    </div>
  );
}
