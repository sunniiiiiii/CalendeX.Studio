import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const PROMPT = `You are a meticulous timetable parser. You are given a file (PDF or image) that contains a timetable / schedule.
Your job: identify EVERY individual calendar event present in the document and extract its details faithfully.

For each event extract:
- title: the event title or subject (e.g. course name, meeting name).
- start: the start date AND time as a single ISO 8601 datetime string (e.g. "2026-09-14T09:00:00") ONLY if the document gives an explicit, unambiguous date and time. If the document only states a day-of-week and a time (with no concrete calendar date), or if the date/time is unclear, leave this field as an empty string "".
- end: the end date AND time as an ISO 8601 datetime string, using the SAME rules as "start". Leave empty if not explicitly determinable.
- location: the room / building / venue / address as written. Empty string if none.
- notes: any additional descriptive details from the source for this event. If the document gives a day-of-week and time but no concrete date, put that schedule information here (e.g. "Every Monday 09:00–10:00"). Empty string if none.

STRICT RULES:
- Do NOT invent, guess, or fabricate any data. Only extract what is actually written in the document.
- Preserve original wording for title, location, and notes.
- If a field is missing or unclear, leave it as an empty string — never fill it with assumptions.
- Each distinct event becomes one entry. Do not merge events. If the same subject repeats on different days/times, each occurrence is its own entry.
- Ignore page furniture (headers, footers, page numbers, logos) unless they carry event information.`;

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
          location: { type: 'string' },
          notes: { type: 'string' }
        },
        required: ['title', 'start', 'end', 'location', 'notes']
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

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: PROMPT,
      file_urls: [fileUrl],
      response_json_schema: SCHEMA
    });

    const events = Array.isArray(result?.events) ? result.events : [];
    return Response.json({ events });
  } catch (error) {
    return Response.json({ error: error?.message || 'Failed to parse timetable' }, { status: 500 });
  }
}