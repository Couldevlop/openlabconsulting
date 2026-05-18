export default function HomePage(): React.ReactElement {
  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-4 text-sm font-medium tracking-widest text-[var(--color-ol-orange)] uppercase">
        P0 — Fondations
      </p>
      <h1 className="text-4xl leading-tight font-semibold text-[var(--color-ol-night)] sm:text-5xl">
        Site OpenLab Consulting — scaffold initial
      </h1>
      <p className="mt-6 text-lg text-[var(--color-ol-graphite)]/80">
        Cette page placeholder confirme uniquement que la chaîne Next.js 15 +
        Tailwind v4 + TS strict est opérationnelle. La homepage réelle sera
        livrée en P2 (cf. CLAUDE.md §6).
      </p>
    </main>
  );
}
