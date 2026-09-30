'use client';
import { useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { OCR_FILE_TYPES, OCR_MAX_FILE_BYTES, extensionOf, formatFileSize } from '@/lib/ocr-config';
import { OCR_LANGUAGES, type OcrLanguage } from '@/lib/ocr-types';

type Props = {
  selectedFile: File | null;
  selectedLanguage: OcrLanguage;
  errorMessage: string | null;
  onSelectFile: (file: File | null) => void;
  onSelectLanguage: (language: OcrLanguage) => void;
  onSubmit: () => void;
};

export function OcrUpload({ selectedFile, selectedLanguage, errorMessage, onSelectFile, onSelectLanguage, onSubmit }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [localWarning, setLocalWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndSet(file: File) {
    setLocalWarning(null);
    const ext = extensionOf(file.name);
    const match = OCR_FILE_TYPES.find((t) => t.ext === ext || (ext === 'jpeg' && t.ext === 'jpg'));

    if (!match) {
      setLocalWarning(`".${ext || 'unknown'}" files aren't supported. Choose a PDF, PNG, JPG, or TIFF.`);
      return;
    }
    if (!match.supported) {
      setLocalWarning(
        `${match.label} digitization isn't available yet — the archive's OCR service currently reads text from PDF files only. Convert this to a PDF, or try again once image OCR is enabled.`,
      );
      return;
    }
    if (file.size > OCR_MAX_FILE_BYTES) {
      setLocalWarning(`This file is ${formatFileSize(file.size)}, which is larger than the ${formatFileSize(OCR_MAX_FILE_BYTES)} limit for this kiosk. Try a smaller scan.`);
      return;
    }
    onSelectFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  }

  return (
    <div className="ocr-panel">
      {errorMessage && (
        <div className="ocr-banner error" role="alert">
          <AlertTriangle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}
      {localWarning && (
        <div className="ocr-banner warn" role="alert">
          <AlertTriangle size={20} />
          <span>{localWarning}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          className={`ocr-dropzone ${isDragging ? 'is-dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="ocr-dropzone-icon"><UploadCloud size={32} strokeWidth={1.5} /></div>
          <h2>Drag a scanned document here</h2>
          <p>or select a file from this device</p>
          <button className="ocr-primary-btn" onClick={() => inputRef.current?.click()} type="button">
            Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={OCR_FILE_TYPES.map((t) => t.accept).join(',')}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSet(f); e.target.value = ''; }}
          />
          <div className="ocr-file-types">
            {OCR_FILE_TYPES.map((t) => (
              <span key={t.ext} className={`ocr-file-chip ${t.supported ? '' : 'is-unsupported'}`}>
                {t.label}
                {!t.supported && <small>coming soon</small>}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="ocr-file-picked">
          <div className="ocr-file-picked-icon"><FileText size={24} /></div>
          <div>
            <strong>{selectedFile.name}</strong>
            <span>{formatFileSize(selectedFile.size)} · {extensionOf(selectedFile.name).toUpperCase()}</span>
          </div>
          <button className="ocr-file-remove" aria-label="Remove file" onClick={() => onSelectFile(null)} type="button">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="ocr-language-row">
        <label id="ocr-language-label">Document language</label>
        <div className="ocr-language-options" role="group" aria-labelledby="ocr-language-label">
          {OCR_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              aria-pressed={selectedLanguage === lang.id}
              onClick={() => onSelectLanguage(lang.id)}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <p className="ocr-language-note">
          Used for cataloguing this record. The archive&apos;s current OCR engine reads text automatically and does not yet use this selection to change recognition.
        </p>
      </div>

      <div className="ocr-actions">
        <button className="ocr-primary-btn" onClick={onSubmit} disabled={!selectedFile} type="button">
          Process Document <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
