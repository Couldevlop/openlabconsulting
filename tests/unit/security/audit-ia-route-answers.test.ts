import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetMemoryStore } from '@/lib/rate-limit';

/**
 * Les SIX réponses du questionnaire doivent atteindre la génération.
 *
 * Défaut trouvé en revue finale : `sector`, `scope` et `urgency`
 * n'existaient ni dans le schéma ni dans ce que la route transmettait.
 * Le moteur de recommandation retombait donc systématiquement sur son
 * cas par défaut, et le rapport contredisait le format annoncé à
 * l'écran. Ce test verrouille la propagation.
 */

const queueReportGeneration = vi.fn(async () => undefined);
vi.mock('@/lib/audit-report/store-server', () => ({ queueReportGeneration }));

const persistLead = vi.fn(async () => ({
  score: 80,
  summary: 'résumé',
  leadId: '42',
}));
vi.mock('@/lib/leads', () => ({ persistLead }));

vi.mock('@/lib/email', () => ({
  sendLeadNotification: vi.fn(async () => ({ ok: true })),
  sendLeadAcknowledgement: vi.fn(async () => ({ ok: true })),
}));

const { POST } = await import('@/app/api/audit-ia/route');

const body = {
  name: 'Debora Ahouma',
  email: 'debora@openlabconsulting.com',
  organization: 'Banque X',
  jobTitle: 'DSI',
  maturity: 'decouverte',
  headcount: '200-1000',
  sector: 'agro-industrie',
  scope: 'single-dept',
  urgency: 'exploration',
  goal: 'Nous voulons cadrer un premier usage de l’IA sur la filiale UEMOA.',
  challenge: 'Les rapprochements bancaires prennent quatre jours par mois.',
  consentRgpd: 'on',
};

function req(payload: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/audit-ia', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': `192.0.2.${Math.floor(Math.random() * 254) + 1}`,
    },
    body: JSON.stringify(payload),
  });
}

describe('POST /api/audit-ia : propagation des réponses', () => {
  beforeEach(() => {
    __resetMemoryStore();
    delete process.env.REDIS_URL;
    delete process.env.TURNSTILE_SECRET_KEY;
    Object.assign(process.env, { NODE_ENV: 'test' });
    queueReportGeneration.mockClear();
    persistLead.mockClear();
  });

  it('transmet les six réponses à la génération', async () => {
    const res = await POST(req(body));
    expect(res.status).toBe(202);

    expect(queueReportGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: '42',
        organization: 'Banque X',
        jobTitle: 'DSI',
        answers: {
          maturity: 'decouverte',
          headcount: '200-1000',
          sector: 'agro-industrie',
          scope: 'single-dept',
          urgency: 'exploration',
          challenge:
            'Les rapprochements bancaires prennent quatre jours par mois.',
        },
      }),
    );
  });

  it('conserve secteur, périmètre et horizon dans les métadonnées du lead', async () => {
    await POST(req(body));

    expect(persistLead).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          sector: 'agro-industrie',
          scope: 'single-dept',
          urgency: 'exploration',
        }),
      }),
    );
  });

  it('reste tolérant si les trois champs sont absents', async () => {
    const {
      sector: _sector,
      scope: _scope,
      urgency: _urgency,
      ...sansContexte
    } = body;
    const res = await POST(req(sansContexte));

    expect(res.status).toBe(202);
    expect(queueReportGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        answers: expect.objectContaining({ sector: undefined }),
      }),
    );
  });

  it('refuse une valeur hors référentiel', async () => {
    const res = await POST(req({ ...body, sector: 'aeronautique' }));
    expect(res.status).toBe(400);
    expect(queueReportGeneration).not.toHaveBeenCalled();
  });
});
