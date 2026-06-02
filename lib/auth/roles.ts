/**
 * Rôles RBAC — source unique de vérité (CLAUDE.md §11.3).
 *
 * Les valeurs DOIVENT correspondre exactement à l'enum du champ `role`
 * de la collection Users (`collections/Users.ts`). Centraliser ici évite
 * le drift de chaîne de rôle (ex. globals testant `'SUPER_ADMIN'` en
 * MAJUSCULES qui ne matchait jamais l'enum réel en minuscules-tirets →
 * OWASP A01).
 *
 * Hiérarchie (du plus puissant au moins) :
 *   super-admin > admin > editor-chief > editor > author > viewer
 *
 * Fichier sans dépendance Payload : importable depuis collections,
 * globals, routes et tests sans cycle.
 */

export const ROLES = {
  superAdmin: 'super-admin',
  admin: 'admin',
  editorChief: 'editor-chief',
  editor: 'editor',
  author: 'author',
  viewer: 'viewer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Rang numérique pour les comparaisons « >= niveau ». */
const RANK: Record<Role, number> = {
  'super-admin': 5,
  admin: 4,
  'editor-chief': 3,
  editor: 2,
  author: 1,
  viewer: 0,
};

/** Extrait le rôle d'un `req.user` Payload (non typé strict). */
export function roleOf(user: unknown): Role | null {
  const role = (user as { role?: unknown } | null | undefined)?.role;
  return typeof role === 'string' && role in RANK ? (role as Role) : null;
}

function atLeast(user: unknown, min: Role): boolean {
  const r = roleOf(user);
  return r !== null && RANK[r] >= RANK[min];
}

export function isSuperAdmin(user: unknown): boolean {
  return roleOf(user) === ROLES.superAdmin;
}
export function isAdminPlus(user: unknown): boolean {
  return atLeast(user, ROLES.admin);
}
export function isEditorChiefPlus(user: unknown): boolean {
  return atLeast(user, ROLES.editorChief);
}
export function isEditorPlus(user: unknown): boolean {
  return atLeast(user, ROLES.editor);
}
export function isAuthorPlus(user: unknown): boolean {
  return atLeast(user, ROLES.author);
}

// ────────────────────────────────────────────────────────────
// Fabriques d'`access` Payload (signature `({ req }) => boolean`)
// À brancher dans les collections/globals (create/update/delete).
// ────────────────────────────────────────────────────────────

interface AccessArgs {
  req: { user?: unknown };
}

export const accessSuperAdmin = ({ req }: AccessArgs): boolean =>
  isSuperAdmin(req.user);
export const accessAdminPlus = ({ req }: AccessArgs): boolean =>
  isAdminPlus(req.user);
export const accessEditorChiefPlus = ({ req }: AccessArgs): boolean =>
  isEditorChiefPlus(req.user);
export const accessEditorPlus = ({ req }: AccessArgs): boolean =>
  isEditorPlus(req.user);

/**
 * Lecture publique restreinte aux documents publiés : un visiteur anonyme
 * ne voit que `_status: 'published'` (contrainte Where appliquée en base,
 * y compris via l'API REST/GraphQL) ; un utilisateur authentifié voit tout.
 * Pattern partagé par toutes les collections versionnées (drafts).
 */
export const accessReadPublishedOrAuth = ({
  req,
}: AccessArgs): true | { _status: { equals: 'published' } } => {
  if (req.user) return true;
  return { _status: { equals: 'published' } };
};
