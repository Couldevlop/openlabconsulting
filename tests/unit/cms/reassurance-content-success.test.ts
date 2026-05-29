import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Couvre le chemin « Payload disponible » de getReassuranceContent
 * (mapping toPartner + relativisation URL média + branches eyebrow /
 * partners), en surchargeant `payload` / `@payload-config` normalement
 * stubbés pour throw. Aligné sur team-server-success.test.ts.
 */
const findGlobalMock = vi.fn();

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ findGlobal: findGlobalMock }),
}));

const { getReassuranceContent } =
  await import('@/lib/cms/site-settings-server');
const { REASSURANCE_FALLBACK } = await import('@/lib/cms/site-settings');

beforeEach(() => {
  findGlobalMock.mockReset();
});

describe('getReassuranceContent — Payload disponible', () => {
  it('mappe les partenaires + relativise l’URL média absolue', async () => {
    findGlobalMock.mockResolvedValue({
      eyebrow: 'Nos partenaires terrain',
      partners: [
        {
          name: 'DOCI',
          logo: {
            url: 'http://localhost:3000/api/media/file/doci.png',
            width: 200,
            height: 80,
          },
        },
      ],
    });
    const content = await getReassuranceContent();
    expect(content.eyebrow).toBe('Nos partenaires terrain');
    expect(content.partners).toEqual([
      { name: 'DOCI', src: '/api/media/file/doci.png', width: 200, height: 80 },
    ]);
  });

  it('applique des dimensions par défaut + URL relative telle quelle', async () => {
    findGlobalMock.mockResolvedValue({
      eyebrow: '',
      partners: [{ name: 'Sertemef', logo: { url: '/api/media/file/s.png' } }],
    });
    const content = await getReassuranceContent();
    // eyebrow vide → fallback ; dims absentes → 160x48 ; URL relative inchangée.
    expect(content.eyebrow).toBe(REASSURANCE_FALLBACK.eyebrow);
    expect(content.partners).toEqual([
      {
        name: 'Sertemef',
        src: '/api/media/file/s.png',
        width: 160,
        height: 48,
      },
    ]);
  });

  it('filtre les items invalides → fallback si plus aucun valide', async () => {
    findGlobalMock.mockResolvedValue({
      partners: [
        { name: '', logo: { url: '/x.png' } }, // nom vide
        { name: 'Sans logo', logo: null }, // pas de média
        { name: 'Logo string', logo: 'media-id-123' }, // logo non peuplé
      ],
    });
    const content = await getReassuranceContent();
    expect(content.partners).toEqual(REASSURANCE_FALLBACK.partners);
  });

  it('retombe sur le fallback si partners n’est pas un tableau', async () => {
    findGlobalMock.mockResolvedValue({ eyebrow: 'Titre', partners: null });
    const content = await getReassuranceContent();
    expect(content.eyebrow).toBe('Titre');
    expect(content.partners).toEqual(REASSURANCE_FALLBACK.partners);
  });
});
