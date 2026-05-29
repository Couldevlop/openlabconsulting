import { describe, it, expect } from 'vitest';
import { getPublishedSectors, getSectorBySlug } from '@/lib/sectors-server';
import { FALLBACK_SECTORS } from '@/lib/data/sectors';

/**
 * Tests `lib/sectors-server` — le chemin "Payload OK + parsing" n'est pas
 * testable ici car l'alias Vite `@payload-config` throw avant que
 * `vi.doMock('payload')` ne puisse intervenir (couvert dans
 * sectors-server-success.test.ts qui mock statiquement les deux modules).
 *
 * On vérifie le fallback complet (Payload indisponible en environnement
 * test) sans régression. Aligné sur products-server-payload.test.ts.
 */
describe('lib/sectors-server — fallback en environnement test', () => {
  it('retombe sur FALLBACK_SECTORS quand Payload est indisponible', async () => {
    const sectors = await getPublishedSectors();
    expect(sectors).toEqual(FALLBACK_SECTORS);
  });

  it('retourne les 5 secteurs avec un iconKey valide (string)', async () => {
    const sectors = await getPublishedSectors();
    expect(sectors).toHaveLength(5);
    for (const s of sectors) {
      expect(typeof s.iconKey).toBe('string');
      expect(s.iconKey.length).toBeGreaterThan(0);
    }
  });

  it('getSectorBySlug renvoie le secteur du fallback', async () => {
    const sector = await getSectorBySlug('sante');
    expect(sector).not.toBeNull();
    expect(sector?.name).toBe('Santé');
  });

  it('getSectorBySlug renvoie null pour un slug inconnu', async () => {
    const sector = await getSectorBySlug('inexistant');
    expect(sector).toBeNull();
  });
});
