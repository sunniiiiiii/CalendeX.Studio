import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ArrowLeft, Search, CheckCircle2, AlertCircle, CircleSlash, FileText, Image as ImageIcon, Inbox } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import CurrentTimeBar from '@/components/CurrentTimeBar';

const STATUS_META = {
  success: { label: 'Success', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  no_events: { label: 'No events', icon: CircleSlash, className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  failed: { label: 'Failed', icon: AlertCircle, className: 'bg-destructive/10 text-destructive' }
};

export default function History() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  async function load() {
    setLoading(true);
    try {
      const list = await base44.entities.ExtractionHistory.list('-created_date', 500);
      setItems(list);
    } catch (err) {
      toast({ title: 'Load failed', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let res = items;
    if (status !== 'all') res = res.filter((i) => i.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter((i) => (i.file_name || '').toLowerCase().includes(q));
    }
    return res;
  }, [items, query, status]);

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
              <p className="text-xs text-muted-foreground mt-0.5">Extraction history</p>
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
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Extraction history</h2>
          <p className="text-sm text-muted-foreground mt-1">
            A log of every timetable file you've uploaded and its processing status.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search file name…"
              className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="no_events">No events</option>
            <option value="failed">Failed</option>
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
              {items.length === 0
                ? 'No uploads yet. Your processed timetable files will appear here.'
                : 'No records match your search.'}
            </p>
            {items.length === 0 && (
              <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" /> Go to upload
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{filtered.length} record{filtered.length === 1 ? '' : 's'}</p>
            {filtered.map((it) => {
              const meta = STATUS_META[it.status] || STATUS_META.failed;
              const Icon = meta.icon;
              const isPdf = /\.(pdf)$/i.test(it.file_name || '');
              const when = new Date(it.created_date).toLocaleString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });
              return (
                <div key={it.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {isPdf ? <FileText className="w-4 h-4 text-primary" /> : <ImageIcon className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground truncate">{it.file_name || 'Unnamed file'}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium flex-shrink-0 ${meta.className}`}>
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{when}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {it.mode && <span>Mode: <span className="text-foreground">{it.mode}</span></span>}
                        <span>Events: <span className="text-foreground">{it.event_count || 0}</span></span>
                        {it.criteria && <span className="truncate max-w-[200px]">Criteria: <span className="text-foreground">{it.criteria}</span></span>}
                      </div>
                      {it.error_message && (
                        <p className="mt-2 text-xs text-destructive">{it.error_message}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}