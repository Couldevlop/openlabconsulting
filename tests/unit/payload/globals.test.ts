import { describe, it, expect } from 'vitest';
import { MethodologieSettings } from '@/globals/MethodologieSettings';

/**
 * Tests sur la structure des Globals Payload — sans instancier Payload
 * (qui requiert une connexion Postgres). On vérifie que les configs sont
 * syntaxiquement valides et que les champs critiques sont présents.
 *
 * Miroir des tests collections (tests/unit/payload/collections.test.ts).
 */
describe('Payload globals', () => {
  describe('MethodologieSettings', () => {
    it('a le slug "methodologie"', () => {
      expect(MethodologieSettings.slug).toBe('methodologie');
    });

    it('expose une lecture publique (contenu marketing affiché côté site)', () => {
      const read = MethodologieSettings.access?.read as
        | (() => boolean)
        | undefined;
      expect(read?.()).toBe(true);
    });

    it('réserve l’écriture à SUPER_ADMIN / ADMIN / EDITOR_CHIEF / EDITOR (§11.3)', () => {
      const update = MethodologieSettings.access?.update as (args: {
        req: { user: { role?: string } | null };
      }) => boolean;
      expect(update({ req: { user: { role: 'SUPER_ADMIN' } } })).toBe(true);
      expect(update({ req: { user: { role: 'ADMIN' } } })).toBe(true);
      expect(update({ req: { user: { role: 'EDITOR_CHIEF' } } })).toBe(true);
      expect(update({ req: { user: { role: 'EDITOR' } } })).toBe(true);
      expect(update({ req: { user: { role: 'AUTHOR' } } })).toBe(false);
      expect(update({ req: { user: { role: 'VIEWER' } } })).toBe(false);
      expect(update({ req: { user: null } })).toBe(false);
    });

    it('a les champs critiques (eyebrow, titleLead, titleHighlight, intro, axes, cta)', () => {
      const fieldNames = (MethodologieSettings.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      for (const required of [
        'eyebrow',
        'titleLead',
        'titleHighlight',
        'intro',
        'axes',
        'cta',
      ]) {
        expect(fieldNames).toContain(required);
      }
    });

    it('contraint le tableau axes à exactement 3 entrées', () => {
      const axes = (MethodologieSettings.fields ?? []).find(
        (f) => 'name' in f && f.name === 'axes',
      );
      expect(axes).toBeDefined();
      expect((axes as { type?: string }).type).toBe('array');
      expect((axes as { minRows?: number }).minRows).toBe(3);
      expect((axes as { maxRows?: number }).maxRows).toBe(3);
    });

    it('chaque axe expose index, title, punchline, body', () => {
      const axes = (MethodologieSettings.fields ?? []).find(
        (f) => 'name' in f && f.name === 'axes',
      );
      const subFields = (axes as { fields?: { name?: string }[] }).fields ?? [];
      const subNames = subFields.flatMap((f) => (f.name ? [f.name] : []));
      expect(subNames).toEqual(
        expect.arrayContaining(['index', 'title', 'punchline', 'body']),
      );
    });
  });
});
