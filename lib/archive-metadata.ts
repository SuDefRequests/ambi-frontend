/** A collection/volume label is provenance, not a substitute for a document title. */
export function passageTitle(p: {
  archive_type: string;
  title?: string | null;
  volume?: number | null;
}) {
  const title = p.title?.trim();

  if (title) {
    // CAD exports use the session date as their title; retain that context.
    return p.archive_type.toLowerCase() === 'cad'
      ? `Assembly session · ${title}`
      : title;
  }

  if (p.archive_type.toLowerCase() === 'baws' && p.volume) {
    return `Collected Works of Babasaheb Ambedkar · Volume ${p.volume}`;
  }

  return 'Source document unavailable';
}