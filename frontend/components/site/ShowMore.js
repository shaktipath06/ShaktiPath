'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

/** Hides extra filter options behind a "Show More" toggle; hidden options still belong to the form. */
export default function ShowMore({ count, className, children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ display: open ? 'flex' : 'none', flexDirection: 'column', gap: '4px' }}>{children}</div>
      <button type="button" className={className} aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name={open ? 'minus' : 'plus'} size={16} />
        {open ? 'Show Less' : `Show More (${count})`}
      </button>
    </>
  );
}
