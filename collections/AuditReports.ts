import type { CollectionConfig } from 'payload';

/**
 * AuditReports : rapports d'audit IA générés depuis /audit-ia
 * (cf. docs/superpowers/specs/2026-07-30-rapport-audit-ia-design.md).
 *
 * Cycle de vie : `brouillon-ia` (produit par la file de tâches) puis
 * `en-revue`, `valide`, `envoye`. `echec-generation` signale un repli sur
 * squelette après échec du modèle.
 *
 * Accès (OWASP A01) : jamais lisible en anonyme, un rapport contient le
 * diagnostic nominatif d'une entreprise. La création passe exclusivement
 * par la file de tâches avec `overrideAccess`, comme les leads : aucune
 * création manuelle depuis l'admin, pour garantir qu'un rapport est
 * toujours rattaché à une demande réelle.
 */

const isStaff = (role: string | undefined): boolean =>
  role === 'super-admin' || role === 'admin' || role === 'editor-chief';

// `req.user` est typé `UntypedUser` tant que payload-types n'expose pas
// le rôle : même cast inline que collections/Leads.ts.
const roleOf = (req: { user: unknown }): string | undefined =>
  (req.user as { role?: string } | null)?.role;

export const AuditReports: CollectionConfig = {
  slug: 'audit-reports',
  labels: { singular: 'Rapport d’audit', plural: 'Rapports d’audit' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'generatedBy', 'createdAt', 'sentAt'],
    description:
      'Rapports d’audit IA. Un brouillon attend votre relecture avant tout envoi au prospect.',
    listSearchableFields: ['title'],
  },
  access: {
    read: ({ req }): boolean => isStaff(roleOf(req)),
    create: (): boolean => false,
    update: ({ req }): boolean => isStaff(roleOf(req)),
    delete: ({ req }): boolean => roleOf(req) === 'super-admin',
  },
  versions: { drafts: false },
  fields: [
    {
      name: 'validate',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/ValidateReportButton.tsx#default',
        },
      },
    },
    { name: 'title', type: 'text', required: true, maxLength: 200 },
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      required: true,
      admin: { description: 'Demande d’audit à l’origine de ce rapport.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'brouillon-ia',
      options: [
        { label: 'Brouillon IA', value: 'brouillon-ia' },
        { label: 'En revue', value: 'en-revue' },
        { label: 'Validé', value: 'valide' },
        { label: 'Envoyé', value: 'envoye' },
        { label: 'Échec de génération', value: 'echec-generation' },
      ],
    },
    {
      name: 'sections',
      type: 'group',
      fields: [
        { name: 'synthesis', type: 'textarea', required: true },
        { name: 'situation', type: 'textarea', required: true },
        { name: 'recommendation', type: 'textarea', required: true },
        {
          name: 'roadmap',
          type: 'array',
          minRows: 1,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'horizon', type: 'text', required: true },
            { name: 'body', type: 'textarea', required: true },
          ],
        },
        { name: 'nextSteps', type: 'textarea', required: true },
      ],
    },
    {
      name: 'generatedBy',
      type: 'select',
      required: true,
      defaultValue: 'squelette',
      options: [
        { label: 'Lucie-7B', value: 'lucie-7b' },
        { label: 'Squelette de repli', value: 'squelette' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'generationError',
      type: 'textarea',
      admin: {
        readOnly: true,
        description:
          'Renseigné si la génération a échoué et que le squelette a pris le relais.',
      },
    },
    {
      name: 'validatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    { name: 'validatedAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'pdfKey',
      type: 'text',
      admin: {
        readOnly: true,
        description:
          'Clé de l’objet dans le bucket privé. Jamais exposée publiquement.',
      },
    },
    { name: 'sentAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'remindedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Dernière relance envoyée à l’équipe.',
      },
    },
    {
      name: 'downloadCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Notes internes, non transmises au prospect.' },
    },
  ],
  timestamps: true,
};
