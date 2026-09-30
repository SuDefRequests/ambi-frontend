import { NextResponse } from 'next/server';

const unavailable = () => NextResponse.json({ detail: {
  code: 'tts_unavailable', message: 'Archive narration is currently unavailable.',
} }, { status: 503 });

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { body = null; }
  if (!body || typeof body.text !== 'string' || !body.text.trim()) {
    return NextResponse.json({ detail: {
      code: 'invalid_text', message: 'Passage text is required.',
    } }, { status: 400 });
  }
  try {
    const base = process.env.ARCHIVE_API_URL || 'http://127.0.0.1:8001';
    const response = await fetch(`${base.replace(/\/$/, '')}/api/v1/audio/speak`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      // Keep the archival text exact. Voice and language are fixed kiosk defaults.
      body: JSON.stringify({ text: body.text, voice: 'alloy', language: 'en' }),
      cache: 'no-store', signal: AbortSignal.timeout(45000),
    });
    if (!response.ok || response.headers.get('content-type')?.split(';')[0] !== 'audio/mpeg') {
      return unavailable();
    }
    const audio = await response.arrayBuffer();
    if (!audio.byteLength) return unavailable();
    return new Response(audio, { headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="archive-narration.mp3"',
      'Cache-Control': 'no-store',
    } });
  } catch {
    return unavailable();
  }
}
