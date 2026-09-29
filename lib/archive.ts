import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type Collection = 'all' | 'writings' | 'debates' | 'manuscripts';
export type Passage = { chunk_id: string; archive_type: string; volume: number; text: string; page: number; title: string; url: string; source: string };
export const collections: { id: Collection; label: string; description: string }[] = [
  { id: 'all', label: 'All collections', description: 'Explore the available archive' },
  { id: 'writings', label: 'Writings & Speeches', description: 'Published words and ideas' },
  { id: 'debates', label: 'Constituent Assembly Debates', description: 'Conversations that shaped India' },
  { id: 'manuscripts', label: 'Manuscripts & Rare Documents', description: 'Original records · awaiting digitisation' },
];
let archive: Promise<Passage[]> | undefined;
export function getArchive() {
  if (!archive) archive = Promise.all(['baws_data_for_graph.json', 'cad_data_for_graph.json'].map(async file => {
    // External archive assets are supplied at runtime; do not trace the parent repository.
    const raw = await readFile(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ process.env.ARCHIVE_DATA_DIR || path.resolve(process.cwd(), '..'), file), 'utf8');
    return JSON.parse(raw) as Passage[];
  })).then(parts => parts.flat()).catch(error => { archive = undefined; throw error; });
  return archive;
}
export { passageTitle } from './archive-metadata';
export function reference(p: Passage) {
  return `${p.source} · ${p.archive_type === 'CAD' ? p.title : `PDF page ${p.page}`} · ${p.chunk_id}`;
}
const aliases: Record<string, string> = { 'संविधान': 'constitution', 'प्रतिनिधित्व': 'representation', 'शिक्षा': 'education', 'शिक्षण': 'education', 'जाति': 'caste', 'जात': 'caste', 'सामाजिक न्याय': 'social justice', 'महिला अधिकार': 'women', 'महिलांचे हक्क': 'women', 'लोकतंत्र': 'democracy', 'लोकशाही': 'democracy', 'women’s rights': 'women' };
export type SearchState = { q: string; collection: Collection; page: number };
export function searchState(params: Record<string, string | string[] | undefined>, collection?: Collection): SearchState {
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 300) : '';
  const candidate = typeof params.collection === 'string' ? params.collection : 'all';
  return { q, collection: collection || (collections.some(c => c.id === candidate) ? candidate as Collection : 'all'), page: Math.max(1, Math.min(100000, Math.floor(Number(params.page) || 1))) };
}
export function searchHref(state: SearchState) {
  return `/search?${new URLSearchParams({ q: state.q, collection: state.collection, page: String(state.page) })}`;
}
export async function searchArchive(state: SearchState) {
  const records = await getArchive();
  const query = aliases[state.q.toLowerCase()] || state.q.toLowerCase();
  const terms = query.match(/[\p{L}\p{N}]+/gu) || [];
  const matches = records.filter(p => {
    if (state.collection === 'manuscripts') return false;
    if (state.collection === 'writings' && p.archive_type !== 'BAWS') return false;
    if (state.collection === 'debates' && p.archive_type !== 'CAD') return false;
    const searchable = `${p.text} ${p.title} ${p.source}`.toLowerCase();
    return terms.every(term => searchable.includes(term));
  });
  const pages = Math.max(1, Math.ceil(matches.length / 6));
  const page = Math.min(state.page, pages);
  return { records: matches.slice((page - 1) * 6, page * 6), total: matches.length, pages, page };
}
