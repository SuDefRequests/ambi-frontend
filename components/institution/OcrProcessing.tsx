'use client';
import { useEffect, useState } from 'react';

// The backend's POST /upload is a single synchronous call — it doesn't
// stream progress or page counts back. This cycles through plausible
// stage labels purely as an indeterminate "still working" indicator,
// per the product spec: "Do NOT fake numerical progress if the backend
// does not provide progress information." No percentage is ever shown.
const STAGES = [
  'Preparing document…',
  'Reading pages…',
  'Recognizing text…',
  'Building archive draft…',
];

export function OcrProcessing({ filename }: { filename: string | null }) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((i) => (i + 1) % STAGES.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ocr-panel">
      <div className="ocr-processing" role="status" aria-live="polite">
        <div className="ocr-spinner" aria-hidden="true" />
        <h2>Reading your document…</h2>
        <p className="ocr-processing-stage">{STAGES[stageIndex]}</p>
        {filename && <p className="ocr-processing-file">{filename}</p>}
      </div>
    </div>
  );
}
