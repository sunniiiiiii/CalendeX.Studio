import React from 'react';
import { CalendarRange, CalendarDays, Check } from 'lucide-react';

const OPTIONS = [
  {
    id: 'recurring',
    icon: CalendarRange,
    title: 'Recurring weekly',
    desc: 'Classes repeat every week. Pick your semester / calendar start and end dates.',
  },
  {
    id: 'specific',
    icon: CalendarDays,
    title: 'Specific dates',
    desc: 'Events already have concrete dates. No calendar period needed.',
  },
];

export default function CalendarModeChooser({ mode, period, onModeChange, onPeriodChange }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-3">Choose your calendar type</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const active = mode === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onModeChange(opt.id)}
              className={[
                'text-left rounded-2xl border p-4 transition-all',
                active
                  ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/30'
                  : 'border-border bg-card hover:border-primary/40',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                {active && <Check className="w-4 h-4 text-primary mt-1" />}
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">{opt.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      {mode === 'recurring' && (
        <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/[0.03] p-5">
          <p className="text-sm font-medium text-foreground mb-1">Calendar period</p>
          <p className="text-xs text-muted-foreground mb-4">
            Each weekly class will repeat every week from the start date until the end date.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-foreground">Calendar start date</span>
              <input
                type="date"
                value={period.start || ''}
                onChange={(e) => onPeriodChange({ ...period, start: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-foreground">Calendar end date</span>
              <input
                type="date"
                value={period.end || ''}
                onChange={(e) => onPeriodChange({ ...period, end: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}