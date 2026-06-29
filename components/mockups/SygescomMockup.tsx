import type { ReactElement } from 'react';

/**
 * Mockup synthétique — Dashboard SYGESCOM temps réel multi-stations
 * avec alerte fraude / anomalie volume carburant.
 */
export function SygescomMockup(): ReactElement {
  return (
    <svg
      viewBox="0 0 480 270"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aperçu : dashboard temps réel SYGESCOM"
      className="h-full w-full"
    >
      {/* Topbar */}
      <text
        x="20"
        y="28"
        fill="#FAF8F5"
        fontSize="14"
        fontWeight="600"
        fontFamily="system-ui"
      >
        Supervision réseau · 24/7
      </text>
      <circle cx="280" cy="22" r="4" fill="#22C55E">
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <text
        x="290"
        y="26"
        fill="rgba(250,248,245,0.7)"
        fontSize="10"
        fontFamily="system-ui"
      >
        Live
      </text>

      {/* Carte schématique des stations (4 points) */}
      <g transform="translate(20, 50)">
        <rect width="220" height="200" rx="8" fill="rgba(255,255,255,0.04)" />
        <text
          x="14"
          y="20"
          fill="rgba(250,248,245,0.55)"
          fontSize="9"
          fontFamily="system-ui"
        >
          12 STATIONS · ABIDJAN
        </text>
        {/* "Carte" stylisée avec lignes décoratives */}
        <path
          d="M 30 60 Q 80 50 110 80 T 200 90 M 40 130 Q 90 110 150 140 T 200 160"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          fill="none"
        />
        {/* Stations OK */}
        {[
          { x: 50, y: 70 },
          { x: 120, y: 90 },
          { x: 80, y: 140 },
          { x: 170, y: 160 },
          { x: 150, y: 50 },
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill="rgba(34,197,94,0.25)" />
            <circle cx={p.x} cy={p.y} r="3" fill="#22C55E" />
          </g>
        ))}
        {/* Station en alerte */}
        <circle cx="180" cy="120" r="10" fill="rgba(220,38,38,0.15)">
          <animate
            attributeName="r"
            values="6;12;6"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="180" cy="120" r="4" fill="#DC2626" />
      </g>

      {/* Panneau résultats */}
      <g transform="translate(255, 50)">
        <rect width="205" height="95" rx="8" fill="rgba(255,90,0,0.10)" />
        <text
          x="14"
          y="20"
          fill="rgba(255,90,0,0.85)"
          fontSize="9"
          fontFamily="system-ui"
        >
          PERTES CARBURANT · 3 MOIS
        </text>
        <text
          x="14"
          y="56"
          fill="#FF5A00"
          fontSize="36"
          fontWeight="700"
          fontFamily="system-ui"
        >
          −12 %
        </text>
        <text
          x="14"
          y="78"
          fill="rgba(250,248,245,0.65)"
          fontSize="9"
          fontFamily="system-ui"
        >
          vs trimestre précédent
        </text>
      </g>

      <g transform="translate(255, 155)">
        <rect width="205" height="95" rx="8" fill="rgba(220,38,38,0.10)" />
        <text
          x="14"
          y="20"
          fill="rgba(220,38,38,0.85)"
          fontSize="9"
          fontFamily="system-ui"
        >
          ANOMALIE DÉTECTÉE
        </text>
        <text
          x="14"
          y="42"
          fill="#FAF8F5"
          fontSize="11"
          fontWeight="600"
          fontFamily="system-ui"
        >
          Station Riviera 3
        </text>
        <text
          x="14"
          y="58"
          fill="rgba(250,248,245,0.7)"
          fontSize="9"
          fontFamily="system-ui"
        >
          Écart stock · −340 L
        </text>
        <text
          x="14"
          y="74"
          fill="rgba(250,248,245,0.7)"
          fontSize="9"
          fontFamily="system-ui"
        >
          Pattern : livraison fantôme
        </text>
        <text
          x="14"
          y="90"
          fill="rgba(255,90,0,0.85)"
          fontSize="8"
          fontWeight="600"
          fontFamily="system-ui"
        >
          ▸ Voir audit
        </text>
      </g>
    </svg>
  );
}
