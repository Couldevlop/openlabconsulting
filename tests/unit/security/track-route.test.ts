import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Tests POST /api/track — comptage de visites (collection `visits`).
 * Couvre : 204 systématique (fail-soft), dédup « 1 visiteur/jour »
 * (find puis create seulement si absent), country depuis CF-IPCountry,
 * et résilience si Payload échoue.
 */
const findMock = vi.fn();
const createMock = vi.fn();

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ find: findMock, create: createMock }),
}));

import { POST as trackPost } from '@/app/api/track/route';
import { __resetMemoryStore } from '@/lib/rate-limit';

function buildReq(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost:3000/api/track', {
    method: 'POST',
    headers: {
      'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 254) + 1}`,
      'user-agent': 'Mozilla/5.0 (test)',
      ...headers,
    },
  });
}

describe('POST /api/track', () => {
  beforeEach(() => {
    __resetMemoryStore();
    delete process.env.REDIS_URL;
    findMock.mockReset();
    createMock.mockReset();
    findMock.mockResolvedValue({ totalDocs: 0 });
    createMock.mockResolvedValue({ id: 1 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renvoie 204 et crée la visite au premier passage du jour', async () => {
    const res = await trackPost(buildReq({ 'cf-ipcountry': 'CI' }));
    expect(res.status).toBe(204);
    expect(createMock).toHaveBeenCalledTimes(1);
    const arg = createMock.mock.calls[0]?.[0] as {
      collection: string;
      data: { day: string; hour: number; country: string; visitorHash: string };
      overrideAccess?: boolean;
    };
    expect(arg.collection).toBe('visits');
    expect(arg.overrideAccess).toBe(true);
    expect(arg.data.country).toBe('CI');
    expect(arg.data.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(arg.data.hour).toBeGreaterThanOrEqual(0);
    expect(arg.data.visitorHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('ne crée PAS de doublon si le visiteur a déjà été vu ce jour', async () => {
    findMock.mockResolvedValue({ totalDocs: 1 });
    const res = await trackPost(buildReq({ 'cf-ipcountry': 'FR' }));
    expect(res.status).toBe(204);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('country = XX quand l’en-tête Cloudflare est absent', async () => {
    await trackPost(buildReq());
    const arg = createMock.mock.calls[0]?.[0] as { data: { country: string } };
    expect(arg.data.country).toBe('XX');
  });

  it('reste 204 (fail-soft) si Payload échoue', async () => {
    findMock.mockRejectedValue(new Error('DB down'));
    const res = await trackPost(buildReq());
    expect(res.status).toBe(204);
  });

  it('avale l’erreur d’unicité sur create (course entre onglets)', async () => {
    createMock.mockRejectedValue(new Error('duplicate key'));
    const res = await trackPost(buildReq());
    expect(res.status).toBe(204);
  });
});
