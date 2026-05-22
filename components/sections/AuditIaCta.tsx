import type { ReactElement } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Sparkles } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import {
  AUDIT_IA_CTA_FALLBACK,
  type AuditIaCtaContent,
} from '@/lib/cms/site-settings';

interface AuditIaCtaProps {
  content?: AuditIaCtaContent;
}

/**
 * AuditIaCta — Section 10 de la homepage (CLAUDE.md §6, §10 audit IA
 * lead magnet, §6.7 manifeste de la souveraineté).
 *
 * Deux voies de conversion, hiérarchisées :
 *
 *   1. **Audit IA gratuit** (CTA primaire) — formulaire 2 champs
 *      (email pro, secteur) qui mène vers `/audit-ia`. La page complète
 *      avec questionnaire + génération PDF arrive en P8 (assistant
 *      Claude). Le formulaire ici sert d'entrée rapide.
 *
 *   2. **Livre blanc « L'IA souveraine en Côte d'Ivoire »** (CTA
 *      secondaire) — téléchargement gating email. L'asset PDF sera
 *      géré par Payload P6 (collection `whitepapers`), voir memory
 *      `project_openlabconsulting_white_paper_souveraine`.
 *
 * Sécurité différée :
 * - Validation Zod côté serveur : P8 (action server actuelle = stub).
 * - Rate limit Redis 3/h/IP : P10.
 * - Cloudflare Turnstile : P10.
 * - Pour l'instant, l'`action` du form pointe sur `/audit-ia` (page
 *   complète) en méthode GET — pas de soumission tant que la pipeline
 *   n'est pas en place. Cf CLAUDE.md §10.4 et §10.5.
 */
export function AuditIaCta({
  content = AUDIT_IA_CTA_FALLBACK,
}: AuditIaCtaProps = {}): ReactElement {
  const { whitepaperCard } = content;
  return (
    <section
      aria-labelledby="audit-ia-title"
      data-testid="audit-ia-cta"
      className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-24 text-[var(--color-ol-ivory)] sm:py-32"
    >
      {/* Halo orange massif en bas-droit pour ancrer le call-to-action */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-40 -z-10 h-[560px] w-[560px] rounded-full"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,90,0,0.30), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,90,0,0.10) 0%, rgba(10,14,26,0) 60%)',
        }}
      />

      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-20">
          {/* Colonne audit IA — voie primaire */}
          <div>
            <Eyebrow tone="orange">{content.eyebrow}</Eyebrow>
            <Heading
              id="audit-ia-title"
              level={2}
              className="mt-4 text-[var(--color-ol-ivory)]"
            >
              {content.headlineLead}{' '}
              <span className="text-[var(--color-ol-orange)]">
                {content.headlineHighlight}
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-ivory)]/85">
              {content.description}
            </p>

            <form
              method="get"
              action={content.cta.href}
              aria-label="Démarrer un audit IA"
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <label className="sr-only" htmlFor="audit-email">
                Adresse e-mail professionnelle
              </label>
              <input
                id="audit-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="prenom@votre-entreprise.com"
                className="min-h-12 flex-1 rounded-md border border-[var(--color-ol-ivory)]/20 bg-[var(--color-ol-ivory)]/10 px-4 text-base text-[var(--color-ol-ivory)] placeholder:text-[var(--color-ol-ivory)]/45 focus:border-[var(--color-ol-orange)] focus:bg-[var(--color-ol-ivory)]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ol-night)]"
              />

              <label className="sr-only" htmlFor="audit-sector">
                Votre secteur
              </label>
              <select
                id="audit-sector"
                name="secteur"
                defaultValue=""
                required
                className="min-h-12 rounded-md border border-[var(--color-ol-ivory)]/20 bg-[var(--color-ol-ivory)]/10 px-4 text-base text-[var(--color-ol-ivory)] focus:border-[var(--color-ol-orange)] focus:bg-[var(--color-ol-ivory)]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ol-night)]"
              >
                <option value="" disabled>
                  Votre secteur…
                </option>
                <option value="banque-assurance">Banque · Assurance</option>
                <option value="secteur-public">Secteur public</option>
                <option value="agro-industrie">Agro-industrie</option>
                <option value="sante">Santé</option>
                <option value="telecoms-energie">Télécoms · Énergie</option>
                <option value="autre">Autre</option>
              </select>

              <Button type="submit" variant="primary" size="lg">
                <Sparkles width={20} height={20} aria-hidden />
                {content.cta.label}
              </Button>
            </form>

            <p className="mt-4 text-xs text-[var(--color-ol-ivory)]/55">
              {content.reassuranceBullets.join(' · ')}. Voir notre{' '}
              <Link
                href="/politique-confidentialite"
                className="underline underline-offset-2 hover:text-[var(--color-ol-orange)]"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          </div>

          {/* Colonne livre blanc — voie secondaire */}
          <aside
            aria-labelledby="whitepaper-title"
            data-testid="whitepaper-card"
            className="rounded-lg border border-[var(--color-ol-ivory)]/10 bg-[var(--color-ol-ivory)]/5 p-8 backdrop-blur-sm"
          >
            <Badge tone="orange">{whitepaperCard.badge}</Badge>
            <Heading
              id="whitepaper-title"
              level={3}
              visualLevel={3}
              className="mt-4 text-[var(--color-ol-ivory)]"
            >
              {whitepaperCard.title}
            </Heading>
            <p className="mt-2 font-[family-name:var(--font-editorial)] text-lg text-[var(--color-ol-orange)] italic">
              {whitepaperCard.subtitle}
            </p>
            <p className="mt-5 text-[var(--color-ol-ivory)]/80">
              {whitepaperCard.description}
            </p>

            <Button
              as="a"
              href={whitepaperCard.ctaHref}
              variant="ghost"
              size="md"
              className="mt-6 border border-[var(--color-ol-ivory)]/20 text-[var(--color-ol-ivory)] hover:bg-[var(--color-ol-ivory)]/10 hover:text-[var(--color-ol-ivory)]"
            >
              <Download width={18} height={18} aria-hidden />
              {whitepaperCard.ctaLabel}
              <ArrowRight width={16} height={16} aria-hidden />
            </Button>

            <p className="mt-4 text-xs text-[var(--color-ol-ivory)]/55">
              {whitepaperCard.footnote}
            </p>
          </aside>
        </div>
      </Container>
    </section>
  );
}
