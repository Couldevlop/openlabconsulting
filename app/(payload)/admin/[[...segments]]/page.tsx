/* eslint-disable */
// @ts-nocheck
import type { Metadata } from 'next';
import config from '@payload-config';
import { generatePageMetadata, RootPage } from '@payloadcms/next/views';
import { importMap } from '../importMap.js';

// Payload admin nécessite la DB au runtime — empêche Next.js de tenter
// une pré-génération statique au build (qui hangerait sans Postgres).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = ({
  params,
  searchParams,
}: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

const Page = ({ params, searchParams }: Args): Promise<React.ReactNode> =>
  RootPage({ config, params, searchParams, importMap });

export default Page;
