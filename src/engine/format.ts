/**
 * Time formatting in the case's time zone. Cases store ISO timestamps with offsets, and we
 * display them in the case's chosen offset (e.g. ACST +09:30), whatever the device's zone.
 */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
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

const pad = (n: number) => String(n).padStart(2, '0');
const twelveHour = (h: number, m: number) =>
  `${h % 12 === 0 ? 12 : h % 12}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`;

export function offsetMinutes(offset: string): number {
  const m = /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  if (!m) return 0;
  const mins = Number(m[2]) * 60 + Number(m[3]);
  return m[1] === '-' ? -mins : mins;
}

/** A Date whose UTC fields read as the wall-clock time at the given offset. */
function shifted(iso: string, offset: string): Date {
  return new Date(Date.parse(iso) + offsetMinutes(offset) * 60_000);
}

/** "7:52 pm" */
export function formatTime12(iso: string, offset: string): string {
  const d = shifted(iso, offset);
  return twelveHour(d.getUTCHours(), d.getUTCMinutes());
}

/** "19:52:07" */
export function formatTime24(iso: string, offset: string, seconds = true): string {
  const d = shifted(iso, offset);
  const base = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  return seconds ? `${base}:${pad(d.getUTCSeconds())}` : base;
}

/** "Fri 14 Aug" */
export function formatShortDate(iso: string, offset: string): string {
  const d = shifted(iso, offset);
  return `${DAYS[d.getUTCDay()]!.slice(0, 3)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]!.slice(0, 3)}`;
}

/** "2026-08-14" → "Friday 14 August 2026" */
export function formatLongDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "19:30" → "7:30 pm" */
export function clockTo12(hhmm: string): string {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return twelveHour(h, m);
}

/** "19:30" → 1170 */
export function clockToMinutes(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Minutes since midnight in the case zone, for timelines. */
export function minutesOfDay(iso: string, offset: string): number {
  const d = shifted(iso, offset);
  return d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
}

/** Device-local date and time, e.g. for when a report was generated. */
export function formatLocalDateTime(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${twelveHour(d.getHours(), d.getMinutes())}`;
}
