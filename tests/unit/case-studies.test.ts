import { describe, it, expect, vi, afterEach } from 'vitest';
import { FALLBACK_CASE_STUDIES } from '@/lib/case-studies';
import { getPublishedCaseStudies } from '@/lib/case-studies-server';

/**
 * Tests du helper `getPublishedCaseStudies()` — vérifie que :
 *   1. Le fallback hard-codé contient les 4 cas fondateurs.
 *   2. Quand Payload échoue (DB down, import error), on retombe sur
 *      le fallback sans throw.
 *
 * Le chemin "Payload renvoie des docs" nécessite une vraie DB et est
 * testé en intégration (à venir).
 */
describe('lib/case-studies — FALLBACK_CASE_STUDIES', () => {
  it('expose 4 cas fondateurs', () => {
    expect(FALLBACK_CASE_STUDIES).toHaveLength(4);
  });

  it('chaque cas a un productSlug valide et 3 résultats', () => {
    for (const cs of FALLBACK_CASE_STUDIES) {
      expect([
        'nexusrh',
        'nexuserp',
        'sygescom',
        'agrosense',
        'qualitos',
        'fraud-shield',
        'smart-city',
      ]).toContain(cs.productSlug);
      expect(cs.results).toHaveLength(3);
      expect(cs.href).toBe(`/solutions/${cs.productSlug}`);
    }
  });

  it('chaque cas a un id unique', () => {
    const ids = FALLBACK_CASE_STUDIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('aucun cas n’a une imageUrl par défaut (utilise mockup SVG)', () => {
    for (const cs of FALLBACK_CASE_STUDIES) {
      expect(cs.imageUrl).toBeNull();
    }
  });
});

describe('lib/case-studies — getPublishedCaseStudies fallback', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retombe sur le fallback quand Payload est indisponible', async () => {
    // En environnement de test sans DB, Payload va échouer → fallback.
    const studies = await getPublishedCaseStudies();
    expect(studies).toEqual(FALLBACK_CASE_STUDIES);
  });
});
