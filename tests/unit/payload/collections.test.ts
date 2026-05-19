import { describe, it, expect } from 'vitest';
import { Articles } from '@/collections/Articles';
import { Media } from '@/collections/Media';
import { Users } from '@/collections/Users';
import { Whitepapers } from '@/collections/Whitepapers';

/**
 * Tests sur la structure des collections Payload — sans instancier
 * Payload (qui requiert une connexion Postgres). On vérifie que les
 * configs sont syntaxiquement valides et que les champs critiques
 * sont présents.
 */
describe('Payload collections', () => {
  describe('Articles', () => {
    it('a le slug "articles"', () => {
      expect(Articles.slug).toBe('articles');
    });

    it('a versions drafts activé', () => {
      expect(Articles.versions).toEqual(
        expect.objectContaining({ drafts: true }),
      );
    });

    it('a les champs critiques (title, slug, content, status, publishedAt)', () => {
      const fieldNames = (Articles.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      for (const required of [
        'title',
        'slug',
        'excerpt',
        'content',
        'category',
        'status',
        'publishedAt',
      ]) {
        expect(fieldNames).toContain(required);
      }
    });

    it('catégories alignées sur les insights de la homepage', () => {
      const categoryField = (Articles.fields ?? []).find(
        (f) => 'name' in f && f.name === 'category',
      );
      expect(categoryField).toBeDefined();
      const options = (categoryField as { options?: { value: string }[] })
        .options;
      const values = options?.map((o) => o.value) ?? [];
      // Doit inclure au moins les catégories utilisées en placeholder insights.
      expect(values).toEqual(
        expect.arrayContaining([
          'souverainete',
          'conformite-rh',
          'cybersecurite',
        ]),
      );
    });
  });

  describe('Whitepapers', () => {
    it('a le slug "whitepapers"', () => {
      expect(Whitepapers.slug).toBe('whitepapers');
    });

    it('a un champ gatingRequired (défaut true)', () => {
      const field = (Whitepapers.fields ?? []).find(
        (f) => 'name' in f && f.name === 'gatingRequired',
      );
      expect(field).toBeDefined();
      expect((field as { defaultValue?: boolean }).defaultValue).toBe(true);
    });

    it('a un compteur downloads readOnly', () => {
      const downloads = (Whitepapers.fields ?? []).find(
        (f) => 'name' in f && f.name === 'downloads',
      );
      expect(downloads).toBeDefined();
      expect(
        (downloads as { admin?: { readOnly?: boolean } }).admin?.readOnly,
      ).toBe(true);
    });
  });

  describe('Media', () => {
    it('a le slug "media"', () => {
      expect(Media.slug).toBe('media');
    });

    it('exige le champ alt (a11y WCAG)', () => {
      const alt = (Media.fields ?? []).find(
        (f) => 'name' in f && f.name === 'alt',
      );
      expect(alt).toBeDefined();
      expect((alt as { required?: boolean }).required).toBe(true);
    });

    it('génère 3 variantes d’image (thumbnail, card, cover)', () => {
      const sizes = (Media.upload as { imageSizes?: { name: string }[] })
        .imageSizes;
      expect(sizes).toBeDefined();
      const names = sizes?.map((s) => s.name) ?? [];
      expect(names).toEqual(
        expect.arrayContaining(['thumbnail', 'card', 'cover']),
      );
    });
  });

  describe('Users', () => {
    it('a le slug "users" et auth activé', () => {
      expect(Users.slug).toBe('users');
      expect(Users.auth).toBeTruthy();
    });

    it('a 6 rôles documentés CLAUDE.md §11.3', () => {
      const roleField = (Users.fields ?? []).find(
        (f) => 'name' in f && f.name === 'role',
      );
      expect(roleField).toBeDefined();
      const options = (roleField as { options?: { value: string }[] }).options;
      expect(options).toHaveLength(6);
      expect(options?.map((o) => o.value).sort()).toEqual(
        [
          'super-admin',
          'admin',
          'editor-chief',
          'editor',
          'author',
          'viewer',
        ].sort(),
      );
    });

    it('session 8 h absolu + lockout 30 min après 10 échecs', () => {
      const auth = Users.auth as {
        tokenExpiration?: number;
        maxLoginAttempts?: number;
        lockTime?: number;
      };
      expect(auth.tokenExpiration).toBe(28800);
      expect(auth.maxLoginAttempts).toBe(10);
      expect(auth.lockTime).toBe(1800 * 1000);
    });
  });
});
