import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function CriteriaBar({ value, onChange, action }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1.5">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium text-foreground">Extraction criteria</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Tell the parser what to keep or skip — e.g. “Don't include arriving to classroom”, “Only week 1”, “I take Economics, not Biology”.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Enter any rules for the parser to follow…"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 resize-y"
      />
      {action && <div className="mt-3 flex justify-end">{action}</div>}
    </div>
  );
}