import type { ReactElement } from 'react';
import { AuditIaCta } from './AuditIaCta';
import { getAuditIaCtaContent } from '@/lib/cms/site-settings-server';

/**
 * Wrapper async server component pour AuditIaCta.
 *
 * Pourquoi un wrapper :
 *   - `AuditIaCta` reste un composant **sync presentational** (testable
 *     en jsdom, accepte `content` en prop, fallback statique par défaut).
 *   - `AuditIaCtaServer` fetch le Global Payload via
 *     `getAuditIaCtaContent()` (server-only) puis délègue à AuditIaCta.
 *   - Toute page qui veut le contenu CMS importe ce wrapper et le rend
 *     comme un composant normal — Next 15 await les async children en
 *     server rendering.
 *
 * Pattern identique à InsightsServer / CasesCarouselServer (P6 binding).
 */
export async function AuditIaCtaServer(): Promise<ReactElement> {
  const content = await getAuditIaCtaContent();
  return <AuditIaCta content={content} />;
}
