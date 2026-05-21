import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scoreLead, detectSpam, summarizeArticle } from '@/lib/claude';

describe('lib/claude — fallback heuristic (no API key)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('scoreLead heuristic', () => {
    it('attribue un score plus élevé pour email pro + organization', async () => {
      const pro = await scoreLead({
        source: 'audit-ia',
        name: 'Debora Ahouma',
        email: 'debora@openlabconsulting.com',
        organization: 'OpenLab Consulting',
        jobTitle: 'CEO',
        message:
          'Audit complet sur la mise en place d’une équipe IA interne pour la banque centrale UEMOA.',
      });
      const grandPublic = await scoreLead({
        source: 'contact',
        name: 'Test',
        email: 'test@gmail.com',
      });
      expect(pro.score).toBeGreaterThan(grandPublic.score);
    });

    it('plafonne le score à 100', async () => {
      const r = await scoreLead({
        source: 'audit-ia',
        name: 'X',
        email: 'x@enterprise.fr',
        organization: 'BNP Paribas',
        jobTitle: 'Director',
        message: 'Long message '.repeat(50),
      });
      expect(r.score).toBeLessThanOrEqual(100);
    });

    it('renvoie un summary par défaut', async () => {
      const r = await scoreLead({
        source: 'contact',
        name: 'X',
        email: 'x@y.fr',
      });
      expect(r.summary.length).toBeGreaterThan(0);
    });
  });

  describe('detectSpam heuristic', () => {
    it('détecte trop de liens', async () => {
      const text =
        'https://a.com https://b.com https://c.com https://d.com https://e.com https://f.com';
      const r = await detectSpam(text);
      expect(r.isSpam).toBe(true);
      expect(r.reason).toContain('liens');
    });

    it('ne flag pas un message normal en mode dev', async () => {
      const r = await detectSpam(
        'Bonjour, je souhaite un audit IA pour ma PME.',
      );
      expect(r.isSpam).toBe(false);
    });
  });

  describe('summarizeArticle', () => {
    it('renvoie un message de fallback sans clé', async () => {
      const r = await summarizeArticle('Contenu article…');
      expect(Array.isArray(r)).toBe(true);
      expect(r.length).toBeGreaterThan(0);
    });
  });
});
