import React from 'react';
import { CalendarRange, CheckCircle2, Info } from 'lucide-react';

export default function CalendarPeriod({ period, onChange, hasRecurring, hasDetailed, eventCount }) {
  // No events: nothing to show.
  if (eventCount === 0) return null;

  // Direct mode: every event has a concrete date, no recurring weekly classes.
  if (!hasRecurring && hasDetailed) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Detailed dates detected — ready to generate</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your timetable already contains concrete dates, so no calendar period is needed. Review the events below
            and generate the ICS file directly.
          </p>
        </div>
      </div>
    );
  }

  // Recurring mode: weekly classes without concrete dates need a calendar period.
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/[0.03] p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CalendarRange className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Calendar period for weekly classes</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Your timetable has weekly recurring classes. Enter the start and end date of the calendar (e.g. your
            semester range) and each class will repeat every week within that period.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-foreground">Calendar start date</span>
              <input
                type="date"
                value={period.start || ''}
                onChange={(e) => onChange({ ...period, start: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-foreground">Calendar end date</span>
              <input
                type="date"
                value={period.end || ''}
                onChange={(e) => onChange({ ...period, end: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </label>
          </div>

          {hasRecurring && period.start && period.end && (
            <p className="mt-3 text-xs text-primary flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Weekly classes will recur from {period.start} until {period.end}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}