import { Check } from 'lucide-react';
import type { OcrWorkflowStep } from '@/lib/ocr-types';

const STEPS: { id: OcrWorkflowStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'processing', label: 'Processing' },
  { id: 'review', label: 'Review' },
  { id: 'metadata', label: 'Metadata' },
  { id: 'final-preview', label: 'Final Preview' },
  { id: 'success', label: 'Complete' },
];

export function OcrSteps({ current }: { current: OcrWorkflowStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <nav className="ocr-steps" aria-label="Digitization progress">
      {STEPS.map((step, i) => (
        <span key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
          <span className={`ocr-step ${i === currentIndex ? 'is-active' : ''} ${i < currentIndex ? 'is-done' : ''}`}>
            <strong aria-hidden="true">{i < currentIndex ? <Check size={15} /> : i + 1}</strong>
            {step.label}
          </span>
          {i < STEPS.length - 1 && <span className="ocr-step-divider" aria-hidden="true" />}
        </span>
      ))}
    </nav>
  );
}
