import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { LocationPage } from '@/components/sections/LocationPage';
import { JsonLd } from '@/components/seo/JsonLd';
import { getLocation } from '@/lib/data/locations';
import {
  breadcrumbSchema,
  localBusinessSchemaForLocation,
} from '@/lib/seo/schema';
import { alternatesFor } from '@/lib/seo/site';

const LOCATION = getLocation('abidjan');

export const metadata: Metadata = {
  title: `${LOCATION.h1.replace(/[.:].*$/, '')} — OpenLab Consulting`,
  description: LOCATION.metaDescription,
  alternates: alternatesFor(`/${LOCATION.slug}`),
};

export default async function AbidjanPage(): Promise<React.ReactElement> {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <>
      <JsonLd
        nonce={nonce}
        data={[
          localBusinessSchemaForLocation(LOCATION),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: LOCATION.label, url: `/${LOCATION.slug}` },
          ]),
        ]}
      />
      <LocationPage location={LOCATION} />
    </>
  );
}
