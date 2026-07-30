import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Validation d'un rapport : action sensible, elle envoie un document
 * nominatif à un prospect. Le rôle est revérifié côté serveur, un
 * bouton masqué dans l'interface ne protégeant rien (OWASP A01).
 */

const auth = vi.fn();
const findByID = vi.fn();

// Le stub Vitest de `@payload-config` lève par défaut : le mocker est
// indispensable dès qu'une route importe la config.
vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ auth, findByID }),
}));

const renderReportPdf = vi.fn(async () => Buffer.from('%PDF-1.7'));
vi.mock('@/lib/audit-report/pdf', () => ({ renderReportPdf }));

const putReportPdf = vi.fn(async () => 'audit-reports/42.pdf');
const markReportSent = vi.fn(async () => undefined);
vi.mock('@/lib/audit-report/store-server', () => ({
  putReportPdf,
  markReportSent,
}));

const sendReportDelivery = vi.fn(async () => ({ ok: true }));
vi.mock('@/lib/email', () => ({ sendReportDelivery }));

const { POST } = await import('@/app/api/audit-report/validate/route');

function req(body: unknown = { reportId: '42' }): Request {
  return new Request('http://localhost:3000/api/audit-report/validate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const reportDoc = {
  id: '42',
  title: 'Audit IA : Banque X',
  sections: {
    synthesis: 'S',
    situation: 'Si',
    recommendation: 'R',
    roadmap: [{ title: 'a', horizon: 'b', body: 'c' }],
    nextSteps: 'N',
  },
  lead: {
    name: 'Debora Ahouma',
    email: 'debora@example.ci',
    organization: 'Banque X',
  },
};

describe('POST /api/audit-report/validate', () => {
  beforeEach(() => {
    Object.assign(process.env, {
      PAYLOAD_SECRET: 'secret-de-test-suffisamment-long-pour-hmac',
      NEXT_PUBLIC_SITE_URL: 'https://openlabconsulting.com',
    });
    auth.mockReset();
    findByID.mockReset();
    findByID.mockResolvedValue(reportDoc);
    sendReportDelivery.mockClear();
    markReportSent.mockClear();
    putReportPdf.mockClear();
  });

  it('refuse un appel anonyme', async () => {
    auth.mockResolvedValueOnce({ user: null });
    expect((await POST(req())).status).toBe(401);
    expect(sendReportDelivery).not.toHaveBeenCalled();
  });

  it('refuse un rôle sans droit', async () => {
    auth.mockResolvedValueOnce({ user: { id: 3, role: 'author' } });
    expect((await POST(req())).status).toBe(403);
    expect(sendReportDelivery).not.toHaveBeenCalled();
  });

  it('refuse un corps invalide', async () => {
    auth.mockResolvedValue({ user: { id: 1, role: 'admin' } });
    expect((await POST(req({}))).status).toBe(400);
    expect((await POST(req({ reportId: 42 }))).status).toBe(400);
  });

  it('refuse d’envoyer si le lead n’a pas d’email', async () => {
    auth.mockResolvedValueOnce({ user: { id: 1, role: 'admin' } });
    findByID.mockResolvedValueOnce({ ...reportDoc, lead: { name: 'X' } });

    expect((await POST(req())).status).toBe(409);
    expect(markReportSent).not.toHaveBeenCalled();
  });

  it('génère, dépose et envoie pour un administrateur', async () => {
    auth.mockResolvedValueOnce({ user: { id: 1, role: 'admin' } });

    const res = await POST(req());

    expect(res.status).toBe(200);
    expect(putReportPdf).toHaveBeenCalledWith('42', expect.any(Buffer));
    expect(sendReportDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'debora@example.ci',
        downloadUrl: expect.stringContaining('/audit-ia/rapport/'),
      }),
    );
    expect(markReportSent).toHaveBeenCalledWith('42', {
      pdfKey: 'audit-reports/42.pdf',
      validatedBy: 1,
    });
  });

  it('signale un envoi refusé par le transport sans masquer l’échec', async () => {
    auth.mockResolvedValueOnce({ user: { id: 1, role: 'admin' } });
    sendReportDelivery.mockResolvedValueOnce({ ok: false });

    const res = await POST(req());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, emailSent: false });
  });
});
