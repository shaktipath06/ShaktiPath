'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import styles from './profile.module.css';

/** Share (Web Share API, else copy the link) and Save buttons in the breadcrumb bar. */
export function ShareSaveBar({ name }) {
  const [note, setNote] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!note) return undefined;
    const t = setTimeout(() => setNote(null), 2500);
    return () => clearTimeout(t);
  }, [note]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} on ShaktiPath`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNote('Link copied');
    } catch {
      setNote('Could not share this page');
    }
  };

  return (
    <div className={styles.actions}>
      <Button variant="ghost" icon="share-2" onClick={share}>
        Share
      </Button>
      <Button variant="ghost" icon="heart" aria-pressed={saved} onClick={() => setSaved(!saved)}>
        {saved ? 'Saved' : 'Save'}
      </Button>
      {note ? (
        <p className={styles.toast} role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/** "Add to Favourite" toggle on the identity card (kept on this device until accounts exist). */
export function FavouriteButton({ label, savedLabel }) {
  const [saved, setSaved] = useState(false);
  return (
    <Button variant="secondary" icon="heart" fullWidth aria-pressed={saved} onClick={() => setSaved(!saved)}>
      {saved ? savedLabel : label}
    </Button>
  );
}
