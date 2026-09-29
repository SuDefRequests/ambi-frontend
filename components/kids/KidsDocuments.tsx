'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  FileText,
  LoaderCircle,
  Sparkles,
} from 'lucide-react';

import type { ArchivePassage } from '@/lib/archive-types';

type Props = {
  onBack?: () => void;
};

export function KidsDocuments({ onBack }: Props) {
  const [documents, setDocuments] = useState<ArchivePassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] =
    useState<ArchivePassage | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/kids/documents');

        if (!response.ok) {
          throw new Error('Document request failed');
        }

        const data = await response.json();

        if (!cancelled) {
          setDocuments(data.records ?? []);
        }
      } catch {
        if (!cancelled) {
          setError(
            'We could not open the archive right now.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  if (selected) {
    return (
      <div className="kids-documents">
        <button
          type="button"
          className="kids-back-button"
          onClick={() => setSelected(null)}
        >
          ← Back to documents
        </button>

        <div className="kids-document-detail">
          <span className="kids-eyebrow">
            FROM THE ARCHIVE
          </span>

          <div className="kids-document-icon">
            <FileText size={34} strokeWidth={1.5} />
          </div>

          <h2>
            {selected.title ||
              'A document from the archive'}
          </h2>

          <p className="kids-document-meta">
            {selected.source}
            {selected.page !== null
              ? ` · Page ${selected.page}`
              : ''}
          </p>

          <div className="kids-document-text">
            <p>{selected.text}</p>
          </div>

          <div className="kids-document-source">
            <Sparkles size={18} />

            <span>
              This is an authentic passage from the
              digital archive.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kids-documents">
      <div className="kids-stage-content">
        <span className="kids-eyebrow">
          EXPLORE DOCUMENTS
        </span>

        <h2>Look closer</h2>

        <p>
          Here are real passages from the archive.
          Choose one and discover what it tells us.
        </p>
      </div>

      {loading && (
        <div className="kids-loading">
          <LoaderCircle
            size={28}
            className="kids-loading-spinner"
          />

          <span>
            Opening the archive...
          </span>
        </div>
      )}

      {error && (
        <div className="kids-error-card">
          <strong>
            The archive is taking a moment.
          </strong>

          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="kids-document-grid">
          {documents.map((document) => (
            <button
              key={document.passage_id}
              type="button"
              className="kids-document-card"
              onClick={() =>
                setSelected(document)
              }
            >
              <span className="kids-document-card-icon">
                <FileText
                  size={28}
                  strokeWidth={1.5}
                />
              </span>

              <span className="kids-document-card-body">
                <strong>
                  {document.title ||
                    'Archive passage'}
                </strong>

                <span>
                  {document.source}
                  {document.page !== null
                    ? ` · Page ${document.page}`
                    : ''}
                </span>

                <p>
                  {document.text.slice(0, 150)}
                  {document.text.length > 150
                    ? '…'
                    : ''}
                </p>
              </span>

              <ArrowRight
                size={20}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}