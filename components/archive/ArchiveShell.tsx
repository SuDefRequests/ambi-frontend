'use client';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Accessibility } from 'lucide-react';
import { ArchiveMark } from '@/components/ui/ArchiveMark';
import { Dialog } from '@/components/ui/Dialog';
import { PreferenceSwitch } from '@/components/ui/PreferenceSwitch';
import { useVisit } from './VisitPreferences';
export function ArchiveShell({ children }: { children: ReactNode }) {
  const prefs = useVisit();
  const [access, setAccess] = useState(false);
  useEffect(() => { document.documentElement.lang = 'en'; }, []);
  return <div lang="en" className={`archive-shell ${prefs.largeText ? 'large-text' : ''} ${prefs.highContrast ? 'high-contrast' : ''} ${prefs.reduceMotion ? 'reduced-motion' : ''}`}>
    <a className="skip-link" href="#archive-content">Skip to archive content</a>
    <header className="archive-header">
      <Link className="identity" href="/" aria-label="Samvidhan home"><ArchiveMark/><span><strong>SAMVIDHAN</strong><small>THE AMBEDKAR DIGITAL ARCHIVE</small></span></Link>
      <nav aria-label="Kiosk navigation"><button onClick={() => setAccess(true)} aria-haspopup="dialog"><Accessibility size={22}/>Accessibility</button><Link href="/"><ArrowLeft size={21}/>Home</Link></nav>
    </header>
    <main id="archive-content" tabIndex={-1}>{children}</main>
    <footer className="archive-footer"><span>✦ A living archive. A shared heritage.</span><span>READING ROOM · ENGLISH SOURCE TEXT</span></footer>
    <Dialog open={access} onClose={() => setAccess(false)} title="Make yourself comfortable." closeLabel="Close">
      <PreferenceSwitch label="Larger text" description="More space for reading." checked={prefs.largeText} onChange={() => prefs.setLargeText(!prefs.largeText)}/>
      <PreferenceSwitch label="Stronger contrast" description="Darker text and clearer controls." checked={prefs.highContrast} onChange={() => prefs.setHighContrast(!prefs.highContrast)}/>
      <PreferenceSwitch label="Reduce motion" description="Keep transitions still and gentle." checked={prefs.reduceMotion} onChange={() => prefs.setReduceMotion(!prefs.reduceMotion)}/>
    </Dialog>
  </div>;
}
