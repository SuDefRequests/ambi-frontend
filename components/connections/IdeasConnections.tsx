'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, BookMarked, Check,
  Landmark, Scale, Search, Users, UsersRound, type LucideIcon,
} from 'lucide-react';

import { ideas, type Idea } from './ideas';
import Link from 'next/link';
import { useIdeaEvidence } from './useIdeaEvidence';

type Props = { onBack?: () => void };

const motifs: Record<string, LucideIcon> = {
  equality: Users,
  education: BookOpen,
  rights: Scale,
  democracy: Landmark,
  law: BookMarked,
  representation: UsersRound,
};

function ConceptMotif({ id }: { id: string }) {
  const Icon = motifs[id] ?? BookOpen;
  return (
    <span className={`connection-motif connection-motif-${id}`} aria-hidden="true">
      <Icon strokeWidth={1.15} />
    </span>
  );
}

// One elliptical orbit for any connection count. SVG lines and HTML nodes
// share the same coordinates, including when the exhibit changes aspect ratio.
function orbitPosition(index: number, count: number) {
  const angle = (-150 + index * (360 / count)) * Math.PI / 180;
  return { x: 50 + 34 * Math.cos(angle), y: 42 + 40 * Math.sin(angle) };
}

export function IdeasConnections({ onBack }: Props) {
  const [selectedId, setSelectedId] = useState('equality');
  const selected = useMemo(
    () => ideas.find((idea) => idea.id === selectedId) ?? ideas[0],
    [selectedId],
  );
  const connectedIdeas = selected.connections
    .map((id) => ideas.find((idea) => idea.id === id))
    .filter((idea): idea is Idea => Boolean(idea));
  const SelectedIcon = motifs[selected.id] ?? BookOpen;
  const retrieval = useIdeaEvidence(selected.id);
  const evidence = retrieval.status === 'ready' ? retrieval.evidence : undefined;
  const passage = evidence?.passages[0];

  return (
    <section className="connections-experience" aria-labelledby="connections-title">
      <div className="connections-atmosphere" aria-hidden="true" />
      {onBack && (
        <button type="button" className="connections-back" onClick={onBack}>
          <ArrowLeft size={18} strokeWidth={1.7} aria-hidden="true" />Back
        </button>
      )}

      <div className="connections-intro">
        <span className="connections-eyebrow">IDEAS &amp; CONNECTIONS</span>
        <h1 id="connections-title">Ideas that connect</h1>
        <p>Explore important ideas and discover how they relate to one another across Ambedkar&apos;s work.</p>
      </div>

      <div className="connections-ideas" role="group" aria-label="Select an idea">
        {ideas.map((idea) => {
          const Icon = motifs[idea.id] ?? BookOpen;
          return (
            <button key={idea.id} type="button"
              className={`connections-idea-pill ${idea.id === selectedId ? 'is-selected' : ''}`}
              aria-pressed={idea.id === selectedId}
              onClick={() => setSelectedId(idea.id)}>
              <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
              {idea.title}
              {idea.id === selectedId && <Check className="connections-selection-check" size={14} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="connections-exhibit">
        <div className="connections-map" role="group" aria-label={`Connections for ${selected.title}`}>
          <div className="connections-map-heading">
            <span>CURATED CONNECTIONS</span>
            <span>{String(connectedIdeas.length).padStart(2, '0')} connected ideas</span>
          </div>
          <div className="connections-network">
            <svg className="connections-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {connectedIdeas.map((idea, index) => {
                const { x, y } = orbitPosition(index, connectedIdeas.length);
                return <g key={idea.id}>
                  <line className="connection-line-halo" x1="50" y1="42" x2={x} y2={y} />
                  <line className="connection-line" x1="50" y1="42" x2={x} y2={y} />
                  <circle cx={(50 + x) / 2} cy={(42 + y) / 2} r=".55" />
                </g>;
              })}
            </svg>

            <div className="connection-core" aria-label={`Selected idea: ${selected.title}`}>
              <ConceptMotif id={selected.id} />
              <span className="connection-core-label">SELECTED IDEA</span>
              <strong>{selected.title}</strong>
              <span className="connection-core-ornament" aria-hidden="true">✦</span>
            </div>

            {connectedIdeas.map((idea, index) => {
              const { x, y } = orbitPosition(index, connectedIdeas.length);
              return (
                <button key={idea.id} type="button" className="connection-node"
                  style={{ '--node-x': `${x}%`, '--node-y': `${y}%` } as CSSProperties}
                  aria-label={`Explore ${idea.title}`}
                  onClick={() => setSelectedId(idea.id)}>
                  <ConceptMotif id={idea.id} />
                  <span>{idea.title}</span>
                  <ArrowRight className="connection-node-arrow" size={17} strokeWidth={1.5} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <p className="connections-map-caption"><span aria-hidden="true">✦</span> Touch an idea. Follow a connection.</p>
        </div>

        <article className="connections-detail" aria-labelledby="connections-detail-title" tabIndex={0}>
          <div className="connections-detail-copy" aria-live="polite" aria-atomic="true">
            <div className="connections-detail-index">
              <span>IDEA / {String(ideas.indexOf(selected) + 1).padStart(2, '0')}</span>
              <span>{String(ideas.length).padStart(2, '0')} IDEAS</span>
            </div>
            <SelectedIcon className="connections-detail-icon" size={34} strokeWidth={1.3} aria-hidden="true" />
            <h2 id="connections-detail-title">{selected.title}</h2>
            <p>{selected.description}</p>
          </div>
          <section className="connections-evidence" aria-labelledby="connections-evidence-title" aria-busy={retrieval.status === 'loading'}>
            <h3 id="connections-evidence-title">FROM THE ARCHIVE</h3>
            <div aria-live="polite">
              {retrieval.status === 'loading' && <p className="connections-evidence-status">Finding relevant passages…</p>}
              {retrieval.status === 'unavailable' && <p className="connections-evidence-status">Archive evidence is temporarily unavailable. You can still explore the curated ideas.</p>}
              {retrieval.status === 'ready' && !passage && <p className="connections-evidence-status">No passages found for this idea. These connections remain curated.</p>}
              {passage && <>
                <p className="connections-evidence-snippet">{passage.snippet}</p>
                <p className="connections-evidence-source">
                  <strong>{passage.archive_type.toUpperCase()}</strong>
                  {passage.volume > 0 && <span>Volume {passage.volume}</span>}
                  {passage.page !== null && <span>PDF page {passage.page}</span>}
                </p>
                <p className="connections-evidence-reference">{[passage.source, passage.title].filter(Boolean).join(' · ')}</p>
                <Link className="connections-evidence-link" href={`/documents/${encodeURIComponent(passage.passage_id)}`}>
                  Read passage <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <span className="connections-passage-id">{passage.passage_id}</span>
              </>}
            </div>
          </section>
          <div className="connections-detail-related">
            <h3>CONNECTED IDEAS <span>CURATED</span></h3>
            <div>
              {connectedIdeas.map((idea) => {
                const Icon = motifs[idea.id] ?? BookOpen;
                return (
                  <div key={idea.id} className="connections-related-entry">
                  <button type="button" aria-label={idea.title} aria-describedby={`connection-basis-${idea.id}`} onClick={() => setSelectedId(idea.id)}>
                    <Icon size={27} strokeWidth={1.4} aria-hidden="true" />
                    <span>{idea.title}<small id={`connection-basis-${idea.id}`}>{evidence?.sharedPassages[idea.id]?.length ? 'Mentioned together in retrieved text' : 'Curated concept relationship'}</small></span>
                    <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  {evidence?.sharedPassages[idea.id]?.[0] && <Link className="connections-shared-link" href={`/documents/${encodeURIComponent(evidence.sharedPassages[idea.id][0])}`} aria-label={`Read shared passage for ${selected.title} and ${idea.title}`}><BookOpen size={16} aria-hidden="true" /><span>Source</span></Link>}
                  </div>
                );
              })}
            </div>
          </div>
          <p className="connections-placard-note">Shared mentions are evidence of co-occurrence, not a proven relationship.</p>
        </article>
      </div>

      <div className="connections-search-note">
        <Search size={21} strokeWidth={1.5} aria-hidden="true" />
        <Link href={`/search?${new URLSearchParams({ q: selected.title, collection: 'all' })}`}>Explore {selected.title.toLowerCase()} in the archive <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
