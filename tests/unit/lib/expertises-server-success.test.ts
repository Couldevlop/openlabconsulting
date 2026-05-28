import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Couvre le chemin « Payload disponible » de lib/expertises-server
 * (mapping toExpertise + filtre slug + validations), en surchargeant les
 * modules `payload` et `@payload-config` normalement stubbés pour throw.
 * Aligné sur products-server-success.test.ts.
 */
const findMock = vi.fn();

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ find: findMock }),
}));

import {
  getPublishedExpertises,
  getExpertiseBySlug,
} from '@/lib/expertises-server';
import { FALLBACK_EXPERTISES } from '@/lib/data/expertises';

function rawDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e-1',
    slug: 'conseil-strategie',
    iconKey: 'compass',
    title: 'Conseil & stratégie IA (CMS)',
    punchline: 'Punchline depuis Payload.',
    intro: 'Intro de l’expertise depuis la base de données.',
    competences: [{ value: 'Compétence A' }, { value: 'Compétence B' }],
    approche: [
      { step: '01', title: 'Étape A', body: 'Corps de l’étape A.' },
      { step: '02', title: 'Étape B', body: 'Corps de l’étape B.' },
      { step: '03', title: 'Étape C', body: 'Corps de l’étape C.' },
    ],
    produitsLies: [{ slug: 'nexuserp', name: 'NexusERP' }],
    ...overrides,
  };
}

beforeEach(() => {
  findMock.mockReset();
});

describe('getPublishedExpertises — Payload disponible', () => {
  it('mappe les documents publiés (toExpertise)', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc()] });
    const expertises = await getPublishedExpertises();
    expect(expertises[0]?.title).toBe('Conseil & stratégie IA (CMS)');
    expect(expertises[0]?.iconKey).toBe('compass');
    expect(expertises[0]?.competences).toEqual([
      'Compétence A',
      'Compétence B',
    ]);
    expect(expertises[0]?.approche).toHaveLength(3);
    expect(expertises[0]?.produitsLies).toEqual([
      { slug: 'nexuserp', name: 'NexusERP' },
    ]);
  });

  it('retombe sur le fallback si la collection est vide', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const expertises = await getPublishedExpertises();
    expect(expertises).toEqual(FALLBACK_EXPERTISES);
  });

  it('ignore les documents invalides (slug manquant) → fallback si plus aucun valide', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ slug: 'pas-un-slug' })] });
    const expertises = await getPublishedExpertises();
    expect(expertises).toEqual(FALLBACK_EXPERTISES);
  });

  it('ignore un document sans iconKey (toExpertise → null)', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ iconKey: 123 })] });
    const expertises = await getPublishedExpertises();
    expect(expertises).toEqual(FALLBACK_EXPERTISES);
  });
});

describe('getExpertiseBySlug — Payload disponible', () => {
  it('mappe l’expertise trouvée et filtre par slug', async () => {
    findMock.mockResolvedValue({
      docs: [rawDoc({ slug: 'cybersecurite-ia', iconKey: 'shield-check' })],
    });
    const expertise = await getExpertiseBySlug('cybersecurite-ia');
    expect(expertise?.slug).toBe('cybersecurite-ia');
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'expertises', limit: 1 }),
    );
  });

  it('retombe sur le fallback réel si aucun document', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const expertise = await getExpertiseBySlug('data-gouvernance');
    expect(expertise?.slug).toBe('data-gouvernance');
    expect(expertise?.title).toBe('Data & gouvernance');
  });
});
