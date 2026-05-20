/* eslint-disable */
// @ts-nocheck
import config from '@payload-config';
import { GRAPHQL_POST, REST_OPTIONS } from '@payloadcms/next/routes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const POST = GRAPHQL_POST(config);
export const OPTIONS = REST_OPTIONS(config);
