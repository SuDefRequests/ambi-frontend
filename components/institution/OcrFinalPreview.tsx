'use client';

import { CheckCircle2 } from 'lucide-react';
import type {
  OcrMetadataDraft,
  OcrPreviewResponse,
} from '@/lib/ocr-types';
import { OCR_LANGUAGES } from '@/lib/ocr-types';

type Props = {
  file: File;
  result: OcrPreviewResponse;
  metadata: OcrMetadataDraft;
  reviewedText: string;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export function OcrFinalPreview({
  file,
  result,
  metadata,
  reviewedText,
  errorMessage,
  isSubmitting = false,
  onBack,
  onConfirm,
}: Props) {
  const languageLabel =
    OCR_LANGUAGES.find((l) => l.id === metadata.language)?.label ??
    metadata.language;

  const wordCount = reviewedText.trim()
    ? reviewedText.trim().split(/\s+/).length
    : 0;

  return (
    <div className="ocr-panel">
      <p className="eyebrow" style={{ color: '#80613d' }}>
        FINAL ARCHIVAL APPROVAL
      </p>

      <h2
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 30,
          fontWeight: 500,
          margin: '8px 0 4px',
        }}
      >
        {metadata.title || file.name}
      </h2>

      <div className="ocr-preview-grid">
        <div className="ocr-preview-section">
          <h3>Document</h3>

          <dl>
            <div>
              <dt>Source file</dt>
              <dd>{file.name}</dd>
            </div>

            <div>
              <dt>Language</dt>
              <dd>{languageLabel}</dd>
            </div>

            <div>
              <dt>Pages</dt>
              <dd>{result.pages.length}</dd>
            </div>

            <div>
              <dt>Reviewed words</dt>
              <dd>{wordCount.toLocaleString()}</dd>
            </div>

            <div>
              <dt>OCR status</dt>
              <dd>{result.status}</dd>
            </div>
          </dl>
        </div>

        <div className="ocr-preview-section">
          <h3>Catalogue record</h3>

          <dl>
            <div>
              <dt>Creator</dt>
              <dd>{metadata.creator || '—'}</dd>
            </div>

            <div>
              <dt>Date</dt>
              <dd>{metadata.date || '—'}</dd>
            </div>

            <div>
              <dt>Document type</dt>
              <dd>{metadata.documentType || '—'}</dd>
            </div>

            <div>
              <dt>Collection</dt>
              <dd>{metadata.collection || '—'}</dd>
            </div>

            <div>
              <dt>Provenance</dt>
              <dd>{metadata.source || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {(metadata.description || metadata.notes) && (
        <div
          className="ocr-preview-section"
          style={{ marginTop: 24 }}
        >
          <h3>Description &amp; notes</h3>

          <p className="ocr-preview-text">
            {[metadata.description, metadata.notes]
              .filter(Boolean)
              .join('\n\n') || '—'}
          </p>
        </div>
      )}

      {errorMessage && (
        <div
          className="ocr-banner"
          style={{ marginTop: 24 }}
        >
          <strong>Archive ingestion failed</strong>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="ocr-actions">
        <button
          className="ocr-secondary-btn"
          onClick={onBack}
          type="button"
          disabled={isSubmitting}
        >
          Back to Metadata
        </button>

        <button
          className="ocr-primary-btn"
          onClick={onConfirm}
          type="button"
          disabled={isSubmitting || !reviewedText.trim()}
        >
          <CheckCircle2 size={18} />

          {isSubmitting ? 'Adding to Archive…' : 'Add to Archive'}
        </button>
      </div>

      <p className="ocr-caption">
        The document has been staged for review. Selecting “Add to Archive”
        will approve the reviewed OCR text and index it in the institutional
        archive.
      </p>
    </div>
  );
}