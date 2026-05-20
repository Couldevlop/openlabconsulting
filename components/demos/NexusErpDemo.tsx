'use client';

import { useState, type ReactElement } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Heading } from '@/components/atoms/Heading';

type Devise = 'XOF' | 'EUR' | 'USD';

const TAUX: Record<Devise, number> = {
  XOF: 1, // base
  EUR: 1 / 656, // 1 EUR = 656 FCFA (parité fixe)
  USD: 1 / 595, // ~ taux 2026
};

const SYMBOLS: Record<Devise, string> = {
  XOF: 'F CFA',
  EUR: '€',
  USD: '$',
};

interface Kpi {
  label: string;
  amountXof: number;
  delta: string;
  trend: number[];
}

const KPIS: readonly Kpi[] = [
  {
    label: 'CA consolidé · groupe',
    amountXof: 1_847_500_000,
    delta: '+12,4 %',
    trend: [42, 48, 55, 53, 61, 68, 72, 70, 78, 84, 87, 92],
  },
  {
    label: 'Marge brute',
    amountXof: 624_300_000,
    delta: '+8,2 %',
    trend: [30, 32, 35, 33, 38, 41, 44, 42, 48, 52, 55, 58],
  },
  {
    label: 'Encours clients',
    amountXof: 412_800_000,
    delta: '−5,1 %',
    trend: [60, 62, 65, 67, 64, 60, 58, 55, 52, 48, 46, 42],
  },
];

function formatAmount(xof: number, devise: Devise): string {
  const value = xof * TAUX[devise];
  const formatted =
    devise === 'XOF'
      ? Math.round(value).toLocaleString('fr-CI')
      : value.toLocaleString('fr-FR', {
          maximumFractionDigits: 0,
        });
  return `${formatted} ${SYMBOLS[devise]}`;
}

export function NexusErpDemo(): ReactElement {
  const [devise, setDevise] = useState<Devise>('XOF');

  return (
    <div className="rounded-xl border border-[var(--color-ol-mist)] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="orange">Dashboard exécutif · multi-devises</Badge>
        <div
          role="tablist"
          aria-label="Sélection devise"
          className="inline-flex rounded-md border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-1"
        >
          {(['XOF', 'EUR', 'USD'] as Devise[]).map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={devise === d}
              onClick={(): void => setDevise(d)}
              className={
                devise === d
                  ? 'rounded bg-[var(--color-ol-orange)] px-3 py-1.5 text-xs font-semibold text-white'
                  : 'rounded px-3 py-1.5 text-xs font-medium text-[var(--color-ol-graphite)]/70 hover:text-[var(--color-ol-night)]'
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <Heading level={3} visualLevel={4} className="mt-6">
        Avril 2026 — clôture mensuelle
      </Heading>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {KPIS.map((k) => {
          const isNegative = k.delta.startsWith('−');
          const max = Math.max(...k.trend);
          return (
            <div
              key={k.label}
              className="rounded-lg border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-5"
            >
              <p className="text-xs text-[var(--color-ol-graphite)]/65">
                {k.label}
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ol-night)]">
                {formatAmount(k.amountXof, devise)}
              </p>
              <p
                className={
                  isNegative
                    ? 'mt-1 text-xs font-medium text-[var(--color-ol-danger)]'
                    : 'mt-1 text-xs font-medium text-[var(--color-ol-success)]'
                }
              >
                {k.delta} vs mois précédent
              </p>
              <svg viewBox="0 0 120 30" className="mt-4 h-8 w-full" aria-hidden>
                <polyline
                  fill="none"
                  stroke={isNegative ? '#DC2626' : '#FF5A00'}
                  strokeWidth="1.5"
                  points={k.trend
                    .map(
                      (v, i) =>
                        `${(i / (k.trend.length - 1)) * 120},${30 - (v / max) * 28}`,
                    )
                    .join(' ')}
                />
              </svg>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-[var(--color-ol-graphite)]/55">
        Consolidation temps réel SYSCOHADA + PCG France. Drill-down par BU,
        pays, période en un clic dans l’application.
      </p>
    </div>
  );
}
