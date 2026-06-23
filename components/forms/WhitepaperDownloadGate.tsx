'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { WhitepaperRequestForm } from './WhitepaperRequestForm';

/**
 * Garde de téléchargement : tant que l'heure d'ouverture (`releaseAt`)
 * n'est pas atteinte, on affiche un compte à rebours. À l'heure dite, le
 * formulaire de capture (RGPD + abonnement) prend la place — sans rechargement.
 *
 * Sans `releaseAt`, le formulaire s'affiche directement (téléchargement libre).
 * Le serveur applique la même règle (API `/api/whitepapers/request` refuse
 * avant l'heure) : le compteur n'est qu'un confort UX.
 */
function remaining(target: number, now: number) {
  const ms = Math.max(0, target - now);
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: ms <= 0,
  };
}

function Cell({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex min-w-[64px] flex-col items-center rounded-lg bg-[var(--color-ol-night)] px-3 py-3 text-[var(--color-ol-ivory)]">
      <span className="font-[family-name:var(--font-display)] text-3xl font-bold tabular-nums">
        {value === null ? '—' : String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] tracking-widest uppercase opacity-70">
        {label}
      </span>
    </div>
  );
}

export function WhitepaperDownloadGate({
  slug,
  releaseAt,
  pageCount = 0,
}: {
  slug: string;
  releaseAt: string | null;
  /** Nombre de pages du PDF, transmis au formulaire une fois l'accès ouvert. */
  pageCount?: number;
}) {
  const target = releaseAt ? Date.parse(releaseAt) : 0;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!releaseAt) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [releaseAt]);

  // Téléchargement libre → formulaire direct.
  if (!releaseAt)
    return <WhitepaperRequestForm slug={slug} pageCount={pageCount} />;

  const r = now === null ? null : remaining(target, now);
  if (r?.done)
    return <WhitepaperRequestForm slug={slug} pageCount={pageCount} />;

  return (
    <div
      data-testid="download-countdown"
      className="rounded-xl border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-6 text-center sm:p-8"
    >
      <p className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ol-orange-text)]">
        <Clock width={16} height={16} aria-hidden />
        Le téléchargement ouvre lundi à 12h (heure de Paris)
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Cell value={r?.days ?? null} label="Jours" />
        <Cell value={r?.hours ?? null} label="Heures" />
        <Cell value={r?.minutes ?? null} label="Min" />
        <Cell value={r?.seconds ?? null} label="Sec" />
      </div>
      <p className="mt-6 text-sm text-[var(--color-ol-graphite)]/75">
        Revenez à l&apos;ouverture : un court formulaire vous donnera accès au
        téléchargement. Vous pourrez aussi vous abonner à notre fil
        d&apos;actualité.
      </p>
    </div>
  );
}
