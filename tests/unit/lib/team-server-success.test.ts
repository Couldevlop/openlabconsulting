import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Couvre le chemin « Payload disponible » de lib/team-server
 * (mapping toTeamMember / toTeamPublication + validations + relativisation
 * de l'URL média), en surchargeant les modules `payload` et `@payload-config`
 * normalement stubbés pour throw. Aligné sur products-server-success.test.ts.
 */
const findMock = vi.fn();

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ find: findMock }),
}));

import {
  getTeamMembers,
  getTeamMemberById,
  getSignaturePublications,
} from '@/lib/team-server';
import { FALLBACK_TEAM_MEMBERS, SIGNATURE_PUBLICATIONS } from '@/lib/data/team';

function rawMember(overrides: Record<string, unknown> = {}) {
  return {
    id: 'm-1',
    memberId: 'debora-ahouma',
    name: 'Debora Ahouma (CMS)',
    jobTitle: 'CEO & Fondatrice',
    shortBio: 'Bio courte depuis Payload.',
    bio: [{ value: 'Paragraphe A.' }, { value: 'Paragraphe B.' }],
    image: {
      url: 'http://localhost:3000/api/media/file/debora.jpg',
    },
    quote: 'Citation signature depuis Payload.',
    focusAreas: [{ value: 'IA appliquée' }, { value: 'MLOps' }],
    sameAs: [{ value: 'https://www.linkedin.com/company/openlab-consulting' }],
    ...overrides,
  };
}

function rawPublication(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pub-1',
    pubType: 'Livre',
    title: 'Un titre depuis Payload',
    year: 2026,
    description: 'Description depuis la base de données.',
    href: '/livre',
    ...overrides,
  };
}

beforeEach(() => {
  findMock.mockReset();
});

describe('getTeamMembers — Payload disponible', () => {
  it('mappe les documents publiés (toTeamMember)', async () => {
    findMock.mockResolvedValue({ docs: [rawMember()] });
    const members = await getTeamMembers();
    expect(members[0]?.id).toBe('debora-ahouma');
    expect(members[0]?.name).toBe('Debora Ahouma (CMS)');
    expect(members[0]?.bio).toEqual(['Paragraphe A.', 'Paragraphe B.']);
    expect(members[0]?.focusAreas).toEqual(['IA appliquée', 'MLOps']);
    expect(members[0]?.sameAs).toEqual([
      'https://www.linkedin.com/company/openlab-consulting',
    ]);
  });

  it('relativise l’URL média du portrait (toRelativeMediaUrl)', async () => {
    findMock.mockResolvedValue({ docs: [rawMember()] });
    const members = await getTeamMembers();
    expect(members[0]?.imagePath).toBe('/api/media/file/debora.jpg');
  });

  it('conserve l’imagePath du fallback si aucune image n’est rattachée', async () => {
    findMock.mockResolvedValue({ docs: [rawMember({ image: null })] });
    const members = await getTeamMembers();
    // `debora-ahouma` existe dans le fallback → on récupère son imagePath.
    expect(members[0]?.imagePath).toBe('/team/debora-ahouma.jpg');
  });

  it('retombe sur le fallback si la collection est vide', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const members = await getTeamMembers();
    expect(members).toEqual(FALLBACK_TEAM_MEMBERS);
  });

  it('ignore les documents invalides (name manquant) → fallback si plus aucun valide', async () => {
    findMock.mockResolvedValue({ docs: [rawMember({ name: 123 })] });
    const members = await getTeamMembers();
    expect(members).toEqual(FALLBACK_TEAM_MEMBERS);
  });
});

describe('getTeamMemberById — Payload disponible', () => {
  it('mappe le membre trouvé et filtre par memberId', async () => {
    findMock.mockResolvedValue({ docs: [rawMember()] });
    const member = await getTeamMemberById('debora-ahouma');
    expect(member?.id).toBe('debora-ahouma');
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'teamMembers', limit: 1 }),
    );
  });

  it('retombe sur le fallback réel si aucun document', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const member = await getTeamMemberById('debora-ahouma');
    expect(member?.name).toBe('Debora Ahouma');
  });
});

describe('getSignaturePublications — Payload disponible', () => {
  it('mappe les publications publiées (toTeamPublication)', async () => {
    findMock.mockResolvedValue({ docs: [rawPublication()] });
    const publications = await getSignaturePublications();
    expect(publications[0]?.type).toBe('Livre');
    expect(publications[0]?.title).toBe('Un titre depuis Payload');
    expect(publications[0]?.year).toBe(2026);
    expect(publications[0]?.href).toBe('/livre');
  });

  it('retombe sur le fallback si la collection est vide', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const publications = await getSignaturePublications();
    expect(publications).toEqual(SIGNATURE_PUBLICATIONS);
  });

  it('ignore une publication invalide (type inconnu) → fallback si plus aucune valide', async () => {
    findMock.mockResolvedValue({
      docs: [rawPublication({ pubType: 'Tweet' })],
    });
    const publications = await getSignaturePublications();
    expect(publications).toEqual(SIGNATURE_PUBLICATIONS);
  });
});
