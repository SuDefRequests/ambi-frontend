'use client';

import { useState } from 'react';
import { OcrSteps } from './OcrSteps';
import { OcrUpload } from './OcrUpload';
import { OcrProcessing } from './OcrProcessing';
import { OcrReview } from './OcrReview';
import { OcrMetadata } from './OcrMetadata';
import { OcrFinalPreview } from './OcrFinalPreview';
import { OcrSuccess } from './OcrSuccess';
import {
  ingestOcrDocument,
  previewDocumentForOcr,
} from '@/lib/ocr-api';
import {
  type OcrIngestRequest,
  type OcrLanguage,
  type OcrMetadataDraft,
  type OcrPreviewResponse,
  type OcrWorkflowStep,
} from '@/lib/ocr-types';

const EMPTY_METADATA_DRAFT: OcrMetadataDraft = {
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

const PROCESSING_TIMEOUT_MS = 300_000;

export function OcrDesk() {
  const [workflowStep, setWorkflowStep] =
    useState<OcrWorkflowStep>('upload');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] =
    useState<OcrLanguage>('en');

  const [uploadResult, setUploadResult] =
    useState<OcrPreviewResponse | null>(null);

  const [reviewedText, setReviewedText] = useState('');
  const [metadata, setMetadata] =
    useState<OcrMetadataDraft>(EMPTY_METADATA_DRAFT);

  const [error, setError] = useState<string | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);

  function resetAll() {
    setWorkflowStep('upload');
    setSelectedFile(null);
    setSelectedLanguage('en');
    setUploadResult(null);
    setReviewedText('');
    setMetadata(EMPTY_METADATA_DRAFT);
    setError(null);
    setIsIngesting(false);
  }

  async function handleSubmit() {
    if (!selectedFile) return;

    setError(null);
    setWorkflowStep('processing');

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      PROCESSING_TIMEOUT_MS,
    );

    try {
      const result = await previewDocumentForOcr(
        selectedFile,
        selectedLanguage,
        controller.signal,
      );

      setUploadResult(result);

      const initialText = result.pages
        .map(
          (page) =>
            `--- Page ${page.page} ---\n${page.text}`,
        )
        .join('\n\n');

      setReviewedText(initialText);

      setMetadata((current) => ({
        ...current,
        language: selectedLanguage,
      }));

      setWorkflowStep('review');
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === 'AbortError'
      ) {
        setError(
          'This document is taking longer than expected to process. Try again with a smaller file.',
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          'Something went wrong while processing this document. Please try again.',
        );
      }

      setWorkflowStep('upload');
    } finally {
      clearTimeout(timeout);
    }
  }

  function buildReviewedPages(): {
    page: number;
    text: string;
  }[] {
    if (!uploadResult) return [];

    const pages: { page: number; text: string }[] = [];

    const pagePattern =
      /(?:^|\n)--- Page (\d+) ---\n?([\s\S]*?)(?=\n--- Page \d+ ---|$)/g;

    for (const match of reviewedText.matchAll(pagePattern)) {
      const pageNumber = Number(match[1]);
      const text = match[2]?.trim() ?? '';

      if (
        Number.isInteger(pageNumber) &&
        pageNumber >= 1 &&
        text
      ) {
        pages.push({
          page: pageNumber,
          text,
        });
      }
    }

    if (pages.length > 0) {
      return pages;
    }

    return [
      {
        page: 1,
        text: reviewedText.trim(),
      },
    ];
  }

  function buildIngestRequest(): OcrIngestRequest | null {
    if (!uploadResult) return null;

    const pages = buildReviewedPages();

    if (!pages.length || !pages.some((page) => page.text.trim())) {
      return null;
    }

    const metadataNotes = [
      metadata.documentType
        ? `Document type: ${metadata.documentType}`
        : '',
      metadata.description
        ? `Description: ${metadata.description}`
        : '',
      metadata.notes
        ? `Reviewer notes: ${metadata.notes}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    return {
      document_id: uploadResult.document_id,

      metadata: {
        title: metadata.title || null,
        source: metadata.source || null,
        collection: metadata.collection || null,
        language: metadata.language || null,
        date: metadata.date || null,
        volume: null,
        author: metadata.creator || null,
        notes: metadataNotes || null,
      },

      pages,
    };
  }

  async function handleIngest() {
    if (!uploadResult) return;

    setError(null);
    setIsIngesting(true);

    try {
      const request = buildIngestRequest();

      if (!request) {
        setError(
          'There is no reviewed OCR text to add to the archive.',
        );
        return;
      }

      await ingestOcrDocument(request);

      setWorkflowStep('success');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          'The document could not be added to the archive. Please try again.',
        );
      }
    } finally {
      setIsIngesting(false);
    }
  }

  return (
    <div className="ocr-desk">
      <div className="ocr-desk-intro">
        <p
          className="eyebrow"
          style={{ color: '#80613d' }}
        >
          INSTITUTION MODE
        </p>

        <h1>Archive Digitization</h1>

        <p>
          Digitize scanned manuscripts and documents for the
          institutional archive.
        </p>
      </div>

      <OcrSteps current={workflowStep} />

      {workflowStep === 'upload' && (
        <OcrUpload
          selectedFile={selectedFile}
          selectedLanguage={selectedLanguage}
          errorMessage={error}
          onSelectFile={setSelectedFile}
          onSelectLanguage={setSelectedLanguage}
          onSubmit={handleSubmit}
        />
      )}

      {workflowStep === 'processing' && (
        <OcrProcessing
          filename={selectedFile?.name ?? null}
        />
      )}

      {workflowStep === 'review' &&
        selectedFile &&
        uploadResult && (
          <OcrReview
            file={selectedFile}
            result={uploadResult}
            language={selectedLanguage}
            reviewedText={reviewedText}
            onChangeReviewedText={setReviewedText}
            onBack={resetAll}
            onContinue={() => {
              setError(null);
              setWorkflowStep('metadata');
            }}
          />
        )}

      {workflowStep === 'metadata' && (
        <OcrMetadata
          metadata={metadata}
          onChange={setMetadata}
          onBack={() => {
            setError(null);
            setWorkflowStep('review');
          }}
          onContinue={() => {
            setError(null);
            setWorkflowStep('final-preview');
          }}
        />
      )}

      {workflowStep === 'final-preview' &&
        selectedFile &&
        uploadResult && (
          <OcrFinalPreview
            file={selectedFile}
            result={uploadResult}
            metadata={metadata}
            reviewedText={reviewedText}
            errorMessage={error}
            isSubmitting={isIngesting}
            onBack={() => {
              setError(null);
              setWorkflowStep('metadata');
            }}
            onConfirm={handleIngest}
          />
        )}

      {workflowStep === 'success' &&
        selectedFile &&
        uploadResult && (
          <OcrSuccess
            file={selectedFile}
            result={uploadResult}
            metadata={metadata}
            onProcessAnother={resetAll}
          />
        )}
    </div>
  );
}