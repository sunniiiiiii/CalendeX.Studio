import React, { useState } from 'react';
import { CalendarClock, Sparkles, Download, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import EventBlock from '@/components/EventBlock';
import { buildIcs, downloadIcs } from '@/lib/ics';
import { useToast } from '@/components/ui/use-toast';

function normalizeEvent(ev, index) {
  return {
    id: `ev-${index}-${Math.random().toString(36).slice(2, 8)}`,
    title: ev.title || '',
    start: ev.start || '',
    end: ev.end || '',
    location: ev.location || '',
    notes: ev.notes || '',
    included: true,
    includeFields: { title: true, start: true, end: true, location: true, notes: true }
  };
}

export default function Home() {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const keptEvents = events.filter((e) => e.included);
  const exportableEvents = keptEvents.filter((e) => e.start);

  function handleParsed(rawEvents) {
    if (!rawEvents || rawEvents.length === 0) {
      toast({ title: 'No events found', description: 'No timetable events could be detected in the file.' });
      setHasParsed(true);
      setEvents([]);
      return;
    }
    setEvents(rawEvents.map(normalizeEvent));
    setHasParsed(true);
    toast({
      title: `${rawEvents.length} event${rawEvents.length === 1 ? '' : 's'} found`,
      description: 'Review each block below and edit as needed.'
    });
  }

  function updateField(id, field, value) {
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } : e));
  }
  function toggleInclude(id) {
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, included: !e.included } : e));
  }
  function toggleField(id, field) {
    setEvents((prev) =>
    prev.map((e) =>
    e.id === id ? { ...e, includeFields: { ...e.includeFields, [field]: !e.includeFields[field] } } : e
    )
    );
  }
  function removeEvent(id) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function reset() {
    setEvents([]);
    setHasParsed(false);
  }

  function handleGenerate() {
    if (exportableEvents.length === 0) {
      toast({
        title: 'Nothing to export',
        description: 'Keep at least one event with a start date/time.',
        variant: 'destructive'
      });
      return;
    }
    setIsGenerating(true);
    try {
      const ics = buildIcs(exportableEvents);
      downloadIcs('timetable.ics', ics);
      toast({
        title: 'ICS file ready',
        description: `${exportableEvents.length} event${exportableEvents.length === 1 ? '' : 's'} exported. Import it into Apple Calendar.`
      });
    } catch (err) {
      toast({ title: 'Export failed', description: err?.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground leading-none">Timetable Parser</h1>
              <p className="text-xs text-muted-foreground mt-0.5">PDF / image → Apple Calendar</p>
            </div>
          </div>
          {hasParsed &&
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Start over</span>
            </button>
          }
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
        {!hasParsed ?
        <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                AI-powered extraction
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Turn Any Timetable into Calendar events将

            </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Upload a class schedule, meeting plan, or any timetable as a PDF or image. Each event becomes an
                editable block you can review, trim, and export as an ICS file for Apple Calendar.
              </p>
            </div>

            <FileUpload onParsed={handleParsed} onError={(msg) => toast({ title: 'Upload error', description: msg, variant: 'destructive' })} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              {[
            { icon: Sparkles, title: 'Extract', text: 'AI reads every event from your file.' },
            { icon: CheckCircle2, title: 'Review', text: 'Edit, keep, or discard each block.' },
            { icon: Download, title: 'Export', text: 'Download a clean ICS for Apple Calendar.' }].
            map((s) =>
            <div key={s.title} className="rounded-xl border border-border/60 bg-card p-4">
                  <s.icon className="w-4 h-4 text-primary mb-2" />
                  <p className="font-medium text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.text}</p>
                </div>
            )}
            </div>
          </div> :

        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                  Review your events
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {events.length} event{events.length === 1 ? '' : 's'} found · {keptEvents.length} kept ·{' '}
                  {exportableEvents.length} ready to export
                </p>
              </div>
              <button
              onClick={handleGenerate}
              disabled={isGenerating || exportableEvents.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              
                <Download className="w-4 h-4" />
                Generate ICS file
              </button>
            </div>

            {events.length === 0 ?
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No events were detected. Try uploading a clearer or different file.
                </p>
                <button
              onClick={reset}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              
                  <RotateCcw className="w-4 h-4" /> Upload another file
                </button>
              </div> :

          <div className="space-y-4">
                {events.map((ev, i) =>
            <EventBlock
              key={ev.id}
              event={ev}
              index={i}
              onChange={(field, value) => updateField(ev.id, field, value)}
              onToggleInclude={() => toggleInclude(ev.id)}
              onToggleField={(field) => toggleField(ev.id, field)}
              onRemove={() => removeEvent(ev.id)} />

            )}
              </div>
          }

            {events.length > 0 &&
          <div className="sticky bottom-4 sm:bottom-6 z-10">
                <div className="rounded-2xl border border-border bg-background/90 backdrop-blur shadow-lg px-5 py-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{exportableEvents.length}</span> event
                    {exportableEvents.length === 1 ? '' : 's'} ready
                  </p>
                  <button
                onClick={handleGenerate}
                disabled={isGenerating || exportableEvents.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                
                    <Download className="w-4 h-4" />
                    Generate ICS file
                  </button>
                </div>
              </div>
          }
          </div>
        }
      </main>
    </div>);

}