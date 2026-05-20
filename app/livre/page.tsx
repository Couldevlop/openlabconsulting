import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, BookOpen, Download, FileText, Users } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import { JsonLd } from '@/components/seo/JsonLd';
import { BOOK, CHAPTERS } from '@/lib/data/book';
import { bookSchema, breadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: `${BOOK.title} — ${BOOK.subtitle}`,
  description: BOOK.longPitch[0],
  alternates: { canonical: '/livre' },
  openGraph: {
    title: `${BOOK.title} · ${BOOK.subtitle}`,
    description: BOOK.longPitch[0],
    type: 'book',
  },
};

const HIGHLIGHTS = [
  {
    Icon: BookOpen,
    label: `${CHAPTERS.length} chapitres`,
    value: 'Du ML supervisé aux agents autonomes',
  },
  {
    Icon: FileText,
    label: `${BOOK.pageCount} pages estimées`,
    value: 'Capstone AgroSense CI intégral',
  },
  {
    Icon: Users,
    label: '4 publics ciblés',
    value: 'Étudiants, data scientists, dirigeants, enseignants',
  },
];

export default async function LivreLandingPage(): Promise<React.ReactElement> {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <main id="main">
      <JsonLd
        nonce={nonce}
        data={[
          bookSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Livre', url: '/livre' },
          ]),
        ]}
      />
      {/* Hero — fond night signature pour la gravité éditoriale */}
      <section
        aria-labelledby="livre-landing-title"
        className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-24 text-[var(--color-ol-ivory)] sm:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-40 -z-10 h-[520px] w-[520px] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,90,0,0.18), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(20,38,84,0.45), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            <div className="mx-auto w-full max-w-md lg:mx-0">
              <MediaPlaceholder
                src={BOOK.cover.src}
                alt={BOOK.cover.alt}
                tone="warm"
                aspect="3/2"
                placeholderLabel="Couverture du livre"
                className="rotate-1 shadow-2xl transition-transform duration-500 ease-[var(--ease-ol)] hover:rotate-0"
              />
            </div>

            <div>
              <Eyebrow tone="orange">L’ouvrage de référence</Eyebrow>
              <Heading
                id="livre-landing-title"
                level={1}
                className="mt-4 text-[var(--color-ol-ivory)]"
              >
                {BOOK.title}
              </Heading>
              <p className="mt-3 font-[family-name:var(--font-editorial)] text-2xl text-[var(--color-ol-orange)] italic sm:text-3xl">
                {BOOK.subtitle}
              </p>
              <p className="mt-4 text-sm tracking-widest text-[var(--color-ol-ivory)]/60 uppercase">
                {BOOK.edition}
              </p>

              <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-ol-ivory)]/85">
                {BOOK.longPitch.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Button
                  as="a"
                  href="/livre/acheter"
                  variant="primary"
                  size="lg"
                >
                  <BookOpen width={20} height={20} aria-hidden />
                  Acheter le livre
                </Button>
                <Button
                  as="a"
                  href="/livre/extraits"
                  variant="ghost"
                  size="lg"
                  className="border border-[var(--color-ol-ivory)]/20 text-[var(--color-ol-ivory)] hover:bg-[var(--color-ol-ivory)]/10 hover:text-[var(--color-ol-ivory)]"
                >
                  <Download width={20} height={20} aria-hidden />
                  Lire un extrait gratuit
                </Button>
              </div>
            </div>
          </div>

          {/* Bandeau highlights */}
          <ul className="mt-16 grid gap-6 border-t border-[var(--color-ol-ivory)]/10 pt-10 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ Icon, label, value }) => (
              <li key={label} className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)] ring-1 ring-[var(--color-ol-orange)]/20"
                >
                  <Icon width={22} height={22} aria-hidden />
                </span>
                <div>
                  <span className="block font-semibold text-[var(--color-ol-ivory)]">
                    {label}
                  </span>
                  <span className="block text-sm text-[var(--color-ol-ivory)]/65">
                    {value}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Audiences */}
      <section
        aria-labelledby="audiences-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">À qui s’adresse ce livre</Eyebrow>
            <Heading id="audiences-title" level={2} className="mt-4">
              Quatre publics, une lecture différente pour chacun.
            </Heading>
            <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/75">
              Le livre est conçu en niveaux : chaque chapitre peut être lu en
              surface stratégique, ou approfondi avec exercices et code.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {BOOK.audiences.map((a) => (
              <li key={a.label}>
                <Card className="flex h-full flex-col gap-3 p-7">
                  <Badge tone="orange">{a.label}</Badge>
                  <p className="text-[var(--color-ol-graphite)]/80">
                    {a.description}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Liens internes vers les sous-pages */}
      <section
        aria-labelledby="livre-explore-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Explorer le livre</Eyebrow>
            <Heading id="livre-explore-title" level={2} className="mt-4">
              Quatre portes d’entrée.
            </Heading>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: '/livre/chapitres',
                title: 'Table des chapitres',
                body: `${CHAPTERS.length} chapitres + capstone, durées de lecture, indicateurs code / étude de cas.`,
              },
              {
                href: '/livre/extraits',
                title: 'Extraits gratuits',
                body: 'Préface intégrale + un chapitre complet, accessibles contre simple email pro.',
              },
              {
                href: '/livre/acheter',
                title: 'Acheter',
                body: 'PDF + ePub direct OpenLab, Amazon, Lulu, librairies CI. Versions imprimée et numérique.',
              },
              {
                href: '/livre/companion',
                title: 'Ressources lecteurs',
                body: 'Code source GitHub, datasets ouverts, errata public, forum Discourse.',
              },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group block h-full focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                >
                  <Card
                    as="article"
                    interactive
                    className="flex h-full flex-col gap-3"
                  >
                    <Heading level={3} visualLevel={4}>
                      {item.title}
                    </Heading>
                    <p className="text-sm text-[var(--color-ol-graphite)]/75">
                      {item.body}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange)]">
                      Y aller
                      <ArrowRight
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
