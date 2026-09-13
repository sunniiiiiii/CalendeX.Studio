import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ArrowLeft, MessageSquare, Lightbulb, AlertTriangle, Send, Inbox, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import CurrentTimeBar from '@/components/CurrentTimeBar';

const TYPES = [
  { value: 'report', label: 'Report a parsing issue', icon: AlertTriangle, hint: 'Tell us about a document that failed to parse correctly.' },
  { value: 'suggestion', label: 'Suggest an improvement', icon: Lightbulb, hint: 'Share an idea to improve the AI extraction logic.' }
];

export default function Feedback() {
  const { toast } = useToast();
  const [type, setType] = useState('report');
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  async function loadRecent() {
    setLoadingList(true);
    try {
      const list = await base44.entities.Feedback.list('-created_date', 10);
      setItems(list);
    } catch {
      // ignore list errors
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => { loadRecent(); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!description.trim()) {
      toast({ title: 'Description required', description: 'Please describe the issue or suggestion.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Feedback.create({
        type,
        file_name: fileName.trim(),
        description: description.trim(),
        contact: contact.trim(),
        status: 'open'
      });
      setSubmitted(true);
      setFileName('');
      setDescription('');
      setContact('');
      loadRecent();
    } catch (err) {
      toast({ title: 'Submit failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
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
              <p className="text-xs text-muted-foreground mt-0.5">Feedback &amp; support</p>
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
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Feedback &amp; support</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Report documents that didn't parse correctly, or suggest improvements to the AI extraction.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Thank you — your feedback was submitted.</p>
              <p className="text-xs text-muted-foreground mt-1">We review every report and suggestion to improve extraction accuracy.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Submit another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground">What kind of feedback?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {TYPES.map((t) => {
                  const active = type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={[
                        'text-left rounded-xl border p-4 transition-colors',
                        active ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted/50'
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <t.icon className={['w-4 h-4', active ? 'text-primary' : 'text-muted-foreground'].join(' ')} />
                        <span className="text-sm font-medium text-foreground">{t.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {type === 'report' && (
              <div>
                <label className="text-sm font-medium text-foreground">File name (optional)</label>
                <input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. semester_schedule.pdf"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder={type === 'report'
                  ? 'What went wrong? Which events were missed, misread, or incorrectly translated?'
                  : 'What improvement would you like to see in the extraction logic?'}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 resize-y"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Contact (optional)</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email if you'd like a reply"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting…' : 'Submit feedback'}
            </button>
          </form>
        )}

        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Recent submissions
          </h3>
          {loadingList ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-7 h-7 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Inbox className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No feedback submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((it) => {
                const isReport = it.type === 'report';
                const when = new Date(it.created_date).toLocaleString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                return (
                  <div key={it.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${isReport ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'}`}>
                        {isReport ? <AlertTriangle className="w-3 h-3" /> : <Lightbulb className="w-3 h-3" />}
                        {isReport ? 'Report' : 'Suggestion'}
                      </span>
                      <span className="text-xs text-muted-foreground">{when}</span>
                    </div>
                    <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">{it.description}</p>
                    {it.file_name && <p className="text-xs text-muted-foreground mt-1.5">File: {it.file_name}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}