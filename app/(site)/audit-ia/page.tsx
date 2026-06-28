import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AuditIaQuizWizard } from '@/components/forms/AuditIaQuizWizard';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAuditIaProcessContent } from '@/lib/cms/site-settings-server';
import { alternatesFor } from '@/lib/seo/site';
import { breadcrumbSchema, howToSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Audit IA gratuit : Questionnaire interactif + recommandation',
  description:
    'Cinq questions pour cadrer votre besoin IA, une recommandation adaptée (atelier, audit éclair, cadrage stratégique ou programme), un consultant senior sous 48 h.',
  alternates: alternatesFor('/audit-ia'),
};

export default async function AuditIaPage(): Promise<React.ReactElement> {
  const content = await getAuditIaProcessContent();
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <main id="main">
      <JsonLd
        nonce={nonce}
        data={[
          howToSchema({
            name: 'Réaliser un audit IA avec OpenLab',
            description:
              'Cadrer un projet d’intelligence artificielle en trois étapes, du questionnaire à la recommandation d’un consultant senior.',
            steps: content.steps.map((s) => ({
              title: s.title,
              body: s.body,
            })),
          }),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Audit IA', url: '/audit-ia' },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ label: 'Audit IA' }]} />
      {/* Hero éditorial */}
      <section
        aria-labelledby="audit-ia-page-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-3xl">
            <Eyebrow tone="orange">{content.heroEyebrow}</Eyebrow>
            <Heading id="audit-ia-page-title" level={1} className="mt-4">
              {content.headlineLead}{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                {content.headlineHighlight}
              </span>
              .
            </Heading>
            <p className="mt-6 font-[family-name:var(--font-editorial)] text-xl leading-relaxed text-[var(--color-ol-graphite)]/85 italic sm:text-2xl">
              {content.lead}
            </p>
          </div>
        </Container>
      </section>

      {/* Questionnaire interactif (cœur de la page) */}
      <section aria-labelledby="quiz-title" className="bg-white py-16 sm:py-24">
        <Container width="narrow">
          <span id="quiz-title" className="sr-only">
            Questionnaire interactif d’audit IA
          </span>
          <AuditIaQuizWizard />
        </Container>
      </section>

      {/* Process en 3 étapes (reste sous le quiz pour la pédagogie) */}
      <section
        aria-labelledby="process-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-2xl">
            <Eyebrow tone="orange">{content.processEyebrow}</Eyebrow>
            <Heading id="process-title" level={2} className="mt-4">
              {content.processHeadline}
            </Heading>
          </div>

          <ol className="mt-12 grid gap-x-12 gap-y-10 lg:grid-cols-3">
            {content.steps.map(({ step, title, body }) => (
              <li
                key={step}
                className="border-t-2 border-[var(--color-ol-orange)] pt-6"
              >
                <span
                  aria-hidden
                  className="block font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ol-orange-text)] sm:text-4xl"
                >
                  {step}
                </span>
                <Heading level={3} visualLevel={4} className="mt-4">
                  {title}
                </Heading>
                <p className="mt-3 text-[var(--color-ol-graphite)]/80">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </main>
  );
}
