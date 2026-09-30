export type OcrLanguage = 'en' | 'hi' | 'mr';

export type OcrPage = {
  page: number;
  text: string;
  confidence?: number | null;
};

export const OCR_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'mr', label: 'Marathi' },
] as const;


export type OcrPreviewResponse = {
  document_id: string;
  filename: string;
  sha256: string;
  language: string;
  processing_timestamp: string;
  status: string;
  pages: OcrPage[];
};

export type OcrMetadataDraft = {
  title: string;
  description: string;
  creator: string;
  date: string;
  language: OcrLanguage;
  documentType: string;
  collection: string;
  source: string;
  notes: string;
};

export type OcrIngestRequest = {
  document_id: string;
  metadata: {
    title: string | null;
    source: string | null;
    collection: string | null;
    language: string | null;
    date: string | null;
    volume: number | null;
    author: string | null;
    notes: string | null;
  };
  pages: {
    page: number;
    text: string;
  }[];
};

export type OcrIngestResponse = {
  document_id: string;
  status: string;
  passage_count: number;
  duplicate: boolean;
};

export type OcrWorkflowStep =
  | 'upload'
  | 'processing'
  | 'review'
  | 'metadata'
  | 'final-preview'
  | 'success';