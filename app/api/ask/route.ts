import { NextResponse } from 'next/server';

const ARCHIVE_API_URL =
  process.env.ARCHIVE_API_URL || 'http://127.0.0.1:8001';

type AskRequest = {
  question?: string;
  language?: 'en' | 'hi' | 'mr';
  archive?: 'all' | 'baws' | 'cad';
  top_k?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AskRequest;

    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json(
        { detail: 'Question is required.' },
        { status: 400 },
      );
    }

    const response = await fetch(`${ARCHIVE_API_URL}/api/v1/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        language: body.language ?? 'en',
        archive: body.archive ?? 'all',
        top_k: body.top_k ?? 6,
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Archive ask proxy error:', error);

    return NextResponse.json(
      {
        detail: {
          code: 'archive_unavailable',
          message: 'The archive service is currently unavailable.',
        },
      },
      { status: 503 },
    );
  }
}