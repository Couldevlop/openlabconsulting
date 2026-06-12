import { describe, it, expect } from 'vitest';
import { Articles } from '@/collections/Articles';
import { CaseStudies } from '@/collections/CaseStudies';
import { Expertises } from '@/collections/Expertises';
import { Leads } from '@/collections/Leads';
import { Media } from '@/collections/Media';
import { Products } from '@/collections/Products';
import { Sectors } from '@/collections/Sectors';
import { TeamMembers } from '@/collections/TeamMembers';
import { TeamPublications } from '@/collections/TeamPublications';
import { Users } from '@/collections/Users';
import { Whitepapers } from '@/collections/Whitepapers';
import { ICON_KEYS } from '@/lib/icon-map';

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

    it('a les champs critiques (title, slug, content, summary, sources, publishedAt)', () => {
      // Le statut de publication n'est PAS un champ déclaré : il est fourni
      // par le versioning natif (`versions.drafts` → `_status`). On évite
      // ainsi la collision d'enum avec un champ `status` custom.
      const fieldNames = (Articles.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      for (const required of [
        'title',
        'slug',
        'excerpt',
        'content',
        'category',
        'summary',
        'sources',
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

  describe('CaseStudies', () => {
    it('a le slug "caseStudies"', () => {
      expect(CaseStudies.slug).toBe('caseStudies');
    });

    it('a versions drafts activé', () => {
      expect(CaseStudies.versions).toEqual(
        expect.objectContaining({ drafts: true }),
      );
    });

    it('a les champs critiques (headline, punchline, body, productSlug, results, image, order)', () => {
      // Le statut de publication n'est PAS un champ déclaré : il est fourni
      // par le versioning natif (`versions.drafts` → `_status`), comme pour
      // Articles. On évite ainsi le doublon avec un champ `status` custom.
      const fieldNames = (CaseStudies.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      for (const required of [
        'headline',
        'punchline',
        'body',
        'sector',
        'client',
        'productSlug',
        'results',
        'image',
        'order',
      ]) {
        expect(fieldNames).toContain(required);
      }
    });

    it('ne déclare pas de champ `status` custom (publication via `_status` natif)', () => {
      const fieldNames = (CaseStudies.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      expect(fieldNames).not.toContain('status');
    });

    it('productSlug expose les 8 produits OpenLab', () => {
      const field = (CaseStudies.fields ?? []).find(
        (f) => 'name' in f && f.name === 'productSlug',
      );
      const options = (field as { options?: { value: string }[] }).options;
      expect(options?.map((o) => o.value).sort()).toEqual(
        [
          'nexusrh',
          'nexuserp',
          'sygescom',
          'agrosense',
          'qualitos',
          'fraud-shield',
          'smart-city',
          'sentinelbtp',
        ].sort(),
      );
    });

    it('results contraint à exactement 3 entrées (CLAUDE.md §4.10)', () => {
      const field = (CaseStudies.fields ?? []).find(
        (f) => 'name' in f && f.name === 'results',
      );
      expect((field as { minRows?: number }).minRows).toBe(3);
      expect((field as { maxRows?: number }).maxRows).toBe(3);
    });
  });

  describe('Products', () => {
    it('a le slug "products"', () => {
      expect(Products.slug).toBe('products');
    });

    it('a versions drafts activé', () => {
      expect(Products.versions).toEqual(
        expect.objectContaining({ drafts: true }),
      );
    });

    it('useAsTitle = name', () => {
      expect(Products.admin?.useAsTitle).toBe('name');
    });

    it('access.read : anonyme → contrainte _status published (OWASP A01)', () => {
      const read = CaseStudies.access?.read;
      const productsRead = Products.access?.read as (args: {
        req: { user: unknown };
      }) => unknown;
      // Anonyme : retourne une contrainte Where sur le statut natif des drafts.
      expect(productsRead({ req: { user: null } })).toEqual({
        _status: { equals: 'published' },
      });
      // Sanity : aligné sur CaseStudies (même politique de lecture).
      expect(typeof read).toBe('function');
    });

    it('access.read : utilisateur authentifié → true', () => {
      const productsRead = Products.access?.read as (args: {
        req: { user: unknown };
      }) => unknown;
      expect(productsRead({ req: { user: { id: 'u1' } } })).toBe(true);
    });

    it('a les champs critiques (slug, name, tagline, target, status, iconKey, features, stack, proofs, pricing, faq, order)', () => {
      const fieldNames = (Products.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      for (const required of [
        'slug',
        'name',
        'tagline',
        'target',
        'maturity',
        'statusLabel',
        'eyebrow',
        'intro',
        'problem',
        'iconKey',
        'features',
        'stack',
        'proofs',
        'pricing',
        'faq',
        'expertisesLies',
        'order',
        'publishedAt',
      ]) {
        expect(fieldNames).toContain(required);
      }
    });

    it('slug est un texte libre kebab-case (unique) — nouveau produit créable depuis l’admin', () => {
      const field = (Products.fields ?? []).find(
        (f) => 'name' in f && f.name === 'slug',
      ) as
        | {
            type?: string;
            unique?: boolean;
            validate?: (value: unknown) => true | string;
          }
        | undefined;
      expect(field?.type).toBe('text');
      expect(field?.unique).toBe(true);
      const validate = field?.validate;
      expect(typeof validate).toBe('function');
      // Slugs valides : produits existants + nouveaux (ex. SentinelBTP).
      for (const ok of ['nexusrh', 'fraud-shield', 'sentinelbtp']) {
        expect(validate!(ok)).toBe(true);
      }
      // Slugs invalides : majuscules, espaces, accents, tirets pendants.
      for (const ko of [
        'SentinelBTP',
        'sentinel btp',
        'sentinel_btp',
        '-sentinel',
        'sentinel-',
        'a--b',
        '',
        42,
        null,
      ]) {
        expect(typeof validate!(ko)).toBe('string');
      }
    });

    it('iconKey est borné au registre ICON_KEYS', () => {
      const field = (Products.fields ?? []).find(
        (f) => 'name' in f && f.name === 'iconKey',
      );
      const options = (field as { options?: { value: string }[] }).options;
      expect(options?.map((o) => o.value).sort()).toEqual(
        [...ICON_KEYS].sort(),
      );
    });

    it('proofs exige une source (§4.10) sur chaque entrée', () => {
      const proofs = (Products.fields ?? []).find(
        (f) => 'name' in f && f.name === 'proofs',
      );
      const subFields = (
        proofs as { fields?: { name: string; required?: boolean }[] }
      ).fields;
      const source = subFields?.find((sf) => sf.name === 'source');
      expect(source).toBeDefined();
      expect(source?.required).toBe(true);
    });
  });

  describe('Expertises', () => {
    it('a le slug "expertises"', () => {
      expect(Expertises.slug).toBe('expertises');
    });

    it('a versions drafts activé', () => {
      expect(Expertises.versions).toEqual(
        expect.objectContaining({ drafts: true }),
      );
    });

    it('useAsTitle = title', () => {
      expect(Expertises.admin?.useAsTitle).toBe('title');
    });

    it('access.read : anonyme → contrainte _status published (OWASP A01)', () => {
      const read = Expertises.access?.read as (args: {
        req: { user: unknown };
      }) => unknown;
      expect(read({ req: { user: null } })).toEqual({
        _status: { equals: 'published' },
      });
    });

    it('access.read : utilisateur authentifié → true', () => {
      const read = Expertises.access?.read as (args: {
        req: { user: unknown };
      }) => unknown;
      expect(read({ req: { user: { id: 'u1' } } })).toBe(true);
    });

    it('ne déclare pas de champ `status` custom (publication via `_status` natif)', () => {
      const fieldNames = (Expertises.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      expect(fieldNames).not.toContain('status');
    });

    it('a les champs critiques (slug, title, iconKey, punchline, intro, competences, approche, produitsLies, order, publishedAt)', () => {
      const fieldNames = (Expertises.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      for (const required of [
        'slug',
        'title',
        'iconKey',
        'punchline',
        'intro',
        'competences',
        'approche',
        'produitsLies',
        'order',
        'publishedAt',
      ]) {
        expect(fieldNames).toContain(required);
      }
    });

    it('slug expose les 4 expertises OpenLab', () => {
      const field = (Expertises.fields ?? []).find(
        (f) => 'name' in f && f.name === 'slug',
      );
      const options = (field as { options?: { value: string }[] }).options;
      expect(options?.map((o) => o.value).sort()).toEqual(
        [
          'conseil-strategie',
          'agents-automatisation',
          'data-gouvernance',
          'cybersecurite-ia',
        ].sort(),
      );
    });

    it('iconKey est borné au registre ICON_KEYS', () => {
      const field = (Expertises.fields ?? []).find(
        (f) => 'name' in f && f.name === 'iconKey',
      );
      const options = (field as { options?: { value: string }[] }).options;
      expect(options?.map((o) => o.value).sort()).toEqual(
        [...ICON_KEYS].sort(),
      );
    });

    it('approche contrainte à exactement 3 étapes', () => {
      const field = (Expertises.fields ?? []).find(
        (f) => 'name' in f && f.name === 'approche',
      );
      expect((field as { minRows?: number }).minRows).toBe(3);
      expect((field as { maxRows?: number }).maxRows).toBe(3);
    });
  });

  describe('Sectors', () => {
    it('a le slug "sectors"', () => {
      expect(Sectors.slug).toBe('sectors');
    });

    it('a versions drafts activé', () => {
      expect(Sectors.versions).toEqual(
        expect.objectContaining({ drafts: true }),
      );
    });

    it('useAsTitle = name', () => {
      expect(Sectors.admin?.useAsTitle).toBe('name');
    });

    it('access.read : anonyme → contrainte _status published (OWASP A01)', () => {
      const read = Sectors.access?.read as (args: {
        req: { user: unknown };
      }) => unknown;
      expect(read({ req: { user: null } })).toEqual({
        _status: { equals: 'published' },
      });
    });

    it('access.read : utilisateur authentifié → true', () => {
      const read = Sectors.access?.read as (args: {
        req: { user: unknown };
      }) => unknown;
      expect(read({ req: { user: { id: 'u1' } } })).toBe(true);
    });

    it('ne déclare pas de champ `status` custom (publication via `_status` natif)', () => {
      const fieldNames = (Sectors.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      expect(fieldNames).not.toContain('status');
    });

    it('a les champs critiques (slug, name, iconKey, tagline, intro, enjeux, regulation, produitsLies, expertisesLies, order, publishedAt)', () => {
      const fieldNames = (Sectors.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      for (const required of [
        'slug',
        'name',
        'iconKey',
        'tagline',
        'intro',
        'enjeux',
        'regulation',
        'produitsLies',
        'expertisesLies',
        'order',
        'publishedAt',
      ]) {
        expect(fieldNames).toContain(required);
      }
    });

    it('slug expose les 5 secteurs OpenLab', () => {
      const field = (Sectors.fields ?? []).find(
        (f) => 'name' in f && f.name === 'slug',
      );
      const options = (field as { options?: { value: string }[] }).options;
      expect(options?.map((o) => o.value).sort()).toEqual(
        [
          'secteur-public',
          'banque-assurance',
          'agro-industrie',
          'sante',
          'telecoms-energie',
        ].sort(),
      );
    });

    it('iconKey est borné au registre ICON_KEYS', () => {
      const field = (Sectors.fields ?? []).find(
        (f) => 'name' in f && f.name === 'iconKey',
      );
      const options = (field as { options?: { value: string }[] }).options;
      expect(options?.map((o) => o.value).sort()).toEqual(
        [...ICON_KEYS].sort(),
      );
    });

    it('regulation contrainte à 3-5 entrées', () => {
      const field = (Sectors.fields ?? []).find(
        (f) => 'name' in f && f.name === 'regulation',
      );
      expect((field as { minRows?: number }).minRows).toBe(3);
      expect((field as { maxRows?: number }).maxRows).toBe(5);
    });
  });

  describe('TeamMembers', () => {
    it('a le slug "teamMembers"', () => {
      expect(TeamMembers.slug).toBe('teamMembers');
    });

    it('a versions drafts activé', () => {
      expect(TeamMembers.versions).toEqual(
        expect.objectContaining({ drafts: true }),
      );
    });

    it('useAsTitle = name', () => {
      expect(TeamMembers.admin?.useAsTitle).toBe('name');
    });

    it('access.read : anonyme → contrainte _status published (OWASP A01)', () => {
      const read = TeamMembers.access?.read as (args: {
        req: { user: unknown };
      }) => unknown;
      expect(read({ req: { user: null } })).toEqual({
        _status: { equals: 'published' },
      });
    });

    it('access.read : utilisateur authentifié → true', () => {
      const read = TeamMembers.access?.read as (args: {
        req: { user: unknown };
      }) => unknown;
      expect(read({ req: { user: { id: 'u1' } } })).toBe(true);
    });

    it('ne déclare pas de champ `status` custom (publication via `_status` natif)', () => {
      const fieldNames = (TeamMembers.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      expect(fieldNames).not.toContain('status');
    });

    it('utilise `memberId` comme slug stable (et non `id`)', () => {
      const fieldNames = (TeamMembers.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      expect(fieldNames).toContain('memberId');
      expect(fieldNames).not.toContain('id');
    });

    it('a les champs critiques (memberId, name, jobTitle, shortBio, bio, image, quote, focusAreas, sameAs, order, publishedAt)', () => {
      const fieldNames = (TeamMembers.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      for (const required of [
        'memberId',
        'name',
        'jobTitle',
        'shortBio',
        'bio',
        'image',
        'quote',
        'focusAreas',
        'sameAs',
        'order',
        'publishedAt',
      ]) {
        expect(fieldNames).toContain(required);
      }
    });

    it('le champ image est un upload vers media (optionnel)', () => {
      const field = (TeamMembers.fields ?? []).find(
        (f) => 'name' in f && f.name === 'image',
      );
      expect((field as { type?: string }).type).toBe('upload');
      expect((field as { relationTo?: string }).relationTo).toBe('media');
      expect((field as { required?: boolean }).required).not.toBe(true);
    });
  });

  describe('TeamPublications', () => {
    it('a le slug "teamPublications"', () => {
      expect(TeamPublications.slug).toBe('teamPublications');
    });

    it('a versions drafts activé', () => {
      expect(TeamPublications.versions).toEqual(
        expect.objectContaining({ drafts: true }),
      );
    });

    it('useAsTitle = title', () => {
      expect(TeamPublications.admin?.useAsTitle).toBe('title');
    });

    it('access.read : anonyme → contrainte _status published (OWASP A01)', () => {
      const read = TeamPublications.access?.read as (args: {
        req: { user: unknown };
      }) => unknown;
      expect(read({ req: { user: null } })).toEqual({
        _status: { equals: 'published' },
      });
    });

    it('access.read : utilisateur authentifié → true', () => {
      const read = TeamPublications.access?.read as (args: {
        req: { user: unknown };
      }) => unknown;
      expect(read({ req: { user: { id: 'u1' } } })).toBe(true);
    });

    it('ne déclare pas de champ `status` custom (publication via `_status` natif)', () => {
      const fieldNames = (TeamPublications.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      expect(fieldNames).not.toContain('status');
    });

    it('a les champs critiques (pubType, title, year, description, href, order, publishedAt)', () => {
      const fieldNames = (TeamPublications.fields ?? []).flatMap((f) =>
        'name' in f ? [f.name] : [],
      );
      for (const required of [
        'pubType',
        'title',
        'year',
        'description',
        'href',
        'order',
        'publishedAt',
      ]) {
        expect(fieldNames).toContain(required);
      }
    });

    it('pubType expose les 4 natures de publication', () => {
      const field = (TeamPublications.fields ?? []).find(
        (f) => 'name' in f && f.name === 'pubType',
      );
      const options = (field as { options?: { value: string }[] }).options;
      expect(options?.map((o) => o.value).sort()).toEqual(
        ['Livre', 'Livre blanc', 'Conférence', 'Article pair-évalué'].sort(),
      );
    });
  });

  describe('Leads', () => {
    it('a le slug "leads"', () => {
      expect(Leads.slug).toBe('leads');
    });

    it('interdit la création API (POST direct) — bypassée seulement via overrideAccess', () => {
      const create = Leads.access?.create as (() => boolean) | undefined;
      expect(create?.()).toBe(false);
    });

    it('lecture réservée admin / super-admin / editor-chief', () => {
      const read = Leads.access?.read as (args: {
        req: { user: { role?: string } | null };
      }) => boolean;
      expect(read({ req: { user: { role: 'super-admin' } } })).toBe(true);
      expect(read({ req: { user: { role: 'admin' } } })).toBe(true);
      expect(read({ req: { user: { role: 'editor-chief' } } })).toBe(true);
      expect(read({ req: { user: { role: 'editor' } } })).toBe(false);
      expect(read({ req: { user: { role: 'viewer' } } })).toBe(false);
    });

    it('expose un pipeline Kanban à 6 stages', () => {
      const stage = (Leads.fields ?? []).find(
        (f) => 'name' in f && f.name === 'stage',
      );
      const options = (stage as { options?: { value: string }[] }).options;
      expect(options?.map((o) => o.value).sort()).toEqual(
        ['nouveau', 'qualifie', 'rdv', 'proposition', 'signe', 'perdu'].sort(),
      );
    });

    it('borne aiScore entre 0 et 100', () => {
      const f = (Leads.fields ?? []).find(
        (x) => 'name' in x && x.name === 'aiScore',
      );
      expect((f as { min?: number }).min).toBe(0);
      expect((f as { max?: number }).max).toBe(100);
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
