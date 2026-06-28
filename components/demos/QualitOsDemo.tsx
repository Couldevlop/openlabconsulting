'use client';

import { useState, type ReactElement } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Heading } from '@/components/atoms/Heading';

interface Cause {
  category: 'Méthode' | 'Milieu' | 'Main d’œuvre' | 'Matière' | 'Matériel';
  label: string;
}

const CAUSES: readonly Cause[] = [
  { category: 'Méthode', label: 'Procédure ISO non appliquée' },
  { category: 'Méthode', label: 'Contrôle qualité trop espacé' },
  { category: 'Milieu', label: 'Température atelier > seuil' },
  { category: 'Milieu', label: 'Humidité ambiante variable' },
  { category: 'Main d’œuvre', label: 'Formation rotation insuffisante' },
  { category: 'Main d’œuvre', label: 'Fatigue post-équipe 3' },
  { category: 'Matière', label: 'Lot fournisseur tracé hors-spec' },
  { category: 'Matière', label: 'Mélange dosage manuel' },
  { category: 'Matériel', label: 'Calibration machine périmée' },
  { category: 'Matériel', label: 'Capteur défaillant pH' },
];

const ANALYSE_IA = [
  '1. Lot matière hors-spec (87 % corrélation)',
  '2. Calibration capteur pH non conforme depuis 18 jours',
  '3. Combinaison températures > 32 °C + dosage manuel',
];

export function QualitOsDemo(): ReactElement {
  const [selected, setSelected] = useState<Cause['category'] | null>(null);

  const branches: Cause['category'][] = [
    'Méthode',
    'Milieu',
    'Main d’œuvre',
    'Matière',
    'Matériel',
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-xl border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-6 shadow-sm sm:p-8">
        <Badge tone="orange">Ishikawa (5M) : assisté IA</Badge>
        <Heading level={3} visualLevel={4} className="mt-4">
          Non-conformité lot #2026-04-A.
        </Heading>
        <p className="mt-2 text-sm text-[var(--color-ol-graphite)]/65">
          Dépassement seuil pH sur 3 contrôles successifs. Cliquez sur une
          branche pour voir les causes potentielles.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {branches.map((b) => {
            const isOn = selected === b;
            return (
              <button
                type="button"
                key={b}
                onClick={(): void => setSelected(isOn ? null : b)}
                className={
                  isOn
                    ? 'rounded-lg border-2 border-[var(--color-ol-orange)] bg-white p-4 text-left text-sm font-medium text-[var(--color-ol-night)] transition-colors'
                    : 'rounded-lg border border-[var(--color-ol-mist)] bg-white p-4 text-left text-sm font-medium text-[var(--color-ol-graphite)]/70 transition-colors hover:border-[var(--color-ol-orange)]/40'
                }
              >
                {b}
              </button>
            );
          })}
        </div>

        {selected ? (
          <ul className="mt-6 space-y-2">
            {CAUSES.filter((c) => c.category === selected).map((c) => (
              <li
                key={c.label}
                className="rounded-md border border-[var(--color-ol-mist)] bg-white px-4 py-3 text-sm text-[var(--color-ol-graphite)]/85"
              >
                {c.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-xl bg-[var(--color-ol-night)] p-6 text-[var(--color-ol-ivory)] sm:p-8">
        <Badge tone="orange">Analyse Claude</Badge>
        <Heading
          level={3}
          visualLevel={4}
          className="mt-4 text-[var(--color-ol-ivory)]"
        >
          Trois causes les plus probables.
        </Heading>

        <ol className="mt-6 space-y-3 text-sm">
          {ANALYSE_IA.map((c) => (
            <li
              key={c}
              className="rounded-md bg-white/5 px-4 py-3 text-[var(--color-ol-ivory)]/85"
            >
              {c}
            </li>
          ))}
        </ol>

        <p className="mt-6 text-xs text-[var(--color-ol-ivory)]/45">
          L’opérateur valide ou recadre, le modèle apprend des décisions finales
          pour les analyses futures.
        </p>
      </div>
    </div>
  );
}
