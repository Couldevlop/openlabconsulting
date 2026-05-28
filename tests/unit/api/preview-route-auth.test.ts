import { describe, it, expect, vi } from 'vitest';

/**
 * Chemin authentifié de /api/preview : on surcharge les modules Payload
 * (normalement stubbés pour throw) afin de simuler un utilisateur connecté
 * et vérifier l'activation du draft mode + la redirection front.
 */
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error('REDIRECT:' + url);
  }),
}));

const enable = vi.fn();
vi.mock('next/headers', () => ({
  headers: async () => new Headers(),
  cookies: async () => new Map(),
  draftMode: async () => ({ isEnabled: false, enable, disable: vi.fn() }),
}));

vi.mock('payload', () => ({
  getPayload: async () => ({
    auth: async () => ({ user: { id: 1, email: 'admin@openlab.ci' } }),
  }),
}));

vi.mock('@payload-config', () => ({ default: {} }));

import { GET as previewGET } from '@/app/api/preview/route';

describe('GET /api/preview — utilisateur authentifié', () => {
  it('active le draft mode et redirige vers la page front', async () => {
    await expect(
      previewGET(new Request('http://localhost/api/preview?slug=mon-article')),
    ).rejects.toThrow('REDIRECT:/insights/mon-article');
    expect(enable).toHaveBeenCalled();
  });
});
