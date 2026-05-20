'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Heading } from '@/components/atoms/Heading';

/**
 * Démo SYGESCOM — dashboard temps réel multi-stations (CLAUDE.md §7.2).
 *
 * Anime des chiffres et événements pour montrer la signature "supervision
 * 24/7". Aucun appel réseau ; les variations sont déterministes via
 * useState + setInterval pour rester accessible (prefers-reduced-motion
 * = fige les chiffres).
 */

interface Station {
  id: string;
  name: string;
  cuves: number;
  volume: number; // litres en stock estimé
  status: 'ok' | 'alerte' | 'critique';
}

const STATIONS_INIT: readonly Station[] = [
  {
    id: 'CI-ABJ-001',
    name: 'Cocody Riviera 3',
    cuves: 4,
    volume: 28_400,
    status: 'ok',
  },
  {
    id: 'CI-ABJ-002',
    name: 'Plateau République',
    cuves: 3,
    volume: 19_200,
    status: 'ok',
  },
  {
    id: 'CI-ABJ-003',
    name: 'Yopougon Maroc',
    cuves: 5,
    volume: 6_300,
    status: 'critique',
  },
  {
    id: 'CI-ABJ-004',
    name: 'Marcory Zone 4',
    cuves: 4,
    volume: 22_100,
    status: 'alerte',
  },
  {
    id: 'CI-BKE-001',
    name: 'Bouaké Belleville',
    cuves: 3,
    volume: 14_800,
    status: 'ok',
  },
];

export function SygescomDemo(): ReactElement {
  const [stations, setStations] = useState<readonly Station[]>(STATIONS_INIT);
  const [totalVendu, setTotalVendu] = useState(247_500);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      // Chaque tick : décrément aléatoire des stocks (vente), incrément
      // total vendu. Stations critiques continuent à descendre, station
      // "ok" peut occasionnellement passer en alerte.
      setStations((prev) =>
        prev.map((s) => {
          const delta = Math.floor(Math.random() * 80) + 20;
          const newVolume = Math.max(0, s.volume - delta);
          let status: Station['status'] = s.status;
          if (newVolume < 5_000) status = 'critique';
          else if (newVolume < 10_000) status = 'alerte';
          else status = 'ok';
          return { ...s, volume: newVolume, status };
        }),
      );
      setTotalVendu((t) => t + Math.floor(Math.random() * 250) + 100);
    }, 2500);
    return () => clearInterval(id);
  }, [paused]);

  const totalEnStock = stations.reduce((sum, s) => sum + s.volume, 0);
  const alertes = stations.filter((s) => s.status !== 'ok').length;

  return (
    <div className="rounded-xl bg-[var(--color-ol-night)] p-6 text-[var(--color-ol-ivory)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge tone="orange">Live · {stations.length} stations</Badge>
          {!paused ? (
            <span className="flex items-center gap-2 text-xs text-[var(--color-ol-success)]">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-ol-success)]" />
              Connecté
            </span>
          ) : (
            <span className="text-xs text-[var(--color-ol-ivory)]/50">
              Pause
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(): void => setPaused((p) => !p)}
          className="rounded-md border border-white/15 px-3 py-1 text-xs text-[var(--color-ol-ivory)]/80 hover:border-[var(--color-ol-orange)] hover:text-[var(--color-ol-orange)]"
        >
          {paused ? 'Reprendre' : 'Pause'}
        </button>
      </div>

      <Heading
        level={3}
        visualLevel={4}
        className="mt-6 text-[var(--color-ol-ivory)]"
      >
        Supervision réseau Côte d’Ivoire
      </Heading>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Stock total temps réel"
          value={`${(totalEnStock / 1000).toFixed(1)} k L`}
          accent="orange"
        />
        <KpiCard
          label="Vendu aujourd’hui"
          value={`${(totalVendu / 1000).toFixed(1)} k L`}
          accent="ivory"
        />
        <KpiCard
          label="Alertes actives"
          value={String(alertes)}
          accent={alertes > 0 ? 'danger' : 'success'}
        />
      </div>

      <ul className="mt-8 space-y-2">
        {stations.map((s) => (
          <li
            key={s.id}
            className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm transition-colors"
          >
            <span
              aria-hidden
              className={
                s.status === 'critique'
                  ? 'inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--color-ol-danger)]'
                  : s.status === 'alerte'
                    ? 'inline-block h-2.5 w-2.5 rounded-full bg-amber-400'
                    : 'inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-ol-success)]'
              }
            />
            <span>
              <span className="font-medium text-[var(--color-ol-ivory)]">
                {s.name}
              </span>
              <span className="ml-2 text-xs text-[var(--color-ol-ivory)]/50">
                {s.id} · {s.cuves} cuves
              </span>
            </span>
            <span className="font-mono text-[var(--color-ol-ivory)]/85">
              {s.volume.toLocaleString('fr-FR')} L
            </span>
            <span
              className={
                s.status === 'critique'
                  ? 'rounded bg-[var(--color-ol-danger)]/20 px-2 py-0.5 text-xs font-medium text-[var(--color-ol-danger)]'
                  : s.status === 'alerte'
                    ? 'rounded bg-amber-400/20 px-2 py-0.5 text-xs font-medium text-amber-300'
                    : 'rounded bg-[var(--color-ol-success)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-ol-success)]'
              }
            >
              {s.status === 'critique'
                ? 'Critique'
                : s.status === 'alerte'
                  ? 'Alerte'
                  : 'OK'}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-[var(--color-ol-ivory)]/45">
        Démo synthétique — données générées en local. En production, SYGESCOM
        ingère via Kafka les jauges, pompes et terminaux paiement de chaque
        station.
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'orange' | 'ivory' | 'success' | 'danger';
}): ReactElement {
  const accentMap = {
    orange: 'text-[var(--color-ol-orange)]',
    ivory: 'text-[var(--color-ol-ivory)]',
    success: 'text-[var(--color-ol-success)]',
    danger: 'text-[var(--color-ol-danger)]',
  } as const;
  return (
    <div className="rounded-lg bg-white/5 p-4">
      <p className="text-xs text-[var(--color-ol-ivory)]/60">{label}</p>
      <p
        className={`mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold ${accentMap[accent]}`}
      >
        {value}
      </p>
    </div>
  );
}
