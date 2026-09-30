'use client';
import { useState } from 'react';
import { OcrSteps } from './OcrSteps';
import { OcrUpload } from './OcrUpload';
import { OcrProcessing } from './OcrProcessing';
import { OcrReview } from './OcrReview';
import { OcrMetadata } from './OcrMetadata';
import { OcrFinalPreview } from './OcrFinalPreview';
import { OcrSuccess } from './OcrSuccess';
import { submitDocumentForOcr, OcrApiError } from '@/lib/ocr-api';
import {
  EMPTY_METADATA_DRAFT,
  type OcrLanguage,
  type OcrMetadataDraft,
  type OcrUploadResponse,
  type OcrWorkflowStep,
} from '@/lib/ocr-types';

// A generous ceiling so a slow document doesn't hang the tab forever
// (requirement: "Never leave the user stuck on an infinite loading
// screen"). The backend gives no progress signal, so this is purely a
// safety net, not a real progress estimate.
const PROCESSING_TIMEOUT_MS = 120_000;

export function OcrDesk() {
  const [workflowStep, setWorkflowStep] = useState<OcrWorkflowStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<OcrLanguage>('en');
  const [uploadResult, setUploadResult] = useState<OcrUploadResponse | null>(null);
  const [reviewedText, setReviewedText] = useState('');
  const [metadata, setMetadata] = useState<OcrMetadataDraft>(EMPTY_METADATA_DRAFT);
  const [error, setError] = useState<string | null>(null);

  function resetAll() {
    setWorkflowStep('upload');
    setSelectedFile(null);
    setUploadResult(null);
    setReviewedText('');
    setMetadata(EMPTY_METADATA_DRAFT);
    setError(null);
  }

  async function handleSubmit() {
    if (!selectedFile) return;
    setError(null);
    setWorkflowStep('processing');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROCESSING_TIMEOUT_MS);

    try {
      const result = await submitDocumentForOcr(selectedFile, controller.signal);
      setUploadResult(result);
      setMetadata((m) => ({ ...m, language: selectedLanguage }));
      setWorkflowStep('review');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('This document is taking longer than expected to process. It may still be finishing on the server — try again in a moment, or use a smaller file.');
      } else if (err instanceof OcrApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong while processing this document. Please try again.');
      }
      setWorkflowStep('upload');
    } finally {
      clearTimeout(timeout);
    }
  }

  return (
    <div className="ocr-desk">
      <div className="ocr-desk-intro">
        <p className="eyebrow" style={{ color: '#80613d' }}>INSTITUTION MODE</p>
        <h1>Archive Digitization</h1>
        <p>Digitize scanned manuscripts and documents for the institutional archive.</p>
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

      {workflowStep === 'processing' && <OcrProcessing filename={selectedFile?.name ?? null} />}

      {workflowStep === 'review' && selectedFile && uploadResult && (
        <OcrReview
          file={selectedFile}
          result={uploadResult}
          language={selectedLanguage}
          reviewedText={reviewedText}
          onChangeReviewedText={setReviewedText}
          onBack={resetAll}
          onContinue={() => setWorkflowStep('metadata')}
        />
      )}

      {workflowStep === 'metadata' && (
        <OcrMetadata
          metadata={metadata}
          onChange={setMetadata}
          onBack={() => setWorkflowStep('review')}
          onContinue={() => setWorkflowStep('final-preview')}
        />
      )}

      {workflowStep === 'final-preview' && selectedFile && uploadResult && (
        <OcrFinalPreview
          file={selectedFile}
          result={uploadResult}
          metadata={metadata}
          reviewedText={reviewedText}
          onBack={() => setWorkflowStep('metadata')}
          onConfirm={() => setWorkflowStep('success')}
        />
      )}

      {workflowStep === 'success' && selectedFile && uploadResult && (
        <OcrSuccess file={selectedFile} result={uploadResult} metadata={metadata} onProcessAnother={resetAll} />
      )}
    </div>
  );
}
