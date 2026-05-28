import { describe, it, expect } from 'vitest';
import {
  getPublishedExpertises,
  getExpertiseBySlug,
} from '@/lib/expertises-server';
import { FALLBACK_EXPERTISES } from '@/lib/data/expertises';

/**
 * Tests `lib/expertises-server` — le chemin "Payload OK + parsing" n'est
 * pas testable ici car l'alias Vite `@payload-config` throw avant que
 * `vi.doMock('payload')` ne puisse intervenir (couvert dans
 * expertises-server-success.test.ts qui mock statiquement les deux
 * modules).
 *
 * On vérifie le fallback complet (Payload indisponible en environnement
 * test) sans régression. Aligné sur products-server-payload.test.ts.
 */
describe('lib/expertises-server — fallback en environnement test', () => {
  it('retombe sur FALLBACK_EXPERTISES quand Payload est indisponible', async () => {
    const expertises = await getPublishedExpertises();
    expect(expertises).toEqual(FALLBACK_EXPERTISES);
  });

  it('retourne les 4 expertises avec un iconKey valide (string)', async () => {
    const expertises = await getPublishedExpertises();
    expect(expertises).toHaveLength(4);
    for (const e of expertises) {
      expect(typeof e.iconKey).toBe('string');
      expect(e.iconKey.length).toBeGreaterThan(0);
    }
  });

  it('getExpertiseBySlug renvoie l’expertise du fallback', async () => {
    const expertise = await getExpertiseBySlug('conseil-strategie');
    expect(expertise).not.toBeNull();
    expect(expertise?.title).toBe('Conseil & stratégie IA');
  });

  it('getExpertiseBySlug renvoie null pour un slug inconnu', async () => {
    const expertise = await getExpertiseBySlug('inexistant');
    expect(expertise).toBeNull();
  });
});
