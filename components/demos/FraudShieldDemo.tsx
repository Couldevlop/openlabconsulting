'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { ScanSearch } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { Heading } from '@/components/atoms/Heading';

/**
 * Démo Fraud Shield — upload + analyse + score (CLAUDE.md §7.2).
 *
 * Pas de vrai upload, pas d'API : on simule la pipeline. Trois
 * exemples de documents pré-définis (authentique, douteux, fraude
 * manifeste) avec leur score IA + zones suspectes overlay.
 *
 * Démontre les 3 valeurs métier :
 *   1. Score 0-100 expliqué
 *   2. Zones suspectes pointées (overlay)
 *   3. Motifs textuels listés
 */

interface FraudCase {
  id: string;
  label: string;
  score: number; // 100 = authentique, 0 = fraude
  hotspots: readonly { x: number; y: number; r: number; reason: string }[];
  motifs: readonly string[];
}

const CASES: readonly FraudCase[] = [
  {
    id: 'auth',
    label: 'CNI conforme',
    score: 94,
    hotspots: [],
    motifs: [
      'Hologramme cohérent avec le millésime déclaré',
      'Métadonnées EXIF intactes (scanner ANI 2023)',
      'Anti-aliasing uniforme sur tout le document',
    ],
  },
  {
    id: 'douteux',
    label: 'Attestation bancaire douteuse',
    score: 62,
    hotspots: [
      {
        x: 75,
        y: 40,
        r: 14,
        reason: 'Montant en lettres / chiffres divergent',
      },
      {
        x: 30,
        y: 80,
        r: 10,
        reason: 'Signature présente sur 3 documents tiers',
      },
    ],
    motifs: [
      'Le montant en lettres ne correspond pas au montant en chiffres',
      'Signature retrouvée à l’identique sur 3 autres documents',
      'Cachet superposé manuellement (anti-aliasing perturbé)',
    ],
  },
  {
    id: 'fraude',
    label: 'Facture manipulée',
    score: 17,
    hotspots: [
      {
        x: 60,
        y: 30,
        r: 16,
        reason: 'Pixel padding incohérent autour du montant',
      },
      {
        x: 25,
        y: 55,
        r: 12,
        reason: 'Date superposée, éditeur Adobe détecté',
      },
      {
        x: 80,
        y: 78,
        r: 14,
        reason: 'Logo basse résolution comparé à fournisseur officiel',
      },
    ],
    motifs: [
      'Montant 1 250 000 réécrit par-dessus 125 000 (pixel padding)',
      'Métadonnées EXIF : édité dans Adobe Acrobat il y a 3 jours',
      'Logo fournisseur reconstruit basse résolution (probable copier-coller)',
      'Trame de fond brisée sur l’en-tête',
    ],
  },
];

