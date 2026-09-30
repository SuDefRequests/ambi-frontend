import { NextRequest, NextResponse } from 'next/server';

const OCR_API_URL = process.env.OCR_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const response = await fetch(`${OCR_API_URL}/api/v1/ocr/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
      },
    });
  } catch {
    return NextResponse.json(
      {
        detail: 'The OCR service could not be reached.',
      },
      { status: 503 },
    );
  }
}