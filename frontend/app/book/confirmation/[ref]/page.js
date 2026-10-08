import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ApiUnavailable from '@/components/site/ApiUnavailable';
import { BookBanner, PromiseSection } from '@/components/booking/BookingSections';
import BookingConfirmation from '@/components/ui/BookingConfirmation';
import BookingSummary from '@/components/ui/BookingSummary';
import Stepper from '@/components/ui/Stepper';
import { cx } from '@/components/ui/utils';
import { BOOK } from '@/content/book';
import { getBooking, isNotFound, isUnavailable } from '@/lib/api';
import { fromMinutes, modeIcon, modeLabel, timeRange, toMinutes } from '@/lib/format';
import page from '@/styles/page.module.css';
import styles from '../../page.module.css';

export const metadata = {
  title: 'Booking Confirmation',
};

const PAYMENT_LABELS = { upi: 'UPI', card: 'Card', netbanking: 'Net Banking', wallet: 'Wallet', other: 'Other' };
const STATUS_LABELS = {
  pending: 'Pending payment',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  no_show: 'Missed',
};

/** Google Calendar "add event" link for the booked slot (IST). */
function calendarHref(b) {
  if (!b.date || !b.time) return undefined;
  const day = String(b.date).replace(/-/g, '');
  const start = `${day}T${String(b.time).replace(':', '')}00`;
  const end = `${day}T${fromMinutes(toMinutes(b.time) + (Number(b.durationMinutes) || 30)).replace(':', '')}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${b.service} with ${b.tantric.name} (ShaktiPath)`,
    dates: `${start}/${end}`,
    ctz: 'Asia/Kolkata',
    details: `Booking reference ${b.ref}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function ConfirmationPage({ params }) {
  return (
    <main id="main">
      <BookBanner
        crumbs={[{ label: 'Home', href: '/' }, { label: BOOK.title, href: '/book' }, 'Confirmation']}
        title="Booking Confirmation"
        subtitle="Thank you for booking with ShaktiPath."
      />
      <Suspense fallback={<ConfirmationSkeleton />}>
        <Confirmation params={params} />
      </Suspense>
      <PromiseSection promise={false} />
    </main>
  );
}

async function Confirmation({ params }) {
  const { ref } = await params;
  let b;
  try {
    b = await getBooking(ref);
  } catch (err) {
    // Unknown references show the not-found page (with status 200, as the shell has already streamed).
    if (isNotFound(err)) notFound();
    if (isUnavailable(err)) {
      return (
        <section className={page.section}>
          <div className={page.wrap}>
            <ApiUnavailable what="This booking" />
          </div>
        </section>
      );
    }
    throw err;
  }
  const pending = b.status === 'pending';
  const time = timeRange(b.time, b.durationMinutes);
  return (
    <section aria-label="Booking confirmation" className={cx(page.section, styles.section)}>
      <div className={cx(page.wrap, styles.stack)}>
        <div className={styles.stepperBox}>
          <Stepper steps={BOOK.steps} current={4} />
        </div>
        <div className={styles.confirmLayout}>
          <BookingConfirmation
            title={pending ? BOOK.confirmation.pendingTitle : BOOK.confirmation.confirmedTitle}
            message={BOOK.confirmation.message}
            bookingId={b.ref}
            date={b.dateLabel}
            time={time}
            amount={b.total}
            amountLabel={pending ? 'Amount Due' : 'Amount Paid'}
            method={b.paymentMethod ? PAYMENT_LABELS[b.paymentMethod] || b.paymentMethod : BOOK.confirmation.pendingMethod}
            calendarHref={calendarHref(b)}
            note={BOOK.confirmation.note}
          />
          <BookingSummary
            image={b.tantric.image}
            name={b.tantric.name}
            service={b.service}
            date={b.dateLabel}
            time={time}
            mode={modeLabel(b.mode)}
            modeIcon={modeIcon(b.mode)}
            fee={b.fee}
            discount={b.discount}
            discountLabel={b.couponCode ? `Coupon ${b.couponCode}` : undefined}
            tax={b.tax}
            total={b.total}
            note={`Booked for ${b.customer.name} (${b.customer.email}). Status: ${STATUS_LABELS[b.status] || b.status}.`}
          />
        </div>
      </div>
    </section>
  );
}

function ConfirmationSkeleton() {
  return (
    <section className={cx(page.section, styles.section)} aria-busy="true" aria-label="Loading booking">
      <div className={cx(page.wrap, styles.stack)}>
        <div className={page.skeleton} style={{ height: 96 }} />
        <div className={styles.confirmLayout}>
          <div className={page.skeleton} style={{ height: 420 }} />
          <div className={page.skeleton} style={{ height: 420 }} />
        </div>
      </div>
    </section>
  );
}
