import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuizAnswers } from '@/lib/audit-ia/quiz';

/**
 * Orchestration de la génération : Lucie si elle répond, squelette
 * sinon. Un rapport est créé dans les deux cas, la raison de l'échec
 * est tracée en base pour que le relecteur sache qu'il doit rédiger.
 */

const createDraftReport = vi.fn(async () => '7');
vi.mock('@/lib/audit-report/store-server', () => ({ createDraftReport }));

const generateWithLucie = vi.fn();
vi.mock('@/lib/audit-report/lucie', () => ({ generateWithLucie }));

const { runGeneration } = await import('@/lib/audit-report/jobs');

const input = {
  leadId: '18',
  organization: 'EXPERTISE IA',
  jobTitle: 'CTO',
  answers: { maturity: 'decouverte', sector: 'agro-industrie' } as QuizAnswers,
};

describe('runGeneration', () => {
  beforeEach(() => {
    createDraftReport.mockClear();
    generateWithLucie.mockReset();
  });

  it('utilise le texte de Lucie quand elle répond', async () => {
    generateWithLucie.mockResolvedValueOnce({
      title: 'T',
      synthesis: 'S',
      situation: 'Si',
      recommendation: 'R',
      roadmap: [{ title: 'a', horizon: 'b', body: 'c' }],
      nextSteps: 'N',
    });

    const out = await runGeneration(input);

    expect(out.generatedBy).toBe('lucie-7b');
    expect(createDraftReport).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedBy: 'lucie-7b',
        generationError: undefined,
        title: 'T',
      }),
    );
  });

  it('bascule sur le squelette quand Lucie échoue, et trace la raison', async () => {
    generateWithLucie.mockResolvedValueOnce(null);

    const out = await runGeneration(input);

    expect(out.generatedBy).toBe('squelette');
    expect(createDraftReport).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedBy: 'squelette',
        generationError: expect.stringContaining('indisponible'),
      }),
    );
  });

  it('crée un rapport dans les deux cas', async () => {
    generateWithLucie.mockResolvedValueOnce(null);
    expect((await runGeneration(input)).reportId).toBe('7');
  });

  it('remonte l’absence de rapport quand la persistance échoue', async () => {
    generateWithLucie.mockResolvedValueOnce(null);
    createDraftReport.mockResolvedValueOnce(null as unknown as string);
    expect((await runGeneration(input)).reportId).toBeNull();
  });
});
