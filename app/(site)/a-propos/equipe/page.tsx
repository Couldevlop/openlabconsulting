import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Globe2,
  Mic,
  FileText,
} from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';
import { JsonLd } from '@/components/seo/JsonLd';
import { DEBORA } from '@/lib/data/team';
import { getTeamMembers, getSignaturePublications } from '@/lib/team-server';
import { breadcrumbSchema, jsonLdString, personSchema } from '@/lib/seo/schema';
import { SITE } from '@/lib/seo/site';

/**
 * /a-propos/equipe — page E-E-A-T premium pour Debora Ahouma (audit P2 §7 #6).
 *
 * Clean architecture : les données sont lues depuis Payload via
 * `lib/team-server.ts` (`getTeamMembers` / `getSignaturePublications`), avec
 * repli hard-codé conservé (`FALLBACK_TEAM_MEMBERS` / `SIGNATURE_PUBLICATIONS`).
 * La page ne fait que la composition UI + injection JSON-LD. Le premier
 * membre (par `order`) est mis en avant comme figure dirigeante.
 *
 * OWASP : aucune entrée utilisateur, JSON-LD échappé via `jsonLdString`
 * (escape <), lien externe LinkedIn protégé `rel="noopener noreferrer"`.
 */

export const metadata: Metadata = {
  title: 'Équipe — OpenLab Consulting',
  description:
    'Debora Ahouma, fondatrice d’OpenLab Consulting et auteure du livre « Intégration de l’Intelligence Artificielle dans le développement logiciel ». Cabinet ivoirien d’IA appliquée, R&D et édition.',
  alternates: { canonical: '/a-propos/equipe' },
};

/** Mapping type de publication → icône lucide. */
const PUB_ICON: Record<string, typeof BookOpen> = {
  Livre: BookOpen,
  'Livre blanc': FileText,
  Conférence: Mic,
  'Article pair-évalué': FileText,
};

export default async function EquipePage(): Promise<React.ReactElement> {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  // Données éditables Payload (repli hard-codé via team-server). On met en
  // avant le premier membre (par `order`) comme figure dirigeante ; le repli
  // garantit `DEBORA` même si la collection est vide ou indisponible.
  const [members, publications] = await Promise.all([
    getTeamMembers(),
    getSignaturePublications(),
  ]);
  const member = members[0] ?? DEBORA;

  const personLd = personSchema({
    name: member.name,
    jobTitle: member.jobTitle,
    description: member.shortBio,
    imageUrl: member.imagePath,
    knowsAbout: member.focusAreas,
    sameAs: member.sameAs,
  });

  const breadcrumb = breadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'À propos', url: '/a-propos' },
    { name: 'Équipe', url: '/a-propos/equipe' },
  ]);

  const ldString = jsonLdString([breadcrumb]);

  return (
    <main id="main">
      <JsonLd nonce={nonce} data={personLd} />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: ldString }}
      />

      <Breadcrumbs
        items={[{ label: 'À propos', href: '/a-propos' }, { label: 'Équipe' }]}
      />

      {/* Hero portrait + bio */}
      <section
        aria-labelledby="equipe-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <Link
            href="/a-propos"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-graphite)]/70 transition-colors hover:text-[var(--color-ol-orange-text)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <ArrowLeft width={14} height={14} aria-hidden />À propos d’OpenLab
          </Link>

          <div className="mt-10 grid items-start gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <figure>
              <MediaPlaceholder
                src={member.imagePath}
                alt={`Portrait de ${member.name}, ${member.jobTitle}`}
                tone="warm"
                aspect="3/2"
                placeholderLabel={`Portrait ${member.name}`}
                className="shadow-2xl"
              />
              <figcaption className="mt-4 text-sm text-[var(--color-ol-graphite)]/70">
                Photo de {member.name} — à venir.
              </figcaption>
            </figure>

            <div>
              <Eyebrow tone="orange">Équipe dirigeante</Eyebrow>
              <Heading id="equipe-title" level={1} className="mt-4">
                {member.name}
              </Heading>
              <p className="mt-3 text-lg text-[var(--color-ol-graphite)]/75">
                {member.jobTitle} · Abidjan
              </p>

              <p className="mt-8 font-[family-name:var(--font-editorial)] text-xl leading-relaxed text-[var(--color-ol-graphite)]/85 italic sm:text-2xl">
                « {member.quote} »
              </p>

              <div className="mt-8 space-y-4 text-[var(--color-ol-graphite)]/85">
                {member.bio.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={SITE.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-ol-night)] transition-colors hover:border-[var(--color-ol-orange)]/40"
                >
                  <Globe2 width={14} height={14} aria-hidden />
                  LinkedIn OpenLab
                  <ArrowUpRight width={12} height={12} aria-hidden />
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ol-night)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-ol-navy)]"
                >
                  Solliciter {member.name.split(' ')[0]}
                  <ArrowUpRight width={12} height={12} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Domaines d’expertise — knowsAbout visible */}
      <section
        aria-labelledby="expertise-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Domaines d’expertise</Eyebrow>
            <Heading id="expertise-title" level={2} className="mt-4">
              Ce que {member.name.split(' ')[0]} maîtrise et signe publiquement.
            </Heading>
          </div>

          <ul className="mt-10 flex flex-wrap gap-3">
            {member.focusAreas.map((area) => (
              <li key={area}>
                <Badge tone="neutral">{area}</Badge>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Publications — signal d'autorité */}
      <section
        aria-labelledby="pubs-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">Publications</Eyebrow>
            <Heading id="pubs-title" level={2} className="mt-4">
              Livres, livres blancs, conférences.
            </Heading>
            <p className="mt-4 text-[var(--color-ol-graphite)]/75">
              La science qui se publie est la science qui se vérifie. Chaque
              sortie est signée et datée, accessible aux universitaires comme
              aux décideurs.
            </p>
          </div>

          <ul className="mt-12 grid gap-x-8 gap-y-10 lg:grid-cols-3">
            {publications.map((p) => {
              const Icon = PUB_ICON[p.type] ?? BookOpen;
              return (
                <li
                  key={p.title}
                  className="border-t-2 border-[var(--color-ol-orange)] bg-white p-6 shadow-[var(--shadow-ol-soft)]"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                  >
                    <Icon width={20} height={20} aria-hidden />
                  </span>
                  <p className="mt-4 text-xs tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
                    {p.type} · {p.year}
                  </p>
                  <Heading level={3} visualLevel={4} className="mt-2">
                    {p.title}
                  </Heading>
                  <p className="mt-3 text-sm text-[var(--color-ol-graphite)]/80">
                    {p.description}
                  </p>
                  <Link
                    href={p.href}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ol-orange-text)] hover:underline"
                  >
                    Voir
                    <ArrowUpRight width={12} height={12} aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
