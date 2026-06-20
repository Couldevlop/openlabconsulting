import type { CollectionConfig } from 'payload';

/**
 * Leads — CRM léger §9.3 (pipeline Kanban) + RGPD §10.6.
 *
 * Source : formulaires publics /api/contact et /api/audit-ia. Chaque
 * soumission valide crée un lead horodaté. Le pipeline Kanban se
 * matérialise via le champ `stage`.
 *
 * Scoring IA : `aiScore` (0-100) + `aiSummary` posés par le helper
 * `lib/claude.ts` au moment de la création (best-effort, fail-soft).
 *
 * RGPD : droit à l'oubli via la collection — un lead peut être
 * supprimé (super-admin) ; un export CSV est possible côté admin.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: [
      'createdAt',
      'email',
      'subject',
      'organization',
      'source',
      'stage',
      'aiScore',
    ],
    description:
      'Pipeline CRM des soumissions formulaires publics. Scoring IA optionnel via Claude.',
    listSearchableFields: ['email', 'name', 'organization', 'message'],
  },
  access: {
    // Lecture : tous les admins + editor-chief (qualification commerciale).
    read: ({ req }): boolean => {
      const role = (req.user as { role?: string } | null)?.role;
      return (
        role === 'super-admin' || role === 'admin' || role === 'editor-chief'
      );
    },
    // Création API only : les soumissions arrivent via les routes API
    // /api/contact et /api/audit-ia qui utilisent overrideAccess.
    create: (): boolean => false,
    update: ({ req }): boolean => {
      const role = (req.user as { role?: string } | null)?.role;
      return (
        role === 'super-admin' || role === 'admin' || role === 'editor-chief'
      );
    },
    delete: ({ req }): boolean =>
      (req.user as { role?: string } | null)?.role === 'super-admin',
  },
  versions: {
    drafts: false,
  },
  fields: [
    // Bouton « Répondre par email » (mailto pré-rempli) — composant client
    // résolu via l'importMap (cf. cms:generate-importmap). UI pure, aucune
    // donnée stockée. La suppression d'un lead reste l'action native Payload
    // (réservée au super-admin, cf. access.delete + RGPD §10.6).
    {
      name: 'reply',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/LeadReplyButton.tsx#default',
        },
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Audit IA', value: 'audit-ia' },
        { label: 'Démo produit', value: 'demo-produit' },
        { label: 'Livre blanc', value: 'whitepaper' },
        { label: 'Autre', value: 'autre' },
      ],
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'organization',
      type: 'text',
      maxLength: 180,
    },
    {
      name: 'jobTitle',
      type: 'text',
      maxLength: 120,
    },
    {
      name: 'phone',
      type: 'text',
      maxLength: 32,
    },
    {
      name: 'subject',
      type: 'text',
      maxLength: 120,
    },
    {
      name: 'message',
      type: 'textarea',
      maxLength: 4000,
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description:
          'Contexte additionnel : maturité IA, headcount, goal audit, etc.',
      },
    },
    {
      name: 'stage',
      type: 'select',
      required: true,
      defaultValue: 'nouveau',
      options: [
        { label: 'Nouveau', value: 'nouveau' },
        { label: 'Qualifié', value: 'qualifie' },
        { label: 'RDV planifié', value: 'rdv' },
        { label: 'Proposition envoyée', value: 'proposition' },
        { label: 'Signé', value: 'signe' },
        { label: 'Perdu', value: 'perdu' },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Commercial responsable du suivi.',
      },
    },
    {
      name: 'aiScore',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        readOnly: true,
        description:
          'Score 0-100 attribué par Claude à la soumission (qualité du lead).',
      },
    },
    {
      name: 'aiSummary',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: 'Résumé Claude en 2-3 phrases du contexte du lead.',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'consentRgpd',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Consentement RGPD coché à la soumission.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Notes internes du commercial.',
      },
    },
  ],
  timestamps: true,
};
