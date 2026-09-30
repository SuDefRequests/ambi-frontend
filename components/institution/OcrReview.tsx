'use client';
import { FileText, Info, RotateCcw } from 'lucide-react';
import type { OcrUploadResponse, OcrLanguage } from '@/lib/ocr-types';
import { OCR_LANGUAGES } from '@/lib/ocr-types';

type Props = {
  file: File;
  result: OcrUploadResponse;
  language: OcrLanguage;
  reviewedText: string;
  onChangeReviewedText: (text: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function OcrReview({ file, result, language, reviewedText, onChangeReviewedText, onBack, onContinue }: Props) {
  const languageLabel = OCR_LANGUAGES.find((l) => l.id === language)?.label ?? language;

  return (
    <div>
      <div className="ocr-banner info ocr-review-notice">
        <Info size={20} />
        <span>
          This document has already been read and added to the archive&apos;s search index — the archive service
          combines reading and indexing into a single step. The screens below help you complete its catalogue
          record before it&apos;s marked ready.
        </span>
      </div>

      <div className="ocr-review-layout">
        <div className="ocr-review-col">
          <h3>Pages</h3>
          <button type="button" className="ocr-page-card" aria-current="true">
            <FileText size={18} />
            <strong>Document</strong>
            <small>Page-level breakdown isn&apos;t provided by the current archive service</small>
          </button>
        </div>

        <div className="ocr-review-col">
          <h3>OCR Text Editor</h3>
          <div className="ocr-text-empty">
            <strong>Original OCR output isn&apos;t returned by the archive service</strong>
            <p style={{ margin: 0 }}>
              The archive&apos;s digitization endpoint reads and indexes the document&apos;s text but doesn&apos;t send
              it back to this screen — so there is nothing extracted to display for correction yet. You can still
              write reviewer notes below for your own records; they are kept only in this browser tab and are not
              sent anywhere, since the archive service doesn&apos;t currently accept edited text.
            </p>
          </div>
          <textarea
            className="ocr-text-editor"
            placeholder="Optional reviewer notes (not saved to the archive)…"
            value={reviewedText}
            onChange={(e) => onChangeReviewedText(e.target.value)}
          />
          <div className="ocr-editor-actions">
            <button type="button" onClick={() => onChangeReviewedText('')}>
              <RotateCcw size={14} style={{ marginRight: 6, display: 'inline' }} />
              Clear notes
            </button>
          </div>
        </div>

        <div className="ocr-review-col">
          <h3>Information</h3>
          <dl className="ocr-info-list">
            <div>
              <dt>Source file</dt>
              <dd>{file.name}</dd>
            </div>
            <div>
              <dt>Language</dt>
              <dd>{languageLabel} <span style={{ opacity: .7 }}>(cataloguing only)</span></dd>
            </div>
            <div>
              <dt>Text segments indexed</dt>
              <dd>{result.chunks_added}</dd>
            </div>
            <div>
              <dt>Archive status</dt>
              <dd>{result.message || result.status}</dd>
            </div>
            <div>
              <dt>OCR confidence</dt>
              <dd className="is-unavailable">Not provided by the archive service</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="ocr-actions">
        <button className="ocr-secondary-btn" onClick={onBack} type="button">Process Another Document</button>
        <button className="ocr-primary-btn" onClick={onContinue} type="button">Continue to Metadata</button>
      </div>
    </div>
  );
}
