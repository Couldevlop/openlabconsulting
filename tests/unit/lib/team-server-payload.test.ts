import { describe, it, expect } from 'vitest';
import {
  getTeamMembers,
  getTeamMemberById,
  getSignaturePublications,
} from '@/lib/team-server';
import { FALLBACK_TEAM_MEMBERS, SIGNATURE_PUBLICATIONS } from '@/lib/data/team';

/**
 * Tests `lib/team-server` — le chemin "Payload OK + parsing" n'est pas
 * testable ici car l'alias Vite `@payload-config` throw avant que
 * `vi.doMock('payload')` ne puisse intervenir (couvert dans
 * team-server-success.test.ts qui mock statiquement les deux modules).
 *
 * On vérifie le fallback complet (Payload indisponible en environnement
 * test) sans régression. Aligné sur products-server-payload.test.ts.
 */
describe('lib/team-server — fallback en environnement test', () => {
  it('retombe sur FALLBACK_TEAM_MEMBERS quand Payload est indisponible', async () => {
    const members = await getTeamMembers();
    expect(members).toEqual(FALLBACK_TEAM_MEMBERS);
  });

  it('retombe sur SIGNATURE_PUBLICATIONS quand Payload est indisponible', async () => {
    const publications = await getSignaturePublications();
    expect(publications).toEqual(SIGNATURE_PUBLICATIONS);
  });

  it('getTeamMemberById renvoie le membre du fallback', async () => {
    const member = await getTeamMemberById('debora-ahouma');
    expect(member).not.toBeNull();
    expect(member?.name).toBe('Debora Ahouma');
  });

  it('getTeamMemberById renvoie null pour un id inconnu', async () => {
    const member = await getTeamMemberById('inexistant');
    expect(member).toBeNull();
  });
});
