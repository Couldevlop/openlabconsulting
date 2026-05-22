import { describe, it, expect } from 'vitest';
import { getPublishedCaseStudies } from '@/lib/case-studies-server';
import { FALLBACK_CASE_STUDIES } from '@/lib/case-studies';

/**
 * Tests `lib/case-studies-server.getPublishedCaseStudies` — le chemin
 * "Payload OK + parsing" ne peut être testé en unitaire car l'alias
 * Vite `@payload-config` throw avant que `vi.doMock('payload')` ne
 * puisse intervenir. Couvert en intégration P6 avec DB éphémère.
 *
 * On vérifie le fallback complet ici (déjà couvert par
 * case-studies.test.ts) + qu'aucun chemin n'introduit de régression.
 */
describe('lib/case-studies-server — fallback en environnement test', () => {
  it('retombe sur FALLBACK_CASE_STUDIES quand Payload est indisponible', async () => {
    const studies = await getPublishedCaseStudies();
    expect(studies).toEqual(FALLBACK_CASE_STUDIES);
  });

  it('chaque case study du fallback a un href bien formé', async () => {
    const studies = await getPublishedCaseStudies();
    for (const s of studies) {
      expect(s.href).toMatch(/^\/solutions\//);
    }
  });
});
