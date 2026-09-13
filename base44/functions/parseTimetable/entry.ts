import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const PROMPT = `You are a meticulous timetable parser. You are given a file (PDF or image) that contains a timetable / schedule.
Your job: identify EVERY individual calendar event present in the document and extract its details faithfully.

For each event extract:
- title: the event title or subject (e.g. course name, meeting name). Preserve original wording.
- start: the start as an ISO 8601 datetime string (e.g. "2026-09-14T09:00:00"). Populate this whenever a concrete calendar date can be found for the event — whether it appears in the event's own row, a date column, OR in the notes / remarks / comments / footnote areas. If a date is present but no time is given, use T00:00:00. Only leave this as an empty string "" when NO concrete date can be found anywhere for the event (e.g. a purely weekly recurring class with no calendar date).
- end: the end as an ISO 8601 datetime string, using the SAME rules as "start". If an end date is present but no end time, use T23:59:59. For single-day events with no explicit end, use the same date as start. Leave empty only when no end date/time can be found anywhere.
- day_of_week: the day of the week as written (e.g. "Monday", "Tue", "Mon/Wed/Fri"). Empty string if none. For multi-day patterns keep them all (e.g. "Mon/Wed/Fri").
- start_time: the start time in 24h HH:MM format (e.g. "09:00") when a time is given. Empty string if none.
- end_time: the end time in 24h HH:MM format (e.g. "10:30") when a time is given. Empty string if none.
- location: the room / building / venue / address as written. Empty string if none.
- notes: any remaining descriptive details from the source for this event, AFTER all date/time data has been extracted into the proper fields. Empty string if none.

IMPORTANT — TIMES OFTEN LIVE ONLY IN NOTES: Frequently start_time/end_time and day_of_week are NOT in a dedicated column but appear only inside notes, remarks, or comments — e.g. "every Tuesday 10 to 11:20", "Mon 9:00-10:30", "Wed/Fri 14:00-15:30", "Lectures: MWF 8:00-9:30". You MUST parse these patterns and populate day_of_week, start_time, and end_time from them. Convert times to 24h HH:MM (10:00, 11:20, 14:00). Convert day names to full or slash form (Tuesday, Mon/Wed/Fri). Scan EVERY event's notes/remarks for such patterns, not just the first. Only after extracting all date/time data into the proper fields should you store whatever descriptive text is left in notes.

STRICT RULES:
- Do NOT invent, guess, or fabricate any data. Only extract what is actually written in the document.
- Preserve original wording for title, location, and notes.
- If a field is missing or unclear, leave it as an empty string — never fill it with assumptions.
- Each distinct event becomes one entry. Do not merge events. If the same subject repeats on different days/times, each occurrence is its own entry.
- Ignore page furniture (headers, footers, page numbers, logos) unless they carry event information.
- Read ALL pages of the PDF. Do not stop after the first page.

GRIDLESS / PLAIN-TEXT / CHINESE TIMETABLES:
- Many source timetables have NO visible grid lines, borders, or cell dividers — they are loose plain-text blocks with Chinese date and time descriptions. Do NOT rely only on visible table lines to split information. Instead, logically group related text pieces that belong to one single calendar event based on proximity and meaning.
- Parse natural-language Chinese dates and convert them to ISO 8601. Examples: "9月15日" → that month/day in the current or nearest academic year (use the year that makes the date fall within the document's term; if unknown, use the current year); "周一" / "星期一" / "礼拜一" → "Monday"; "周三" → "Wednesday". Map the full set: 周一/星期一=Monday, 周二/星期二=Tuesday, 周三/星期三=Wednesday, 周四/星期四=Thursday, 周五/星期五=Friday, 周六/星期六=Saturday, 周日/星期日/周天=Sunday.
- Parse Chinese time expressions into 24h HH:MM. Examples: "上午9点" → "09:00", "下午2点半" → "14:30", "晚上7:00-8:30" → start_time "19:00", end_time "20:30", "14:00-15:30" → start_time "14:00", end_time "15:30".
- Distinguish separate events: different dates OR different time slots mean different events, even when the text has no separators between them.
- Ignore decorative text, headers, page numbers, and title banners that are not real schedule entries.

UNCERTAINTY MARKING:
- If you are not confident about any date, day, or time value (e.g. ambiguous characters, unclear which event a time belongs to, year not stated), still populate the field but PREFIX its value with "[UNCERTAIN] " (e.g. start "[UNCERTAIN] 2026-09-15T09:00:00", day_of_week "[UNCERTAIN] Monday", start_time "[UNCERTAIN] 09:00"). The user will manually correct it. Do not use [UNCERTAIN] for title, location, or notes — only for date/day/time fields where confidence is low.`;

const SCHEMA = {
  type: 'object',
  properties: {
    events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          start: { type: 'string' },
          end: { type: 'string' },
          day_of_week: { type: 'string' },
          start_time: { type: 'string' },
          end_time: { type: 'string' },
          location: { type: 'string' },
          notes: { type: 'string' }
        },
        required: ['title', 'start', 'end', 'day_of_week', 'start_time', 'end_time', 'location', 'notes']
      }
    }
  },
  required: ['events']
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const fileUrl = typeof body?.file_url === 'string' ? body.file_url.trim() : '';
    if (!fileUrl) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }
    const criteria = typeof body?.criteria === 'string' ? body.criteria.trim() : '';
    const prompt = criteria
      ? `${PROMPT}\n\nADDITIONAL USER CRITERIA — follow these strictly when selecting and filtering events. Omit any event that violates them. When two subjects share the same time slot, keep only the one the user says they take. When the user asks for a specific teaching week (e.g. "week 1 only"), include only the occurrences that fall in that week and set their concrete dates accordingly. Apply these criteria in addition to the strict rules above:\n${criteria}`
      : PROMPT;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [fileUrl],
      response_json_schema: SCHEMA,
      model: 'gemini_3_flash'
    });

    const events = Array.isArray(result?.events) ? result.events : [];
    return Response.json({ events });
  } catch (error) {
    return Response.json({ error: error?.message || 'Failed to parse timetable' }, { status: 500 });
  }
}