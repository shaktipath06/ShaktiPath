// Date, time and label helpers for the pages. Bookings run on Indian Standard Time; dates are
// 'YYYY-MM-DD' and times 'HH:MM' (24-hour), exactly as the API sends and expects them.

const IST = 'Asia/Kolkata';

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function isIsoDate(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
}

export function isTime(v) {
  return typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}

/** Today's date in IST as 'YYYY-MM-DD'. */
export function todayIst() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export function addDays(date, n) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** '2026-10-08' -> '8 October 2026'. */
export function dateLabel(date) {
  if (!isIsoDate(date)) return date || '';
  const [y, m, d] = date.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** '2026-10-08' -> 'Thursday, 8 October 2026'. */
export function longDateLabel(date) {
  if (!isIsoDate(date)) return date || '';
  const weekday = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
  return `${weekday}, ${dateLabel(date)}`;
}

export function toMinutes(time) {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + (m || 0);
}

export function fromMinutes(n) {
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
}

/** '16:00' -> '04:00 PM'. */
export function timeLabel(time) {
  if (!isTime(time)) return time || '';
  const m = toMinutes(time);
  const h = Math.floor(m / 60);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m % 60).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** ('11:00', 30) -> '11:00 AM - 11:30 AM (30 mins)'. */
export function timeRange(time, minutes) {
  if (!isTime(time)) return '';
  const mins = Number(minutes) || 0;
  if (!mins) return timeLabel(time);
  return `${timeLabel(time)} - ${timeLabel(fromMinutes(toMinutes(time) + mins))} (${mins} mins)`;
}

/** 'YYYY-MM-DD HH:MM:SS' (IST) or ISO -> '2 weeks ago'. */
export function relativeDate(value, now = Date.now()) {
  if (!value) return '';
  const iso = String(value).includes('T') ? String(value) : `${String(value).replace(' ', 'T')}+05:30`;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const days = Math.max(0, Math.floor((now - t) / 86400000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? '' : 's'} ago`;
  return `${Math.floor(days / 365)} year${days < 730 ? '' : 's'} ago`;
}

const MODE_LABELS = {
  video: 'Video call',
  audio: 'Audio call',
  in_person: 'In person',
  remote_ritual: 'Ritual performed for you',
};

export function modeLabel(mode) {
  return MODE_LABELS[mode] || (mode ? String(mode).replace(/_/g, ' ') : '');
}

export function modeIcon(mode) {
  return mode === 'audio' ? 'phone' : mode === 'in_person' ? 'map-pin' : mode === 'remote_ritual' ? 'flame' : 'video';
}

/** ['online', 'offline'] -> 'Online & Offline'. */
export function sessionModesLabel(modes) {
  const list = Array.isArray(modes) ? modes : [];
  const online = list.includes('online');
  const offline = list.includes('offline');
  if (online && offline) return 'Online & Offline';
  if (offline) return 'Offline';
  return 'Online';
}

export function languagesLabel(languages) {
  return (Array.isArray(languages) ? languages : []).join(', ');
}

/** 5000 -> '5000+' (the counts shown in the profile stat tiles). */
export function plusLabel(n) {
  const v = Number(n) || 0;
  if (v < 10) return String(v);
  const pow = 10 ** Math.max(1, String(v).length - 2);
  return `${Math.floor(v / pow) * pow}+`;
}

/** 320 -> '320+', 42 -> '42' (the same rule as the API's review labels). */
export function reviewCountLabel(count) {
  const n = Number(count) || 0;
  if (n < 100) return String(n);
  return `${Math.floor(n / 10) * 10}+`;
}

/** Durations: 90 -> '90 mins'. */
export function durationLabel(minutes) {
  const m = Number(minutes) || 0;
  return m ? `${m} mins` : '';
}
