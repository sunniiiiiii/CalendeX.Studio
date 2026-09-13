import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ArrowLeft, FileText, Repeat, CalendarDays, Filter, Sparkles, Download, Lightbulb } from 'lucide-react';
import CurrentTimeBar from '@/components/CurrentTimeBar';

const FORMAT_TIPS = [
  'Use a high-resolution file (300 DPI or higher). Blurry scans lead to missed or misread events.',
  'Prefer real tables with visible rows and columns. The AI reads grid layouts most reliably.',
  'Keep one event per row. Avoid merged cells that combine multiple classes or times.',
  'Include explicit dates and times in their own columns — "2026-09-14" and "09:00–10:30" are ideal.',
  'For recurring classes, label the day of week and time clearly, e.g. "Mon/Wed/Fri 14:00–15:30".',
  'If times only appear in a notes/remarks column, that\'s fine — the parser scans notes for day/time patterns too.',
  'Avoid handwritten timetables; typed or printed text extracts far more accurately.',
  'For multi-page PDFs, make sure every page is included — the parser reads all pages.',
  'Crop out headers, footers, and logos that aren\'t part of the schedule to reduce noise.',
  'Chinese documents are supported: calendar dates like 九月八日 become concrete dates, and 周一/星期一 map to weekdays.'
];

const MODE_OPTIONS = [
  { icon: CalendarDays, title: 'Specific', text: 'Use when each event has a concrete calendar date (e.g. a one-off meeting or exam schedule).' },
  { icon: Repeat, title: 'Recurring', text: 'Use for weekly class schedules. Set a start and end date for the term, and events repeat by day of week + time.' }
];

const CRITERIA_EXAMPLES = [
  'Only include events I\'m enrolled in — exclude "Microeconomics".',
  'Week 1 only.',
  'Keep only Monday and Wednesday sessions.',
  'When two subjects share the same time slot, keep the lecture, not the tutorial.',
  'Exclude any event marked "cancelled" or "TBD".'
];

const REVIEW_TIPS = [
  'Each event becomes an editable block — fix any title, date, time, location, or note before exporting.',
  'Use the Keep / Discard toggle to include or exclude an event from the ICS file.',
  'Field-level toggles let you omit specific fields (e.g. hide notes) while keeping the event.',
  'Low-confidence values are prefixed with [UNCERTAIN] — review those first.',
  'Use Regenerate to re-run the AI on the same file after changing your criteria.',
  'Save to library to keep events for later, then export the ICS for Apple Calendar.'
];

function TipList({ items }) {
  return (
    <ul className="space-y-2.5">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function Help() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground leading-none">CalendeX</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Help center</p>
            </div>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
      </header>

      <CurrentTimeBar />

      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-12 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Help center</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tips for getting the cleanest AI extraction and making the most of CalendeX.
          </p>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            The better your source document, the less manual editing you'll need. A clear, high-resolution table with explicit dates and times gives the best results.
          </p>
        </div>

        <Section icon={FileText} title="Formatting your document for better extraction">
          <TipList items={FORMAT_TIPS} />
        </Section>

        <Section icon={CalendarDays} title="Choosing the right mode">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODE_OPTIONS.map((m) => (
              <div key={m.title} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-2 mb-2">
                  <m.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{m.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{m.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Filter} title="Using the criteria bar">
          <p className="text-sm text-muted-foreground mb-4">
            The criteria bar lets you give the AI filtering instructions before (or after) extraction. Type plain-English rules and the parser will apply them when selecting events. A few examples:
          </p>
          <ul className="space-y-2">
            {CRITERIA_EXAMPLES.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary flex-shrink-0">›</span>
                <code className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">{c}</code>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            After changing criteria on the review screen, press <span className="font-medium text-foreground">Regenerate</span> to re-run the AI on your uploaded file.
          </p>
        </Section>

        <Section icon={Sparkles} title="Reviewing & exporting">
          <TipList items={REVIEW_TIPS} />
        </Section>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
          <Download className="w-4 h-4" />
          Ready to export? <Link to="/" className="text-primary hover:underline">Upload a timetable</Link>
        </div>
      </main>
    </div>
  );
}