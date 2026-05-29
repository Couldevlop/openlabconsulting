import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Couvre le chemin « Payload disponible » de lib/sectors-server
 * (mapping toSector + filtre slug + validations), en surchargeant les
 * modules `payload` et `@payload-config` normalement stubbés pour throw.
 * Aligné sur products-server-success.test.ts.
 */
const findMock = vi.fn();

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ find: findMock }),
}));

import { getPublishedSectors, getSectorBySlug } from '@/lib/sectors-server';
import { FALLBACK_SECTORS } from '@/lib/data/sectors';

function rawDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: 's-1',
    slug: 'banque-assurance',
    iconKey: 'wallet',
    name: 'Banque & assurance (CMS)',
    tagline: 'Tagline depuis Payload.',
    intro: 'Intro du secteur depuis la base de données.',
    enjeux: [{ value: 'Enjeu A' }, { value: 'Enjeu B' }],
    regulation: [{ value: 'Texte A' }, { value: 'Texte B' }],
    produitsLies: [{ slug: 'fraud-shield', title: 'OpenLab Fraud Shield' }],
    expertisesLies: [
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  findMock.mockReset();
});

describe('getPublishedSectors — Payload disponible', () => {
  it('mappe les documents publiés (toSector)', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc()] });
    const sectors = await getPublishedSectors();
    expect(sectors[0]?.name).toBe('Banque & assurance (CMS)');
    expect(sectors[0]?.iconKey).toBe('wallet');
    expect(sectors[0]?.enjeux).toEqual(['Enjeu A', 'Enjeu B']);
    expect(sectors[0]?.regulation).toEqual(['Texte A', 'Texte B']);
    expect(sectors[0]?.produitsLies).toEqual([
      { slug: 'fraud-shield', title: 'OpenLab Fraud Shield' },
    ]);
    expect(sectors[0]?.expertisesLies).toEqual([
      { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée' },
    ]);
  });

  it('retombe sur le fallback si la collection est vide', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const sectors = await getPublishedSectors();
    expect(sectors).toEqual(FALLBACK_SECTORS);
  });

  it('ignore les documents invalides (slug manquant) → fallback si plus aucun valide', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ slug: 'pas-un-slug' })] });
    const sectors = await getPublishedSectors();
    expect(sectors).toEqual(FALLBACK_SECTORS);
  });

  it('ignore un document sans iconKey (toSector → null)', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ iconKey: 123 })] });
    const sectors = await getPublishedSectors();
    expect(sectors).toEqual(FALLBACK_SECTORS);
  });
});

describe('getSectorBySlug — Payload disponible', () => {
  it('mappe le secteur trouvé et filtre par slug', async () => {
    findMock.mockResolvedValue({
      docs: [rawDoc({ slug: 'agro-industrie', iconKey: 'wheat' })],
    });
    const sector = await getSectorBySlug('agro-industrie');
    expect(sector?.slug).toBe('agro-industrie');
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'sectors', limit: 1 }),
    );
  });

  it('retombe sur le fallback réel si aucun document', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const sector = await getSectorBySlug('secteur-public');
    expect(sector?.slug).toBe('secteur-public');
    expect(sector?.name).toBe('Secteur public');
  });
});
