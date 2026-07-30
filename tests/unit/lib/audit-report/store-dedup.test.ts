import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Leads } from '@/collections/Leads';
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
const update = vi.fn(
  async (_args: { collection: string; data: Record<string, unknown> }) => ({
    id: 42,
    lead: 18,
  }),
);

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ find, create, update, findByID: vi.fn() }),
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

describe('markReportSent', () => {
  beforeEach(() => {
    update.mockClear();
    update.mockResolvedValue({ id: 42, lead: 18 });
  });

  it('marque le rapport envoyé et renvoie true', async () => {
    const { markReportSent } = await import('@/lib/audit-report/store-server');

    const ok = await markReportSent('42', {
      pdfKey: 'audit-reports/42.pdf',
      validatedBy: 1,
    });

    expect(ok).toBe(true);
    const report = update.mock.calls.find(
      (c) => c[0].collection === 'audit-reports',
    );
    expect(report?.[0].data).toMatchObject({
      status: 'envoye',
      pdfKey: 'audit-reports/42.pdf',
    });
  });

  it('fait avancer le lead sur une valeur du référentiel', async () => {
    const { markReportSent } = await import('@/lib/audit-report/store-server');
    await markReportSent('42', {
      pdfKey: 'audit-reports/42.pdf',
      validatedBy: 1,
    });

    const lead = update.mock.calls.find((c) => c[0].collection === 'leads');
    expect(lead).toBeDefined();
    // Valeur exacte, et non « une valeur du référentiel » : une liste
    // incluant « nouveau » resterait verte si le lead n'avançait pas.
    // Le référentiel est dérivé de la collection pour que ce test tombe
    // si quelqu'un retire l'option au lieu de dériver silencieusement.
    expect(lead?.[0].data.stage).toBe('qualifie');
    const stageField = Leads.fields.find(
      (f) => 'name' in f && f.name === 'stage',
    );
    const options =
      stageField && 'options' in stageField ? stageField.options : [];
    expect((options as { value: string }[]).map((o) => o.value)).toContain(
      'qualifie',
    );
  });

  it('renvoie false si l’enregistrement échoue', async () => {
    const { markReportSent } = await import('@/lib/audit-report/store-server');
    update.mockRejectedValueOnce(new Error('base indisponible'));

    expect(await markReportSent('42', { pdfKey: 'k', validatedBy: 1 })).toBe(
      false,
    );
  });
});
