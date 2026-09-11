import React from 'react';
import { Trash2, MapPin, StickyNote, Clock, Type, Eye, EyeOff } from 'lucide-react';

const FIELD_META = {
  title: { label: 'Title', icon: Type, type: 'text', placeholder: 'Event title' },
  start: { label: 'Start', icon: Clock, type: 'datetime-local', placeholder: '' },
  end: { label: 'End', icon: Clock, type: 'datetime-local', placeholder: '' },
  location: { label: 'Location', icon: MapPin, type: 'text', placeholder: 'Location' },
  notes: { label: 'Notes', icon: StickyNote, type: 'textarea', placeholder: 'Additional notes' }
};

function toInputValue(value, type) {
  if (!value) return '';
  if (type === 'datetime-local') {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return String(value);
}

function fromInputValue(value, type) {
  if (!value) return '';
  if (type === 'datetime-local') {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toISOString();
  }
  return value;
}

export default function EventBlock({ event, index, onChange, onToggleInclude, onToggleField, onRemove }) {
  const meta = FIELD_META;

  return (
    <div
      className={[
        'rounded-2xl border bg-card transition-all duration-300',
        event.included ? 'border-border shadow-sm' : 'border-border/60 opacity-60 shadow-none'
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-foreground truncate">
            {event.title || 'Untitled event'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => onToggleInclude()}
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              event.included
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            ].join(' ')}
          >
            {event.included ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {event.included ? 'Keep' : 'Discard'}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            aria-label="Remove event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="p-5 space-y-4">
        {Object.entries(meta).map(([key, info]) => {
          const Icon = info.icon;
          const isIncluded = event.includeFields?.[key] !== false;
          return (
            <div key={key} className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-2 sm:gap-3 sm:items-start">
              <div className="flex items-center gap-2 sm:pt-2.5 text-muted-foreground">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide hidden sm:inline">{info.label}</span>
              </div>

              {info.type === 'textarea' ? (
                <textarea
                  value={event[key] || ''}
                  onChange={(e) => onChange(key, e.target.value)}
                  placeholder={info.placeholder}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 resize-y"
                />
              ) : (
                <input
                  type={info.type}
                  value={toInputValue(event[key], info.type)}
                  onChange={(e) => onChange(key, fromInputValue(e.target.value, info.type))}
                  placeholder={info.placeholder}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              )}

              <button
                type="button"
                onClick={() => onToggleField(key)}
                title={isIncluded ? `Include ${info.label} in ICS` : `Exclude ${info.label} from ICS`}
                className={[
                  'inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors sm:self-start sm:mt-0.5',
                  isIncluded
                    ? 'bg-primary/10 text-primary hover:bg-primary/15'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                ].join(' ')}
              >
                {isIncluded ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isIncluded ? 'In ICS' : 'Excluded'}</span>
              </button>
            </div>
          );
        })}

        {!event.start && (
          <p className="text-xs text-amber-600 dark:text-amber-500/90 flex items-center gap-1.5 pt-1">
            <Clock className="w-3.5 h-3.5" />
            No start date/time was found in the source. Add one to include this event in the ICS file.
          </p>
        )}
      </div>
    </div>
  );
}