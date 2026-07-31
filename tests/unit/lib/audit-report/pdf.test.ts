import { describe, expect, it } from 'vitest';
import { renderReportPdf } from '@/lib/audit-report/pdf';
import type { AuditReportSections } from '@/lib/audit-report/types';

/**
 * Rendu PDF : on vérifie qu'un document valide sort du moteur et que le
 * contenu des sections y est réellement présent. Le PDF part chez un
 * prospect, un document tronqué ou vide serait pire qu'aucun envoi.
 */

const sections: AuditReportSections = {
  title: 'Audit IA : Banque X',
  synthesis: 'Synthèse du rapport.',
  situation: 'Situation constatée.',
  recommendation: 'Recommandation retenue.',
  roadmap: [
    { title: 'Cadrage', horizon: 'Semaines 1 à 2', body: 'Entretiens.' },
  ],
  nextSteps: 'Contact sous 24 h ouvrées.',
};

describe('renderReportPdf', () => {
  it(
    'produit un PDF valide et non vide',
    async () => {
      const buf = await renderReportPdf({
        sections,
        organization: 'Banque X',
        generatedOn: new Date('2026-07-30T10:00:00Z'),
      });

      expect(buf.subarray(0, 5).toString()).toBe('%PDF-');
      expect(buf.length).toBeGreaterThan(2000);
    },
    { timeout: 60_000 },
  );

  it(
    'grossit avec le contenu, signe que les sections sont bien rendues',
    async () => {
      const court = await renderReportPdf({
        sections,
        organization: 'Banque X',
        generatedOn: new Date('2026-07-30T10:00:00Z'),
      });
      const long = await renderReportPdf({
        sections: {
          ...sections,
          situation: 'Une situation détaillée. '.repeat(200),
          roadmap: Array.from({ length: 5 }, (_, i) => ({
            title: `Étape ${i + 1}`,
            horizon: `Mois ${i + 1}`,
            body: 'Contenu substantiel de cette étape. '.repeat(30),
          })),
        },
        organization: 'Banque X',
        generatedOn: new Date('2026-07-30T10:00:00Z'),
      });

      expect(long.length).toBeGreaterThan(court.length);
    },
    { timeout: 60_000 },
  );
});
