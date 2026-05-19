import type { ReactElement } from 'react';
import { jsonLdString } from '@/lib/seo/schema';

interface JsonLdProps {
  data: unknown;
}

/**
 * <script type="application/ld+json"> sécurisé pour injecter du
 * Schema.org dans une page. Utiliser dans le head ou en tête de page :
 *
 *   import { JsonLd } from '@/components/seo/JsonLd';
 *   <JsonLd data={[serviceSchema(expertise), breadcrumbSchema([...])]} />
 *
 * `data` peut être un objet Thing ou un tableau de Things.
 */
export function JsonLd({ data }: JsonLdProps): ReactElement {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: jsonLdString(data as Parameters<typeof jsonLdString>[0]),
      }}
    />
  );
}
