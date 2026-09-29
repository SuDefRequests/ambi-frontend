'use client';

import { useEffect, useState } from 'react';
import type { IdeaEvidence } from '@/lib/connections-evidence';

type Result = { status: 'ready'; evidence: IdeaEvidence } | { status: 'unavailable' };
type Entry = { expires: number; request: Promise<Result> };
// Only the six canonical ideas are requested. Reuse in-flight requests as well
// as results across selections/remounts; failures expire sooner for recovery.
const cache = new Map<string, Entry>();

function retrieve(id: string): Promise<Result> {
  const existing = cache.get(id);
  if (existing && existing.expires > Date.now()) return existing.request;
  const entry: Entry = { expires: Infinity, request: Promise.resolve({ status: 'unavailable' }) };
  entry.request = fetch(`/api/connections/evidence?idea=${encodeURIComponent(id)}`, {
    signal: AbortSignal.timeout(10000),
  }).then(async response => {
    if (!response.ok) throw new Error('Archive unavailable');
    const evidence = await response.json() as IdeaEvidence;
    if (!Array.isArray(evidence.passages) || !evidence.sharedPassages) throw new Error('Invalid evidence');
    entry.expires = Date.now() + 5 * 60 * 1000;
    return { status: 'ready', evidence } as const;
  }).catch(() => {
    entry.expires = Date.now() + 15000;
    return { status: 'unavailable' } as const;
  });
  cache.set(id, entry);
  return entry.request;
}

export function useIdeaEvidence(id: string): Result | { status: 'loading' } {
  const [result, setResult] = useState<{ id: string; value: Result }>();
  useEffect(() => {
    let active = true;
    // Quick browsing should not start a retrieval for every intermediate tap.
    const timer = setTimeout(() => {
      void retrieve(id).then(value => { if (active) setResult({ id, value }); });
    }, 150);
    return () => { active = false; clearTimeout(timer); };
  }, [id]);
  return result?.id === id ? result.value : { status: 'loading' };
}
