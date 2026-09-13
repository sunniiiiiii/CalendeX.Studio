// Minimal ICS (iCalendar) generator, Apple-Calendar compatible (RFC 5545).
// Supports single (concrete-date) events and weekly recurring events (RRULE).

function escapeText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function foldLine(line) {
  if (line.length <= 75) return line;
  const chunks = [];
  let rest = line;
  chunks.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    chunks.push(' ' + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return chunks.join('\r\n');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDT(value) {
  let d;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === 'string' && value.trim()) {
    d = new Date(value);
  } else {
    return null;
  }
  if (isNaN(d.getTime())) return null;
  const utc =
    d.getUTCFullYear().toString() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
    'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  const floating =
    d.getFullYear().toString() + pad(d.getMonth() + 1) + pad(d.getDate()) +
    'T' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  return { utc, floating };
}

function isUtcIso(value) {
  return typeof value === 'string' && (value.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(value));
}

function dateOnly(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.getFullYear().toString() + pad(d.getMonth() + 1) + pad(d.getDate());
}

// Parse a day-of-week string into ordered BYDAY codes (MO,TU,WE,TH,FR,SA,SU).
// Handles "Monday", "Mon/Wed/Fri", "MWF", "TR", "Tue & Thu", etc.
const WEEKDAY_ORDER = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']; // index = Date.getDay()

export function parseByDay(s) {
  if (!s) return [];
  let str = String(s).toLowerCase();
  const found = new Set();
  const fullMap = { monday: 'MO', tuesday: 'TU', wednesday: 'WE', thursday: 'TH', friday: 'FR', saturday: 'SA', sunday: 'SU' };
  for (const [name, code] of Object.entries(fullMap)) {
    if (str.includes(name)) { found.add(code); str = str.replace(new RegExp(name, 'g'), ' '); }
  }
  const abbrMap = { mon: 'MO', tue: 'TU', wed: 'WE', thu: 'TH', fri: 'FR', sat: 'SA', sun: 'SU' };
  for (const [abbr, code] of Object.entries(abbrMap)) {
    if (str.includes(abbr)) { found.add(code); str = str.replace(new RegExp(abbr, 'g'), ' '); }
  }
  const compactMap = { m: 'MO', t: 'TU', w: 'WE', r: 'TH', f: 'FR', s: 'SA', u: 'SU' };
  for (const ch of str) {
    if (compactMap[ch]) found.add(compactMap[ch]);
  }
  return WEEKDAY_ORDER.filter((c) => found.has(c));
}

function firstOccurrence(startDate, byDays) {
  const d = new Date(startDate);
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const code = WEEKDAY_CODES[d.getDay()];
    if (byDays.includes(code)) return new Date(d);
    d.setDate(d.getDate() + 1);
  }
  return null;
}

function floatingFromDate(date, hhmm) {
  let h = 0, m = 0;
  if (hhmm) {
    const parts = String(hhmm).split(':').map(Number);
    h = parts[0] || 0;
    m = parts[1] || 0;
  }
  return date.getFullYear().toString() + pad(date.getMonth() + 1) + pad(date.getDate()) +
    'T' + pad(h) + pad(m) + '00';
}

// events: array of { title, start, end, day_of_week, start_time, end_time, location, notes, includeFields }
// period: { start, end } — semester/calendar range for recurring weekly events (ISO date strings)
export function buildIcs(events, period) {
  const now = new Date();
  const dtstamp = formatDT(now).utc;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Base44//Timetable Parser//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  let counter = 1;
  for (const ev of events) {
    const fields = ev.includeFields || {};
    const hasConcreteStart = !!ev.start;

    let dtstart, dtend, rrule;

    if (hasConcreteStart) {
      if (ev.all_day) {
        const ds = dateOnly(ev.start);
        if (!ds) continue;
        dtstart = ds;
        let endD;
        if (fields.end !== false && ev.end) {
          endD = new Date(ev.end);
        } else {
          endD = new Date(ev.start);
          endD.setDate(endD.getDate() + 1);
        }
        const de = dateOnly(endD);
        if (de) dtend = de;
      } else {
        const start = formatDT(ev.start);
        if (!start) continue;
        const useUtc = isUtcIso(ev.start) || (ev.end && isUtcIso(ev.end));
        dtstart = useUtc ? start.utc : start.floating;
        if (fields.end !== false && ev.end) {
          const end = formatDT(ev.end);
          if (end) dtend = useUtc ? end.utc : end.floating;
        }
      }
    } else if (ev.day_of_week && ev.start_time && period && period.start && period.end) {
      const byDays = parseByDay(ev.day_of_week);
      if (byDays.length === 0) continue;
      const first = firstOccurrence(period.start, byDays);
      if (!first) continue;
      dtstart = floatingFromDate(first, ev.start_time);
      if (fields.end !== false && ev.end_time) {
        dtend = floatingFromDate(first, ev.end_time);
      }
      const untilDate = new Date(period.end);
      untilDate.setHours(23, 59, 59, 0);
      const until = untilDate.getFullYear().toString() + pad(untilDate.getMonth() + 1) +
        pad(untilDate.getDate()) + 'T' + pad(untilDate.getHours()) + pad(untilDate.getMinutes()) + pad(untilDate.getSeconds());
      rrule = `FREQ=WEEKLY;BYDAY=${byDays.join(',')};UNTIL=${until}`;
    } else {
      continue;
    }

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:timetable-${counter}-${dtstamp}@base44.app`);
    lines.push(`DTSTAMP:${dtstamp}`);
    const startParam = ev.all_day ? ';VALUE=DATE' : (isUtcIso(ev.start) ? '' : ';VALUE=DATE-TIME');
    lines.push(`DTSTART${startParam}:${dtstart}`);
    if (dtend) {
      const endParam = ev.all_day ? ';VALUE=DATE' : (isUtcIso(ev.start) || isUtcIso(ev.end) ? '' : ';VALUE=DATE-TIME');
      lines.push(`DTEND${endParam}:${dtend}`);
    }
    if (rrule) lines.push(`RRULE:${rrule}`);
    if (fields.title !== false && ev.title) lines.push(foldLine(`SUMMARY:${escapeText(ev.title)}`));
    if (fields.location !== false && ev.location) lines.push(foldLine(`LOCATION:${escapeText(ev.location)}`));
    if (fields.notes !== false && ev.notes) lines.push(foldLine(`DESCRIPTION:${escapeText(ev.notes)}`));
    lines.push('END:VEVENT');
    counter += 1;
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcs(filename, icsText) {
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'timetable.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}