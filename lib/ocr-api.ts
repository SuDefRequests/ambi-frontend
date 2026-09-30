'use client';
// Client-side counterpart to lib/archive-api.ts. That file is
// `server-only` (used from React Server Components); this one runs in
// the browser because it needs to send a real File through FormData.
// Both go through our own Next.js route handlers so the backend URL
// stays server-side and every OCR call funnels through one place
// instead of scattering fetch() calls across components.

import type { OcrErrorBody, OcrUploadResponse } from './ocr-types';

export class OcrApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'OcrApiError';
  }
}

function messageFromErrorBody(body: OcrErrorBody | null, fallback: string): { message: string; code?: string } {
  if (!body || !body.detail) return { message: fallback };
  if (typeof body.detail === 'string') return { message: body.detail };
  return { message: body.detail.message || fallback, code: body.detail.code };
}

/**
 * Submits a file to the institutional OCR/ingestion workflow.
 *
 * Today this is the ONLY real network call in the whole OCR Desk flow:
 * the backend's POST /upload extracts text AND ingests it into the
 * archive's search index in one atomic, synchronous step — there is no
 * separate non-destructive preview endpoint. See OCR-DESK-NOTES.md for
 * why the Review/Metadata/Final-Preview screens don't make additional
 * requests.
 */
export async function submitDocumentForOcr(file: File, signal?: AbortSignal): Promise<OcrUploadResponse> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  let response: Response;
  try {
    response = await fetch('/api/ocr/upload', { method: 'POST', body: formData, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new OcrApiError(0, 'The digitization service could not be reached. Check your connection and try again.');
  }

  let body: OcrErrorBody & Partial<OcrUploadResponse> | null = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const { message, code } = messageFromErrorBody(body, 'The document could not be processed.');
    throw new OcrApiError(response.status, message, code);
  }

  if (!body || typeof body.status !== 'string' || typeof body.chunks_added !== 'number') {
    throw new OcrApiError(response.status, 'The archive service returned an unexpected response.');
  }

  return {
    status: body.status,
    filename: body.filename ?? file.name,
    chunks_added: body.chunks_added,
    message: body.message ?? '',
  };
}
