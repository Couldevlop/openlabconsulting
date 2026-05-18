import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { Button } from '@/components/atoms/Button';

export default function HomePage(): React.ReactElement {
  return (
    <main id="main">
      <Container as="section" width="narrow" className="py-24 sm:py-32">
        <Eyebrow>P1 — Design system</Eyebrow>
        <Heading level={1} className="mt-4">
          Site OpenLab Consulting — shell applicatif posé
        </Heading>
        <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
          Cette page placeholder confirme que les polices, tokens, atomes,
          navbar, footer et middleware de sécurité sont opérationnels. La
          homepage finale (11 sections, hero WebGL) est livrée en P2 — voir
          CLAUDE.md §6.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button as="a" href="/audit-ia" variant="primary" size="lg">
            Demander un audit IA
          </Button>
          <Button as="a" href="/solutions" variant="ghost" size="lg">
            Voir l’écosystème produits
          </Button>
        </div>
      </Container>
    </main>
  );
}
