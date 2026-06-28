import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  Atom,
  BookOpen,
  Boxes,
  FlaskConical,
  GraduationCap,
  Microscope,
} from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { breadcrumbSchema, jsonLdString } from '@/lib/seo/schema';
import { PRODUCTS } from '@/lib/data/products';
import { RD_AXES, PARTENARIATS } from '@/lib/data/laboratoire';
import { spellFrenchCount } from '@/lib/format/product-count';
import { alternatesFor } from '@/lib/seo/site';

const PRODUCT_WORD = spellFrenchCount(PRODUCTS.length);
const PRODUCT_WORD_CAP =
  PRODUCT_WORD.charAt(0).toUpperCase() + PRODUCT_WORD.slice(1);

/** Chiffres-clés FACTUELS (dérivés des données réelles, rien d'inventé). */
const RD_STATS: readonly { value: string; label: string }[] = [
  {
    value: String(PRODUCTS.length),
    label: 'logiciels propriétaires issus de la R&D',
  },
  { value: String(RD_AXES.length), label: 'axes de recherche & développement' },
  { value: '1', label: 'livre de référence publié' },
  {
    value: String(PARTENARIATS.length),
    label: 'partenariats noués (universités, public)',
  },
];

/** Démarche de recherche — points FACTUELS, sans surclaim académique. */
const RD_DEMARCHE: readonly { title: string; body: string }[] = [
  {
    title: 'Née du terrain',
    body: 'Chaque axe part d’un problème client réel, puis se généralise quand le pattern tient. Pas de recherche hors-sol.',
  },
  {
    title: 'Données africaines & sources ouvertes',
    body: 'Séries climatiques SODEXAM, ERA5, CHIRPS, imagerie Sentinel-2, des données publiques mobilisées pour des modèles ancrés dans le contexte.',
  },
  {
    title: 'Infrastructure souveraine',
    body: 'Entraînement et déploiement sur cluster K3s sous contrôle opérationnel propre. Code et données maîtrisés, audit total.',
  },
  {
    title: 'Supervision humaine & auditabilité',
    body: 'Agents et modèles sous supervision, journaux d’audit immuables. Pas de boîte noire pour les déploiements bancaires et publics.',
  },
];

export const metadata: Metadata = {
  title: 'Laboratoire : R&D, publications, partenariats',
  description: `OpenLab Consulting est un cabinet qui code, qui édite, qui publie. ${PRODUCT_WORD_CAP} logiciels propriétaires, un livre IA de référence, des partenariats universitaires francophones.`,
  alternates: alternatesFor('/laboratoire'),
};

const AXES = [
  {
    Icon: Boxes,
    title: `${PRODUCT_WORD_CAP} logiciels propriétaires`,
    body: 'NexusRH CI, NexusERP, SYGESCOM, AgroSense CI, QualitOS, Fraud Shield, Smart City, SentinelBTP. Chaque produit naît d’un terrain client réel, déployé sur K3s, audité en interne.',
    href: '/solutions',
    cta: 'Voir l’écosystème',
  },
  {
    Icon: BookOpen,
    title: 'Édition académique',
    body: '« Intégration de l’Intelligence Artificielle dans le développement logiciel » : 11 chapitres, capstone AgroSense, à destination des étudiants, dirigeants et enseignants.',
    href: '/livre',
    cta: 'Explorer le livre',
  },
  {
    Icon: Atom,
    title: 'Recherche appliquée',
    body: 'MLOps, agents multi-acteurs, séries temporelles climatiques, RAG souverain, adossés à des partenariats universitaires francophones et à des données africaines (SODEXAM, ERA5, CHIRPS).',
    href: '/laboratoire/axes',
    cta: 'Découvrir nos axes',
  },
];

const RESEARCH_AREAS = [
  {
    Icon: Microscope,
    title: 'Séries temporelles climatiques',
    body: 'Modèles probabilistes appliqués aux données SODEXAM, CHIRPS, ERA5 pour la prédiction d’événements météo en zone tropicale.',
  },
  {
    Icon: FlaskConical,
    title: 'RAG souverain & agents multi-acteurs',
    body: 'Architectures retrieval augmenté en milieu fermé, orchestration agents Claude/GPT avec supervision humaine et audit log.',
  },
  {
    Icon: Atom,
    title: 'Sécurité des modèles IA',
    body: 'Détection prompt injection, model extraction, adversarial robustness pour les déploiements bancaires et publics.',
  },
  {
    Icon: GraduationCap,
    title: 'Pédagogie & vulgarisation',
    body: 'Lectures dirigées, supports d’enseignement, conférences universitaires. L’IA appliquée africaine francophone se construit par la formation.',
  },
];

const PUBLICATIONS_PREVIEW = [
  {
    label: 'Livre',
    title:
      'Intégration de l’Intelligence Artificielle dans le développement logiciel',
    href: '/livre',
  },
  {
    label: 'Livre blanc',
    title: 'L’IA souveraine en Côte d’Ivoire : feuille de route 2026',
    href: '/laboratoire/publications/ia-souveraine-feuille-de-route-2026',
  },
];

const breadcrumbJsonLd = jsonLdString(
  breadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Laboratoire', url: '/laboratoire' },
  ]),
);

