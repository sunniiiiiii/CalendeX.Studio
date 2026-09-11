// Minimal ICS (iCalendar) generator, Apple-Calendar compatible (RFC 5545).

function escapeText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function foldLine(line) {
  // RFC 5545 line folding at 75 octets.
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

function formatDT(value) {
  // Accepts an ISO 8601 string or a Date. Returns { utc: "Z" suffixed string, floating: local string }.
  let d;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === 'string' && value.trim()) {
    d = new Date(value);
  } else {
    return null;
  }
  if (isNaN(d.getTime())) return null;

  const pad = (n) => String(n).padStart(2, '0');
  const utc =
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z';
  const floating =
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds());
  return { utc, floating };
}

function isUtcIso(value) {
  return typeof value === 'string' && (value.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(value));
}

// events: array of { title, start, end, location, notes, includeFields: {title,start,end,location,notes} }
export function buildIcs(events) {
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
    const start = formatDT(ev.start);
    const end = formatDT(ev.end);

    // A usable event needs at least a start. Skip if missing.
    if (!start) continue;

    const useUtc = isUtcIso(ev.start) || (ev.end && isUtcIso(ev.end));
    const startVal = useUtc ? start.utc : start.floating;
    const endVal = end ? (useUtc ? end.utc : end.floating) : '';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:timetable-${counter}-${dtstamp}@base44.app`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART${useUtc ? '' : ';VALUE=DATE-TIME'}:${startVal}`);
    if (endVal) {
      lines.push(`DTEND${useUtc ? '' : ';VALUE=DATE-TIME'}:${endVal}`);
    }
    if (fields.title !== false && ev.title) {
      lines.push(foldLine(`SUMMARY:${escapeText(ev.title)}`));
    }
    if (fields.location !== false && ev.location) {
      lines.push(foldLine(`LOCATION:${escapeText(ev.location)}`));
    }
    if (fields.notes !== false && ev.notes) {
      lines.push(foldLine(`DESCRIPTION:${escapeText(ev.notes)}`));
    }
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