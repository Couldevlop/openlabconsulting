/* eslint-disable */
// @ts-nocheck
/**
 * Layout root du groupe Payload — voir docs Payload v3 + Next 15.
 *
 * Ce layout est nu (sans Navbar/Footer site) pour que l'admin Payload
 * occupe toute la fenêtre. Le layout root du site (app/layout.tsx)
 * applique Navbar/Footer ; on les écrase ici via le route group
 * `(payload)`.
 *
 * On désactive eslint + tsc sur ce fichier car le scaffold Payload
 * impose ses propres conventions de typing/runtime que notre strict
 * mode rejette par défaut. Le fichier reste minimal.
 */
import { RootLayout } from '@payloadcms/next/layouts';
import '@payloadcms/next/css';
import config from '@payload-config';
import { importMap } from './admin/importMap.js';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'Admin · OpenLab',
};

export default async function PayloadAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RootLayout config={config} importMap={importMap}>
      {children}
    </RootLayout>
  );
}
