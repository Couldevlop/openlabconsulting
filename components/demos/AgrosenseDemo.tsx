'use client';

import { useState, type ReactElement } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Heading } from '@/components/atoms/Heading';

interface Parcelle {
  id: string;
  x: number;
  y: number;
  culture: 'cacao' | 'anacarde' | 'coton';
  surface: number;
  humidite: number;
  alerte: string | null;
  rendementEstime: string;
}

const PARCELLES: readonly Parcelle[] = [
  {
    id: 'DLA-001',
    x: 30,
    y: 25,
    culture: 'cacao',
    surface: 3.2,
    humidite: 78,
    alerte: null,
    rendementEstime: '+18 %',
  },
  {
    id: 'DLA-002',
    x: 55,
    y: 38,
    culture: 'cacao',
    surface: 4.5,
    humidite: 42,
    alerte: 'Stress hydrique modéré',
    rendementEstime: '−4 %',
  },
  {
    id: 'DLA-003',
    x: 70,
    y: 60,
    culture: 'cacao',
    surface: 2.1,
    humidite: 35,
    alerte: 'Pourriture brune J+14',
    rendementEstime: '−22 % si non traité',
  },
  {
    id: 'DLA-004',
    x: 25,
    y: 65,
    culture: 'anacarde',
    surface: 6.0,
    humidite: 71,
    alerte: null,
    rendementEstime: '+9 %',
  },
  {
    id: 'DLA-005',
    x: 45,
    y: 75,
    culture: 'coton',
    surface: 3.8,
    humidite: 65,
    alerte: null,
    rendementEstime: 'stable',
  },
];

export function AgrosenseDemo(): ReactElement {
  const [selected, setSelected] = useState<Parcelle>(PARCELLES[0]!);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-xl bg-[#0d2818] p-6 text-[var(--color-ol-ivory)] sm:p-8">
        <Badge tone="orange">Carte parcelles · Coopérative Daloa</Badge>
        <Heading
          level={3}
          visualLevel={4}
          className="mt-4 text-[var(--color-ol-ivory)]"
        >
          5 parcelles instrumentées
        </Heading>

        <svg
          viewBox="0 0 100 100"
          className="mt-6 aspect-square w-full rounded-lg bg-[#163d27]"
          aria-label="Carte des parcelles agricoles"
        >
          {/* Fond végétation */}
          {Array.from({ length: 30 }).map((_, i) => (
            <circle
              key={i}
              cx={((i * 17) % 100) + 3}
              cy={((i * 23) % 100) + 4}
              r={0.5 + (i % 3) * 0.3}
              fill="#1f5a3a"
              opacity={0.6}
            />
          ))}

          {/* Cours d'eau stylisé */}
          <path
            d="M 0 50 Q 30 45 50 55 T 100 60"
            stroke="#4a90c2"
            strokeWidth="1.5"
            fill="none"
            opacity="0.7"
          />

          {/* Parcelles */}
          {PARCELLES.map((p) => {
            const isSelected = p.id === selected.id;
            const color = p.alerte
              ? p.alerte.includes('Pourriture')
                ? '#DC2626'
                : '#FBBF24'
              : '#22C55E';
            return (
              <g
                key={p.id}
                onClick={(): void => setSelected(p)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 4.5 : 3}
                  fill={color}
                  fillOpacity={isSelected ? 0.9 : 0.7}
                  stroke="white"
                  strokeWidth={isSelected ? 1 : 0.5}
                />
                {p.alerte ? (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.5"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="r"
                      values="3;8;3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                ) : null}
              </g>
            );
          })}
        </svg>

        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
            Sain
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FBBF24]" />
            Stress hydrique
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#DC2626]" />
            Maladie détectée
          </span>
        </div>
      </div>

      <div
        aria-live="polite"
        className="rounded-xl border border-[var(--color-ol-mist)] bg-white p-6 shadow-sm sm:p-8"
      >
        <Badge tone="orange">Parcelle {selected.id}</Badge>
        <p className="mt-3 text-sm tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
          {selected.culture} · {selected.surface} ha
        </p>

        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="text-[var(--color-ol-graphite)]/70">
              Humidité du sol
            </dt>
            <dd className="mt-1 flex items-center gap-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-ol-mist)]">
                <div
                  className={
                    selected.humidite < 50
                      ? 'h-full rounded-full bg-amber-400'
                      : 'h-full rounded-full bg-[var(--color-ol-success)]'
                  }
                  style={{ width: `${selected.humidite}%` }}
                />
              </div>
              <span className="font-mono text-base font-semibold text-[var(--color-ol-night)]">
                {selected.humidite} %
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-ol-graphite)]/70">
              Rendement estimé
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ol-orange-text)]">
              {selected.rendementEstime}
            </dd>
          </div>
          {selected.alerte ? (
            <div className="rounded-lg bg-[var(--color-ol-danger)]/10 p-4 text-[var(--color-ol-danger)]">
              <p className="text-xs tracking-widest uppercase">Alerte IA</p>
              <p className="mt-1 font-medium">{selected.alerte}</p>
              <p className="mt-3 text-xs text-[var(--color-ol-graphite)]/70">
                Modèle CHIRPS + ERA5 + observation terrain. Recommandation :
                traitement bicaprotec dans les 3 jours.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-[var(--color-ol-success)]/10 p-4 text-[var(--color-ol-success)]">
              <p className="font-medium">Aucune alerte active.</p>
              <p className="mt-1 text-xs text-[var(--color-ol-graphite)]/70">
                Prochaine analyse satellite : J+3.
              </p>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
