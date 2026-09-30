// The backend's POST /upload only extracts text from .pdf files today
// (PyPDF2). Image formats (PNG/JPG/TIFF) hit its `else: raise
// HTTPException(400, "Unsupported file format.")` branch — there is no
// image OCR engine wired up yet. We still show them in the picker per
// the product spec (institutions expect to eventually scan photographs
// of manuscripts), but marked unsupported so an operator doesn't waste
// a submit on a guaranteed 400. See OCR-DESK-NOTES.md.
export type OcrFileType = {
  ext: string;
  label: string;
  accept: string;
  supported: boolean;
};

export const OCR_FILE_TYPES: OcrFileType[] = [
  { ext: 'pdf', label: 'PDF', accept: '.pdf,application/pdf', supported: true },
  { ext: 'png', label: 'PNG', accept: '.png,image/png', supported: false },
  { ext: 'jpg', label: 'JPG / JPEG', accept: '.jpg,.jpeg,image/jpeg', supported: false },
  { ext: 'tiff', label: 'TIFF', accept: '.tif,.tiff,image/tiff', supported: false },
];

export const OCR_ACCEPT_ATTR = OCR_FILE_TYPES.map((t) => t.accept).join(',');

// The backend declares no upper bound on POST /upload. This is a
// frontend-only safety guard so a multi-hundred-MB scan doesn't hang
// the kiosk tab; raise it if the institution's real scans run larger.
export const OCR_MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
