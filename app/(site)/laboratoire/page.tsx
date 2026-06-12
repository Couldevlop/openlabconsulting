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
import { spellFrenchCount } from '@/lib/format/product-count';

const PRODUCT_WORD = spellFrenchCount(PRODUCTS.length);
const PRODUCT_WORD_CAP =
  PRODUCT_WORD.charAt(0).toUpperCase() + PRODUCT_WORD.slice(1);

export const metadata: Metadata = {
  title: 'Laboratoire — R&D, publications, partenariats',
  description: `OpenLab Consulting est un cabinet qui code, qui édite, qui publie. ${PRODUCT_WORD_CAP} logiciels propriétaires, un livre IA de référence, des partenariats universitaires francophones.`,
  alternates: { canonical: '/laboratoire' },
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
    body: '« Intégration de l’Intelligence Artificielle dans le développement logiciel » — 11 chapitres, capstone AgroSense, à destination des étudiants, dirigeants et enseignants.',
    href: '/livre',
    cta: 'Explorer le livre',
  },
  {
    Icon: Atom,
    title: 'Recherche appliquée',
    body: 'MLOps, agents multi-acteurs, séries temporelles climatiques, RAG souverain — adossés à des partenariats universitaires francophones et à des données africaines (SODEXAM, ERA5, CHIRPS).',
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
    title:
      'L’IA souveraine en Côte d’Ivoire — feuille de route 2026 (en rédaction)',
    href: '/audit-ia',
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
              Un livre de référence, un livre blanc en rédaction, et des
              articles longs format sur le blog. La science qui se publie est la
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
