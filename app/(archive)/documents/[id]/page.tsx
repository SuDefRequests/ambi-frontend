import Link from 'next/link';
import { ReaderNarration } from '@/components/archive/ReaderNarration';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { passageTitle, searchHref, searchState } from '@/lib/archive';
import { ArchiveApiError, getPassage, getAdjacency, passageReference } from '@/lib/archive-api';
export const dynamic = 'force-dynamic';
export default async function DocumentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const state = searchState(await searchParams);
  const p = await getPassage(id).catch(error => {
    if (error instanceof ArchiveApiError && error.status === 404) notFound();
    throw error;
  });
  const { previous, next } = await getAdjacency(id);
  const context = new URLSearchParams({ q: state.q, collection: state.collection, page: String(state.page) }).toString();
  return <>
    <Link className="archive-back" href={searchHref(state)}><ArrowLeft size={22}/>Back to results</Link>
    <section className="reader-heading"><p className="eyebrow">FROM THE COLLECTION · {p.archive_type === 'baws' ? 'WRITINGS & SPEECHES' : 'CONSTITUENT ASSEMBLY DEBATES'}</p><h1>{passageTitle(p)}</h1><p>{p.source}{p.archive_type === 'baws' && p.page !== null ? ` · PDF page ${p.page}` : ''} <span> · </span> English <span> · </span> Source excerpt</p></section>
    <ReaderNarration passageId={p.passage_id} text={p.text} />
    <div className="reader-layout"><aside className="reader-details"><p className="eyebrow">ABOUT THIS PASSAGE</p><dl><dt>Collection</dt><dd>{p.source}</dd><dt>Location</dt><dd>{p.archive_type === 'baws' ? (p.page === null ? 'Page unavailable' : `PDF page ${p.page}`) : p.title}</dd><dt>Archive reference</dt><dd>{p.passage_id}</dd></dl><p>{p.archive_type === 'baws' ? 'PDF page offsets may differ from the printed page numbers.' : 'Assembly proceedings include multiple speakers. These words should not all be attributed to Dr. Ambedkar.'}</p><p>This is an extracted passage, not a scan or a complete document. OCR and scraping artifacts are retained for source transparency.</p></aside>
    <article className="reading-paper" aria-label="Source passage"><div className="paper-heading"><span>SAMVIDHAN / READING ROOM</span><span>{p.archive_type === 'baws' ? `VOL. ${p.volume}${p.page === null ? '' : ` · P. ${p.page}`}` : p.title}</span></div><p className="source-text">{p.text}</p><footer className="source-citation"><h2>Source reference</h2><p>{passageReference(p)}</p>{p.url && <p className="source-url">Source recorded in export: {p.url}</p>}</footer></article></div>
    <nav className="reader-pagination" aria-label="Adjacent source passages">{previous ? <Link href={`/documents/${encodeURIComponent(previous.passage_id)}?${context}`}><ArrowLeft size={21}/>Previous passage</Link> : <span/>}{next ? <Link href={`/documents/${encodeURIComponent(next.passage_id)}?${context}`}>Next passage<ArrowRight size={21}/></Link> : <span/>}</nav>
  </>;
}
