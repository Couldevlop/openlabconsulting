import type { GlobalConfig } from 'payload';
import { accessEditorPlus } from '../lib/auth/roles';

/**
 * Global AuditIaProcessSettings — bandeau éditorial + process de la page
 * `/audit-ia` (le questionnaire interactif `AuditIaQuizWizard` reste codé).
 *
 * Permet d'éditer le hero (titre, accroche) et les 3 étapes « Comment ça se
 * passe » sans déploiement. Vide = fallback hard-codé (lib/cms/site-settings).
 *
 * Lecture publique ; écriture EDITOR+ (RBAC §11.3).
 */
export const AuditIaProcessSettings: GlobalConfig = {
  slug: 'audit-ia-process-settings',
  label: 'Page Audit IA',
  admin: {
    description:
      'Bandeau + étapes de la page /audit-ia. Le questionnaire interactif n’est pas concerné. Vide = textes par défaut.',
    group: 'Contenu site',
  },
  access: {
    read: (): boolean => true,
    update: accessEditorPlus,
  },
  fields: [
    {
      name: 'heroEyebrow',
      type: 'text',
      maxLength: 60,
      admin: {
        description: 'Mention au-dessus du titre (ex. « Audit IA gratuit »).',
      },
    },
    {
      name: 'headlineLead',
      type: 'text',
      maxLength: 160,
      admin: { description: 'Début du titre (avant le segment orange).' },
    },
    {
      name: 'headlineHighlight',
      type: 'text',
      maxLength: 120,
      admin: { description: 'Segment orange du titre.' },
    },
    {
      name: 'lead',
      type: 'textarea',
      maxLength: 500,
      admin: { description: 'Accroche éditoriale (italique) sous le titre.' },
    },
    {
      name: 'processEyebrow',
      type: 'text',
      maxLength: 60,
      admin: {
        description:
          'Eyebrow de la section process (ex. « Comment ça se passe »).',
      },
    },
    {
      name: 'processHeadline',
      type: 'text',
      maxLength: 120,
      admin: { description: 'Titre de la section process.' },
    },
    {
      name: 'steps',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Étape', plural: 'Étapes' },
      admin: {
        description: 'Étapes « Comment ça se passe » (numéro + titre + texte).',
      },
      fields: [
        {
          name: 'step',
          type: 'text',
          required: true,
          maxLength: 8,
          admin: { description: 'Numéro affiché (ex. « 01 »).' },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 80,
          admin: { description: 'Titre court de l’étape.' },
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          maxLength: 320,
          admin: { description: 'Description en 1 à 2 phrases.' },
        },
      ],
    },
  ],
};
