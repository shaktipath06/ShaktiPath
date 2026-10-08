'use client';

import { useId, useState } from 'react';
import { cx, labelOf, list } from './utils';

export const PAYMENT_OPTIONS = [
  { id: 'upi', label: 'UPI (Recommended)', methods: ['PhonePe', 'Google Pay', 'Paytm', 'BHIM'] },
  { id: 'card', label: 'Cards', description: 'Credit / Debit Card', methods: ['Visa', 'Mastercard', 'RuPay'] },
  { id: 'netbanking', label: 'Net Banking', description: 'All major banks' },
  { id: 'wallet', label: 'Wallet', description: 'Supported wallets' },
  { id: 'other', label: 'Other Options', description: 'UPI ID / Scan QR' },
];

/** Radio cards for the payment method. Controlled when `value` and `onChange` are given. */
export default function PaymentMethods({ title, name, options = PAYMENT_OPTIONS, value, onChange, className, ...rest }) {
  const opts = list(options);
  const [inner, setInner] = useState(opts[0] ? opts[0].id : null);
  const gen = useId();
  const groupName = name || gen;
  const current = value != null ? value : inner;
  return (
    <fieldset className={cx('sp', 'sp-pay', className)} {...rest}>
      <legend className={title ? 'sp-pay__legend' : 'sp-visually-hidden'}>{title || 'Payment method'}</legend>
      {opts.map((o, i) => {
        const id = o.id || String(i);
        const on = id === current;
        const inputId = `${gen}-${id}`;
        return (
          <label key={inputId} htmlFor={inputId} className={cx('sp-pay__opt', on && 'is-on')}>
            <input
              id={inputId}
              type="radio"
              name={groupName}
              value={id}
              className="sp-radio__dot"
              checked={on}
              onChange={() => {
                setInner(id);
                if (onChange) onChange(id);
              }}
            />
            <span className="sp-pay__text">
              <span className="sp-pay__label">{labelOf(o)}</span>
              {o.description ? <span className="sp-pay__desc">{o.description}</span> : null}
              {list(o.methods).length ? (
                <span className="sp-pay__methods">
                  {list(o.methods).map((m, j) => (
                    <span key={j}>{labelOf(m)}</span>
                  ))}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
