import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import {
  ArrowUpRight,
  Building2,
  Globe2,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { JsonLd } from '@/components/seo/JsonLd';
import { personSchema } from '@/lib/seo/schema';
import { SITE, alternatesFor } from '@/lib/seo/site';
import { getAboutContent } from '@/lib/cms/site-settings-server';

export const metadata: Metadata = {
  title: 'À propos — OpenLab Consulting',
  description:
    'Cabinet ivoirien d’IA appliquée, R&D produit et publication de référence pour l’Afrique francophone. Trois piliers : conseil, produits, édition.',
  alternates: alternatesFor('/a-propos'),
};

export default async function AProposPage(): Promise<React.ReactElement> {
  const [nonceHeader, about] = await Promise.all([
    headers(),
    getAboutContent(),
  ]);
  const nonce = nonceHeader.get('x-nonce') ?? undefined;

  // Person schema Debora Ahouma — boost E-E-A-T pour le ranking sur
  // les sujets IA / Afrique francophone. À enrichir au fil du temps
  // avec sameAs LinkedIn, Google Scholar, ORCID, etc.
  const deboraPersonSchema = personSchema({
    name: 'Debora Ahouma',
    jobTitle: 'CEO & Fondatrice, OpenLab Consulting',
    description:
      'Fondatrice du cabinet OpenLab Consulting, auteure du livre « Intégration de l’Intelligence Artificielle dans le développement logiciel ». Spécialiste de l’IA appliquée en Afrique francophone.',
    knowsAbout: [
      'Intelligence artificielle',
      'Machine learning',
      'Agents autonomes',
      'IA souveraine',
      'Cybersécurité IA',
      'Data gouvernance',
      'MLOps',
      'IA appliquée Afrique',
    ],
    sameAs: [
      'https://www.linkedin.com/company/openlab-consulting',
      // À compléter : LinkedIn perso, Google Scholar, ORCID, Hugging Face
    ],
  });

  return (
    <main id="main">
      <JsonLd nonce={nonce} data={deboraPersonSchema} />
      {/* Hero */}
      <section
        aria-labelledby="apropos-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <div className="max-w-3xl">
            <Eyebrow tone="orange">{about.eyebrow}</Eyebrow>
            <Heading id="apropos-title" level={1} className="mt-4">
              {about.headlineLead}{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                {about.headlineHighlight}
              </span>
              .
            </Heading>
            <p className="mt-6 font-[family-name:var(--font-editorial)] text-xl leading-relaxed text-[var(--color-ol-graphite)]/85 italic sm:text-2xl">
              {about.intro}
            </p>
          </div>
        </Container>
      </section>

      {/* Trois piliers */}
      <section
        aria-labelledby="piliers-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">{about.pillarsEyebrow}</Eyebrow>
            <Heading id="piliers-title" level={2} className="mt-4">
              {about.pillarsHeadline}
            </Heading>
          </div>

          <ol className="mt-12 grid gap-x-12 gap-y-10 lg:grid-cols-3">
            {about.pillars.map((p, i) => (
              <li
                key={p.title}
                className="border-t-2 border-[var(--color-ol-orange)] pt-6"
              >
                <span
                  aria-hidden
                  className="block font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ol-orange-text)] sm:text-4xl"
                >
                  {`0${i + 1}`}
                </span>
                <Heading level={3} visualLevel={4} className="mt-4">
                  {p.title}
                </Heading>
                <p className="mt-3 text-[var(--color-ol-graphite)]/80">
                  {p.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Identité — coordonnées légales */}
      <section
        aria-labelledby="identite-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <div>
              <Eyebrow tone="orange">Identité</Eyebrow>
              <Heading id="identite-title" level={2} className="mt-4">
                {SITE.legalName}.
              </Heading>
              <p className="mt-4 text-lg text-[var(--color-ol-graphite)]/75">
                Raison sociale enregistrée à Abidjan, gouvernée par une équipe
                ivoirienne. Infrastructure souveraine sous notre seul contrôle
                opérationnel.
              </p>
            </div>

            <dl className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                >
                  <Building2 width={20} height={20} aria-hidden />
                </span>
                <div>
                  <dt className="text-xs tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
                    RCCM
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--color-ol-night)]">
                    {SITE.rccm}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                >
                  <MapPin width={20} height={20} aria-hidden />
                </span>
                <div>
                  <dt className="text-xs tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
                    Siège
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--color-ol-night)]">
                    {SITE.address.streetAddress}
                    <br />
                    {SITE.address.addressLocality}, {SITE.address.addressRegion}{' '}
                    · {SITE.address.addressCountry}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                >
                  <Phone width={20} height={20} aria-hidden />
                </span>
                <div>
                  <dt className="text-xs tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
                    Téléphone
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--color-ol-night)]">
                    <a
                      href={`tel:${SITE.contact.primaryPhone.replace(/\s/g, '')}`}
                      className="hover:text-[var(--color-ol-orange-text)]"
                    >
                      {SITE.contact.primaryPhone}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                >
                  <Mail width={20} height={20} aria-hidden />
                </span>
                <div>
                  <dt className="text-xs tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
                    Email
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--color-ol-night)]">
                    <a
                      href={`mailto:${SITE.contact.email}`}
                      className="hover:text-[var(--color-ol-orange-text)]"
                    >
                      {SITE.contact.email}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4 sm:col-span-2">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                >
                  <Globe2 width={20} height={20} aria-hidden />
                </span>
                <div>
                  <dt className="text-xs tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
                    LinkedIn
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--color-ol-night)]">
                    <a
                      href={SITE.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-[var(--color-ol-orange-text)]"
                    >
                      Suivre OpenLab Consulting
                      <ArrowUpRight width={14} height={14} aria-hidden />
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 rounded-md bg-[var(--color-ol-night)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-ol-navy)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
            >
              Nous contacter
              <ArrowUpRight width={14} height={14} aria-hidden />
            </Link>
            <Link
              href="/laboratoire"
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-ol-mist)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-ol-night)] transition-colors hover:border-[var(--color-ol-orange)]/40"
            >
              Visiter le laboratoire
              <ArrowUpRight width={14} height={14} aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
