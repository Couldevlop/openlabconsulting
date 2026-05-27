import type { ReactElement } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';

interface CaseResult {
  value: string;
  label: string;
  /** Source ou contexte chiffré, écrit en bas du stat. Aucun chiffre
   *  rond inventé : tout est issu de CLAUDE.md §7.2. */
  source: string;
}

interface CaseStudy {
  client: string;
  sector: string;
  duration: string;
  /** Captures avant/après — `src` reste null tant que l'admin Payload
   *  (P6) n'a pas chargé les visuels MinIO. Le placeholder typé prend
   *  alors le relais. Voir memory project_openlabconsulting_cms_media. */
  visualBefore: { src: string | null; alt: string };
  visualAfter: { src: string | null; alt: string };
  results: readonly CaseResult[];
  caseLink: string;
}

const SYGESCOM_CASE: CaseStudy = {
  client: 'SYGESCOM',
  sector: 'Distribution d’hydrocarbures · Afrique de l’Ouest',
  duration: 'Déploiement en moins de 3 mois',
  visualBefore: {
    src: null,
    alt: 'Reporting station manuel — papier, Excel, retards d’une journée',
  },
  visualAfter: {
    src: null,
    alt: 'Dashboard SYGESCOM temps réel multi-stations',
  },
  results: [
    {
      value: '−12 %',
      label: 'pertes carburant',
      source: 'sur 3 mois d’exploitation',
    },
    {
      value: '< 3 mois',
      label: 'retour sur investissement',
      source: 'CAPEX déploiement amorti',
    },
    {
      value: '24/7',
      label: 'stations supervisées',
      source: 'temps réel centralisé',
    },
  ],
  caseLink: '/solutions/sygescom',
};

/**
 * CasClient — Section 5 de la homepage (CLAUDE.md §6, §7.2).
 *
 * Narration avant/après autour de SYGESCOM. Trois chiffres sourcés
 * (aucun rond non sourcé, §4.10). Visuels en MediaPlaceholder tant
 * que Payload (P6) ne fournit pas les URLs MinIO.
 */
export function CasClient(): ReactElement {
  const c = SYGESCOM_CASE;
  return (
    <section
      aria-labelledby="cas-client-title"
      data-testid="cas-client"
      className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
    >
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-20">
          {/* Colonne narration */}
          <div>
            <Eyebrow tone="orange">Cas client · {c.client}</Eyebrow>

            <Heading id="cas-client-title" level={2} className="mt-4">
              Un réseau de stations{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                remis sous contrôle
              </span>
              .
            </Heading>

            <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-ol-graphite)]/65">
              <div>
                <dt className="sr-only">Secteur</dt>
                <dd>{c.sector}</dd>
              </div>
              <div aria-hidden className="text-[var(--color-ol-mist)]">
                ·
              </div>
              <div>
                <dt className="sr-only">Durée du projet</dt>
                <dd>{c.duration}</dd>
              </div>
            </dl>

            <p className="mt-8 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              Avant : un réseau en croissance, des pertes carburant invisibles,
              des contrôles manuels qui arrivent toujours avec un jour de
              retard. La fraude documentaire passe sous le radar.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              Après : SYGESCOM centralise chaque flux station en temps réel, une
              couche IA isole les anomalies, le dashboard exécutif rend tout le
              réseau lisible en un coup d’œil. Les écarts ne se cachent plus.
            </p>

            <div className="mt-10">
              <Button as="a" href={c.caseLink} variant="secondary" size="lg">
                Voir le cas complet
                <ArrowRight width={20} height={20} aria-hidden />
              </Button>
            </div>
          </div>

          {/* Colonne visuels avant / après */}
          <div className="space-y-6">
            <figure>
              <Eyebrow
                tone="graphite"
                className="text-[var(--color-ol-graphite)]/70"
              >
                Avant
              </Eyebrow>
              <MediaPlaceholder
                src={c.visualBefore.src}
                alt={c.visualBefore.alt}
                tone="cold"
                aspect="16/9"
                placeholderLabel="Capture avant"
                className="mt-3"
              />
              <figcaption className="mt-3 text-sm text-[var(--color-ol-graphite)]/70">
                Reporting manuel : papier, tableurs, validation J+1.
              </figcaption>
            </figure>

            <figure>
              <Eyebrow tone="orange">Après</Eyebrow>
              <MediaPlaceholder
                src={c.visualAfter.src}
                alt={c.visualAfter.alt}
                tone="warm"
                aspect="16/9"
                placeholderLabel="Capture après"
                className="mt-3"
              />
              <figcaption className="mt-3 text-sm text-[var(--color-ol-graphite)]/70">
                Dashboard SYGESCOM : ingestion temps réel, alertes IA,
                drill-down par station.
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Bandeau résultats sourcés */}
        <ul
          aria-label="Résultats mesurés du déploiement SYGESCOM"
          className="mt-16 grid gap-x-12 gap-y-10 border-t border-[var(--color-ol-mist)] pt-12 sm:grid-cols-3"
        >
          {c.results.map((r) => (
            <li key={r.label} data-testid="cas-client-result">
              <span className="block font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ol-orange-text)] sm:text-5xl">
                {r.value}
              </span>
              <span className="mt-2 block text-base font-medium text-[var(--color-ol-night)]">
                {r.label}
              </span>
              <span className="mt-1 block text-xs text-[var(--color-ol-graphite)]/70">
                {r.source}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
