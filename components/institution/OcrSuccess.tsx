'use client';

import { CheckCircle2, Search, FilePlus2 } from 'lucide-react';
import type {
  OcrMetadataDraft,
  OcrPreviewResponse,
} from '@/lib/ocr-types';
import { OCR_LANGUAGES } from '@/lib/ocr-types';

type Props = {
  file: File;
  result: OcrPreviewResponse;
  metadata: OcrMetadataDraft;
  onProcessAnother: () => void;
};

export function OcrSuccess({
  file,
  result,
  metadata,
  onProcessAnother,
}: Props) {
  const languageLabel =
    OCR_LANGUAGES.find((language) => language.id === metadata.language)
      ?.label ?? metadata.language;

  const totalCharacters = result.pages.reduce(
    (total, page) => total + page.text.length,
    0,
  );

  return (
    <div className="ocr-panel">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <CheckCircle2 size={34} />

        <div>
          <p
            className="eyebrow"
            style={{ color: '#80613d', marginBottom: 4 }}
          >
            ARCHIVE INGESTION COMPLETE
          </p>

          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 30,
              fontWeight: 500,
              margin: 0,
            }}
          >
            Document added to the archive
          </h2>
        </div>
      </div>

      <p style={{ marginBottom: 28 }}>
        The reviewed OCR text and catalogue metadata have been approved
        and indexed in the institutional archive.
      </p>

      <div className="ocr-preview-grid">
        <div className="ocr-preview-section">
          <h3>Document</h3>

          <dl>
            <div>
              <dt>File</dt>
              <dd>{file.name}</dd>
            </div>

            <div>
              <dt>Title</dt>
              <dd>{metadata.title || file.name}</dd>
            </div>

            <div>
              <dt>Language</dt>
              <dd>{languageLabel}</dd>
            </div>

            <div>
              <dt>Pages</dt>
              <dd>{result.pages.length}</dd>
            </div>
          </dl>
        </div>

        <div className="ocr-preview-section">
          <h3>OCR record</h3>

          <dl>
            <div>
              <dt>Extracted text</dt>
              <dd>{totalCharacters.toLocaleString()} characters</dd>
            </div>

            <div>
              <dt>Processing status</dt>
              <dd>{result.status}</dd>
            </div>

            <div>
              <dt>Document ID</dt>
              <dd
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  wordBreak: 'break-all',
                }}
              >
                {result.document_id}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="ocr-actions" style={{ marginTop: 28 }}>
        <button
          className="ocr-secondary-btn"
          type="button"
          onClick={onProcessAnother}
        >
          <FilePlus2 size={18} />
          Process Another Document
        </button>

        <button
          className="ocr-primary-btn"
          type="button"
          onClick={() => {
            window.location.href = '/search';
          }}
        >
          <Search size={18} />
          Search the Archive
        </button>
      </div>

      <p className="ocr-caption">
        This document is now available through the institutional archive
        and unified search experience.
      </p>
    </div>
  );
}