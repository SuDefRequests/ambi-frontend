import { Catalogue } from '@/components/archive/Catalogue';
import { searchState } from '@/lib/archive';
export const dynamic = 'force-dynamic';
export default async function ManuscriptsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <Catalogue state={searchState(await searchParams, 'manuscripts')}/>; }
