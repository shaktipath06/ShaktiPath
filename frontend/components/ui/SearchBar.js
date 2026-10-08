import Form from 'next/form';
import Icon from './Icon';
import { cx } from './utils';

/**
 * Search field. By default it is its own GET form (next/form: the query joins the URL as `?q=` and the page
 * navigates client-side). With `asForm={false}` it renders a search landmark that submits the surrounding form.
 * variant: button (text button) | icon (icon button) | pill (header field, submits on Enter).
 */
export default function SearchBar({
  action = '/consult',
  asForm = true,
  id = 'search',
  name = 'q',
  label = 'Search',
  placeholder = 'Search by name, expertise or keyword',
  defaultValue,
  variant = 'button',
  size,
  buttonLabel,
  hidden,
  className,
  ...rest
}) {
  const cls = cx('sp', 'sp-search', `sp-search--${variant}`, size === 'lg' && 'sp-search--lg', className);
  const hiddenInputs = hidden
    ? Object.entries(hidden)
        .filter(([, v]) => v != null && v !== '')
        .flatMap(([k, v]) => (Array.isArray(v) ? v : [v]).map((val, i) => <input key={`${k}-${i}`} type="hidden" name={k} value={val} />))
    : null;
  const inner = (
    <>
      <label htmlFor={id} className="sp-visually-hidden">
        {label}
      </label>
      <Icon name="search" size={20} className="sp-search__icon" />
      <input
        id={id}
        type="search"
        name={name}
        className="sp-search__input"
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete="off"
      />
      {hiddenInputs}
      {variant === 'button' ? (
        <button type="submit" className="sp-search__btn">
          {buttonLabel || 'Search'}
        </button>
      ) : null}
      {variant === 'icon' ? (
        <button type="submit" className="sp-search__ibtn" aria-label={buttonLabel || 'Search'}>
          <Icon name="search" size={20} />
        </button>
      ) : null}
    </>
  );
  if (!asForm) {
    return (
      <div role="search" aria-label={label} className={cls} {...rest}>
        {inner}
      </div>
    );
  }
  return (
    <Form action={action} role="search" aria-label={label} className={cls} {...rest}>
      {inner}
    </Form>
  );
}
