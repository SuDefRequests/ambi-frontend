import { NextResponse } from 'next/server';
import { searchIdeaPassages } from '@/lib/archive-api';
import { buildIdeaEvidence } from '@/lib/connections-evidence';
import { ideas } from '@/components/connections/ideas';

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('idea');
  const idea = ideas.find(item => item.id === id);
  if (!idea) return NextResponse.json({ error: 'Unknown idea.' }, { status: 400 });
  try {
    const result = await searchIdeaPassages(idea.title);
    return NextResponse.json(buildIdeaEvidence(idea, result));
  } catch {
    return NextResponse.json({ error: 'Archive evidence is temporarily unavailable.' }, { status: 503 });
  }
}
