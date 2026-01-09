import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = process.env.SERPER_API_KEY; 
    const url = `https://google.serper.dev/search?q=${encodeURIComponent(query)}&gl=id&hl=id&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }

    return NextResponse.json({ results: data });
  } catch (error) {
    console.error('Error calling Serper API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}