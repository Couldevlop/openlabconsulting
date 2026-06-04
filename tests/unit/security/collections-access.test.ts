import { describe, it, expect } from 'vitest';
import { Articles } from '@/collections/Articles';
import { CaseStudies } from '@/collections/CaseStudies';
import { Products } from '@/collections/Products';
import { Expertises } from '@/collections/Expertises';
import { Sectors } from '@/collections/Sectors';
import { TeamMembers } from '@/collections/TeamMembers';
import { TeamPublications } from '@/collections/TeamPublications';
import { Whitepapers } from '@/collections/Whitepapers';
import { Media } from '@/collections/Media';
import { Users } from '@/collections/Users';
import { HeroSettings } from '@/globals/HeroSettings';
import { FooterSettings } from '@/globals/FooterSettings';
import { SeoDefaults } from '@/globals/SeoDefaults';

type AccessFn = (args: { req: { user: unknown } }) => unknown;
const as = (role: string | null) => ({
  req: { user: role ? { id: 'u', role } : null },
});

/**
 * OWASP A01 — garantit qu'aucune collection de contenu ne laisse un compte
 * authentifié faible (viewer/author) écrire/supprimer. Avant ce durcissement,
 * `create/update/delete` retombaient sur le défaut Payload (« authentifié »).
 */
describe('Access control des collections de contenu (OWASP A01)', () => {
  const contentCollections = [
    { name: 'CaseStudies', c: CaseStudies },
    { name: 'Products', c: Products },
    { name: 'Expertises', c: Expertises },
    { name: 'Sectors', c: Sectors },
    { name: 'TeamMembers', c: TeamMembers },
    { name: 'TeamPublications', c: TeamPublications },
    { name: 'Whitepapers', c: Whitepapers },
  ];

  for (const { name, c } of contentCollections) {
    it(`${name} : create/update/delete refusés aux viewer & non-auth`, () => {
      for (const op of ['create', 'update', 'delete'] as const) {
        const fn = c.access?.[op] as AccessFn | undefined;
        expect(typeof fn, `${name}.${op} défini`).toBe('function');
        expect(fn!(as('viewer'))).toBe(false);
        expect(fn!(as(null))).toBe(false);
        expect(fn!(as('editor-chief'))).toBe(true);
        expect(fn!(as('super-admin'))).toBe(true);
      }
    });
  }

  it('Articles : create/update = éditeur+, delete = chef+ ; viewer refusé partout', () => {
    const create = Articles.access?.create as AccessFn;
    const update = Articles.access?.update as AccessFn;
    const del = Articles.access?.delete as AccessFn;
    expect(create(as('editor'))).toBe(true);
    expect(update(as('editor'))).toBe(true);
    expect(del(as('editor'))).toBe(false);
    expect(del(as('editor-chief'))).toBe(true);
    expect(create(as('viewer'))).toBe(false);
    expect(create(as('author'))).toBe(false);
  });

  it('Whitepapers : lecture anon = publiés seulement (gating non contournable)', () => {
    const read = Whitepapers.access?.read as AccessFn;
    expect(read(as(null))).toEqual({ _status: { equals: 'published' } });
    expect(read(as('viewer'))).toBe(true);
  });

  it('Media : upload/update = éditeur+, delete = chef+ ; viewer refusé partout', () => {
    const create = Media.access?.create as AccessFn;
    const update = Media.access?.update as AccessFn;
    const del = Media.access?.delete as AccessFn;
    expect(typeof create, 'Media.create défini').toBe('function');
    expect(typeof update, 'Media.update défini').toBe('function');
    expect(typeof del, 'Media.delete défini').toBe('function');
    expect(create(as('editor'))).toBe(true);
    expect(update(as('editor'))).toBe(true);
    expect(del(as('editor'))).toBe(false);
    expect(del(as('editor-chief'))).toBe(true);
    for (const fn of [create, update, del]) {
      expect(fn(as('viewer'))).toBe(false);
      expect(fn(as('author'))).toBe(false);
      expect(fn(as(null))).toBe(false);
    }
  });
});

describe('Users — champ role verrouillé au super-admin (OWASP A07)', () => {
  it('le champ role n’est éditable que par un super-admin', () => {
    const roleField = (Users.fields ?? []).find(
      (f) => (f as { name?: string }).name === 'role',
    ) as { access?: { update?: AccessFn } } | undefined;
    const update = roleField?.access?.update;
    expect(typeof update).toBe('function');
    expect(update!(as('super-admin'))).toBe(true);
    expect(update!(as('admin'))).toBe(false);
  });
});

describe('Globals — checks de rôle corrigés (minuscules, plus de drift A01)', () => {
  it('HeroSettings.update : éditeur+ autorisé, viewer refusé', () => {
    const u = HeroSettings.access?.update as AccessFn;
    expect(u(as('editor'))).toBe(true);
    expect(u(as('viewer'))).toBe(false);
  });
  it('FooterSettings.update : chef+ requis (editor refusé)', () => {
    const u = FooterSettings.access?.update as AccessFn;
    expect(u(as('editor-chief'))).toBe(true);
    expect(u(as('editor'))).toBe(false);
  });
  it('SeoDefaults.update : admin+ requis (editor-chief refusé)', () => {
    const u = SeoDefaults.access?.update as AccessFn;
    expect(u(as('admin'))).toBe(true);
    expect(u(as('editor-chief'))).toBe(false);
  });
});
