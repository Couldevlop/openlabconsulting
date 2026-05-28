import type { ComponentType, ReactElement, SVGProps } from 'react';
import { createElement } from 'react';
import {
  Antenna,
  BadgeCheck,
  Bot,
  Building2,
  Compass,
  Database,
  Fuel,
  HeartPulse,
  Landmark,
  Radar,
  ScanSearch,
  ShieldCheck,
  Sprout,
  Users,
  Wallet,
  Wheat,
} from 'lucide-react';

/**
 * Registre icônes — pont entre une clé string (sérialisable en base
 * Payload) et un composant Lucide (non sérialisable).
 *
 * Une icône Lucide est un composant React : elle ne peut pas vivre en
 * base de données. Les collections Payload (Products) stockent donc une
 * clé `iconKey` (string) ; ce registre la résout en composant au rendu.
 *
 * Fichier volontairement **client-safe** : aucun import `server-only`
 * ni Node — il est consommé par des Server Components (pages produits)
 * comme par des Client Components (cartes, démos).
 */

export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

/** Clés d'icônes autorisées (options du select Payload + validation). */
export const ICON_MAP = {
  users: Users,
  'badge-check': BadgeCheck,
  building: Building2,
  'scan-search': ScanSearch,
  fuel: Fuel,
  sprout: Sprout,
  radar: Radar,
  // Expertises (lib/data/expertises.ts).
  compass: Compass,
  bot: Bot,
  database: Database,
  'shield-check': ShieldCheck,
  // Secteurs (lib/data/sectors.ts).
  landmark: Landmark,
  wallet: Wallet,
  wheat: Wheat,
  'heart-pulse': HeartPulse,
  antenna: Antenna,
} as const satisfies Record<string, LucideIcon>;

/** Type union des clés valides (`'users' | 'badge-check' | …`). */
export type IconKey = keyof typeof ICON_MAP;

/** Liste des clés valides — options du select + validation collection. */
export const ICON_KEYS = Object.keys(ICON_MAP) as readonly IconKey[];

/** Indique si une string arbitraire est une clé d'icône connue. */
export function isIconKey(value: unknown): value is IconKey {
  return typeof value === 'string' && value in ICON_MAP;
}

interface DynamicIconProps extends SVGProps<SVGSVGElement> {
  /** Clé d'icône (champ `iconKey` Payload). */
  name: string;
}

/**
 * Rend l'icône Lucide associée à `name`. Retourne `null` si la clé est
 * inconnue — le rendu reste sûr même avec une valeur de base corrompue.
 */
export function DynamicIcon({
  name,
  ...props
}: DynamicIconProps): ReactElement | null {
  if (!isIconKey(name)) return null;
  return createElement(ICON_MAP[name], props);
}