export default function LaboratoirePage(): React.ReactElement {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      {/* Hero — fond night signature */}
      <section
        aria-labelledby="laboratoire-page-title"
        className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-24 text-[var(--color-ol-ivory)] sm:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 -z-10 h-[520px] w-[520px] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,90,0,0.20), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-20">
            <div>
              <Eyebrow tone="orange">Laboratoire OpenLab</Eyebrow>
              <Heading
                id="laboratoire-page-title"
                level={1}
                className="mt-4 text-[var(--color-ol-ivory)]"
              >
                Un cabinet qui code, qui édite,{' '}
                <span className="text-[var(--color-ol-orange-text)]">
                  qui publie
                </span>
                .
              </Heading>
            </div>
            <blockquote className="font-[family-name:var(--font-editorial)] text-xl leading-snug text-[var(--color-ol-ivory)]/85 italic sm:text-2xl">
              <span aria-hidden className="text-[var(--color-ol-orange-text)]">
                “
              </span>
              La data est votre pétrole. La gouvernance est votre raffinerie.
              <br />
              Le laboratoire, lui, dessine ce qui sortira du puits dans cinq
              ans.
              <span aria-hidden className="text-[var(--color-ol-orange-text)]">
                ”
              </span>
            </blockquote>
          </div>

          <ul
            role="list"
            className="mt-20 grid gap-x-12 gap-y-14 lg:grid-cols-3 lg:divide-x lg:divide-[var(--color-ol-ivory)]/10"
          >
            {AXES.map(({ Icon, title, body, href, cta }) => (
              <li
                key={title}
                className="flex flex-col gap-5 lg:px-8 lg:first:pl-0 lg:last:pr-0"
              >
                <span
                  aria-hidden
                  className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-ol-ivory)]/5 text-[var(--color-ol-orange-text)] ring-1 ring-[var(--color-ol-ivory)]/10"
                >
                  <Icon width={24} height={24} aria-hidden />
                </span>
                <Heading
                  level={2}
                  visualLevel={4}
                  className="text-[var(--color-ol-ivory)]"
                >
                  {title}
                </Heading>
                <p className="text-[var(--color-ol-ivory)]/80">{body}</p>
                <Link
                  href={href}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-orange-text)] transition-colors hover:text-[var(--color-ol-orange-light)]"
                >
                  {cta}
                  <ArrowUpRight width={14} height={14} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* La R&D en chiffres — données factuelles, rien d'inventé */}
      <section
        aria-label="La R&D OpenLab en chiffres"
        className="border-b border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] py-14"
      >
        <Container width="wide">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {RD_STATS.map((s) => (
              <div key={s.label}>
                <dt className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ol-orange-text)] sm:text-5xl">
                  {s.value}
                </dt>
                <dd className="mt-2 text-sm leading-snug text-[var(--color-ol-graphite)]/70">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 max-w-3xl text-sm text-[var(--color-ol-graphite)]/60">
            OpenLab structure progressivement son laboratoire de R&amp;D
            appliquée : une démarche déjà à l’œuvre dans nos produits et nos
            publications, en cours de formalisation.
          </p>
        </Container>
      </section>

      {/* Axes de recherche détaillés */}
      <section
        aria-labelledby="research-areas-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Axes de recherche</Eyebrow>
            <Heading id="research-areas-title" level={2} className="mt-4">
              Quatre fronts, une même rigueur scientifique.
            </Heading>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {RESEARCH_AREAS.map(({ Icon, title, body }) => (
              <li key={title}>
                <Card className="flex h-full flex-col gap-4 p-7">
                  <span
                    aria-hidden
                    className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                  >
                    <Icon width={24} height={24} aria-hidden />
                  </span>
                  <Heading level={3} visualLevel={4}>
                    {title}
                  </Heading>
                  <p className="text-[var(--color-ol-graphite)]/75">{body}</p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Démarche & science ouverte */}
      <section
        aria-labelledby="demarche-title"
        className="bg-[var(--color-ol-night)] py-20 text-[var(--color-ol-ivory)] sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Notre démarche</Eyebrow>
            <Heading
              id="demarche-title"
              level={2}
              className="mt-4 text-[var(--color-ol-ivory)]"
            >
              Une R&amp;D ouverte, ancrée et souveraine.
            </Heading>
          </div>

          <ul className="mt-12 grid gap-x-12 gap-y-10 lg:grid-cols-2">
            {RD_DEMARCHE.map((d) => (
              <li
                key={d.title}
                className="border-t border-[var(--color-ol-ivory)]/15 pt-5"
              >
                <Heading
                  level={3}
                  visualLevel={4}
                  className="text-[var(--color-ol-ivory)]"
                >
                  {d.title}
                </Heading>
                <p className="mt-2 text-[var(--color-ol-ivory)]/75">{d.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Publications */}
      <section
        aria-labelledby="publications-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Publications</Eyebrow>
            <Heading id="publications-title" level={2} className="mt-4">
              Ce qui sort du laboratoire.
            </Heading>
            <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/75">
              Un livre de référence, des livres blancs téléchargeables et des
              articles longs sur le blog. La science qui se publie est la
              science qui se vérifie.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {PUBLICATIONS_PREVIEW.map((p) => (
              <li key={p.title}>
                <Link
                  href={p.href}
                  className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                >
                  <Card
                    as="article"
                    interactive
                    className="flex h-full flex-col gap-3 p-7"
                  >
                    <Badge tone="orange">{p.label}</Badge>
                    <Heading level={3} visualLevel={4}>
                      {p.title}
                    </Heading>
                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange-text)]">
                      Y aller
                      <ArrowUpRight
                        width={14}
                        height={14}
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
