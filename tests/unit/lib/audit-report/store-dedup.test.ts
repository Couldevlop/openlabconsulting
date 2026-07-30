import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuditReportSections } from '@/lib/audit-report/types';

/**
 * Déduplication de la création de rapport.
 *
 * La file réessaie jusqu'à deux fois. Une écriture peut réussir en base
 * alors que sa confirmation se perd (timeout réseau) : sans garde, le
 * prospect se retrouverait avec deux rapports pour une seule demande.
 * Critère « non-duplication si relancé » de la spec.
 */

const find = vi.fn();
const create = vi.fn(async (_args: { data: Record<string, unknown> }) => ({
  id: 99,
}));

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({
    find,
    create,
    update: vi.fn(),
    findByID: vi.fn(),
  }),
}));

const { createDraftReport } = await import('@/lib/audit-report/store-server');

const sections: AuditReportSections = {
  title: 'Audit IA : Banque X',
  synthesis: 'S',
  situation: 'Si',
  recommendation: 'R',
  roadmap: [{ title: 'a', horizon: 'b', body: 'c' }],
  nextSteps: 'N',
};

const args = {
  leadId: 18,
  title: 'Audit IA : Banque X',
  sections,
  generatedBy: 'squelette' as const,
};

describe('createDraftReport', () => {
  beforeEach(() => {
    find.mockReset();
    create.mockClear();
  });

  it('crée le rapport quand le lead n’en a pas encore', async () => {
    find.mockResolvedValueOnce({ docs: [] });

    expect(await createDraftReport(args)).toBe('99');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('renvoie le rapport existant sans en créer un second', async () => {
    find.mockResolvedValueOnce({ docs: [{ id: 42 }] });

    expect(await createDraftReport(args)).toBe('42');
    expect(create).not.toHaveBeenCalled();
  });

  it('cherche bien le rapport par identifiant de lead', async () => {
    find.mockResolvedValueOnce({ docs: [] });
    await createDraftReport(args);

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'audit-reports',
        where: { lead: { equals: 18 } },
      }),
    );
  });

  it('n’écrit pas le titre dans le groupe sections', async () => {
    find.mockResolvedValueOnce({ docs: [] });
    await createDraftReport(args);

    const data = create.mock.calls[0]?.[0].data ?? {};
    expect(data.title).toBe('Audit IA : Banque X');
    expect(data.sections).not.toHaveProperty('title');
    expect(data.sections).toHaveProperty('synthesis');
  });
});
