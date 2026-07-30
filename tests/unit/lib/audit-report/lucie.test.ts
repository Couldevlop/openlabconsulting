import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateWithLucie } from '@/lib/audit-report/lucie';
import type { AuditReportInput } from '@/lib/audit-report/types';

/**
 * Client Ollama vers Lucie-7B : contrat fail-soft. Toute anomalie renvoie
 * `null` pour laisser l'appelant basculer sur le squelette, jamais une
 * exception qui remonterait dans la file de tâches.
 */

const input: AuditReportInput = {
  organization: 'Banque X',
  jobTitle: 'DSI',
  answers: { maturity: 'pilote', sector: 'banque-assurance' },
};

function mockOllama(body: unknown, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );
}

describe('generateWithLucie', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('transforme une réponse conforme en sections', async () => {
    mockOllama({
      response: JSON.stringify({
        title: 'Audit IA : Banque X',
        synthesis: 'Synthèse suffisamment longue pour être utile au lecteur.',
        situation: 'Situation décrite.',
        recommendation: 'Recommandation détaillée.',
        roadmap: [
          { title: 'Cadrage', horizon: 'S1 à S2', body: 'Entretiens.' },
        ],
        nextSteps: 'Prise de contact sous 24 h ouvrées.',
      }),
    });
    const out = await generateWithLucie(input);
    expect(out?.title).toBe('Audit IA : Banque X');
    expect(out?.roadmap[0]?.horizon).toBe('S1 à S2');
  });

  it('tolère un JSON entouré de balises markdown', async () => {
    mockOllama({
      response:
        '```json\n{"title":"T","synthesis":"S","situation":"Si","recommendation":"R","roadmap":[{"title":"a","horizon":"b","body":"c"}],"nextSteps":"N"}\n```',
    });
    expect((await generateWithLucie(input))?.title).toBe('T');
  });

  it('écarte les étapes de feuille de route incomplètes', async () => {
    mockOllama({
      response: JSON.stringify({
        title: 'T',
        synthesis: 'S',
        situation: 'Si',
        recommendation: 'R',
        roadmap: [
          { title: 'a', horizon: 'b', body: 'c' },
          { title: 'incomplète' },
        ],
        nextSteps: 'N',
      }),
    });
    expect((await generateWithLucie(input))?.roadmap).toHaveLength(1);
  });

  it('renvoie null si la feuille de route est vide', async () => {
    mockOllama({
      response: JSON.stringify({
        title: 'T',
        synthesis: 'S',
        situation: 'Si',
        recommendation: 'R',
        roadmap: [],
        nextSteps: 'N',
      }),
    });
    expect(await generateWithLucie(input)).toBeNull();
  });

  it('renvoie null si la réponse n’est pas exploitable', async () => {
    mockOllama({ response: 'Bonjour, voici mon rapport en texte libre.' });
    expect(await generateWithLucie(input)).toBeNull();
  });

  it('renvoie null sur erreur HTTP', async () => {
    mockOllama({ error: 'model not found' }, 404);
    expect(await generateWithLucie(input)).toBeNull();
  });

  it('renvoie null si le service est injoignable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    expect(await generateWithLucie(input)).toBeNull();
  });

  it('remplace les tirets cadratins produits par le modèle', async () => {
    mockOllama({
      response: JSON.stringify({
        title: 'Audit IA — Banque X',
        synthesis: 'Une lecture — franche — de votre situation.',
        situation: 'Si',
        recommendation: 'R',
        roadmap: [{ title: 'Cadrage — initial', horizon: 'S1', body: 'c' }],
        nextSteps: 'N',
      }),
    });
    const out = await generateWithLucie(input);
    expect(JSON.stringify(out)).not.toContain('—');
    expect(out?.title).toBe('Audit IA, Banque X');
  });

  it('borne les champs de la feuille de route et écarte les propriétés inventées', async () => {
    mockOllama({
      response: JSON.stringify({
        title: 'T',
        synthesis: 'S',
        situation: 'Si',
        recommendation: 'R',
        roadmap: [
          {
            title: 'x'.repeat(300),
            horizon: 'y'.repeat(200),
            body: 'z'.repeat(3000),
            budget: '10 000 000 FCFA',
          },
        ],
        nextSteps: 'N',
      }),
    });
    const step = (await generateWithLucie(input))?.roadmap[0];
    expect(step?.title).toHaveLength(120);
    expect(step?.horizon).toHaveLength(60);
    expect(step?.body).toHaveLength(1500);
    expect(step).not.toHaveProperty('budget');
  });

  it('n’envoie aucune donnée nominative au modèle', async () => {
    const spy = vi.fn(
      async (_url: string, _init: RequestInit) =>
        new Response(JSON.stringify({ response: '{}' })),
    );
    vi.stubGlobal('fetch', spy);
    await generateWithLucie({
      ...input,
      answers: { ...input.answers, challenge: 'Rapprochement trop lent.' },
    });
    const body = String(spy.mock.calls[0]?.[1].body);
    expect(body).not.toContain('@');
    expect(body).toContain('Rapprochement trop lent.');
  });
});
