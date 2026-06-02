import { describe, it, expect } from 'vitest';
import {
  ROLES,
  roleOf,
  isSuperAdmin,
  isAdminPlus,
  isEditorChiefPlus,
  isEditorPlus,
  isAuthorPlus,
  accessSuperAdmin,
  accessAdminPlus,
  accessEditorChiefPlus,
  accessEditorPlus,
  accessReadPublishedOrAuth,
} from '@/lib/auth/roles';

const user = (role: string) => ({ role });

describe('lib/auth/roles — prédicats hiérarchiques', () => {
  it('roleOf retourne le rôle valide ou null', () => {
    expect(roleOf(user('admin'))).toBe('admin');
    expect(roleOf(user('SUPER_ADMIN'))).toBeNull(); // MAJUSCULES = invalide
    expect(roleOf(null)).toBeNull();
    expect(roleOf({})).toBeNull();
    expect(roleOf({ role: 42 })).toBeNull();
  });

  it('isSuperAdmin strict', () => {
    expect(isSuperAdmin(user(ROLES.superAdmin))).toBe(true);
    expect(isSuperAdmin(user(ROLES.admin))).toBe(false);
  });

  it('hiérarchie isAdminPlus / EditorChief / Editor / Author', () => {
    expect(isAdminPlus(user('admin'))).toBe(true);
    expect(isAdminPlus(user('editor-chief'))).toBe(false);
    expect(isEditorChiefPlus(user('editor-chief'))).toBe(true);
    expect(isEditorChiefPlus(user('editor'))).toBe(false);
    expect(isEditorPlus(user('editor'))).toBe(true);
    expect(isEditorPlus(user('author'))).toBe(false);
    expect(isAuthorPlus(user('author'))).toBe(true);
    expect(isAuthorPlus(user('viewer'))).toBe(false);
  });

  it('un viewer ne passe aucun prédicat d’écriture', () => {
    const v = user('viewer');
    expect(isAuthorPlus(v)).toBe(false);
    expect(isEditorPlus(v)).toBe(false);
    expect(isEditorChiefPlus(v)).toBe(false);
    expect(isAdminPlus(v)).toBe(false);
    expect(isSuperAdmin(v)).toBe(false);
  });
});

describe('lib/auth/roles — fabriques access Payload', () => {
  it('accessSuperAdmin / AdminPlus / EditorChiefPlus / EditorPlus', () => {
    expect(accessSuperAdmin({ req: { user: user('super-admin') } })).toBe(true);
    expect(accessSuperAdmin({ req: { user: user('admin') } })).toBe(false);
    expect(accessAdminPlus({ req: { user: user('admin') } })).toBe(true);
    expect(accessEditorChiefPlus({ req: { user: user('editor-chief') } })).toBe(
      true,
    );
    expect(accessEditorPlus({ req: { user: user('editor') } })).toBe(true);
    expect(accessEditorPlus({ req: { user: user('viewer') } })).toBe(false);
    expect(accessEditorPlus({ req: { user: null } })).toBe(false);
  });

  it('accessReadPublishedOrAuth : anon → contrainte, authed → true', () => {
    expect(accessReadPublishedOrAuth({ req: { user: null } })).toEqual({
      _status: { equals: 'published' },
    });
    expect(accessReadPublishedOrAuth({ req: { user: user('viewer') } })).toBe(
      true,
    );
  });
});
