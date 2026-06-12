import type { GlobalConfig } from 'payload';
import { accessEditorPlus } from '../lib/auth/roles';

/**
 * Fabrique de Global « hero de hub » (Solutions, Expertises, Secteurs).
 *
 * Chaque page hub a un bandeau éditorial identique en structure (eyebrow +
 * titre scindé lead/highlight + description). Plutôt que dupliquer trois
 * fichiers, on génère le `GlobalConfig` à partir du slug/label.
 *
 * Vide = fallback hard-codé (cf. lib/cms/site-settings.ts). Les champs
 * `headlineLead` et `description` acceptent les tokens de compteur
 * (`{productsWord}`, `{Products}`…), interpolés au rendu serveur.
 *
 * Lecture publique ; écriture EDITOR+ (RBAC §11.3).
 */
function makeHubHeroGlobal(
  slug: string,
  label: string,
  hint: string,
): GlobalConfig {
  return {
    slug,
    label,
    admin: {
      description: `${hint} Laissez vide pour utiliser le texte par défaut. Tokens compteur : {productsWord}, {Products}.`,
      group: 'Contenu site',
    },
    access: {
      read: (): boolean => true,
      update: accessEditorPlus,
    },
    fields: [
      {
        name: 'eyebrow',
        type: 'text',
        maxLength: 60,
        admin: { description: 'Mention courte au-dessus du titre.' },
      },
      {
        name: 'headlineLead',
        type: 'text',
        maxLength: 160,
        admin: {
          description: 'Début du titre (avant le segment orange).',
        },
      },
      {
        name: 'headlineHighlight',
        type: 'text',
        maxLength: 120,
        admin: { description: 'Segment orange du titre (accent).' },
      },
      {
        name: 'description',
        type: 'textarea',
        maxLength: 600,
        admin: { description: 'Paragraphe descriptif sous le titre.' },
      },
    ],
  };
}

export const SolutionsHubSettings = makeHubHeroGlobal(
  'solutions-hub-settings',
  'Hub Solutions',
  'Bandeau de la page /solutions.',
);

export const ExpertisesHubSettings = makeHubHeroGlobal(
  'expertises-hub-settings',
  'Hub Expertises',
  'Bandeau de la page /expertises.',
);

export const SecteursHubSettings = makeHubHeroGlobal(
  'secteurs-hub-settings',
  'Hub Secteurs',
  'Bandeau de la page /secteurs.',
);
