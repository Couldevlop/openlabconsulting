import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests `lib/claude` quand le SDK Anthropic est disponible (clé +
 * import OK). Le SDK est mocké pour répondre selon le scénario.
 *
 * NB : on doit resetModules() entre chaque test pour vider le client
 * caché dans le module (`cachedClient`).
 */
describe('lib/claude — chemin Anthropic disponible', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    vi.resetModules();
    process.env.ANTHROPIC_API_KEY = 'sk-test-key';
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalKey;
    }
    vi.doUnmock('@anthropic-ai/sdk');
  });

  it('scoreLead utilise la réponse Claude JSON valide', async () => {
    vi.doMock('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [
              { type: 'text', text: '{"score":85,"summary":"Lead pro CTO"}' },
            ],
          }),
        };
      },
    }));
    const { scoreLead } = await import('@/lib/claude');
    const res = await scoreLead({
      source: 'audit-ia',
      name: 'A',
      email: 'a@x.fr',
    });
    expect(res.score).toBe(85);
    expect(res.summary).toBe('Lead pro CTO');
  });

  it('scoreLead retombe sur l’heuristique si JSON Claude invalide', async () => {
    vi.doMock('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'pas du json' }],
          }),
        };
      },
    }));
    const { scoreLead } = await import('@/lib/claude');
    const res = await scoreLead({
      source: 'contact',
      name: 'A',
      email: 'a@x.fr',
    });
    // L'heuristique retourne un score numérique borné.
    expect(typeof res.score).toBe('number');
    expect(res.score).toBeGreaterThanOrEqual(0);
    expect(res.score).toBeLessThanOrEqual(100);
  });

  it('scoreLead retombe sur l’heuristique si Claude throw', async () => {
    vi.doMock('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: vi.fn().mockRejectedValue(new Error('Anthropic down')),
        };
      },
    }));
    const { scoreLead } = await import('@/lib/claude');
    const res = await scoreLead({
      source: 'contact',
      name: 'A',
      email: 'a@x.fr',
    });
    expect(res.score).toBeGreaterThanOrEqual(0);
    expect(typeof res.summary).toBe('string');
  });

  it('scoreLead clamp et arrondit le score (out of range)', async () => {
    vi.doMock('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: '{"score":250.7,"summary":"hi"}' }],
          }),
        };
      },
    }));
    const { scoreLead } = await import('@/lib/claude');
    const res = await scoreLead({
      source: 'contact',
      name: 'A',
      email: 'a@x.fr',
    });
    expect(res.score).toBe(100);
  });

  it('scoreLead tolère les balises ```json autour de la réponse', async () => {
    vi.doMock('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: '```json\n{"score":42,"summary":"OK"}\n```',
              },
            ],
          }),
        };
      },
    }));
    const { scoreLead } = await import('@/lib/claude');
    const res = await scoreLead({
      source: 'contact',
      name: 'A',
      email: 'a@x.fr',
    });
    expect(res.score).toBe(42);
  });

  it('summarizeArticle renvoie 3 bullets quand Claude répond', async () => {
    vi.doMock('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: '{"bullets":["Un","Deux","Trois","Quatre"]}',
              },
            ],
          }),
        };
      },
    }));
    const { summarizeArticle } = await import('@/lib/claude');
    const res = await summarizeArticle('contenu');
    expect(res).toEqual(['Un', 'Deux', 'Trois']);
  });

  it('summarizeArticle renvoie [] si JSON invalide', async () => {
    vi.doMock('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'pas du json' }],
          }),
        };
      },
    }));
    const { summarizeArticle } = await import('@/lib/claude');
    const res = await summarizeArticle('contenu');
    expect(res).toEqual([]);
  });

  it('detectSpam renvoie isSpam=true quand Claude le détecte', async () => {
    vi.doMock('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: '{"isSpam":true,"reason":"texte promotionnel"}',
              },
            ],
          }),
        };
      },
    }));
    const { detectSpam } = await import('@/lib/claude');
    const res = await detectSpam('Achetez nos formations !');
    expect(res.isSpam).toBe(true);
    expect(res.reason).toContain('promotionnel');
  });

  it('detectSpam renvoie isSpam=false si format Claude invalide', async () => {
    vi.doMock('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: '{"foo":"bar"}' }],
          }),
        };
      },
    }));
    const { detectSpam } = await import('@/lib/claude');
    const res = await detectSpam('Bonjour');
    expect(res.isSpam).toBe(false);
  });

  it('getClient retombe en fallback si import @anthropic-ai/sdk throw', async () => {
    vi.doMock('@anthropic-ai/sdk', () => {
      throw new Error('module cassé');
    });
    const { scoreLead } = await import('@/lib/claude');
    // fallback heuristique.
    const res = await scoreLead({
      source: 'contact',
      name: 'A',
      email: 'a@x.fr',
    });
    expect(res.summary).toContain('heuristique');
  });
});