export function FraudShieldDemo(): ReactElement {
  const [selected, setSelected] = useState<FraudCase>(CASES[0]!);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayScore, setDisplayScore] = useState(selected.score);

  function analyze(c: FraudCase): void {
    setSelected(c);
    setAnalyzing(true);
    setProgress(0);
    setDisplayScore(0);
  }

  useEffect(() => {
    if (!analyzing) return;
    const start = Date.now();
    const duration = 1500;
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(1, elapsed / duration);
      setProgress(pct);
      setDisplayScore(Math.round(selected.score * pct));
      if (pct >= 1) {
        setAnalyzing(false);
        clearInterval(id);
      }
    }, 60);
    return () => clearInterval(id);
  }, [analyzing, selected.score]);

  const scoreColor =
    displayScore >= 80
      ? 'text-[var(--color-ol-success)]'
      : displayScore >= 50
        ? 'text-amber-500'
        : 'text-[var(--color-ol-danger)]';

  const verdict =
    selected.score >= 80
      ? { label: 'Document authentique', tone: 'production' as const }
      : selected.score >= 50
        ? { label: 'Vérification manuelle requise', tone: 'pilot' as const }
        : { label: 'Fraude probable', tone: 'mvp' as const };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      {/* Sélecteur + score */}
      <div className="rounded-xl border border-[var(--color-ol-mist)] bg-white p-6 shadow-sm sm:p-8">
        <Badge tone="orange">Analyse IA en temps réel</Badge>
        <Heading level={3} visualLevel={4} className="mt-4">
          Choisissez un document.
        </Heading>
        <p className="mt-2 text-sm text-[var(--color-ol-graphite)]/65">
          Trois cas représentatifs des décisions rencontrées en banque /
          assurance / administration.
        </p>

        <div className="mt-6 space-y-2">
          {CASES.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={(): void => analyze(c)}
              className={
                selected.id === c.id
                  ? 'flex w-full items-center justify-between gap-3 rounded-lg border-2 border-[var(--color-ol-orange)] bg-[var(--color-ol-orange)]/5 px-4 py-3 text-left text-sm transition-colors'
                  : 'flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--color-ol-mist)] bg-white px-4 py-3 text-left text-sm transition-colors hover:border-[var(--color-ol-orange)]/40'
              }
            >
              <span className="flex items-center gap-2 font-medium text-[var(--color-ol-night)]">
                <ScanSearch
                  width={16}
                  height={16}
                  aria-hidden
                  className="text-[var(--color-ol-orange-text)]"
                />
                {c.label}
              </span>
              <span className="font-mono text-xs text-[var(--color-ol-graphite)]/70">
                {c.score >= 80 ? 'OK' : c.score >= 50 ? '?' : '⚠'}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-lg bg-[var(--color-ol-ivory)] p-6 text-center">
          <p className="text-xs tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
            Score d’authenticité
          </p>
          <p
            data-testid="fraud-score"
            className={`mt-2 font-[family-name:var(--font-display)] text-6xl font-semibold ${scoreColor}`}
          >
            {displayScore}
            <span className="text-2xl text-[var(--color-ol-graphite)]/70">
              /100
            </span>
          </p>
          {analyzing ? (
            <div
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--color-ol-mist)]"
              aria-label="Analyse en cours"
              role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-[var(--color-ol-orange)] transition-all duration-100"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          ) : (
            <Badge tone={verdict.tone} className="mt-4">
              {verdict.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Document + zones suspectes */}
      <div className="rounded-xl border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] p-6 shadow-sm sm:p-8">
        <Badge tone="neutral">Document analysé</Badge>
        <div className="relative mt-4 aspect-[210/297] overflow-hidden rounded-lg border border-[var(--color-ol-mist)] bg-white">
          {/* Faux document : lignes de texte stylisées */}
          <svg
            viewBox="0 0 210 297"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <rect width="210" height="297" fill="white" />
            <rect
              x="15"
              y="20"
              width="80"
              height="6"
              fill="#0A0E1A"
              opacity="0.8"
            />
            <rect
              x="15"
              y="32"
              width="50"
              height="3"
              fill="#0A0E1A"
              opacity="0.4"
            />
            <rect
              x="15"
              y="38"
              width="60"
              height="3"
              fill="#0A0E1A"
              opacity="0.4"
            />
            <rect
              x="170"
              y="20"
              width="25"
              height="25"
              fill="#FF5A00"
              opacity="0.15"
              rx="2"
            />
            <rect
              x="15"
              y="60"
              width="180"
              height="0.5"
              fill="#0A0E1A"
              opacity="0.15"
            />
            {Array.from({ length: 18 }).map((_, i) => (
              <rect
                key={i}
                x="15"
                y={70 + i * 8}
                width={140 + Math.sin(i) * 30}
                height="2"
                fill="#0A0E1A"
                opacity={0.25 + (i % 3) * 0.05}
              />
            ))}
            <rect
              x="15"
              y="245"
              width="40"
              height="20"
              fill="#0A0E1A"
              opacity="0.12"
              rx="2"
            />
            <rect
              x="150"
              y="265"
              width="45"
              height="18"
              fill="#0A0E1A"
              opacity="0.18"
              rx="2"
            />

            {/* Hotspots overlay */}
            {!analyzing &&
              selected.hotspots.map((h, i) => (
                <g key={i}>
                  <circle
                    cx={(h.x / 100) * 210}
                    cy={(h.y / 100) * 297}
                    r={h.r}
                    fill="#DC2626"
                    fillOpacity={0.15}
                    stroke="#DC2626"
                    strokeWidth="1.5"
                  >
                    <animate
                      attributeName="r"
                      values={`${h.r};${h.r + 4};${h.r}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              ))}
          </svg>
        </div>

        {!analyzing && selected.motifs.length > 0 ? (
          <div className="mt-6">
            <p className="text-xs tracking-widest text-[var(--color-ol-graphite)]/70 uppercase">
              Motifs détectés
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {selected.motifs.map((m) => (
                <li
                  key={m}
                  className="flex items-start gap-2 text-[var(--color-ol-graphite)]/80"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-ol-orange)]"
                  />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
