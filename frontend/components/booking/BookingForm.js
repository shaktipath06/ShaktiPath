'use client';

import { useActionState, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BookingSummary from '@/components/ui/BookingSummary';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import ChoiceGroup from '@/components/ui/ChoiceGroup';
import DatePicker from '@/components/ui/DatePicker';
import Icon from '@/components/ui/Icon';
import Notice from '@/components/ui/Notice';
import PaymentMethods from '@/components/ui/PaymentMethods';
import Rating from '@/components/ui/Rating';
import StatItem from '@/components/ui/StatItem';
import Stepper from '@/components/ui/Stepper';
import TextField from '@/components/ui/TextField';
import TimeSlots from '@/components/ui/TimeSlots';
import { cx, inr } from '@/components/ui/utils';
import { BOOK } from '@/content/book';
import { applyCoupon, fetchSlots, submitBooking } from '@/lib/actions';
import { dateLabel, durationLabel, modeIcon, modeLabel, reviewCountLabel, timeRange } from '@/lib/format';
import page from '@/styles/page.module.css';
import styles from '@/app/book/page.module.css';

const INITIAL = { error: null, slotTaken: false };

/**
 * The interactive booking form: date (slots reload per day), time, details, consent, coupon and payment
 * method. Submitting runs the submitBooking Server Action, which creates the booking through the API and
 * redirects to the confirmation page.
 */
export default function BookingForm({
  tantric,
  service,
  initialDate,
  initialSlots,
  initialTime,
  today,
  taxPercent = 0,
  infoItems,
  stats,
  couponCode,
}) {
  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState(initialSlots || []);
  const [time, setTime] = useState(initialTime || null);
  const [slotError, setSlotError] = useState(null);
  const [slotsPending, startSlots] = useTransition();
  const [coupon, setCoupon] = useState(null);
  const [method, setMethod] = useState('upi');

  const loadSlots = (iso) => {
    startSlots(async () => {
      const result = await fetchSlots(tantric.slug, iso);
      setSlots(result.slots || []);
      setSlotError(result.error || null);
    });
  };
  const changeDate = (iso) => {
    setDate(iso);
    setTime(null);
    setSlotError(null);
    loadSlots(iso);
  };

  // The form posts straight to the Server Action (so it also works before JavaScript loads). On success the
  // action redirects to the confirmation page; on a validation error it returns { error }. When the chosen
  // slot was taken while the form was open, the result carries the day's current slots: the form adopts
  // them and clears the time (state adjusted during render, the React pattern for reacting to a new value).
  const [state, formAction, submitting] = useActionState(submitBooking, INITIAL);
  const [handled, setHandled] = useState(INITIAL);
  if (state !== handled) {
    setHandled(state);
    if (state && state.slotTaken) {
      setTime(null);
      if (Array.isArray(state.slots) && state.date === date) setSlots(state.slots);
    }
  }

  const fee = Number(service.price) || 0;
  const discount = coupon ? Math.min(fee, Number(coupon.discount) || 0) : 0;
  const tax = Math.round((fee - discount) * taxPercent) / 100;
  const total = Math.round((fee - discount + tax) * 100) / 100;
  const slot = slots.find((s) => s.time === time);
  const duration = Number(service.durationMinutes) || (slot && slot.durationMinutes) || 30;
  const step = time ? 2 : 1;

  return (
    <section aria-label="Booking" className={cx(page.section, styles.section)}>
      <form action={formAction} className={cx(page.wrap, styles.stack)}>
        <input type="hidden" name="tantricSlug" value={tantric.slug} />
        <input type="hidden" name="serviceId" value={service.id} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="time" value={time || ''} />
        <input type="hidden" name="couponCode" value={coupon ? coupon.code : ''} />

        <div className={styles.stepperBox}>
          <Stepper steps={BOOK.steps} current={step} />
        </div>

        <div className={styles.layout}>
          <article className={styles.card} aria-labelledby="tantric-name">
            <div className={cx(styles.photo, styles.phoneHide)}>
              <Image src={tantric.profileImage || tantric.image} alt={`${tantric.name} - ${tantric.specialty}`} fill sizes="(max-width: 1024px) 50vw, 348px" />
            </div>
            <h2 id="tantric-name" className={styles.name}>
              {tantric.name}
              {tantric.verified ? (
                <span className={styles.verified}>
                  <Icon name="badge-check" size={20} label="Verified practitioner" />
                </span>
              ) : null}
            </h2>
            <p className={styles.spec}>{tantric.specialty}</p>
            {tantric.rating > 0 ? <Rating value={tantric.rating} count={reviewCountLabel(tantric.reviewCount)} countSuffix="reviews" /> : null}
            {tantric.location ? (
              <p className={styles.location}>
                <span className={styles.pin}>
                  <Icon name="map-pin" size={20} />
                </span>
                {tantric.location}
              </p>
            ) : null}
            {stats && stats.length ? (
              <div className={cx(styles.stats, styles.phoneHide)}>
                {stats.map((s) => (
                  <StatItem key={s.label} icon={s.icon} value={s.value} label={s.label} />
                ))}
              </div>
            ) : null}
            <div className={styles.service}>
              {service.image ? (
                <div className={styles.serviceImg}>
                  <Image src={service.image} alt="" fill sizes="76px" />
                </div>
              ) : null}
              <div className={styles.serviceText}>
                <p className={styles.serviceTitle}>{service.title}</p>
                {service.description ? <p className={styles.serviceDesc}>{service.description}</p> : null}
                <p className={styles.serviceMeta}>
                  <span>
                    <Icon name="clock" size={16} />
                    {durationLabel(service.durationMinutes)}
                  </span>
                  <span>
                    <Icon name={modeIcon(service.mode)} size={16} />
                    {modeLabel(service.mode)}
                  </span>
                </p>
                <p className={styles.servicePrice}>
                  <strong>{inr(service.price)}</strong>
                  <Link href={`/tantrics/${encodeURIComponent(tantric.slug)}#services`}>{BOOK.changeServiceLabel}</Link>
                </p>
              </div>
            </div>
          </article>

          <div className={styles.info}>
            <Notice items={infoItems} />
          </div>

          <div className={styles.form}>
            <h3 className={styles.h4}>1. Select Date</h3>
            <DatePicker value={date} min={today} today={today} onChange={changeDate} />
            <h3 className={cx(styles.h4, styles.h4Gap)}>2. Select Time</h3>
            <TimeSlots slots={slots} value={time} onChange={(t) => setTime(t)} loading={slotsPending} />
            {slotError ? (
              <p className={styles.error} role="alert">
                <Icon name="info" size={16} />
                {slotError}
              </p>
            ) : null}
            <h3 className={cx(styles.h4, styles.h4Gap)}>3. Add Your Details</h3>
            <TextField id="full-name" name="name" label="Full Name" required autoComplete="name" maxLength={120} />
            <TextField id="email" name="email" label="Email Address" type="email" required autoComplete="email" maxLength={190} />
            <TextField
              id="mobile"
              name="phone"
              label="Mobile Number"
              type="tel"
              inputMode="numeric"
              prefix="+91"
              required
              autoComplete="tel-national"
              maxLength={20}
            />
            <TextField
              id="purpose"
              name="purpose"
              label="Purpose of Consultation"
              optional
              multiline
              rows={3}
              placeholder="Share a brief note about your concern"
              helper={BOOK.purposeHelper}
              maxLength={2000}
            />
            <ChoiceGroup title="Consent">
              <Checkbox name="terms" value="yes" id="agree-terms" required>
                I agree to the <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy">Privacy Policy</Link> (required)
              </Checkbox>
              <Checkbox name="age" value="yes" id="agree-age" required label="I am 18 years of age or older (required)" />
              <Checkbox name="marketing" value="yes" id="agree-marketing" label="Send me offers and updates by email and SMS (optional)" />
            </ChoiceGroup>
            {state.error ? (
              <p className={styles.error} role="alert">
                <Icon name="info" size={16} />
                {state.error}
              </p>
            ) : null}
          </div>

          <div className={styles.summary}>
            <BookingSummary
              image={tantric.image}
              name={tantric.name}
              service={service.title}
              date={dateLabel(date)}
              time={time ? timeRange(time, duration) : BOOK.chooseTimeLabel}
              mode={modeLabel(service.mode)}
              modeIcon={modeIcon(service.mode)}
              fee={fee}
              discount={discount}
              discountLabel={coupon ? `Coupon ${coupon.code}` : undefined}
              tax={tax}
              taxLabel={taxPercent ? `GST (${taxPercent}%)` : 'GST'}
              total={total}
              coupon={<CouponField fee={fee} initialCode={couponCode} onApply={setCoupon} />}
              note={BOOK.summaryNote}
            />
            <PaymentMethods title="4. Payment Method" name="paymentMethod" value={method} onChange={setMethod} />
            <Button type="submit" size="lg" icon="lock" arrow fullWidth disabled={!time || submitting}>
              {submitting ? BOOK.submittingLabel : `${BOOK.payLabel} ${inr(total)}`}
            </Button>
            <p className={styles.fine}>{BOOK.paymentNote}</p>
          </div>
        </div>
      </form>
    </section>
  );
}

function CouponField({ fee, initialCode, onApply }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState(null);
  const apply = (code) => {
    start(async () => {
      const result = await applyCoupon(code, fee);
      if (result.ok) {
        onApply({ code: result.code, discount: result.discount });
        setMessage({ ok: true, text: `${result.code} applied: ${result.description || `${inr(result.discount)} off`}` });
      } else {
        onApply(null);
        setMessage({ ok: false, text: result.error });
      }
    });
  };
  return (
    <>
      <TextField
        id="coupon-code"
        label="Coupon code"
        placeholder="Enter coupon code"
        defaultValue={initialCode || ''}
        autoComplete="off"
        actionLabel={pending ? 'Checking…' : 'Apply'}
        actionDisabled={pending}
        onAction={apply}
      />
      {message ? (
        <p className={cx(styles.couponMsg, message.ok ? styles.couponOk : styles.couponErr)} role="status">
          {message.text}
        </p>
      ) : null}
    </>
  );
}
