import type { Metadata } from 'next';
import { SITE } from '@/lib/seo/site';

/**
 * Layout racine — **passthrough**.
 *
 * Next 15 requiert un fichier `app/layout.tsx` qui retourne du JSX. Mais
 * Payload v3 admin (`app/(payload)/layout.tsx`) rend lui-même un `<html>`
 * complet via `RootLayout` de `@payloadcms/next/layouts`. Si on rendait
 * `<html>` ici aussi, on aurait deux `<html>` imbriqués → hydration error
 * (`<html> cannot be a child of <div>`).
 *
 * Solution officielle Payload v3 + Next 15 : ce layout racine renvoie
 * juste `{children}` et chaque route group (`(site)` et `(payload)`)
 * rend son propre document HTML.
 *
 * Les `<meta>` globaux + métadonnées Open Graph sont définis ici (Next
 * les remonte au document `<html>` rendu par le layout enfant).
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — IA, R&D et conseil pour l’Afrique francophone`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: 'Debora Ahouma', url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.legalName,
  keywords: [
    'intelligence artificielle',
    'IA Afrique',
    'IA Côte d’Ivoire',
    'cabinet IA Abidjan',
    'NexusRH',
    'NexusERP',
    'SYGESCOM',
    'AgroSense',
    'Fraud Shield',
    'Smart City',
    'SYSCOHADA',
    'CNPS',
    'MLOps',
    'agents autonomes',
    'RAG souverain',
    'cybersécurité IA',
    'data gouvernance',
  ],
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    title: `${SITE.name} — IA, R&D et conseil pour l’Afrique francophone`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — IA, R&D et conseil pour l’Afrique francophone`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
