import { describe, it, expect } from 'vitest';
import { persistLead } from '@/lib/leads';

/**
 * Tests `lib/leads.persistLead` — en environnement de test, le stub
 * `@payload-config` throw immédiatement (cf. vitest.config.ts) donc
 * tout chemin Payload tombe sur le catch silencieux. On vérifie
 * uniquement que persistLead reste fail-soft dans toutes les
 * conditions (no-throw).
 *
 * Le chemin "Payload disponible + create OK" ne peut être testé en
 * unitaire car l'alias Vite redirige `@payload-config` vers un stub
 * qui throw avant que `vi.doMock('payload')` ne puisse prendre effet.
 * Couvert par les tests d'intégration P6 avec DB éphémère.
 */
describe('lib/leads — persistLead (fail-soft)', () => {
  it('ne throw pas si Payload est indisponible', async () => {
    await expect(
      persistLead({
        source: 'contact',
        name: 'X',
        email: 'x@y.fr',
      }),
    ).resolves.toBeUndefined();
  });

  it('accepte tous les champs optionnels sans throw', async () => {
    await expect(
      persistLead({
        source: 'audit-ia',
        name: 'Debora',
        email: 'd@openlab.ci',
        organization: 'OpenLab',
        jobTitle: 'CEO',
        message: 'Audit IA',
        phone: '+225 07 09 33 42 38',
        subject: 'audit-ia',
        ipAddress: '192.0.2.1',
        userAgent: 'TestAgent/1.0',
        consentRgpd: true,
        metadata: { utm: 'test' },
      }),
    ).resolves.toBeUndefined();
  });
});
