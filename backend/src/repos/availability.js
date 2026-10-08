// Time slots are computed from availability_rules (weekly hours), availability_overrides (days off or
// special hours) and live bookings. Nothing is stored per slot.
import { query } from '../db.js';
import { addDays, fromMinutes, nowInIst, timeLabel, toMinutes, weekdayOf } from '../lib/time.js';

const LIVE_STATUSES = "('pending','confirmed','completed')";

export async function listRulesFor(tantricId) {
  return query(
    'SELECT weekday, start_time, end_time, slot_minutes, mode FROM availability_rules WHERE tantric_id = ? AND is_active = 1 ORDER BY weekday, start_time',
    [tantricId],
  );
}

export async function getOverride(tantricId, date) {
  const rows = await query(
    'SELECT is_available, start_time, end_time, slot_minutes, note FROM availability_overrides WHERE tantric_id = ? AND on_date = ? LIMIT 1',
    [tantricId, date],
  );
  return rows[0] || null;
}

export async function listBookedMinutes(tantricId, date) {
  const rows = await query(
    `SELECT start_time FROM bookings WHERE tantric_id = ? AND booking_date = ? AND status IN ${LIVE_STATUSES}`,
    [tantricId, date],
  );
  return new Set(rows.map((r) => toMinutes(r.start_time)));
}

function windowsFor(rules, override, weekday) {
  if (override) {
    if (!override.is_available) return [];
    if (override.start_time && override.end_time) {
      return [{ start: toMinutes(override.start_time), end: toMinutes(override.end_time), slot: Number(override.slot_minutes) || 60 }];
    }
  }
  return rules
    .filter((r) => Number(r.weekday) === weekday)
    .map((r) => ({ start: toMinutes(r.start_time), end: toMinutes(r.end_time), slot: Number(r.slot_minutes) || 60 }));
}

/**
 * Slots for one date: [{ time: '10:00', label: '10:00 AM', durationMinutes, available, reason }].
 * Past times (today, IST) and booked times are returned with available: false so the UI can grey them out.
 */
export async function getSlotsForDate(tantricId, date, { rules } = {}) {
  const [ruleRows, override, booked] = await Promise.all([
    rules ? Promise.resolve(rules) : listRulesFor(tantricId),
    getOverride(tantricId, date),
    listBookedMinutes(tantricId, date),
  ]);
  const now = nowInIst();
  const pastDay = date < now.date;
  const slots = [];
  for (const w of windowsFor(ruleRows, override, weekdayOf(date))) {
    for (let t = w.start; t + w.slot <= w.end; t += w.slot) {
      const past = pastDay || (date === now.date && t <= now.minutes);
      const isBooked = booked.has(t);
      const time = fromMinutes(t);
      slots.push({
        time,
        label: timeLabel(time),
        durationMinutes: w.slot,
        available: !past && !isBooked,
        reason: isBooked ? 'booked' : past ? 'past' : undefined,
      });
    }
  }
  slots.sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
  return slots;
}

/** First date within `days` from today (IST) that has an open slot, or null. */
export async function nextAvailableDate(tantricId, days = 14) {
  const rules = await listRulesFor(tantricId);
  if (!rules.length) return null;
  const start = nowInIst().date;
  for (let i = 0; i < days; i += 1) {
    const date = addDays(start, i);
    const slots = await getSlotsForDate(tantricId, date, { rules });
    if (slots.some((s) => s.available)) return date;
  }
  return null;
}
