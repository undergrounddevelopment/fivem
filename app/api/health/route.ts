import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 0
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
