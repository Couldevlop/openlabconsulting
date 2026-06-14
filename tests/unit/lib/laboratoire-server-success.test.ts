import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Couvre le chemin « Payload disponible » de lib/laboratoire-server :
 * mappers toRdAxe / toPublication (slug + abstract) / toPartenariat,
 * normalement non exercés (les tests retombent sur le fallback).
 * Aligné sur expertises-server-success.test.ts (mockResolvedValue).
 */
const findMock = vi.fn();

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ find: findMock }),
}));

import {
  getRdAxes,
  getPublications,
  getPartnerships,
  getPublicationBySlug,
} from '@/lib/laboratoire-server';

beforeEach(() => {
  findMock.mockReset();
});

describe('lib/laboratoire-server — mappers (Payload disponible)', () => {
  it('getRdAxes mappe + filtre les axes invalides', async () => {
    findMock.mockResolvedValue({
      docs: [
        {
          slug: 'axe-cms',
          title: 'Axe depuis le CMS',
          pitch: 'Pitch axe.',
          produitsLies: [{ value: 'NexusRH CI' }, { value: '' }],
          exemples: [{ value: 'Exemple 1' }],
        },
        { slug: 'invalide' }, // filtré (title/pitch manquants)
      ],
    });
    const axes = await getRdAxes();
    expect(axes).toHaveLength(1);
    expect(axes[0]?.slug).toBe('axe-cms');
    expect(axes[0]?.produitsLies).toEqual(['NexusRH CI']); // valeur vide filtrée
    expect(axes[0]?.exemples).toEqual(['Exemple 1']);
  });

  it('getPublications mappe slug + abstract ; getPublicationBySlug retrouve', async () => {
    findMock.mockResolvedValue({
      docs: [
        {
          type: 'livre-blanc',
          title: 'Publication CMS',
          authors: [{ value: 'Équipe OpenLab' }],
          year: 2026,
          href: '/x',
          summary: 'Résumé.',
          slug: 'pub-cms',
          abstract: 'Abstract long depuis le CMS.',
        },
      ],
    });
    const pubs = await getPublications();
    expect(pubs[0]?.slug).toBe('pub-cms');
    expect(pubs[0]?.abstract).toBe('Abstract long depuis le CMS.');
    const found = await getPublicationBySlug('pub-cms');
    expect(found?.title).toBe('Publication CMS');
  });

  it('getPartnerships mappe le type', async () => {
    findMock.mockResolvedValue({
      docs: [
        {
          slug: 'part-cms',
          title: 'Partenaire CMS',
          type: 'universitaire',
          pitch: 'Pitch partenaire.',
        },
      ],
    });
    const parts = await getPartnerships();
    expect(parts[0]?.type).toBe('universitaire');
    expect(parts[0]?.slug).toBe('part-cms');
  });
});
