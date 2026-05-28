'use client';

import { useState, type ReactElement } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Heading } from '@/components/atoms/Heading';

interface Quartier {
  id: string;
  nom: string;
  risque: number; // 0-100
  facteurs: readonly string[];
}

const QUARTIERS: readonly Quartier[] = [
  {
    id: 'Q1',
    nom: 'Cocody',
    risque: 22,
    facteurs: ['Mobilité fluide', 'Densité maîtrisée'],
  },
  {
    id: 'Q2',
    nom: 'Plateau',
    risque: 38,
    facteurs: ['Flux pendulaires élevés'],
  },
  {
    id: 'Q3',
    nom: 'Marcory',
    risque: 41,
    facteurs: ['Trafic dense soir', 'Quelques signalements'],
  },
  {
    id: 'Q4',
    nom: 'Treichville',
    risque: 56,
    facteurs: ['Mobilité contrainte', 'Densité forte'],
  },
  {
    id: 'Q5',
    nom: 'Yopougon',
    risque: 78,
    facteurs: [
      'Densité critique',
      'Signalements en hausse',
      'Équipements publics insuffisants',
    ],
  },
  {
    id: 'Q6',
    nom: 'Adjamé',
    risque: 65,
    facteurs: ['Marché central', 'Flux non régulé'],
  },
  {
    id: 'Q7',
    nom: 'Abobo',
    risque: 71,
    facteurs: ['Densité critique', 'Mobilité saturée'],
  },
  { id: 'Q8', nom: 'Koumassi', risque: 52, facteurs: ['Mobilité contrainte'] },
  {
    id: 'Q9',
    nom: 'Port-Bouët',
    risque: 33,
    facteurs: ['Zone aéroportuaire stable'],
  },
];

function colorForRisk(risque: number): string {
  if (risque >= 70) return '#DC2626';
  if (risque >= 50) return '#F97316';
  if (risque >= 30) return '#FBBF24';
  return '#22C55E';
}

export function SmartCityDemo(): ReactElement {
  const [selected, setSelected] = useState<Quartier>(QUARTIERS[4]!);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-xl bg-[var(--color-ol-night)] p-6 text-[var(--color-ol-ivory)] sm:p-8">
        <Badge tone="orange">Abidjan — modèle prédictif J+7</Badge>
        <Heading
          level={3}
          visualLevel={4}
          className="mt-4 text-[var(--color-ol-ivory)]"
        >
          Indice de risque par quartier
        </Heading>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {QUARTIERS.map((q) => {
            const isSel = q.id === selected.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={(): void => setSelected(q)}
                aria-label={`Quartier ${q.nom} — risque ${q.risque}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 transition-all hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)]"
                style={{
                  backgroundColor: colorForRisk(q.risque),
                  opacity: isSel ? 1 : 0.65,
                }}
              >
                <div className="absolute inset-0 flex flex-col justify-between p-3 text-left text-white">
                  <span className="text-xs font-semibold">{q.nom}</span>
                  <span className="font-[family-name:var(--font-display)] text-2xl font-bold">
                    {q.risque}
                  </span>
                </div>
                {isSel ? (
                  <div
                    className="absolute inset-0 ring-2 ring-white"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#22C55E]" />
            Faible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#FBBF24]" />
            Modéré
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#F97316]" />
            Élevé
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#DC2626]" />
            Critique
          </span>
        </div>
      </div>

      <div
        aria-live="polite"
        className="rounded-xl border border-[var(--color-ol-mist)] bg-white p-6 shadow-sm sm:p-8"
      >
        <Badge tone="orange">{selected.nom}</Badge>
        <p className="mt-3 text-sm tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
          Indice de risque
        </p>
        <p
          className="mt-2 font-[family-name:var(--font-display)] text-5xl font-semibold"
          style={{ color: colorForRisk(selected.risque) }}
        >
          {selected.risque}
          <span className="text-2xl text-[var(--color-ol-graphite)]/70">
            /100
          </span>
        </p>

        <div className="mt-6">
          <p className="text-xs tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
            Facteurs contributeurs
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {selected.facteurs.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-[var(--color-ol-graphite)]/80"
              >
                <span
                  aria-hidden
                  className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-ol-orange)]"
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-xs text-[var(--color-ol-graphite)]/70">
          Anonymisation différentielle appliquée dès l’ingestion. Aucune
          identification individuelle possible.
        </p>
      </div>
    </div>
  );
}
