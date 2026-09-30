'use client';
import { Info } from 'lucide-react';
import type { OcrMetadataDraft } from '@/lib/ocr-types';
import { OCR_LANGUAGES } from '@/lib/ocr-types';

const DOCUMENT_TYPES = ['Speech', 'Letter', 'Manuscript', 'Debate transcript', 'Photograph', 'Other'];

type Props = {
  metadata: OcrMetadataDraft;
  onChange: (metadata: OcrMetadataDraft) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function OcrMetadata({ metadata, onChange, onBack, onContinue }: Props) {
  function set<K extends keyof OcrMetadataDraft>(key: K, value: OcrMetadataDraft[K]) {
    onChange({ ...metadata, [key]: value });
  }

  return (
    <div className="ocr-panel">
      <div className="ocr-banner info">
        <Info size={20} />
        <span>
          These details build this document&apos;s catalogue record for your team. The archive service doesn&apos;t
          yet have a field to store them, so they stay in this browser tab until that capability is added — they
          won&apos;t be lost mid-session, but they also won&apos;t persist after you leave this page.
        </span>
      </div>

      <div className="ocr-form-grid">
        <div className="ocr-form-field">
          <label htmlFor="ocr-meta-title">Title</label>
          <input id="ocr-meta-title" value={metadata.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Address to the Constituent Assembly" />
        </div>
        <div className="ocr-form-field">
          <label htmlFor="ocr-meta-creator">Creator / Author</label>
          <input id="ocr-meta-creator" value={metadata.creator} onChange={(e) => set('creator', e.target.value)} />
        </div>
        <div className="ocr-form-field">
          <label htmlFor="ocr-meta-date">Date</label>
          <input id="ocr-meta-date" type="date" value={metadata.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div className="ocr-form-field">
          <label htmlFor="ocr-meta-language">Language</label>
          <select id="ocr-meta-language" value={metadata.language} onChange={(e) => set('language', e.target.value as OcrMetadataDraft['language'])}>
            {OCR_LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
        <div className="ocr-form-field">
          <label htmlFor="ocr-meta-type">Document type</label>
          <select id="ocr-meta-type" value={metadata.documentType} onChange={(e) => set('documentType', e.target.value)}>
            <option value="">Select a type…</option>
            {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="ocr-form-field">
          <label htmlFor="ocr-meta-collection">Collection</label>
          <input id="ocr-meta-collection" value={metadata.collection} onChange={(e) => set('collection', e.target.value)} placeholder="e.g. Constituent Assembly Debates" />
        </div>
        <div className="ocr-form-field span-2">
          <label htmlFor="ocr-meta-description">Description</label>
          <textarea id="ocr-meta-description" value={metadata.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="ocr-form-field span-2">
          <label htmlFor="ocr-meta-source">Source / provenance</label>
          <textarea id="ocr-meta-source" value={metadata.source} onChange={(e) => set('source', e.target.value)} placeholder="Where this scan came from" />
        </div>
        <div className="ocr-form-field span-2">
          <label htmlFor="ocr-meta-notes">Notes</label>
          <textarea id="ocr-meta-notes" value={metadata.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
      </div>

      <div className="ocr-actions">
        <button className="ocr-secondary-btn" onClick={onBack} type="button">Back to Review</button>
        <button className="ocr-primary-btn" onClick={onContinue} type="button">Continue to Final Preview</button>
      </div>
    </div>
  );
}
