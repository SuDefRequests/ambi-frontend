import type { HomeCopy, Navigate } from '@/lib/content';
import { destinationHref } from '@/lib/navigation';
export function TopicChips({copy,onNavigate}:{copy:HomeCopy;onNavigate:Navigate}){return <nav className="topic-chips" aria-label="Popular topics">{copy.topics.map(topic=>{const destination={kind:'search' as const,query:topic};return <a key={topic} href={destinationHref(destination)} onClick={e=>{e.preventDefault();onNavigate(destination);}}>{topic}</a>})}</nav>}
