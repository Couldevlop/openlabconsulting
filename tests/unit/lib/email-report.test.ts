import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Emails du pipeline de rapport d'audit : alerte de relecture vers
 * l'équipe, livraison du lien vers le prospect. Comme le reste du
 * mailer, ils sont fail-soft : sans configuration ZeptoMail, ils sont
 * neutres plutôt que bloquants.
 */

describe('emails du rapport d’audit', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    delete process.env.ZEPTOMAIL_TOKEN;
  });

  it('reste neutre quand ZeptoMail n’est pas configuré', async () => {
    const { sendReportReviewAlert, sendReportDelivery } =
      await import('@/lib/email');

    expect(
      await sendReportReviewAlert({ reportId: '42', organization: 'Banque X' }),
    ).toEqual({ ok: false, skipped: true });

    expect(
      await sendReportDelivery({
        name: 'Debora Ahouma',
        email: 'debora@example.ci',
        organization: 'Banque X',
        downloadUrl: 'https://openlabconsulting.com/audit-ia/rapport/jeton',
      }),
    ).toEqual({ ok: false, skipped: true });
  });

  describe('avec ZeptoMail configuré', () => {
    const sent: string[] = [];

    beforeEach(() => {
      sent.length = 0;
      Object.assign(process.env, {
        ZEPTOMAIL_TOKEN: 'token-de-test',
        EMAIL_FROM: 'noreply@openlabconsulting.com',
        EMAIL_TEAM: 'waopron@openlabconsulting.com',
        NEXT_PUBLIC_SITE_URL: 'https://openlabconsulting.com',
      });
      vi.stubGlobal(
        'fetch',
        vi.fn(async (_url: string, init: RequestInit) => {
          sent.push(String(init.body));
          return new Response(JSON.stringify({ data: [] }), { status: 201 });
        }),
      );
    });

    it('distingue l’objet quand l’échéance est dépassée', async () => {
      const { sendReportReviewAlert } = await import('@/lib/email');

      await sendReportReviewAlert({ reportId: '42', organization: 'Banque X' });
      await sendReportReviewAlert({
        reportId: '42',
        organization: 'Banque X',
        overdue: true,
      });

      expect(sent[0]).toContain('à valider');
      expect(sent[0]).not.toContain('dépassée');
      expect(sent[1]).toContain('dépassée');
    });

    it('adresse l’alerte à l’équipe avec un lien vers le back-office', async () => {
      const { sendReportReviewAlert } = await import('@/lib/email');
      await sendReportReviewAlert({ reportId: '42', organization: 'Banque X' });

      expect(sent[0]).toContain('waopron@openlabconsulting.com');
      expect(sent[0]).toContain('/admin/collections/audit-reports/42');
    });

    it('envoie au prospect un lien, jamais une pièce jointe', async () => {
      const { sendReportDelivery } = await import('@/lib/email');
      await sendReportDelivery({
        name: 'Debora Ahouma',
        email: 'debora@example.ci',
        organization: 'Banque X',
        downloadUrl: 'https://openlabconsulting.com/audit-ia/rapport/jeton-xyz',
      });

      const body = sent[0] ?? '';
      expect(body).toContain('debora@example.ci');
      expect(body).toContain('jeton-xyz');
      expect(body).toContain('30 jours');
      expect(body).not.toContain('attachments');
    });

    it('n’introduit aucun tiret cadratin dans les messages', async () => {
      const { sendReportReviewAlert, sendReportDelivery } =
        await import('@/lib/email');
      await sendReportReviewAlert({
        reportId: '42',
        organization: 'Banque X',
        overdue: true,
      });
      await sendReportDelivery({
        name: 'Debora',
        email: 'd@example.ci',
        organization: 'Banque X',
        downloadUrl: 'https://openlabconsulting.com/audit-ia/rapport/j',
      });

      for (const body of sent) {
        expect(body).not.toContain('—');
      }
    });
  });
});
