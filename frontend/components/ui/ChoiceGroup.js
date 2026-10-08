import { cx } from './utils';

/** Fieldset for related checkboxes or radios, with a serif legend; `columns` lays the items out in a grid. */
export default function ChoiceGroup({ title, columns = 1, className, children, ...rest }) {
  const cols = Number(columns) || 1;
  return (
    <fieldset
      className={cx('sp', 'sp-group', cols > 1 && 'sp-group--cols', className)}
      style={cols > 1 ? { '--sp-cols': cols } : undefined}
      {...rest}
    >
      {title ? <legend className="sp-group__legend">{title}</legend> : null}
      <div className="sp-group__items">{children}</div>
    </fieldset>
  );
}
