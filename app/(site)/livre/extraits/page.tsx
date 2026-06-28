import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Mail } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { BOOK, CHAPTERS } from '@/lib/data/book';
import { alternatesFor } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: `Extraits gratuits : ${BOOK.title}`,
  description:
    'Préface intégrale + chapitre 06 (RAG souverain) en accès libre. Téléchargement PDF gratuit contre simple email professionnel.',
  alternates: alternatesFor('/livre/extraits'),
};

const FEATURED_CHAPTER =
  CHAPTERS.find((c) => c.title.includes('RAG')) ?? CHAPTERS[5];

export default function LivreExtraitsPage(): React.ReactElement {
  return (
    <main id="main">
      {/* Hero */}
      <section
        aria-labelledby="extraits-title"
        className="bg-[var(--color-ol-ivory)] py-20 sm:py-28"
      >
        <Container width="wide">
          <Link
            href="/livre"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-graphite)]/65 transition-colors hover:text-[var(--color-ol-orange-text)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <ArrowLeft width={16} height={16} aria-hidden />
            Page du livre
          </Link>

          <div className="mt-10 max-w-3xl">
            <Eyebrow tone="orange">Extraits gratuits</Eyebrow>
            <Heading id="extraits-title" level={1} className="mt-4">
              Lisez avant{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                d’acheter
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              On vous laisse jauger le ton, la rigueur, la profondeur technique.
              Préface intégrale en lecture directe, chapitre choisi
              téléchargeable en PDF contre simple email professionnel.
            </p>
          </div>
        </Container>
      </section>

      {/* Préface intégrale */}
      <section
        aria-labelledby="preface-title"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="narrow">
          <Eyebrow tone="orange">Préface intégrale</Eyebrow>
          <Heading id="preface-title" level={2} className="mt-4">
            Pourquoi écrire ce livre à Abidjan, en 2026.
          </Heading>

          <div className="mt-8 space-y-6 font-[family-name:var(--font-editorial)] text-lg leading-relaxed text-[var(--color-ol-graphite)]/90 sm:text-xl">
            <p>
              Pendant trente ans, on nous a expliqué que la technologie
              viendrait d’ailleurs. Que la recherche se ferait ailleurs. Que les
              modèles seraient entraînés ailleurs. Ce livre est né d’un refus
              poli mais ferme de cette assignation.
            </p>
            <p>
              L’intelligence artificielle n’est pas une discipline importée.
              C’est un outil de transformation qui se déploie dans des
              contextes, et nos contextes africains francophones ont leurs
              propres exigences : conformité CNPS, multi-devises FCFA-EUR,
              climatologie SODEXAM, parcelles cacao géoréférencées, fraude
              documentaire spécifique, et un cadre réglementaire qui s’écrit en
              ce moment-même.
            </p>
            <p>
              Ce livre s’adresse à quatre publics, étudiants ingénieurs, data
              scientists confirmés, dirigeants, enseignants, avec une promesse
              simple : chaque chapitre est utilisable seul, et chaque concept
              est ancré sur un déploiement réel. Le capstone final, AgroSense
              CI, montre comment on passe d’un capteur planté dans un champ
              cacao à un dashboard exécutif de coopérative.
            </p>
            <p>
              Vous n’êtes pas obligé de me croire sur parole : tout le code est
              sur GitHub, tous les datasets sont ouverts, toutes les corrections
              de coquilles sont publiques. Bonne lecture.
            </p>
          </div>

          <p className="mt-10 text-right text-sm text-[var(--color-ol-graphite)]/70">
            Debora Ahouma · Abidjan, mai 2026
          </p>
        </Container>
      </section>

      {/* Téléchargement chapitre gating email */}
      <section
        aria-labelledby="chapitre-gratuit-title"
        className="relative isolate overflow-hidden bg-[var(--color-ol-night)] py-20 text-[var(--color-ol-ivory)] sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 -z-10 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,90,0,0.18), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-20">
            <div>
              <Eyebrow tone="orange">Chapitre complet offert</Eyebrow>
              <Heading
                id="chapitre-gratuit-title"
                level={2}
                className="mt-4 text-[var(--color-ol-ivory)]"
              >
                {FEATURED_CHAPTER?.title}
              </Heading>
              <p className="mt-3 text-sm tracking-widest text-[var(--color-ol-ivory)]/60 uppercase">
                Chapitre {FEATURED_CHAPTER?.index} ·{' '}
                {FEATURED_CHAPTER?.readingTime}
              </p>
              <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-ivory)]/85">
                {FEATURED_CHAPTER?.summary}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {FEATURED_CHAPTER?.keywords.map((kw) => (
                  <li key={kw}>
                    <Badge tone="neutral">{kw}</Badge>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="border-[var(--color-ol-ivory)]/10 bg-[var(--color-ol-ivory)]/5 p-8 backdrop-blur-sm">
              <form
                method="get"
                action="/livre/extraits"
                aria-label="Recevoir l’extrait gratuit par e-mail"
                className="flex flex-col gap-4"
              >
                <label
                  htmlFor="extrait-email"
                  className="text-sm font-medium text-[var(--color-ol-ivory)]"
                >
                  Adresse e-mail professionnelle
                </label>
                <input
                  id="extrait-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="prenom@votre-entreprise.com"
                  className="min-h-12 rounded-md border border-[var(--color-ol-ivory)]/20 bg-[var(--color-ol-ivory)]/10 px-4 text-base text-[var(--color-ol-ivory)] placeholder:text-[var(--color-ol-ivory)]/45 focus:border-[var(--color-ol-orange)] focus:bg-[var(--color-ol-ivory)]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ol-night)]"
                />

                <Button type="submit" variant="primary" size="lg">
                  <Mail width={20} height={20} aria-hidden />
                  Recevoir le PDF gratuit
                </Button>

                <p className="text-xs text-[var(--color-ol-ivory)]/55">
                  Pas de spam, désabonnement en un clic. La pipeline d’envoi
                  sera branchée en P8 (Resend/Brevo + validation Zod côté
                  serveur + rate limit Redis).
                </p>
              </form>
            </Card>
          </div>
        </Container>
      </section>

      {/* Lecture intégrale = acheter */}
      <section className="bg-[var(--color-ol-ivory)] py-16">
        <Container
          width="wide"
          className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"
        >
          <p className="max-w-xl text-[var(--color-ol-graphite)]/80">
            Envie de tout lire d’une traite ? La version PDF + ePub complète
            paraît en 2026, en numérique direct chez OpenLab puis en imprimé
            chez les principaux distributeurs.
          </p>
          <Button
            as="a"
            href="/livre/acheter"
            variant="primary"
            size="lg"
            className="shrink-0"
          >
            <BookOpen width={20} height={20} aria-hidden />
            Réserver le livre complet
          </Button>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
