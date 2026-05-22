/* eslint-disable */
// @ts-nocheck
/**
 * Layout root du groupe Payload — voir docs Payload v3.84 + Next 15.
 *
 * Depuis Payload v3.84, RootLayout exige une prop `serverFunction`
 * (server action) qui wrap `handleServerFunctions` avec la config +
 * importMap pré-injectés. Sans ça, runtime error
 * « ServerFunctionsProvider requires a serverFunction prop ».
 *
 * Pattern officiel Payload : 'use server' + closure qui appelle
 * handleServerFunctions avec args.
 *
 * Ce layout est nu (sans Navbar/Footer site) — `(payload)` est un
 * route group qui écrase le layout root du site.
 */
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts';
import '@payloadcms/next/css';
import config from '@payload-config';
import { importMap } from './admin/importMap.js';

import type { ServerFunctionClient } from 'payload';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Admin · OpenLab',
};

// Server action wrappant les fonctions serveur Payload.
// 'use server' obligatoire pour Next 15 actions inline.
const serverFunction: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default async function PayloadAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
