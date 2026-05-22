import { headers } from 'next/headers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ScrollProgress } from '@/components/atoms/ScrollProgress';
import { getFooterContent } from '@/lib/cms/site-settings-server';
import {
  jsonLdString,
  localBusinessSchema,
  organizationSchema,
  webSiteSchema,
} from '@/lib/seo/schema';
import { fontVariables } from '../fonts';
import '../globals.css';

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
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}

/**
 * Layout du site public — route group `(site)`.
 *
 * Pourquoi un route group : Payload v3 admin (`app/(payload)/layout.tsx`)
 * rend son propre `<html>` via `RootLayout` de `@payloadcms/next/layouts`.
 * Pour éviter le nesting `<html>` dans `<div>` (hydration error), le
 * layout racine `app/layout.tsx` est un passthrough qui laisse chaque
 * route group rendre son propre document HTML.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const [headersList, footerContent] = await Promise.all([
    headers(),
    getFooterContent(),
  ]);
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
        <Footer content={footerContent} />
      </body>
    </html>
  );
}
