import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Search, ArrowLeft, Trash2, MapPin, Clock, CalendarDays, StickyNote, Inbox } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import CurrentTimeBar from '@/components/CurrentTimeBar';

function formatWhen(ev) {
  if (ev.start) {
    const d = new Date(ev.start);
    if (!isNaN(d.getTime())) {
      const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${date} · ${time}`;
    }
    return ev.start;
  }
  const parts = [];
  if (ev.day_of_week) parts.push(ev.day_of_week);
  if (ev.start_time || ev.end_time) parts.push(`${ev.start_time || '—'}–${ev.end_time || '—'}`);
  return parts.join(' · ') || 'No time';
}

export default function SavedEvents() {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');
  const [sort, setSort] = useState('newest');

  async function load() {
    setLoading(true);
    try {
      const list = await base44.entities.SavedEvent.list('-created_date', 500);
      setEvents(list);
    } catch (err) {
      toast({ title: 'Load failed', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const sources = useMemo(() => {
    const set = new Set(events.map((e) => e.source_file_name).filter(Boolean));
    return Array.from(set);
  }, [events]);

  const filtered = useMemo(() => {
    let res = events;
    if (source !== 'all') res = res.filter((e) => e.source_file_name === source);
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter((e) =>
        [e.title, e.location, e.notes, e.day_of_week].some((v) => (v || '').toLowerCase().includes(q))
      );
    }
    res = [...res];
    if (sort === 'newest') res.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    else if (sort === 'oldest') res.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    else if (sort === 'title') res.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    else if (sort === 'date') res.sort((a, b) => new Date(a.start || '9999-12-31') - new Date(b.start || '9999-12-31'));
    return res;
  }, [events, query, source, sort]);

  async function remove(id) {
    try {
      await base44.entities.SavedEvent.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast({ title: 'Removed from library' });
    } catch (err) {
      toast({ title: 'Delete failed', description: err?.message, variant: 'destructive' });
    }
  }

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
              <p className="text-xs text-muted-foreground mt-0.5">Event library</p>
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
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Saved events</h2>
          <p className="text-sm text-muted-foreground mt-1">
            All events you've saved from past extractions. Search, filter, and organize them below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, location, notes…"
              className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="all">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="date">Event date</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {events.length === 0
                ? 'No saved events yet. Save events from the review screen to build your library.'
                : 'No events match your search.'}
            </p>
            {events.length === 0 && (
              <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" /> Go to upload
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{filtered.length} event{filtered.length === 1 ? '' : 's'}</p>
            {filtered.map((ev) => (
              <div key={ev.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ev.title || 'Untitled event'}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatWhen(ev)}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(ev.id)}
                    className="rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors flex-shrink-0"
                    aria-label="Remove event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  {ev.day_of_week && (
                    <span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{ev.day_of_week}</span>
                  )}
                  {ev.location && (
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ev.location}</span>
                  )}
                  {ev.source_file_name && (
                    <span className="inline-flex items-center gap-1 truncate"><CalendarClock className="w-3.5 h-3.5" />{ev.source_file_name}</span>
                  )}
                </div>
                {ev.notes && (
                  <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1.5">
                    <StickyNote className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{ev.notes}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}