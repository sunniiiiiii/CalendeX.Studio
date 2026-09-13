import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ArrowLeft, Sparkles, Users, ShieldCheck } from 'lucide-react';
import CurrentTimeBar from '@/components/CurrentTimeBar';
import Footer from '@/components/Footer';

export default function About() {
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
              <p className="text-xs text-muted-foreground mt-0.5">About</p>
            </div>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
      </header>

      <CurrentTimeBar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-8 sm:py-12 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">About CalendeX</h1>
          <p className="text-sm text-muted-foreground mt-2">AI-powered timetable extraction for Apple Calendar.</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            CalendeX is an AI-powered tool that turns any timetable — a class schedule, meeting plan, exam roster, or
            shift chart — into clean, editable calendar events. Upload a PDF or image, and the app reads every event
            from the document, translating foreign-language text into English. Each
            extracted event becomes an independent block you can review, edit, keep, or discard before exporting.
          </p>
          <p>
            It is built for students juggling weekly recurring classes, teachers consolidating term schedules,
            administrators, and professionals who receive plans on paper or in scanned PDFs. Whether your schedule is
            a tidy grid or a gridless block of plain text, CalendeX extracts titles, dates, times, days of the week,
            locations, and notes — and flags low-confidence values with <span className="font-medium text-foreground">[UNCERTAIN]</span> so
            you can correct them before anything reaches your calendar.
          </p>
          <p>
            Choose a <span className="font-medium text-foreground">Specific</span> mode for one-off dated events, or a
            <span className="font-medium text-foreground"> Recurring</span> mode for weekly schedules bounded by a term
            period, then export a single RFC 5545-compliant ICS file that imports directly into Apple Calendar. A
            criteria bar lets you filter events during extraction, a History page logs every upload, and a Library keeps
            your saved schedules for later reuse.
          </p>
          <p>
            CalendeX is built and maintained by an independent team on the Base44 platform, with a focus on accuracy,
            transparency, and a review-first workflow that keeps you in control of every event that reaches your
            calendar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <Sparkles className="w-4 h-4 text-primary mb-2" />
            <p className="text-sm font-medium text-foreground">What it does</p>
            <p className="text-xs text-muted-foreground mt-0.5">Converts PDF/image timetables into editable ICS calendar events.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Users className="w-4 h-4 text-primary mb-2" />
            <p className="text-sm font-medium text-foreground">Who it's for</p>
            <p className="text-xs text-muted-foreground mt-0.5">Students, teachers, admins, and professionals with paper or PDF schedules.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <ShieldCheck className="w-4 h-4 text-primary mb-2" />
            <p className="text-sm font-medium text-foreground">Who builds it</p>
            <p className="text-xs text-muted-foreground mt-0.5">An independent team, built on the Base44 platform.</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
          Ready to try it? <Link to="/" className="text-primary hover:underline">Upload a timetable</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}