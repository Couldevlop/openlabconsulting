import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Building2, GraduationCap, Handshake } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { PARTENARIATS, type Partenariat } from '@/lib/data/laboratoire';
import { breadcrumbSchema, jsonLdString } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Partenariats — Laboratoire OpenLab',
  description:
    'Partenaires universitaires (Université Félix Houphouët-Boigny, ESATIC), publics (SODEXAM, Conseil Café-Cacao) et éditoriaux (Jeune Afrique Business+). Notre R&D ne marche jamais seule.',
  alternates: { canonical: '/laboratoire/partenariats' },
};

const breadcrumbJsonLd = jsonLdString(
  breadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Laboratoire', url: '/laboratoire' },
    { name: 'Partenariats', url: '/laboratoire/partenariats' },
  ]),
);

const TYPE_LABEL: Record<Partenariat['type'], string> = {
  universitaire: 'Universitaire',
  public: 'Institution publique',
  prive: 'Partenaire privé',
  ong: 'ONG / société civile',
};

const TYPE_ICON: Record<Partenariat['type'], typeof Building2> = {
  universitaire: GraduationCap,
  public: Building2,
  prive: Handshake,
  ong: Handshake,
};

export default function LaboratoirePartenariatsPage(): React.ReactElement {
  // Regroupé par type pour structuration claire.
  const grouped = (
    ['universitaire', 'public', 'prive', 'ong'] as Partenariat['type'][]
  )
    .map((type) => ({
      type,
      label: TYPE_LABEL[type],
      items: PARTENARIATS.filter((p) => p.type === type),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      <section
        aria-labelledby="partenariats-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <Link
            href="/laboratoire"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange-text)]"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Hub Laboratoire
          </Link>

          <div className="mt-10 max-w-3xl">
            <Eyebrow tone="orange">Partenariats</Eyebrow>
            <Heading id="partenariats-title" level={1} className="mt-4">
              Nos R&amp;D ne marchent jamais seules.
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              Universités ivoiriennes, institutions publiques, partenaires
              éditoriaux : autant de relais qui font passer la R&amp;D OpenLab
              du laboratoire au terrain.
            </p>
          </div>
        </Container>
      </section>

      {grouped.map((group) => (
        <section
          key={group.type}
          aria-labelledby={`partenariats-${group.type}-title`}
          className="bg-white py-16 sm:py-20"
        >
          <Container width="wide">
            <Heading
              id={`partenariats-${group.type}-title`}
              level={2}
              visualLevel={3}
              className="mb-8"
            >
              {group.label}
            </Heading>
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {group.items.map((p) => {
                const Icon = TYPE_ICON[p.type];
                return (
                  <li key={p.slug}>
                    <Card className="flex h-full flex-col gap-4 p-6 sm:p-8">
                      <span
                        aria-hidden
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                      >
                        <Icon width={18} height={18} aria-hidden />
                      </span>
                      <Heading level={3} visualLevel={4}>
                        {p.title}
                      </Heading>
                      <p className="text-[var(--color-ol-graphite)]/80">
                        {p.pitch}
                      </p>
                      <div className="mt-auto">
                        <Badge tone="orange">{TYPE_LABEL[p.type]}</Badge>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
      ))}

      <AuditIaCta />
    </main>
  );
}
