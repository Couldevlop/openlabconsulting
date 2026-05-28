'use client';

import { useMemo, useState, type ReactElement } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Heading } from '@/components/atoms/Heading';
import {
  calculerPaie,
  formatFcfa,
  type PaieInput,
} from '@/lib/demos/nexusrh-paie';

/**
 * Démo interactive NexusRH — simulateur de paie conforme CNPS / ITS /
 * FDFP / CMU 2025-2026 (CLAUDE.md §7.2).
 *
 * Calcul exact côté client via `lib/demos/nexusrh-paie.ts`. Aucune
 * donnée envoyée au serveur. Vitrine de précision : on ne triche pas
 * sur les barèmes, on les expose.
 */
export function NexusRhDemo(): ReactElement {
  const [brut, setBrut] = useState(450_000);
  const [statut, setStatut] = useState<PaieInput['statut']>('cdi');
  const [enfantsCharge, setEnfantsCharge] = useState(0);

  const result = useMemo(
    () => calculerPaie({ brut, statut, enfantsCharge }),
    [brut, statut, enfantsCharge],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
      {/* Formulaire */}
      <form
        aria-label="Simulateur de paie"
        onSubmit={(e): void => e.preventDefault()}
        className="rounded-xl border border-[var(--color-ol-mist)] bg-white p-6 shadow-sm sm:p-8"
      >
        <Badge tone="orange">Simulateur interactif</Badge>
        <Heading level={3} visualLevel={4} className="mt-4">
          Combien coûte vraiment ce salaire ?
        </Heading>
        <p className="mt-2 text-sm text-[var(--color-ol-graphite)]/65">
          Barème CNPS, ITS, FDFP, CMU 2025-2026 appliqué en direct.
        </p>

        <div className="mt-8 space-y-6">
          <label className="block">
            <span className="block text-sm font-medium text-[var(--color-ol-night)]">
              Salaire brut mensuel
            </span>
            <div className="mt-2 flex items-stretch gap-3">
              <input
                type="number"
                min={0}
                step={10_000}
                value={brut}
                onChange={(e): void => setBrut(Number(e.target.value) || 0)}
                aria-label="Salaire brut en F CFA"
                className="min-h-11 w-full rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
              />
              <span className="inline-flex shrink-0 items-center rounded-md border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] px-3 text-sm font-medium text-[var(--color-ol-graphite)]/70">
                F CFA
              </span>
            </div>
            <input
              type="range"
              min={75_000}
              max={3_000_000}
              step={25_000}
              value={brut}
              onChange={(e): void => setBrut(Number(e.target.value))}
              aria-label="Curseur salaire brut"
              className="mt-3 w-full accent-[var(--color-ol-orange)]"
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--color-ol-graphite)]/70">
              <span>75 000</span>
              <span>3 000 000</span>
            </div>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-[var(--color-ol-night)]">
              Statut
            </span>
            <select
              value={statut}
              onChange={(e): void =>
                setStatut(e.target.value as PaieInput['statut'])
              }
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none"
            >
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="apprenti">Apprenti (exonéré ITS)</option>
              <option value="stagiaire">Stagiaire (exonéré ITS)</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-[var(--color-ol-night)]">
              Enfants à charge
            </span>
            <input
              type="number"
              min={0}
              max={10}
              value={enfantsCharge}
              onChange={(e): void =>
                setEnfantsCharge(
                  Math.max(0, Math.min(10, Number(e.target.value) || 0)),
                )
              }
              aria-label="Nombre d'enfants à charge"
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[var(--color-ol-graphite)]/70">
              Abattement ITS : −10 % par enfant, plafonné à −50 %.
            </p>
          </label>
        </div>
      </form>

      {/* Résultat */}
      <div
        aria-live="polite"
        className="rounded-xl bg-[var(--color-ol-night)] p-6 text-[var(--color-ol-ivory)] sm:p-8"
      >
        <Badge tone="orange">Bulletin de paie simulé</Badge>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--color-ol-ivory)]/60">
              Net à verser
            </p>
            <p
              data-testid="nexusrh-net"
              className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ol-orange-text)] sm:text-4xl"
            >
              {formatFcfa(result.net)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--color-ol-ivory)]/60">
              Coût employeur
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ol-ivory)]">
              {formatFcfa(result.coutEmployeur)}
            </p>
          </div>
        </div>

        <ul className="mt-8 space-y-2 text-sm">
          <Row label="Brut mensuel" value={result.brut} />
          <Row
            label="CNPS salarié (6,3 %)"
            value={-result.cnpsSalarie}
            accent
          />
          <Row
            label="FDFP salarié (1,2 %)"
            value={-result.fdfpSalarie}
            accent
          />
          <Row label="CMU (1,2 %)" value={-result.cmu} accent />
          <Row label="ITS" value={-result.its} accent />
          <li className="my-3 border-t border-[var(--color-ol-ivory)]/15" />
          <Row label="Net à verser" value={result.net} bold />
        </ul>

        <details className="mt-8 rounded-lg bg-white/5 p-4 text-sm">
          <summary className="cursor-pointer text-[var(--color-ol-orange-text)]">
            Voir le détail des charges employeur
          </summary>
          <ul className="mt-3 space-y-2">
            <Row
              label="CNPS employeur (retraite 7,7 % + PF 5,75 % + AT 2 %)"
              value={result.cnpsEmployeur}
            />
            <Row label="FDFP employeur (0,6 %)" value={result.fdfpEmployeur} />
          </ul>
        </details>

        {result.trancheIts.length > 0 ? (
          <details className="mt-3 rounded-lg bg-white/5 p-4 text-sm">
            <summary className="cursor-pointer text-[var(--color-ol-orange-text)]">
              Détail des tranches ITS appliquées
            </summary>
            <table className="mt-3 w-full text-left">
              <thead className="text-xs text-[var(--color-ol-ivory)]/55 uppercase">
                <tr>
                  <th className="pb-2">Tranche</th>
                  <th className="pb-2">Taux</th>
                  <th className="pb-2 text-right">Impôt</th>
                </tr>
              </thead>
              <tbody>
                {result.trancheIts.map((t) => (
                  <tr key={t.from} className="border-t border-white/10">
                    <td className="py-1.5">
                      {formatFcfa(t.from)} → {formatFcfa(t.to)}
                    </td>
                    <td className="py-1.5">{(t.rate * 100).toFixed(0)} %</td>
                    <td className="py-1.5 text-right">
                      {formatFcfa(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        ) : null}

        <p className="mt-6 text-xs text-[var(--color-ol-ivory)]/45">
          Démo à titre indicatif. Le module paie NexusRH intègre en plus
          ancienneté, primes spécifiques, abattements catégoriels.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  bold,
}: {
  label: string;
  value: number;
  accent?: boolean;
  bold?: boolean;
}): ReactElement {
  return (
    <li className="flex items-baseline justify-between gap-4">
      <span
        className={
          bold
            ? 'font-semibold text-[var(--color-ol-ivory)]'
            : 'text-[var(--color-ol-ivory)]/75'
        }
      >
        {label}
      </span>
      <span
        className={
          accent
            ? 'font-mono text-[var(--color-ol-orange-text)]/85'
            : bold
              ? 'font-mono text-lg font-semibold text-[var(--color-ol-orange-text)]'
              : 'font-mono text-[var(--color-ol-ivory)]/90'
        }
      >
        {formatFcfa(value)}
      </span>
    </li>
  );
}
