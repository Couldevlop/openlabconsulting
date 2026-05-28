import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Couvre le chemin « Payload disponible » de lib/case-studies-server
 * (mapping toCaseStudy + filtre produit), en surchargeant les modules
 * `payload` et `@payload-config` normalement stubbés pour throw.
 */
const findMock = vi.fn();

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ find: findMock }),
}));

import {
  getPublishedCaseStudies,
  getCaseStudyForProduct,
} from '@/lib/case-studies-server';
import { FALLBACK_CASE_STUDIES } from '@/lib/case-studies';

function rawDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cs-1',
    headline: 'Titre cas',
    punchline: 'Une punchline',
    body: 'Le corps du cas client.',
    sector: 'Banque',
    client: 'Client X',
    productSlug: 'fraud-shield',
    results: [
      { value: '−50 %', label: 'fraude évitée' },
      { value: '2 s', label: 'analyse' },
      { value: '24/7', label: 'supervision' },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  findMock.mockReset();
});

describe('getPublishedCaseStudies — Payload disponible', () => {
  it('mappe les documents publiés', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc()] });
    const studies = await getPublishedCaseStudies();
    expect(studies[0]?.headline).toBe('Titre cas');
    expect(studies[0]?.href).toBe('/solutions/fraud-shield');
  });

  it('retombe sur le fallback si la collection est vide', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const studies = await getPublishedCaseStudies();
    expect(studies).toEqual(FALLBACK_CASE_STUDIES);
  });
});

describe('getCaseStudyForProduct — Payload disponible', () => {
  it('mappe le cas trouvé et filtre par produit', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ productSlug: 'nexusrh' })] });
    const cas = await getCaseStudyForProduct('nexusrh');
    expect(cas?.productSlug).toBe('nexusrh');
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'caseStudies', limit: 1 }),
    );
  });

  it('retombe sur le fallback réel si aucun document', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const cas = await getCaseStudyForProduct('sygescom');
    expect(cas?.productSlug).toBe('sygescom');
  });
});
