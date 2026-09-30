# Archive Digitization (OCR Desk) — backend contract notes

The task brief assumed `POST /api/v1/ocr/preview` and `POST /api/v1/ocr/ingest`
backed by `app/ocr/{models,routes,service,ingestion,storage}.py`. None of
that exists in the backend project (`ambiguity-man-backend-integration`).
Inspecting `app/api.py` directly, the real, only relevant endpoint is:

```
POST /upload
  in:  multipart/form-data, field "file"
  out: { status: string, filename: string, chunks_added: number, message: string }
```

What it actually does (`app/api.py`, `upload_file`):
- Accepts `.pdf` (via PyPDF2) or an audio/video extension (routed to
  Whisper transcription) — **no image OCR**. PNG/JPG/TIFF hit the
  `else: raise HTTPException(400, "Unsupported file format.")` branch.
- Extracts all text, chunks it by a fixed 1000-character window (not by
  page), and immediately `upsert()`s the chunks into the same ChromaDB
  collection used by `/api/v1/search` and `/api/v1/ask` — extraction and
  ingestion happen in one atomic, synchronous call. There is no
  non-destructive preview.
- Returns no per-page text, no OCR confidence, no document/passage id,
  and ignores any language parameter (none is accepted).

## What this meant for the frontend

Per the brief's own rules ("DO NOT invent request fields", "do not fake
persistence", "if a backend capability is not currently available,
implement the frontend state/UI for it cleanly but do not fake it"),
the OCR Desk is built as follows:

- **One real network call**, at "Process Document" (`lib/ocr-api.ts` →
  `app/api/ocr/upload/route.ts` → backend `POST /upload`). Everything
  after that is UI/local state.
- **Review step** cannot show real extracted text (the backend never
  returns it) — it says so plainly instead of fabricating OCR output,
  and offers a local, clearly-unsaved notes field instead.
- **No confidence score** is shown anywhere — the spec's own rule 4
  ("If confidence is unavailable... do NOT invent it") applies literally,
  since the live endpoint never returns one.
- **Metadata step** fields are pure client-side state — the backend has
  no field to receive them, so nothing is silently dropped or faked as
  saved.
- **"Add to Archive"** on the Final Preview screen does **not** make a
  second request — the document was already ingested at Process Document
  time, since that's the only point where the backend does anything. The
  button is kept (per spec wording) but its caption says exactly what it
  does: mark the catalogue record complete.
- **File picker** visually lists PDF/PNG/JPG/TIFF per the spec, but only
  PDF is accepted for submission — the others are shown as "coming soon"
  so an operator doesn't waste a submit on a guaranteed 400.
- **Language selector** is kept (useful for cataloguing and for a future
  backend that does honor it) but labeled as cataloguing-only, since the
  live OCR path ignores it today.

## To make the spec's full flow real, the backend would need

1. A true two-phase contract: `POST /ocr/preview` that extracts and
   returns `{ pages: [{ page, text, confidence? }], ... }` **without**
   committing to the archive, and a separate `POST /ocr/ingest` that
   commits an approved/edited version.
2. Image OCR (PNG/JPG/TIFF) — currently PDF-only.
3. A metadata field on ingest (title, creator, date, collection, etc.),
   or a separate metadata-attach endpoint.
4. A returned document/passage id so the frontend can deep-link to the
   freshly ingested record instead of only pointing at Search.
5. Page-level chunking (the current 1000-char fixed window has no
   relationship to source pages).
