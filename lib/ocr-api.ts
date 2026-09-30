import type {
  OcrIngestRequest,
  OcrIngestResponse,
  OcrLanguage,
  OcrPreviewResponse,
} from './ocr-types';

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      body && typeof body.detail === 'string'
        ? body.detail
        : 'OCR request failed';

    throw new Error(detail);
  }

  return body as T;
}

export async function previewDocumentForOcr(
  file: File,
  language: OcrLanguage,
  signal?: AbortSignal,
): Promise<OcrPreviewResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const response = await fetch('/api/ocr/preview', {
    method: 'POST',
    body: formData,
    signal,
  });

  return parseResponse<OcrPreviewResponse>(response);
}

export async function ingestOcrDocument(
  request: OcrIngestRequest,
  signal?: AbortSignal,
): Promise<OcrIngestResponse> {
  const response = await fetch('/api/ocr/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  });

  return parseResponse<OcrIngestResponse>(response);
}