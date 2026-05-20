/* eslint-disable */
// @ts-nocheck
import config from '@payload-config';
import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = GRAPHQL_PLAYGROUND_GET(config);
