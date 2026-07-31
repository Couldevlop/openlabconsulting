import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetMemoryStore } from '@/lib/rate-limit';

/**
 * Route de téléchargement du rapport : elle ne sert qu'un fichier, et
 * uniquement pour un rapport réellement envoyé, sous jeton valide
 * (OWASP A01). Un jeton falsifié, périmé ou pointant vers un brouillon
 * ne doit rien révéler.
 */

const findReportForDownload = vi.fn();
const incrementDownloadCount = vi.fn(async () => undefined);
const getReportPdf = vi.fn(async () => Buffer.from('%PDF-1.7 contenu'));

vi.mock('@/lib/audit-report/store-server', () => ({
  findReportForDownload,
  incrementDownloadCount,
  getReportPdf,
  // La route re-dérive la clé plutôt que de faire confiance au champ.
  buildReportKey: (id: string) => `audit-reports/${id}.pdf`,
}));

const { GET } = await import('@/app/audit-ia/rapport/[token]/route');
const { signReportToken } = await import('@/lib/audit-report/link');

function req(token: string): Request {
  return new Request(`http://localhost:3000/audit-ia/rapport/${token}`, {
    headers: {
      'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 254) + 1}`,
    },
  });
}

describe('GET /audit-ia/rapport/[token]', () => {
  beforeEach(() => {
    __resetMemoryStore();
    delete process.env.REDIS_URL;
    Object.assign(process.env, {
      PAYLOAD_SECRET: 'secret-de-test-suffisamment-long-pour-hmac',
    });
    findReportForDownload.mockReset();
    incrementDownloadCount.mockClear();
  });

  it('sert le PDF pour un rapport envoyé', async () => {
    findReportForDownload.mockResolvedValueOnce({
      id: '42',
      status: 'envoye',
      pdfKey: 'audit-reports/42.pdf',
      downloadCount: 3,
    });
    const token = signReportToken('42');

    const res = await GET(req(token), {
      params: Promise.resolve({ token }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('x-robots-tag')).toContain('noindex');
    expect(res.headers.get('content-disposition')).toContain('attachment');
    expect(incrementDownloadCount).toHaveBeenCalledWith('42', 3);
  });

  it('renvoie 403 sur signature invalide', async () => {
    const res = await GET(req('faux.jeton'), {
      params: Promise.resolve({ token: 'faux.jeton' }),
    });
    expect(res.status).toBe(403);
    expect(findReportForDownload).not.toHaveBeenCalled();
  });

  it('renvoie 410 sur jeton expiré', async () => {
    // TTL négatif : jeton déjà périmé à la signature, sans manipuler
    // l'horloge (le limiteur de débit s'appuie dessus).
    const token = signReportToken('42', -1);

    const res = await GET(req(token), { params: Promise.resolve({ token }) });

    expect(res.status).toBe(410);
    expect(findReportForDownload).not.toHaveBeenCalled();
  });

  it('renvoie 404 si le rapport n’est pas au statut envoyé', async () => {
    findReportForDownload.mockResolvedValueOnce({
      id: '42',
      status: 'brouillon-ia',
      pdfKey: 'audit-reports/42.pdf',
      downloadCount: 0,
    });
    const token = signReportToken('42');

    const res = await GET(req(token), { params: Promise.resolve({ token }) });

    expect(res.status).toBe(404);
    expect(incrementDownloadCount).not.toHaveBeenCalled();
  });

  it('renvoie 404 si le rapport est introuvable', async () => {
    findReportForDownload.mockResolvedValueOnce(null);
    const token = signReportToken('999');

    const res = await GET(req(token), { params: Promise.resolve({ token }) });

    expect(res.status).toBe(404);
  });

  it('limite le débit pour empêcher le balayage de jetons', async () => {
    findReportForDownload.mockResolvedValue({
      id: '42',
      status: 'envoye',
      pdfKey: 'audit-reports/42.pdf',
      downloadCount: 0,
    });
    const token = signReportToken('42');
    const sameIp = new Request(
      `http://localhost:3000/audit-ia/rapport/${token}`,
      { headers: { 'x-forwarded-for': '198.51.100.7' } },
    );

    let last = 200;
    for (let i = 0; i < 32; i += 1) {
      const res = await GET(sameIp.clone(), {
        params: Promise.resolve({ token }),
      });
      last = res.status;
    }

    expect(last).toBe(429);
  });
});
