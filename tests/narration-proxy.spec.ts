import { test, expect } from '@playwright/test';
import { POST } from '../app/api/audio/speak/route';

// Exercise the actual Next handler with a mocked upstream; no TTS service calls.
const request = (body: unknown) => new Request('http://localhost/api/audio/speak', {
  method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' },
});

test('Narration proxy validates input before calling the backend', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Backend must not be called'); };
  try {
    for (const body of [null, {}, { text: 12 }, { text: '' }, { text: ' \n' }]) {
      expect((await POST(request(body))).status).toBe(400);
    }
    expect((await POST(new Request('http://localhost/api/audio/speak', { method: 'POST', body: '{' }))).status).toBe(400);
  } finally { globalThis.fetch = original; }
});

test('Narration proxy forwards exact text and returns unchanged MP3 bytes', async () => {
  const original = globalThis.fetch;
  const text = '  Original  quotation\n“Equality.” नमस्ते  ';
  const bytes = new Uint8Array([73, 68, 51, 0, 255, 128]);
  globalThis.fetch = async (url, options) => {
    const base = process.env.ARCHIVE_API_URL || 'http://127.0.0.1:8001';
    expect(url).toBe(`${base.replace(/\/$/, '')}/api/v1/audio/speak`);
    expect(JSON.parse(options?.body as string)).toEqual({ text, voice: 'alloy', language: 'en' });
    expect(options?.cache).toBe('no-store');
    return new Response(bytes, { headers: { 'Content-Type': 'audio/mpeg' } });
  };
  try {
    const response = await POST(request({ text }));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('audio/mpeg');
    expect(response.headers.get('content-disposition')).toBe('attachment; filename="archive-narration.mp3"');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
  } finally { globalThis.fetch = original; }
});

test('Narration proxy masks upstream errors, invalid audio and network failures', async () => {
  const original = globalThis.fetch;
  try {
    for (const result of [
      () => new Response('private provider details', { status: 503 }),
      () => new Response('{}', { headers: { 'Content-Type': 'application/json' } }),
      () => new Response('', { headers: { 'Content-Type': 'audio/mpeg' } }),
      () => { throw new Error('secret'); },
    ]) {
      globalThis.fetch = async () => result();
      const response = await POST(request({ text: 'Text' }));
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ detail: {
        code: 'tts_unavailable', message: 'Archive narration is currently unavailable.',
      } });
    }
  } finally { globalThis.fetch = original; }
});
