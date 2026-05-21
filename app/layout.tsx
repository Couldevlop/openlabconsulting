import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ScrollProgress } from '@/components/atoms/ScrollProgress';
import {
  jsonLdString,
  localBusinessSchema,
  organizationSchema,
  webSiteSchema,
} from '@/lib/seo/schema';
import { SITE } from '@/lib/seo/site';
import { fontVariables } from './fonts';
import './globals.css';

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

/** JSON-LD global Organization + LocalBusiness + WebSite. */
function GlobalJsonLd({ nonce }: { nonce: string }): React.ReactElement {
  const payload = jsonLdString([
    organizationSchema(),
    localBusinessSchema(),
    webSiteSchema(),
  ]);
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  // Nonce CSP injecté par `middleware.ts` (§10.3). Si absent (build
  // statique, ex. génération sitemap), on retombe sur chaîne vide qui
  // ne matche aucun CSP — acceptable car CSP `'unsafe-inline'` couvre
  // ce cas en fallback pour les vieux navigateurs.
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? '';

  return (
    <html lang="fr-CI" className={fontVariables}>
      <head>
        <GlobalJsonLd nonce={nonce} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-[var(--color-ol-night)] focus:px-4 focus:py-2 focus:text-white"
        >
          Aller au contenu principal
        </a>
        <ScrollProgress />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
