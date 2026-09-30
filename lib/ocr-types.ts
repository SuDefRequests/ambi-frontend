// Types for the institutional Archive Digitization (OCR) workflow.
//
// IMPORTANT: OcrUploadResponse mirrors the *actual* backend response
// from POST /upload (see app/api.py in the backend project) — it does
// NOT include page-level text, confidence, or a document id, because
// the live endpoint does not return them. Do not add fields here that
// the backend doesn't send; see OCR-DESK-NOTES.md for the full gap list.

export type OcrLanguage = 'en' | 'hi' | 'mr';

export const OCR_LANGUAGES: { id: OcrLanguage; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'mr', label: 'Marathi' },
];

/** The real, current shape of a successful POST /upload response. */
export type OcrUploadResponse = {
  status: string;
  filename: string;
  chunks_added: number;
  message: string;
};

/** The real shape of a FastAPI HTTPException(detail=...) error body. */
export type OcrErrorBody = {
  detail?: { code?: string; message?: string } | string;
};

export type OcrWorkflowStep =
  | 'upload'
  | 'processing'
  | 'review'
  | 'metadata'
  | 'final-preview'
  | 'success';

/** Purely local, in-browser record-keeping. Nothing here is sent to the
 * backend today — there is no metadata field on POST /upload. Kept
 * separate from OcrUploadResponse so it's never confused with what the
 * archive service actually stored. See OCR-DESK-NOTES.md. */
export type OcrMetadataDraft = {
  title: string;
  description: string;
  creator: string;
  date: string;
  language: OcrLanguage;
  documentType: string;
  collection: string;
  source: string;
  notes: string;
};

export const EMPTY_METADATA_DRAFT: OcrMetadataDraft = {
  title: '',
  description: '',
  creator: '',
  date: '',
  language: 'en',
  documentType: '',
  collection: '',
  source: '',
  notes: '',
};
