import Link from 'next/link';
import Form from 'next/form';
import { ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { collections, passageTitle, searchHref, type SearchState } from '@/lib/archive';
import { getCatalogue } from '@/lib/archive-api';
export async function Catalogue({ state }: { state: SearchState }) {
  const result = await getCatalogue(state);
  const current = { ...state, page: result.page };
  const heading = state.q ? `Discover “${state.q}”` : state.collection === 'all' ? 'A life in words. An archive of ideas.' : collections.find(c => c.id === state.collection)!.label;
  return <>
    <section className="catalogue-intro"><p className="eyebrow">EXPLORE THE COLLECTIONS</p><h1>{heading}</h1><p>Follow a question. Open a passage. Encounter the original words.</p></section>
    <Form action="/search" role="search" className="archive-search catalogue-search"><Search size={25}/><label className="sr-only" htmlFor="discovery-query">Search the archive</label><input key={state.q} id="discovery-query" name="q" type="search" defaultValue={state.q} maxLength={300} placeholder="Search words, ideas, people…" autoComplete="off"/><input type="hidden" name="collection" value={state.collection}/><button className="search-action" aria-label="Search the archive"><ArrowRight size={25}/></button></Form>
    <div className="catalogue-layout">
      <aside className="collection-index"><p className="eyebrow">BROWSE BY COLLECTION</p><nav aria-label="Collections">{collections.map((c, i) => <Link key={c.id} href={searchHref({ q: state.q, collection: c.id, page: 1 })} aria-current={state.collection === c.id ? 'page' : undefined}><span className="collection-number">0{i + 1}</span><span><strong>{c.label}</strong><small>{c.description}</small></span></Link>)}</nav><p className="collection-note">Published texts and Assembly proceedings, presented as searchable passages. The original exports may contain OCR or transcription errors.</p></aside>
      <section className="catalogue-results" aria-label="Archive results"><div className="results-heading"><h2>{result.total.toLocaleString('en-IN')} {result.total === 1 ? 'passage' : 'passages'}</h2><span>{state.q ? 'TOP 20 · SEARCH ORDER' : 'IN SOURCE ORDER'}</span></div>
        {result.records.length ? <ol className="passage-list">{result.records.map(p => <li key={p.passage_id}><Link className="passage-link" href={`/documents/${encodeURIComponent(p.passage_id)}?${new URLSearchParams({ q: state.q, collection: state.collection, page: String(result.page) })}`}><div><p className="passage-meta">{p.archive_type === 'baws' ? 'WRITINGS & SPEECHES' : 'ASSEMBLY DEBATES'} <span> / </span> {p.source}{p.archive_type === 'baws' && p.page !== null ? ` · PDF PAGE ${p.page}` : ''}</p><h3>{passageTitle(p)}</h3><p className="passage-excerpt">{p.text.slice(0, 230)}{p.text.length > 230 ? '…' : ''}</p></div><span className="read-passage"><span>Read passage</span><ArrowRight size={23}/></span></Link></li>)}</ol> : <div className="archive-empty"><p className="eyebrow">{state.collection === 'manuscripts' ? 'A COLLECTION IN PREPARATION' : 'TRY ANOTHER PATH'}</p><h2>{state.collection === 'manuscripts' ? 'Original pages take time to preserve.' : 'No passages found.'}</h2><p>{state.collection === 'manuscripts' ? 'Manuscript scans are not yet available in this archive. Explore the published writings and Assembly debates while this collection is prepared.' : 'Try a shorter phrase or choose another collection. Search retrieves related passages from the available archive.'}</p><Link className="primary-button" href="/search">Browse all collections<ArrowRight size={20}/></Link></div>}
        {result.total > 0 && <nav className="results-pagination" aria-label="Results pages">{result.page > 1 ? <Link href={searchHref({ ...current, page: result.page - 1 })}><ChevronLeft size={21}/>Previous</Link> : <span/>}<span>Page {result.page} of {result.pages}</span>{result.page < result.pages ? <Link href={searchHref({ ...current, page: result.page + 1 })}>Next<ChevronRight size={21}/></Link> : <span/>}</nav>}
      </section>
    </div>
  </>;
}
