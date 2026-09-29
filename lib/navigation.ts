import type { Destination } from './content';
export const exhibitRoutes = {writings:'/writings',manuscripts:'/manuscripts',media:'/media',timeline:'/timeline',connections:'/connections',assistant:'/ask'} as const;
/** Shared URLs for discovery; unimplemented exhibits retain their home previews. */
export function destinationHref(destination:Destination):string {
 if(destination.kind==='search') return `/search?${new URLSearchParams({q:destination.query.trim()})}`;
 if(destination.kind==='milestone') return `/timeline?${new URLSearchParams({year:destination.year})}`;
 return exhibitRoutes[destination.id];
}
