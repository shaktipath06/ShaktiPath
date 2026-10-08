'use client';

import { useState } from 'react';
import IconButton from '@/components/ui/IconButton';
import ReviewCard from '@/components/ui/ReviewCard';
import styles from './profile.module.css';

/** One review at a time with previous / next buttons. `reviews` carry a ready-made `dateLabel`. */
export default function ReviewsCarousel({ reviews = [], emptyText = 'No reviews yet.' }) {
  const [index, setIndex] = useState(0);
  if (!reviews.length) return <p className={styles.reviewEmpty}>{emptyText}</p>;
  const i = Math.min(index, reviews.length - 1);
  const r = reviews[i];
  const single = reviews.length < 2;
  return (
    <div className={styles.reviewBox} aria-live="polite">
      <IconButton
        icon="chevron-left"
        variant="plain"
        size="sm"
        label="Previous review"
        toggle={false}
        disabled={single}
        onClick={() => setIndex((i - 1 + reviews.length) % reviews.length)}
      />
      <ReviewCard
        variant="inline"
        avatar={r.avatar}
        name={r.name}
        rating={r.rating}
        date={r.dateLabel}
        verifiedBooking={r.verifiedBooking}
        quote={r.quote}
      />
      <IconButton
        icon="chevron-right"
        variant="plain"
        size="sm"
        label="Next review"
        toggle={false}
        disabled={single}
        onClick={() => setIndex((i + 1) % reviews.length)}
      />
      <span className="sp-visually-hidden">{`Review ${i + 1} of ${reviews.length}`}</span>
    </div>
  );
}
