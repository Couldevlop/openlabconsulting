import { describe, expect, it } from 'vitest';
import { selectReportsToRemind } from '@/lib/audit-report/jobs';

/**
 * Règle de relance : premier rappel à 12 h, soit la mi-parcours de la
 * promesse de 24 h ouvrées, puis au plus un rappel par jour avec un
 * objet distinct une fois l'échéance dépassée.
 *
 * Fonction pure : la lecture en base reste dans la tâche.
 */

const now = new Date('2026-07-30T12:00:00Z');
const at = (hoursAgo: number): string =>
  new Date(now.getTime() - hoursAgo * 3_600_000).toISOString();

describe('selectReportsToRemind', () => {
  it('ignore un rapport de moins de 12 h', () => {
    expect(
      selectReportsToRemind(now, [
        { id: '1', organization: 'A', createdAt: at(6), remindedAt: null },
      ]),
    ).toEqual([]);
  });

  it('relance un rapport de plus de 12 h jamais relancé', () => {
    const out = selectReportsToRemind(now, [
      { id: '1', organization: 'A', createdAt: at(13), remindedAt: null },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]?.overdue).toBe(false);
  });

  it('marque le dépassement au-delà de 24 h', () => {
    const out = selectReportsToRemind(now, [
      { id: '1', organization: 'A', createdAt: at(30), remindedAt: at(21) },
    ]);
    expect(out[0]?.overdue).toBe(true);
  });

  it('ne relance pas deux fois dans la même journée', () => {
    expect(
      selectReportsToRemind(now, [
        { id: '1', organization: 'A', createdAt: at(30), remindedAt: at(2) },
      ]),
    ).toEqual([]);
  });

  it('traite chaque rapport indépendamment', () => {
    const out = selectReportsToRemind(now, [
      { id: '1', organization: 'A', createdAt: at(2), remindedAt: null },
      { id: '2', organization: 'B', createdAt: at(13), remindedAt: null },
      { id: '3', organization: 'C', createdAt: at(48), remindedAt: at(25) },
    ]);
    expect(out.map((r) => r.report.id)).toEqual(['2', '3']);
    expect(out.map((r) => r.overdue)).toEqual([false, true]);
  });

  it('accepte une liste vide', () => {
    expect(selectReportsToRemind(now, [])).toEqual([]);
  });
});
