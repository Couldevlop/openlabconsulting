import type { ReactElement } from 'react';
import { jsonLdString } from '@/lib/seo/schema';

interface JsonLdProps {
  data: unknown;
  /** Nonce CSP — récupéré par la page parent via `headers()`.
   *  Optionnel pour rétro-compat et fallback sur CSP `unsafe-inline`. */
  nonce?: string;
}

/**
 * <script type="application/ld+json"> sécurisé pour injecter du
 * Schema.org dans une page. Utiliser dans le head ou en tête de page :
 *
 *   import { headers } from 'next/headers';
 *   import { JsonLd } from '@/components/seo/JsonLd';
 *
 *   const nonce = (await headers()).get('x-nonce') ?? undefined;
 *   <JsonLd data={[...]} nonce={nonce} />
 *
 * `data` peut être un objet Thing ou un tableau de Things.
 *
 * Le nonce CSP (P10) doit être passé en prop quand le composant est
 * utilisé dans une page Server Component. Sans nonce, le script ne
 * sera autorisé que dans les navigateurs qui ignorent CSP3 (fallback
 * `'unsafe-inline'` dans `middleware.ts`).
 */
export function JsonLd({ data, nonce }: JsonLdProps): ReactElement {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: jsonLdString(data as Parameters<typeof jsonLdString>[0]),
      }}
    />
  );
}
