import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Health check minimal pour P0. Les sondes de dépendances
 * (Postgres, Redis, MinIO) seront ajoutées en P6/P7
 * — voir CLAUDE.md §15.2.
 */
export function GET(): NextResponse {
  return NextResponse.json(
    { status: 'ok', uptime: process.uptime() },
    { status: 200 },
  );
}
