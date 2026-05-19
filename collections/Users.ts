import type { CollectionConfig } from 'payload';

/**
 * Users — collection minimale pour l’auth admin Payload (P6).
 *
 * Rôles supportés (CLAUDE.md §11.3) :
 *   - SUPER_ADMIN   : tous droits + gestion users + paramètres système
 *   - ADMIN         : tous droits sauf gestion users
 *   - EDITOR_CHIEF  : CRUD contenu + produits + livre + leads
 *   - EDITOR        : CRUD articles, médias, FAQs
 *   - AUTHOR        : CRUD ses propres articles uniquement
 *   - VIEWER        : lecture seule (dashboard, KPIs)
 *
 * Sécurité P7 :
 *   - 2FA TOTP obligatoire pour SUPER_ADMIN et ADMIN
 *   - Politique mot de passe 12+ chars, zxcvbn ≥ 3
 *   - Session rolling 30 min idle, 8 h absolu
 *   - Account lockout 10 échecs / 30 min
 *
 * Cette collection est volontairement minimale en P6 setup ; les
 * politiques fines (2FA, account-lockout, audit log) sont ajoutées
 * en P7 via @payloadcms/plugin-multi-tenant + middleware custom.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  auth: {
    tokenExpiration: 28800, // 8 h absolu
    maxLoginAttempts: 10,
    lockTime: 1800 * 1000, // 30 min
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'lastLogin'],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'author',
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor in chief', value: 'editor-chief' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
        { label: 'Viewer', value: 'viewer' },
      ],
    },
    {
      name: 'fullName',
      type: 'text',
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
};
