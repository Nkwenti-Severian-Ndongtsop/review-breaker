import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch('http://localhost:3001/api/internal/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.text();
  try {
    return NextResponse.json(JSON.parse(data), { status: res.status });
  } catch {
    return new NextResponse(data, { status: res.status });
  }
}
