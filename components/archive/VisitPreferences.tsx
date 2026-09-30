'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Language, Mode } from '@/lib/content';
function useVisitState() {
  const [language, setLanguage] = useState<Language>('en');
  const [mode, setMode] = useState<Mode>('visitor');
  const [query, setQuery] = useState('');
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  return { language, setLanguage, mode, setMode, query, setQuery, largeText, setLargeText, highContrast, setHighContrast, reduceMotion, setReduceMotion };
}
const VisitContext = createContext<ReturnType<typeof useVisitState> | null>(null);
export function VisitPreferences({ children }: { children: ReactNode }) {
  const value = useVisitState();
  return <VisitContext.Provider value={value}>{children}</VisitContext.Provider>;
}
export function useVisit() {
  const value = useContext(VisitContext);
  if (!value) throw new Error('VisitPreferences is required');
  return value;
}
