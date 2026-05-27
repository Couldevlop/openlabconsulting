import type { Metadata } from 'next';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';

export const metadata: Metadata = {
  title: 'Audit IA gratuit — Cartographie cas d’usage + ROI estimé',
  description:
    'Trente minutes avec un consultant senior pour cadrer vos cas d’usage IA prioritaires, leur ROI estimé et trois prochaines étapes activables.',
  alternates: { canonical: '/audit-ia' },
};

const STEPS = [
  {
    step: '01',
    title: 'Cadrage initial · 30 min',
    body: 'Vous remplissez le formulaire (3 questions). On planifie un appel sous 24 h ouvrées.',
  },
  {
    step: '02',
    title: 'Audit terrain · 5 jours',
    body: 'Un consultant senior cartographie vos workflows, votre data disponible, vos contraintes réglementaires.',
  },
  {
    step: '03',
    title: 'Livrable PDF · 10 jours',
    body: 'Trois cas d’usage chiffrés (impact × faisabilité), une roadmap 6-18 mois, des outils opérables dès lundi.',
  },
];

export default function AuditIaPage(): React.ReactElement {
  return (
    <main id="main">
      {/* Hero éditorial */}
      <section
        aria-labelledby="audit-ia-page-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <div className="max-w-3xl">
            <Eyebrow tone="orange">Audit IA gratuit</Eyebrow>
            <Heading id="audit-ia-page-title" level={1} className="mt-4">
              Trente minutes pour savoir si l’IA{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                vous fera gagner du temps
              </span>
              .
            </Heading>
            <p className="mt-6 font-[family-name:var(--font-editorial)] text-xl leading-relaxed text-[var(--color-ol-graphite)]/85 italic sm:text-2xl">
              Pas un appel commercial déguisé. Un cadrage opérationnel mené par
              un consultant senior, débouchant sur une cartographie de cas
              d’usage IA priorisés par ROI mesurable.
            </p>
          </div>
        </Container>
      </section>

      {/* Process en 3 étapes */}
      <section
        aria-labelledby="process-title"
        className="bg-white py-20 sm:py-28"
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

      {/* Réutilisation du CTA homepage (qui contient le formulaire + livre blanc) */}
      <AuditIaCta />
    </main>
  );
}
