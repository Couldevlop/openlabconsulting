import { NextResponse } from 'next/server';
import { ensureJobSchedulerStarted } from '@/lib/audit-report/scheduler-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Health check minimal pour P0. Les sondes de dépendances
 * (Postgres, Redis, MinIO) seront ajoutées en P6/P7
 * — voir CLAUDE.md §15.2.
 *
 * Sert aussi d'amorce au planificateur de tâches Payload. Celui-ci ne
 * démarre qu'à l'instanciation de Payload, laquelle est paresseuse :
 * sans amorce, un rapport déjà en file attend qu'un visiteur arrive.
 * Les sondes Kubernetes frappent cette route en continu, le
 * planificateur démarre donc dans les secondes qui suivent le boot.
 *
 * L'amorce n'est jamais attendue : la sonde doit rester instantanée et
 * répondre même si la base est indisponible.
 */
export function GET(): NextResponse {
  void ensureJobSchedulerStarted();

  return NextResponse.json(
    { status: 'ok', uptime: process.uptime() },
    { status: 200 },
  );
}
