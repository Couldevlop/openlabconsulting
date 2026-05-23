import type { Metadata } from 'next';
import { AuditIaQuizWizard } from '@/components/forms/AuditIaQuizWizard';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';

export const metadata: Metadata = {
  title: 'Audit IA gratuit — Questionnaire interactif + recommandation',
  description:
    'Cinq questions pour cadrer votre besoin IA, une recommandation adaptée (atelier, audit éclair, cadrage stratégique ou programme), un consultant senior sous 48 h.',
  alternates: { canonical: '/audit-ia' },
};

const STEPS = [
  {
    step: '01',
    title: 'Questionnaire · 3 min',
    body: 'Cinq questions séquentielles pour qualifier votre maturité IA, votre secteur, votre périmètre et votre urgence.',
  },
  {
    step: '02',
    title: 'Recommandation instantanée',
    body: 'Un format d’audit adapté (atelier, audit éclair, cadrage stratégique, programme) avec durée et livrable annoncés.',
  },
  {
    step: '03',
    title: 'Consultant senior · 48 h',
    body: 'Un consultant senior reprend contact sous 48 h ouvrées avec votre contexte déjà compris — pas de questions répétées.',
  },
];

export default function AuditIaPage(): React.ReactElement {
  return (
    <main id="main">
      {/* Hero éditorial */}
      <section
        aria-labelledby="audit-ia-page-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <div className="max-w-3xl">
            <Eyebrow tone="orange">Audit IA gratuit</Eyebrow>
            <Heading id="audit-ia-page-title" level={1} className="mt-4">
              Cinq questions pour savoir si l’IA{' '}
              <span className="text-[var(--color-ol-orange)]">
                vous fera gagner du temps
              </span>
              .
            </Heading>
            <p className="mt-6 font-[family-name:var(--font-editorial)] text-xl leading-relaxed text-[var(--color-ol-graphite)]/85 italic sm:text-2xl">
              Pas un appel commercial déguisé. Un cadrage opérationnel qui
              commence par un questionnaire interactif, débouche sur une
              recommandation contextuelle, et finit avec un consultant senior
              qui connaît déjà votre contexte.
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
            <Eyebrow tone="orange">Comment ça se passe</Eyebrow>
            <Heading id="process-title" level={2} className="mt-4">
              Trois étapes. Aucune surprise.
            </Heading>
          </div>

          <ol className="mt-12 grid gap-x-12 gap-y-10 lg:grid-cols-3">
            {STEPS.map(({ step, title, body }) => (
              <li
                key={step}
                className="border-t-2 border-[var(--color-ol-orange)] pt-6"
              >
                <span
                  aria-hidden
                  className="block font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ol-orange)] sm:text-4xl"
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
