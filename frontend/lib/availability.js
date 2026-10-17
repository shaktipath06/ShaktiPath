// Picks the day the booking UI opens on. Used by the booking page and the profile's booking panel (server side).
import { getSlots } from './api';
import { addDays, isIsoDate, isTime, longDateLabel, timeLabel } from './format';

const LOOKAHEAD_DAYS = 14;

const hasOpen = (slots) => slots.some((s) => s.available !== false);

async function slotsFor(slug, date) {
  try {
    const { slots } = await getSlots(slug, date);
    return { slots: Array.isArray(slots) ? slots : [], ok: true };
  } catch {
    return { slots: [], ok: false };
  }
}

function whyFull(date, slots) {
  const label = longDateLabel(date);
  if (!slots.length) return `No sessions are offered on ${label}.`;
  if (slots.every((s) => s.reason === 'past')) return `All times on ${label} have passed.`;
  return `${label} is fully booked.`;
}

/**
 * The day to show with its slots, so the page never opens on a day where no time can be chosen (which would
 * leave the Pay button disabled with nothing to click). Starts from `requested` when it is a valid date not in
 * the past, else the practitioner's next open day (`availableFrom`, computed by the API), else today. When that
 * day has no open time left (all passed or booked, or no sessions offered that weekday) it walks forward, up to
 * two weeks, to the first day with one and explains the move in `notice`.
 *
 * `wanted` is a preselected time ('HH:MM', from the profile's booking panel); it is kept only while it is still
 * open on the day asked for. Returns { date, slots, time, notice }.
 */
export async function resolveBookingDay({ slug, requested, wanted, availableFrom, today }) {
  const asked = requested && isIsoDate(requested) ? requested : null;
  const start = asked && asked >= today ? asked : availableFrom && availableFrom >= today ? availableFrom : today;

  let date = start;
  let { slots, ok } = await slotsFor(slug, start);
  let notice = null;

  if (ok && !hasOpen(slots)) {
    const reason = whyFull(start, slots);
    // The API's own "next open day" first (one request), then day by day after the start.
    const candidates = availableFrom && availableFrom > start ? [availableFrom] : [];
    for (let i = 1; i <= LOOKAHEAD_DAYS; i += 1) {
      const d = addDays(start, i);
      if (!candidates.includes(d)) candidates.push(d);
    }
    let found = null;
    for (const d of candidates) {
      const next = await slotsFor(slug, d);
      if (!next.ok) break;
      if (hasOpen(next.slots)) {
        found = { date: d, slots: next.slots };
        break;
      }
    }
    if (found) {
      ({ date, slots } = found);
      notice = `${reason} Showing the next open day, ${longDateLabel(date)}.`;
    } else {
      notice = `${reason} No times are open in the next two weeks; please try a later date.`;
    }
  } else if (asked && asked < today) {
    notice = `${longDateLabel(asked)} has passed. Showing ${longDateLabel(date)} instead.`;
  }

  let time = null;
  if (wanted && isTime(wanted)) {
    const slot = date === start ? slots.find((s) => s.time === wanted) : null;
    if (slot && slot.available !== false) time = wanted;
    else if (!notice) notice = `The ${timeLabel(wanted)} time is no longer available. Please choose another time.`;
  }

  return { date, slots, time, notice };
}
