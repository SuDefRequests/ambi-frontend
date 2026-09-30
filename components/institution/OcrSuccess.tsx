'use client';
import Link from 'next/link';
import { CheckCircle2, Search, FilePlus2 } from 'lucide-react';
import type { OcrMetadataDraft, OcrUploadResponse } from '@/lib/ocr-types';
import { OCR_LANGUAGES } from '@/lib/ocr-types';

type Props = {
  file: File;
  result: OcrUploadResponse;
  metadata: OcrMetadataDraft;
  onProcessAnother: () => void;
};

export function OcrSuccess({ file, result, metadata, onProcessAnother }: Props) {
  const languageLabel = OCR_LANGUAGES.find((l) => l.id === metadata.language)?.label ?? metadata.language;

  return (
    <div className="ocr-panel">
      <div className="ocr-success">
        <div className="ocr-success-icon"><CheckCircle2 size={40} strokeWidth={1.5} /></div>
        <h2>Document added to the archive</h2>
        <p style={{ color: '#5d5849' }}>{result.message || 'The document was processed and indexed successfully.'}</p>

        <dl className="ocr-success-summary">
          <div><dt>Title</dt><dd>{metadata.title || file.name}</dd></div>
          <div><dt>Source file</dt><dd>{result.filename}</dd></div>
          <div><dt>Language</dt><dd>{languageLabel}</dd></div>
          <div><dt>Text segments indexed</dt><dd>{result.chunks_added}</dd></div>
          <div><dt>Archive status</dt><dd>{result.status}</dd></div>
        </dl>

        <div className="ocr-success-actions">
          <Link className="ocr-secondary-btn" href={`/search?q=${encodeURIComponent(metadata.title || file.name)}`}>
            <Search size={18} /> Search the Archive
          </Link>
          <button className="ocr-primary-btn" onClick={onProcessAnother} type="button">
            <FilePlus2 size={18} /> Process Another Document
          </button>
        </div>
        <p className="ocr-caption">
          The archive service doesn&apos;t return a document identifier for this upload yet, so there isn&apos;t a
          direct link to it — try searching for a distinctive phrase from the document above; newly digitized text
          is added to the same index that search queries.
        </p>
      </div>
    </div>
  );
}
