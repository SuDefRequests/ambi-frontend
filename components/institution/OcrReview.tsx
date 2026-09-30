'use client';

import { useState } from 'react';
import { FileText, Info, RotateCcw } from 'lucide-react';
import type { OcrLanguage, OcrPreviewResponse } from '@/lib/ocr-types';
import { OCR_LANGUAGES } from '@/lib/ocr-types';

type Props = {
  file: File;
  result: OcrPreviewResponse;
  language: OcrLanguage;
  reviewedText: string;
  onChangeReviewedText: (text: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

type PageTextMap = Record<number, string>;

function serializePages(pageTexts: PageTextMap, pages: OcrPreviewResponse['pages']) {
  return pages
    .map(
      (page) =>
        `--- Page ${page.page} ---\n${pageTexts[page.page] ?? ''}`,
    )
    .join('\n\n');
}

function parseReviewedText(
  reviewedText: string,
  pages: OcrPreviewResponse['pages'],
): PageTextMap {
  const pageTexts: PageTextMap = {};

  for (const page of pages) {
    pageTexts[page.page] = page.text;
  }

  const pagePattern =
    /(?:^|\n)--- Page (\d+) ---\n?([\s\S]*?)(?=\n--- Page \d+ ---|$)/g;

  let foundPage = false;

  for (const match of reviewedText.matchAll(pagePattern)) {
    const pageNumber = Number(match[1]);

    if (Number.isInteger(pageNumber)) {
      pageTexts[pageNumber] = match[2]?.trim() ?? '';
      foundPage = true;
    }
  }

  if (!foundPage && pages.length === 1) {
    pageTexts[pages[0].page] = reviewedText;
  }

  return pageTexts;
}

export function OcrReview({
  file,
  result,
  language,
  reviewedText,
  onChangeReviewedText,
  onBack,
  onContinue,
}: Props) {
  const languageLabel =
    OCR_LANGUAGES.find((l) => l.id === language)?.label ?? language;

  const pageCount = result.pages.length;

  const [selectedPage, setSelectedPage] = useState(
    result.pages[0]?.page ?? 1,
  );

  const [pageTexts, setPageTexts] = useState<PageTextMap>(() =>
    parseReviewedText(reviewedText, result.pages),
  );

  function updatePageText(pageNumber: number, text: string) {
    setPageTexts((current) => {
      const next = {
        ...current,
        [pageNumber]: text,
      };

      onChangeReviewedText(serializePages(next, result.pages));

      return next;
    });
  }

  function restoreOcrOutput() {
    const restored: PageTextMap = {};

    for (const page of result.pages) {
      restored[page.page] = page.text;
    }

    setPageTexts(restored);
    onChangeReviewedText(serializePages(restored, result.pages));
  }

  function clearCurrentPage() {
    updatePageText(selectedPage, '');
  }

  const currentPageText = pageTexts[selectedPage] ?? '';

  return (
    <div>
      <div className="ocr-banner info ocr-review-notice">
        <Info size={20} />

        <span>
          OCR has completed successfully. Review and correct the extracted text
          before adding this document to the institutional archive.
        </span>
      </div>

      <div className="ocr-review-layout">
        <div className="ocr-review-col">
          <h3>Pages</h3>

          {result.pages.map((page) => (
            <button
              key={page.page}
              type="button"
              className="ocr-page-card"
              aria-current={
                page.page === selectedPage ? 'true' : undefined
              }
              onClick={() => setSelectedPage(page.page)}
            >
              <FileText size={18} />

              <strong>Page {page.page}</strong>

              <small>
                {pageTexts[page.page]?.trim()
                  ? `${pageTexts[page.page].trim().length.toLocaleString()} characters`
                  : 'No text detected'}
              </small>
            </button>
          ))}
        </div>

        <div className="ocr-review-col">
          <h3>OCR Text Editor</h3>

          <div className="ocr-text-empty">
            <strong>
              Page {selectedPage} · {pageCount}{' '}
              {pageCount === 1 ? 'page' : 'pages'} extracted
            </strong>

            <p style={{ margin: 0 }}>
              Review and correct the OCR output for this page. Your edits
              will be preserved when you switch between pages.
            </p>
          </div>

          <textarea
            className="ocr-text-editor"
            placeholder={`OCR text for Page ${selectedPage} will appear here…`}
            value={currentPageText}
            onChange={(e) =>
              updatePageText(selectedPage, e.target.value)
            }
          />

          <div className="ocr-editor-actions">
            <button
              type="button"
              onClick={restoreOcrOutput}
            >
              Restore OCR output
            </button>

            <button
              type="button"
              onClick={clearCurrentPage}
            >
              <RotateCcw
                size={14}
                style={{
                  marginRight: 6,
                  display: 'inline',
                }}
              />

              Clear
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
              <dd>{languageLabel}</dd>
            </div>

            <div>
              <dt>Pages detected</dt>
              <dd>{pageCount}</dd>
            </div>

            <div>
              <dt>Current page</dt>
              <dd>{selectedPage}</dd>
            </div>

            <div>
              <dt>Processing status</dt>
              <dd>{result.status}</dd>
            </div>

            <div>
              <dt>OCR confidence</dt>

              <dd>
                {result.pages.find(
                  (page) => page.page === selectedPage,
                )?.confidence != null
                  ? 'Available for this page'
                  : 'Not provided'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="ocr-actions">
        <button
          className="ocr-secondary-btn"
          onClick={onBack}
          type="button"
        >
          Process Another Document
        </button>

        <button
          className="ocr-primary-btn"
          onClick={onContinue}
          type="button"
          disabled={!reviewedText.trim()}
        >
          Continue to Metadata
        </button>
      </div>
    </div>
  );
}