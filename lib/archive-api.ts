import 'server-only';
import type { SearchState } from './archive';
import type { ArchivePassage } from './archive-types';

export type { ArchivePassage } from './archive-types';


type SearchHit = ArchivePassage & { snippet: string; relevance_score: number | null };
export type SearchResponse = { query: string; archive_searched: string; total_results: number; results: SearchHit[] };
export type BrowseResponse = { total: number; results: ArchivePassage[] };
export type Adjacency = { current: ArchivePassage; previous: ArchivePassage | null; next: ArchivePassage | null };
export class ArchiveApiError extends Error {
  constructor(public readonly status: number) { super(`Archive request failed (${status})`); }
}
async function request<T>(path: string, timeoutMs = 30000): Promise<T> {
  const base = process.env.ARCHIVE_API_URL || 'http://127.0.0.1:8001';
  const response = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    cache: 'no-store', signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new ArchiveApiError(response.status);
  return response.json() as Promise<T>;
}
export function getPassage(id: string) {
  return request<ArchivePassage>(`/api/v1/passages/${encodeURIComponent(id)}`);
}
export function getAdjacency(id: string) {
  return request<Adjacency>(`/api/v1/passages/${encodeURIComponent(id)}/adjacency`);
}
export async function getCatalogue(state: SearchState) {
  const size = 6;
  if (state.collection === 'manuscripts') return { records: [], total: 0, page: 1, pages: 1 };
  const archive = state.collection === 'writings' ? 'baws' : state.collection === 'debates' ? 'cad' : 'all';
  if (state.q) {
    // Search has no offset: paginate only the backend's bounded ranked result set.
    const params = new URLSearchParams({ q: state.q, archive, limit: '20' });
    const result = await request<SearchResponse>(`/api/v1/search?${params}`);
    const pages = Math.max(1, Math.ceil(result.results.length / size));
    const page = Math.min(state.page, pages);
    return { records: result.results.slice((page - 1) * size, page * size), total: result.total_results, page, pages };
  }
  const params = new URLSearchParams({ archive, offset: String((state.page - 1) * size), limit: String(size) });
  let result = await request<BrowseResponse>(`/api/v1/passages?${params}`);
  const pages = Math.max(1, Math.ceil(result.total / size));
  const page = Math.min(state.page, pages);
  if (page !== state.page) {
    params.set('offset', String((page - 1) * size));
    result = await request<BrowseResponse>(`/api/v1/passages?${params}`);
  }
  return { records: result.results, total: result.total, page, pages };
}
export function passageReference(p: ArchivePassage) {
  const location = p.archive_type === 'cad' ? p.title : p.page === null ? null : `PDF page ${p.page}`;
  return [p.source, location, p.passage_id].filter(Boolean).join(' · ');
}

// Bounded exhibit retrieval through the same backend as the archive catalogue.
export function searchIdeaPassages(query: string) {
  const params = new URLSearchParams({ q: query, archive: 'all', limit: '4' });
  return request<SearchResponse>(`/api/v1/search?${params}`, 8000);
}
