import type { ReactElement } from 'react';

/**
 * Mockup synthétique — QualitOS : management de la qualité (non-conformités,
 * analyse de Pareto, actions CAPA, score qualité).
 */
export function QualitOsMockup(): ReactElement {
  return (
    <svg
      viewBox="0 0 480 270"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aperçu — tableau de bord qualité QualitOS"
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
        Management qualité · ISO 9001
      </text>
      <text
        x="380"
        y="26"
        fill="rgba(250,248,245,0.5)"
        fontSize="10"
        fontFamily="system-ui"
      >
        DMAIC · PDCA
      </text>

      {/* Score qualité (jauge) */}
      <g transform="translate(20, 50)">
        <rect width="140" height="200" rx="8" fill="rgba(255,255,255,0.04)" />
        <text
          x="14"
          y="22"
          fill="rgba(250,248,245,0.55)"
          fontSize="9"
          fontFamily="system-ui"
        >
          INDICE QUALITÉ
        </text>
        <circle
          cx="70"
          cy="110"
          r="44"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="110"
          r="44"
          fill="none"
          stroke="#22C55E"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="276"
          strokeDashoffset="44"
          transform="rotate(-90 70 110)"
        />
        <text
          x="70"
          y="116"
          fill="#FAF8F5"
          fontSize="28"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui"
        >
          92
        </text>
        <text
          x="70"
          y="178"
          fill="rgba(250,248,245,0.6)"
          fontSize="9"
          textAnchor="middle"
          fontFamily="system-ui"
        >
          +8 pts vs trimestre
        </text>
      </g>

      {/* Pareto des non-conformités */}
      <g transform="translate(172, 50)">
        <rect width="180" height="120" rx="8" fill="rgba(255,255,255,0.04)" />
        <text
          x="14"
          y="22"
          fill="rgba(250,248,245,0.55)"
          fontSize="9"
          fontFamily="system-ui"
        >
          NON-CONFORMITÉS · PARETO
        </text>
        {[72, 52, 34, 22, 12].map((h, i) => (
          <rect
            key={i}
            x={18 + i * 32}
            y={104 - h}
            width="22"
            height={h}
            rx="2"
            fill={i === 0 ? '#FF5A00' : 'rgba(255,90,0,0.35)'}
          />
        ))}
        <path
          d="M 29 32 L 61 52 L 93 70 L 125 82 L 157 90"
          stroke="rgba(250,248,245,0.5)"
          strokeWidth="1.5"
          fill="none"
        />
      </g>

      {/* Actions CAPA */}
      <g transform="translate(172, 182)">
        <rect width="180" height="68" rx="8" fill="rgba(255,90,0,0.10)" />
        <text
          x="14"
          y="20"
          fill="rgba(255,90,0,0.85)"
          fontSize="9"
          fontFamily="system-ui"
        >
          ACTIONS CAPA
        </text>
        <text
          x="14"
          y="48"
          fill="#FF5A00"
          fontSize="26"
          fontWeight="700"
          fontFamily="system-ui"
        >
          14
        </text>
        <text
          x="60"
          y="48"
          fill="rgba(250,248,245,0.65)"
          fontSize="9"
          fontFamily="system-ui"
        >
          en cours · 3 critiques
        </text>
      </g>

      {/* Coût non-qualité évité */}
      <g transform="translate(364, 50)">
        <rect width="96" height="200" rx="8" fill="rgba(34,197,94,0.10)" />
        <text
          x="12"
          y="22"
          fill="rgba(34,197,94,0.85)"
          fontSize="8"
          fontFamily="system-ui"
        >
          NON-QUALITÉ
        </text>
        <text
          x="12"
          y="22"
          fill="rgba(34,197,94,0.85)"
          fontSize="8"
          fontFamily="system-ui"
          dy="12"
        >
          ÉVITÉE
        </text>
        <text
          x="12"
          y="120"
          fill="#22C55E"
          fontSize="22"
          fontWeight="700"
          fontFamily="system-ui"
        >
          −9 %
        </text>
        <text
          x="12"
          y="140"
          fill="rgba(250,248,245,0.6)"
          fontSize="8"
          fontFamily="system-ui"
        >
          du CA
        </text>
      </g>
    </svg>
  );
}
