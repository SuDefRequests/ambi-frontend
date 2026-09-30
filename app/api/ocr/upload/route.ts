import { NextResponse } from 'next/server';

const ARCHIVE_API_URL = process.env.ARCHIVE_API_URL || 'http://127.0.0.1:8001';

// Mirrors app/api/ask/route.ts: keep the backend URL server-side, and
// translate a down/unreachable backend into a friendly, human-readable
// error instead of a raw fetch failure the UI would have to guess at.
//
// NOTE ON THE ENDPOINT PATH: the backend's OCR/ingestion route is
// `POST /upload` (unprefixed) in app/api.py — not `/api/v1/ocr/upload`.
// There is no `/api/v1/ocr/preview` or `/api/v1/ocr/ingest` in the
// backend today. See OCR-DESK-NOTES.md for the full contract gap list.
export async function POST(request: Request) {
  try {
    const incoming = await request.formData();
    const file = incoming.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { detail: { code: 'missing_file', message: 'No file was provided.' } },
        { status: 400 },
      );
    }

    // Rebuild the multipart body rather than forwarding the parsed
    // FormData object directly, so the boundary/content-type fetch
    // generates for the outbound request is guaranteed correct.
    const outgoing = new FormData();
    outgoing.append('file', file, file.name);

    const response = await fetch(`${ARCHIVE_API_URL}/upload`, {
      method: 'POST',
      body: outgoing,
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({
      detail: { code: 'invalid_response', message: 'The archive service returned an unexpected response.' },
    }));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('OCR upload proxy error:', error);
    return NextResponse.json(
      {
        detail: {
          code: 'archive_unavailable',
          message: 'The digitization service is currently unavailable.',
        },
      },
      { status: 503 },
    );
  }
}
