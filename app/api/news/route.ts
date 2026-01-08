import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  const limit = searchParams.get('limit') || '10';

  // Construct URL with optional ticker
  let url = `https://api.financialdatasets.ai/news?limit=${limit}`;
  if (ticker) {
    url += `&ticker=${ticker}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.FINANCIAL_DATASETS_API_KEY as string, // Store this in .env.local
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}