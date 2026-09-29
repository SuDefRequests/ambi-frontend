import {
  BookOpen,
  Files,
  Play,
  Route,
  Network,
  MessagesSquare,
  ArrowUpRight,
} from 'lucide-react';
import type { HomeCopy, Navigate } from '@/lib/content';
import { exhibits } from '@/lib/content';
import { destinationHref } from '@/lib/navigation';
import { ConceptArtwork } from './ConceptArtwork';

const icons = {
  book: BookOpen,
  document: Files,
  play: Play,
  timeline: Route,
  network: Network,
  chat: MessagesSquare,
};

export function DiscoveryCard({
  exhibit,
  copy,
  onNavigate,
}: {
  exhibit: typeof exhibits[number];
  copy: HomeCopy;
  onNavigate: Navigate;
}) {
  const Icon = icons[exhibit.icon];
  const [title, description] = copy.cards[exhibit.id];

  const isAskArchive = exhibit.id === 'assistant';

  const destination = isAskArchive
    ? null
    : { kind: 'exhibit' as const, id: exhibit.id };

  const href = isAskArchive ? '/ask' : destinationHref(destination!);

  return (
    <a
      href={href}
      onClick={(event) => {
        if (isAskArchive) return;

        event.preventDefault();
        onNavigate(destination!);
      }}
      className={`discovery-card tone-${exhibit.tone} exhibit-${exhibit.id}`}
      aria-label={title}
    >
      <div className="exhibit-image" aria-hidden="true">
        {exhibit.id === 'connections' && <ConceptArtwork />}
      </div>

      <div className="exhibit-shade" />

      <span className="exhibit-number" aria-hidden="true">
        {exhibit.number} /
      </span>

      <div className="exhibit-content">
        <Icon
          className="exhibit-icon"
          size={30}
          strokeWidth={1.45}
        />

        <h3>{title}</h3>
        <p>{description}</p>

        <span className="exhibit-arrow" aria-hidden="true">
          <ArrowUpRight size={22} strokeWidth={1.7} />
        </span>
      </div>
    </a>
  );
}