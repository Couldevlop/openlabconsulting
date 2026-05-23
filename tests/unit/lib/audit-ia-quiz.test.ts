import { describe, it, expect } from 'vitest';
import {
  QUESTIONS,
  getRecommendation,
  summarizeAnswers,
} from '@/lib/audit-ia/quiz';

describe('lib/audit-ia/quiz — questionnaire interactif (audit P2 §7 #14)', () => {
  it('expose exactement 5 questions séquentielles', () => {
    expect(QUESTIONS).toHaveLength(5);
  });

  it('chaque question a au moins 4 options avec value/label/hint', () => {
    for (const q of QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(4);
      for (const o of q.options) {
        expect(o.value).toBeTruthy();
        expect(o.label).toBeTruthy();
        expect(o.hint).toBeTruthy();
      }
    }
  });

  it('chaque question référence un id unique parmi maturity/sector/headcount/scope/urgency', () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      'maturity',
      'sector',
      'headcount',
      'scope',
      'urgency',
    ]);
  });

  describe('getRecommendation', () => {
    it('découverte + exploration → atelier demi-journée', () => {
      const rec = getRecommendation({
        maturity: 'decouverte',
        sector: 'banque-assurance',
        headcount: 'lt-50',
        scope: 'single-usecase',
        urgency: 'exploration',
      });
      expect(rec.format).toBe('atelier');
      expect(rec.title).toMatch(/Atelier/);
      expect(rec.duration).toMatch(/demi-journ/);
    });

    it('pilote + single-usecase + 3 months → audit éclair 5 jours', () => {
      const rec = getRecommendation({
        maturity: 'pilote',
        sector: 'banque-assurance',
        headcount: '50-200',
        scope: 'single-usecase',
        urgency: '3-months',
      });
      expect(rec.format).toBe('audit-eclair');
      expect(rec.duration).toMatch(/5 jours/);
    });

    it('production + single-dept + 6 months → audit éclair', () => {
      const rec = getRecommendation({
        maturity: 'production',
        sector: 'sante',
        headcount: '50-200',
        scope: 'single-dept',
        urgency: '6-months',
      });
      expect(rec.format).toBe('audit-eclair');
    });

    it('grande entreprise + multi-dept → programme stratégique 6-12 mois', () => {
      const rec = getRecommendation({
        maturity: 'production',
        sector: 'telecoms-energie',
        headcount: 'gt-1000',
        scope: 'multi-dept',
        urgency: '3-months',
      });
      expect(rec.format).toBe('programme');
      expect(rec.duration).toMatch(/6 à 12 mois/);
    });

    it('grande entreprise + enterprise scope → programme', () => {
      const rec = getRecommendation({
        maturity: 'industrialisation',
        sector: 'banque-assurance',
        headcount: '200-1000',
        scope: 'enterprise',
        urgency: 'no-deadline',
      });
      expect(rec.format).toBe('programme');
    });

    it('cas par défaut (PME pilote multi-dept 6 mois) → cadrage stratégique', () => {
      const rec = getRecommendation({
        maturity: 'pilote',
        sector: 'agro-industrie',
        headcount: '50-200',
        scope: 'multi-dept',
        urgency: '6-months',
      });
      expect(rec.format).toBe('cadrage');
      expect(rec.duration).toMatch(/semaines/);
    });

    it('cas par défaut (réponses vides) → cadrage stratégique', () => {
      const rec = getRecommendation({});
      expect(rec.format).toBe('cadrage');
    });

    it('chaque recommandation expose title, subtitle, body, duration, deliverable', () => {
      const rec = getRecommendation({
        maturity: 'decouverte',
        urgency: 'exploration',
      });
      expect(rec.title).toBeTruthy();
      expect(rec.subtitle).toBeTruthy();
      expect(rec.body.length).toBeGreaterThan(0);
      expect(rec.duration).toBeTruthy();
      expect(rec.deliverable).toBeTruthy();
    });
  });

  describe('summarizeAnswers', () => {
    it('produit un texte structuré listant les 5 réponses + recommandation', () => {
      const answers = {
        maturity: 'pilote' as const,
        sector: 'banque-assurance' as const,
        headcount: '50-200' as const,
        scope: 'single-usecase' as const,
        urgency: '3-months' as const,
      };
      const rec = getRecommendation(answers);
      const summary = summarizeAnswers(answers, rec);

      expect(summary).toMatch(/Recommandation issue du questionnaire/);
      expect(summary).toMatch(rec.title);
      expect(summary).toMatch(/Maturité IA :/);
      expect(summary).toMatch(/Secteur :/);
      expect(summary).toMatch(/Headcount :/);
      expect(summary).toMatch(/Périmètre souhaité :/);
      expect(summary).toMatch(/Délai de démarrage :/);
    });

    it('summarize avec réponses vides → met « ? » mais ne plante pas', () => {
      const summary = summarizeAnswers({}, getRecommendation({}));
      expect(summary).toMatch(/\?/);
    });
  });
});
