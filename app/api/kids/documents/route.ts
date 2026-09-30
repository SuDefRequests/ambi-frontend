import { NextResponse } from 'next/server';
import { getCatalogue } from '@/lib/archive-api';

export async function GET() {
  try {
    const result = await getCatalogue({
      collection: 'writings',
      q: '',
      page: 1,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Unable to load archive documents.' },
      { status: 503 },
    );
  }
}