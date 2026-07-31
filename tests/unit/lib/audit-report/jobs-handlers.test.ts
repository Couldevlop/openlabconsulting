import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Gestionnaires des deux tâches de la file.
 *
 * Ce sont eux qui tournent réellement en production, toutes les minutes
 * pour la génération et toutes les heures pour la relance. Leurs
 * branches d'échec décident si un rapport existe et si l'équipe est
 * prévenue.
 */

const createDraftReport = vi.fn();
const listPendingReports = vi.fn();
const markReminded = vi.fn(async () => undefined);
vi.mock('@/lib/audit-report/store-server', () => ({
  createDraftReport,
  listPendingReports,
  markReminded,
}));

const generateWithLucie = vi.fn();
vi.mock('@/lib/audit-report/lucie', () => ({ generateWithLucie }));

const sendReportReviewAlert = vi.fn(async () => ({ ok: true }));
vi.mock('@/lib/email', () => ({ sendReportReviewAlert }));

const { generateAuditReportTask, remindPendingReportsTask } =
  await import('@/lib/audit-report/jobs');

beforeEach(() => {
  createDraftReport.mockReset();
  listPendingReports.mockReset();
  markReminded.mockClear();
  generateWithLucie.mockReset();
  sendReportReviewAlert.mockClear();
});

describe('tâche de génération', () => {
  const input = {
    leadId: '18',
    organization: 'Banque X',
    jobTitle: 'DSI',
    answers: { maturity: 'pilote' },
  };

  it('crée le rapport puis alerte l’équipe', async () => {
    generateWithLucie.mockResolvedValueOnce(null);
    createDraftReport.mockResolvedValueOnce('7');

    const out = await generateAuditReportTask.handler({ input });

    expect(out.output).toEqual({ reportId: '7', generatedBy: 'squelette' });
    expect(sendReportReviewAlert).toHaveBeenCalledWith({
      reportId: '7',
      organization: 'Banque X',
    });
  });

  it('jette si la persistance a échoué, pour que la file réessaie', async () => {
    generateWithLucie.mockResolvedValueOnce(null);
    createDraftReport.mockResolvedValueOnce(null);

    await expect(generateAuditReportTask.handler({ input })).rejects.toThrow(
      /impossible/,
    );
    expect(sendReportReviewAlert).not.toHaveBeenCalled();
  });

  it('tolère une entrée sans organisation ni fonction', async () => {
    generateWithLucie.mockResolvedValueOnce(null);
    createDraftReport.mockResolvedValueOnce('7');

    await generateAuditReportTask.handler({ input: { leadId: '18' } });

    expect(sendReportReviewAlert).toHaveBeenCalledWith({
      reportId: '7',
      organization: 'organisation non précisée',
    });
  });

  it('déclare deux tentatives', () => {
    expect(generateAuditReportTask.retries).toBe(2);
  });
});

describe('tâche de relance', () => {
  it('relance chaque rapport éligible et horodate', async () => {
    const vieux = new Date(Date.now() - 30 * 3_600_000).toISOString();
    listPendingReports.mockResolvedValueOnce([
      { id: '1', organization: 'A', createdAt: vieux, remindedAt: null },
      {
        id: '2',
        organization: 'B',
        createdAt: new Date().toISOString(),
        remindedAt: null,
      },
    ]);

    const out = await remindPendingReportsTask.handler();

    expect(out.output.reminded).toBe(1);
    expect(sendReportReviewAlert).toHaveBeenCalledWith({
      reportId: '1',
      organization: 'A',
      overdue: true,
    });
    expect(markReminded).toHaveBeenCalledWith('1');
  });

  it('ne fait rien quand aucun rapport n’attend', async () => {
    listPendingReports.mockResolvedValueOnce([]);

    expect((await remindPendingReportsTask.handler()).output.reminded).toBe(0);
    expect(sendReportReviewAlert).not.toHaveBeenCalled();
  });

  it('est planifiée toutes les heures sur sa propre file', () => {
    expect(remindPendingReportsTask.schedule).toEqual([
      { cron: '0 * * * *', queue: 'reminders' },
    ]);
  });
});
