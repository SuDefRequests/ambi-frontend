import type { ArchivePassage } from './archive-types';
import type { Idea } from '@/components/connections/ideas';

export type IdeaEvidence = {
  passages: (ArchivePassage & { snippet: string })[];
  // These are literal co-mentions in retrieved text, not inferred relationships.
  sharedPassages: Record<string, string[]>;
};

const mentions: Record<string, RegExp> = {
  equality: /\b(?:equality|equal rights|equal opportunity)\b/i,
  education: /\b(?:education|educational|school|schools)\b/i,
  rights: /\brights\b/i,
  democracy: /\b(?:democracy|democratic)\b/i,
  law: /\b(?:law|laws|constitution|constitutional)\b/i,
  representation: /\b(?:representation|representatives|representative)\b/i,
};

export function buildIdeaEvidence(idea: Idea, response: unknown): IdeaEvidence {
  if (!response || typeof response !== 'object' || !('results' in response) || !Array.isArray(response.results)) {
    throw new Error('Invalid search response');
  }
  const passages: IdeaEvidence['passages'] = [];
  for (const hit of response.results.slice(0, 4)) {
    if (!hit || typeof hit !== 'object') continue;
    // Support the archive's canonical response and its older id/snippet exports.
    const id = hit.passage_id ?? hit.id;
    const text = hit.text ?? hit.snippet;
    if (typeof id !== 'string' || !id.trim() || typeof text !== 'string' || !text.trim() ||
      !['baws', 'cad'].includes(hit.archive_type) || typeof hit.source !== 'string' || !hit.source.trim()) continue;
    if (passages.some(p => p.passage_id === id)) continue;
    passages.push({
      passage_id: id, archive_type: hit.archive_type, source: hit.source,
      text, snippet: typeof hit.snippet === 'string' && hit.snippet.trim() ? hit.snippet : text,
      volume: Number.isInteger(hit.volume) && hit.volume > 0 ? hit.volume : 0,
      page: Number.isInteger(hit.page) && hit.page > 0 ? hit.page : null,
      title: typeof hit.title === 'string' ? hit.title : null,
      url: typeof hit.url === 'string' ? hit.url : null,
    });
  }
  if (response.results.length && !passages.length) throw new Error('Missing passage metadata');
  const sharedPassages: IdeaEvidence['sharedPassages'] = {};
  for (const id of idea.connections) {
    sharedPassages[id] = passages.filter(p => mentions[idea.id]?.test(p.text) && mentions[id]?.test(p.text)).map(p => p.passage_id);
  }
  return { passages, sharedPassages };
}
