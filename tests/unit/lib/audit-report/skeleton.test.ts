import { describe, expect, it } from 'vitest';
import { buildSkeletonReport } from '@/lib/audit-report/skeleton';
import type { QuizAnswers } from '@/lib/audit-ia/quiz';

/**
 * Squelette de repli : produit un rapport complet sans réseau ni base,
 * pour que le consultant ait toujours un document à corriger même quand
 * la génération par le modèle échoue.
 */

const answers: QuizAnswers = {
  maturity: 'pilote',
  sector: 'banque-assurance',
  headcount: '200-1000',
  scope: 'single-dept',
  urgency: '3-months',
};

describe('buildSkeletonReport', () => {
  it('remplit toutes les sections sans réseau', () => {
    const r = buildSkeletonReport({
      organization: 'Banque X',
      jobTitle: 'DSI',
      answers,
    });
    expect(r.title).toContain('Banque X');
    expect(r.synthesis.length).toBeGreaterThan(80);
    expect(r.situation).toContain('Banque & assurance');
    expect(r.recommendation).toContain('Audit IA éclair');
    expect(r.roadmap.length).toBeGreaterThanOrEqual(3);
    expect(r.roadmap.every((s) => s.title && s.horizon && s.body)).toBe(true);
    expect(r.nextSteps).toContain('24 h');
  });

  it('reprend le problème décrit quand il est fourni', () => {
    const r = buildSkeletonReport({
      organization: 'Banque X',
      jobTitle: 'DSI',
      answers: {
        ...answers,
        challenge: 'Le rapprochement bancaire prend 4 jours.',
      },
    });
    expect(r.situation).toContain('rapprochement bancaire');
  });

  it('reste complet même sans aucune réponse', () => {
    const r = buildSkeletonReport({
      organization: 'Inconnue',
      jobTitle: '',
      answers: {},
    });
    expect(r.roadmap.length).toBeGreaterThanOrEqual(3);
    expect(r.synthesis).not.toContain('undefined');
    expect(r.situation).not.toContain('undefined');
  });

  it('remplace une organisation vide par une formule neutre', () => {
    const r = buildSkeletonReport({
      organization: '   ',
      jobTitle: 'DSI',
      answers,
    });
    expect(r.title).toContain('votre organisation');
  });

  it('ne contient aucun tiret cadratin', () => {
    const r = buildSkeletonReport({
      organization: 'Banque X',
      jobTitle: 'DSI',
      answers,
    });
    expect(JSON.stringify(r)).not.toContain('—');
  });
});
