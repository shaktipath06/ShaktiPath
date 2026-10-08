import { cx } from './utils';

/** Pull quote on a tan panel with a large quotation mark and the author line. */
export default function Quote({ text, author, className, children, ...rest }) {
  return (
    <figure className={cx('sp', 'sp-quote', className)} {...rest}>
      <span className="sp-quote__mark" aria-hidden="true">
        “
      </span>
      <blockquote>{text || children}</blockquote>
      {author ? <figcaption>{`– ${author}`}</figcaption> : null}
    </figure>
  );
}
