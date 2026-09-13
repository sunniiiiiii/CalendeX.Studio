import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/80 mt-12">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock className="w-4 h-4" />
          <span>CalendeX</span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          <Link to="/help" className="hover:text-foreground transition-colors">Help</Link>
          <Link to="/feedback" className="hover:text-foreground transition-colors">Feedback</Link>
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CalendeX</p>
      </div>
    </footer>
  );
}