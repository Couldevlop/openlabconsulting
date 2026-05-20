import type { CollectionConfig } from 'payload';

/**
 * AuditLog — journal immuable des actions sensibles (CLAUDE.md §11.2).
 *
 * Capture pour chaque action :
 *   - timestamp, user (id+email+role), ip, userAgent
 *   - action (create / update / delete / login / logout / 2fa-enable…)
 *   - resource (collection + document id)
 *
 * **Lecture seule en admin** : aucune mutation manuelle possible. Les
 * entrées sont créées via hooks `afterChange` / `afterDelete` /
 * `afterLogin` posés sur les collections sensibles (Users, Articles,
 * CaseStudies, Whitepapers).
 *
 * Pour la conformité ASVS L2, les logs doivent être :
 *   - WORM (Write Once Read Many) → access.update/delete bloqué
 *   - Conservés 12 mois minimum → CronJob de purge (P9)
 *   - Exportables CSV/JSON pour les auditeurs externes
 */
export const AuditLog: CollectionConfig = {
  slug: 'auditLog',
  labels: { singular: 'Entrée audit', plural: 'Journal d’audit' },
  admin: {
    useAsTitle: 'action',
    defaultColumns: [
      'createdAt',
      'action',
      'resource',
      'userEmail',
      'ipAddress',
    ],
    description:
      'Journal immuable des actions sensibles (lecture seule). Conservation 12 mois.',
  },
  access: {
    // Lecture : SUPER_ADMIN + ADMIN uniquement.
    read: ({ req }): boolean => {
      const role = (req.user as { role?: string } | null)?.role;
      return role === 'super-admin' || role === 'admin';
    },
    // Mutations : interdites via API. Seuls les hooks internes peuvent
    // créer des entrées via `payload.create({ collection: 'auditLog',
    // overrideAccess: true, ... })`.
    create: (): boolean => false,
    update: (): boolean => false,
    delete: (): boolean => false,
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Création', value: 'create' },
        { label: 'Mise à jour', value: 'update' },
        { label: 'Suppression', value: 'delete' },
        { label: 'Connexion réussie', value: 'login.success' },
        { label: 'Connexion échouée', value: 'login.failed' },
        { label: 'Déconnexion', value: 'logout' },
        { label: '2FA activé', value: '2fa.enable' },
        { label: '2FA désactivé', value: '2fa.disable' },
        { label: '2FA vérifié', value: '2fa.verify' },
        { label: 'Mot de passe changé', value: 'password.change' },
        { label: 'Lockout déclenché', value: 'account.lockout' },
        { label: 'Rôle modifié', value: 'role.change' },
        { label: 'Export données', value: 'data.export' },
      ],
    },
    {
      name: 'resource',
      type: 'text',
      required: true,
      admin: {
        description:
          'Identifie la ressource cible. Format : `<collection>:<id>`. Ex : `articles:65a...`',
      },
    },
    {
      name: 'userId',
      type: 'text',
      admin: { description: 'ID Payload de l’utilisateur ayant agi.' },
    },
    {
      name: 'userEmail',
      type: 'text',
      admin: { description: 'Email pour traçabilité même si user supprimé.' },
    },
    {
      name: 'userRole',
      type: 'text',
    },
    {
      name: 'ipAddress',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'text',
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description:
          'Données contextuelles. Ex: champs modifiés (avant/après diffé).',
      },
    },
  ],
  timestamps: true,
};
