'use client';

import { useState, useTransition } from 'react';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import Select from '@/components/ui/Select';
import TimeSlots from '@/components/ui/TimeSlots';
import { inr } from '@/components/ui/utils';
import { fetchSlots } from '@/lib/actions';
import styles from './profile.module.css';

/**
 * "Book Your Session" sidebar on the profile: pick a service, a date (time slots load for it) and a time,
 * then continue to /book with the choice in the URL.
 */
export default function BookingPanel({ slug, services, initialDate, initialSlots, today, title, proceedLabel }) {
  const [serviceId, setServiceId] = useState(services[0] ? String(services[0].id) : '');
  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState(initialSlots || []);
  const [time, setTime] = useState(null);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  const changeDate = (iso) => {
    setDate(iso);
    setTime(null);
    setError(null);
    startTransition(async () => {
      const result = await fetchSlots(slug, iso);
      setSlots(result.slots || []);
      if (result.error) setError(result.error);
    });
  };

  const params = new URLSearchParams({ tantric: slug, date });
  if (serviceId) params.set('service', serviceId);
  if (time) params.set('time', time);
  const href = `/book?${params.toString()}`;

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      {services.length ? (
        <Select
          label="1. Select Service"
          name="service"
          id="panel-service"
          options={services.map((s) => ({ value: String(s.id), label: `${s.title} (${inr(s.price)})` }))}
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        />
      ) : (
        <p className={styles.hint}>This practitioner has not listed bookable services yet.</p>
      )}
      <div className={styles.step}>
        <p className={styles.stepLabel}>2. Select Date</p>
        <DatePicker value={date} min={today} today={today} onChange={changeDate} />
      </div>
      <div className={styles.step}>
        <p className={styles.stepLabel}>3. Select Time</p>
        <TimeSlots slots={slots} value={time} onChange={(t) => setTime(t)} loading={pending} />
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
      <Button fullWidth arrow href={href} disabled={!services.length}>
        {proceedLabel}
      </Button>
    </div>
  );
}
