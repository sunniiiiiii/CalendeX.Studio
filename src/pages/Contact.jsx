import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ArrowLeft, Send, CheckCircle2, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import CurrentTimeBar from '@/components/CurrentTimeBar';
import Footer from '@/components/Footer';

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!message.trim()) {
      toast({ title: 'Message required', description: 'Please enter a message.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Feedback.create({
        type: 'contact',
        name: name.trim(),
        contact: email.trim(),
        description: message.trim(),
        status: 'open'
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      toast({ title: 'Submit failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground leading-none">CalendeX</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Contact</p>
            </div>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
      </header>

      <CurrentTimeBar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-8 sm:py-12 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Contact us</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Questions, bug reports, or ideas? Send us a message and we'll get back to you.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Thanks — your message was sent.</p>
              <p className="text-xs text-muted-foreground mt-1">We read every message and will reply if you left an email.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Send another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="How can we help?"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 resize-y"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}

        <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
          <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Prefer email?</p>
            <p className="text-xs text-muted-foreground mt-1">
              You can also reach us through the <Link to="/feedback" className="text-primary hover:underline">Feedback &amp; support</Link> page to report a parsing issue or suggest an improvement.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}