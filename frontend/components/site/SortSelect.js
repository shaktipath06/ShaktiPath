'use client';

import Select from '@/components/ui/Select';

/** "Sort by" select that submits its surrounding GET form as soon as a choice is made. */
export default function SortSelect({ options, value, name = 'sort', id = 'sort', label = 'Sort by:' }) {
  return (
    <Select
      inline
      label={label}
      name={name}
      id={id}
      options={options}
      defaultValue={value}
      onChange={(e) => {
        const form = e.currentTarget.form;
        if (form) form.requestSubmit();
      }}
    />
  );
}
