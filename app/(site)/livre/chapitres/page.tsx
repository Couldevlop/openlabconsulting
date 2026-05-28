import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Code2, FlaskConical } from 'lucide-react';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { BOOK, CHAPTERS } from '@/lib/data/book';

export const metadata: Metadata = {
  title: `Chapitres — ${BOOK.title}`,
  description: `Les ${CHAPTERS.length} chapitres du livre OpenLab sur l’IA : du machine learning aux agents autonomes, en passant par MLOps, sécurité et capstone AgroSense.`,
  alternates: { canonical: '/livre/chapitres' },
};

export default function LivreChapitresPage(): React.ReactElement {
  const totalReadingMin = CHAPTERS.reduce((acc, c) => {
    const m = parseInt(c.readingTime.replace(/[^0-9]/g, ''), 10);
    return acc + (Number.isFinite(m) ? m : 0);
  }, 0);
  const totalHours = Math.round((totalReadingMin / 60) * 10) / 10;
  const codeCount = CHAPTERS.filter((c) => c.hasCode).length;
  const caseCount = CHAPTERS.filter((c) => c.hasCaseStudy).length;

  return (
    <main id="main">
      {/* Hero */}
      <section
        aria-labelledby="chapitres-title"
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
            <Eyebrow tone="orange">Table des chapitres</Eyebrow>
            <Heading id="chapitres-title" level={1} className="mt-4">
              {CHAPTERS.length} chapitres,{' '}
              <span className="text-[var(--color-ol-orange-text)]">
                ~{totalHours} h de lecture
              </span>
              .
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
              Chaque chapitre est conçu pour être lu indépendamment. Les numéros
              sont indicatifs — un dirigeant peut entrer par le chapitre 10
              (gouvernance) sans avoir lu les précédents.
            </p>

            <ul className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--color-ol-graphite)]/70">
              <li className="inline-flex items-center gap-2 rounded-md border border-[var(--color-ol-mist)] bg-white px-3 py-1.5">
                <Code2
                  width={16}
                  height={16}
                  aria-hidden
                  className="text-[var(--color-ol-orange-text)]"
                />
                {codeCount} chapitres avec exemples de code
              </li>
              <li className="inline-flex items-center gap-2 rounded-md border border-[var(--color-ol-mist)] bg-white px-3 py-1.5">
                <FlaskConical
                  width={16}
                  height={16}
                  aria-hidden
                  className="text-[var(--color-ol-orange-text)]"
                />
                {caseCount} chapitres avec étude de cas terrain
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* Liste */}
      <section
        aria-label="Liste des chapitres"
        className="bg-white py-20 sm:py-28"
      >
        <Container width="wide">
          <ol className="space-y-4">
            {CHAPTERS.map((c) => (
              <li key={c.index}>
                <Card
                  as="article"
                  className="grid gap-6 p-7 sm:grid-cols-[auto_1fr_auto] sm:items-start"
                >
                  <span
                    aria-hidden
                    className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ol-orange-text)] sm:text-4xl"
                  >
                    {c.index}
                  </span>

                  <div>
                    <Heading level={3} visualLevel={4}>
                      {c.title}
                    </Heading>
                    <p className="mt-2 text-[var(--color-ol-graphite)]/80">
                      {c.summary}
                    </p>

                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {c.keywords.map((kw) => (
                        <li key={kw}>
                          <Badge tone="neutral">{kw}</Badge>
                        </li>
                      ))}
                      {c.hasCode ? (
                        <li>
                          <Badge tone="orange">Code</Badge>
                        </li>
                      ) : null}
                      {c.hasCaseStudy ? (
                        <li>
                          <Badge tone="orange">Étude de cas</Badge>
                        </li>
                      ) : null}
                    </ul>
                  </div>

                  <span className="text-sm text-[var(--color-ol-graphite)]/70 sm:text-right">
                    {c.readingTime}
                  </span>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <AuditIaCta />
    </main>
  );
}
