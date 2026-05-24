import { describe, it, expect, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error('REDIRECT:' + url);
  }),
}));

import { GET as previewGET } from '@/app/api/preview/route';
import { GET as exitGET } from '@/app/api/preview/exit/route';

describe('GET /api/preview', () => {
  it('renvoie 400 si le slug est absent', async () => {
    const res = await previewGET(new Request('http://localhost/api/preview'));
    expect(res.status).toBe(400);
  });

  it('renvoie 400 si la collection est inconnue', async () => {
    const res = await previewGET(
      new Request('http://localhost/api/preview?slug=x&collection=foo'),
    );
    expect(res.status).toBe(400);
  });

  it('renvoie 401 si l’utilisateur n’est pas authentifié (Payload indisponible)', async () => {
    const res = await previewGET(
      new Request('http://localhost/api/preview?slug=x'),
    );
    expect(res.status).toBe(401);
  });
});

describe('GET /api/preview/exit', () => {
  it('désactive le draft mode et redirige vers /insights', async () => {
    await expect(exitGET()).rejects.toThrow('REDIRECT:/insights');
  });
});
