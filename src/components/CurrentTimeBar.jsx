import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CurrentTimeBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString(undefined, { hour12: false });

  return (
    <div className="border-b border-border/60 bg-muted/40">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4 text-primary" />
        <span className="font-medium text-foreground">{dateStr}</span>
        <span className="text-border">·</span>
        <span className="font-mono tabular-nums">{timeStr}</span>
      </div>
    </div>
  );
}