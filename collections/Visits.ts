import type { CollectionConfig } from 'payload';
import { accessAdminPlus } from '../lib/auth/roles';

/**
 * Visits — comptage de fréquentation du site public (demande 2026-06-07).
 *
 * Granularité : **un document par visiteur unique et par jour**. La
 * déduplication est garantie par l'index unique composé (`day`,
 * `visitorHash`) : le endpoint `/api/track` ne crée la ligne que la
 * première fois qu'un visiteur est vu dans la journée. On conserve le
 * pays (en-tête Cloudflare `CF-IPCountry`) et l'heure de première visite.
 *
 * RGPD (CLAUDE.md §10.6) : AUCUNE donnée personnelle stockée.
 *   - `visitorHash` = SHA-256(secret + jour + IP + user-agent). L'IP
 *     n'est jamais persistée et le hash intègre le jour → il tourne
 *     chaque jour et n'est pas corrélable d'un jour à l'autre.
 *   - `country` = code ISO 2 lettres (pays seulement, pas de géoloc fine).
 *   - Pas de cookie posé (le tracker public utilise sendBeacon).
 *
 * Sécurité :
 *   - A01 : lecture réservée admin/super-admin ; écriture interdite par
 *     l'API publique (create/update/delete = false). Le endpoint
 *     `/api/track` écrit via `overrideAccess`.
 *   - Exposé en lecture seule dans le dashboard admin (Server Component).
 */
export const Visits: CollectionConfig = {
  slug: 'visits',
  labels: { singular: 'Visite', plural: 'Visites' },
  admin: {
    useAsTitle: 'day',
    defaultColumns: ['day', 'hour', 'country', 'createdAt'],
    description:
      'Visiteurs uniques par jour (pays + heure). Alimenté automatiquement par /api/track. Lecture seule.',
    group: 'Système',
  },
  access: {
    read: accessAdminPlus,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  indexes: [
    // Déduplication « 1 visiteur / jour » + accélère les agrégats par jour.
    { fields: ['day', 'visitorHash'], unique: true },
  ],
  fields: [
    {
      name: 'day',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Jour de la visite au format AAAA-MM-JJ (UTC).' },
    },
    {
      name: 'hour',
      type: 'number',
      required: true,
      min: 0,
      max: 23,
      admin: {
        description: 'Heure (0–23, UTC) de la première visite du jour.',
      },
    },
    {
      name: 'country',
      type: 'text',
      required: true,
      defaultValue: 'XX',
      maxLength: 2,
      index: true,
      admin: {
        description:
          'Code pays ISO 3166-1 alpha-2 (en-tête Cloudflare). « XX » si inconnu.',
      },
    },
    {
      name: 'visitorHash',
      type: 'text',
      required: true,
      index: true,
      admin: {
        readOnly: true,
        description:
          'Empreinte anonyme du visiteur pour le jour (SHA-256, sans IP). Rotation quotidienne.',
      },
    },
  ],
  timestamps: true,
};
