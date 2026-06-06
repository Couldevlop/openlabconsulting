import type { ReactElement } from 'react';

/**
 * Mockup synthétique — OpenLab Smart City : carte de chaleur urbaine,
 * zones de risque anticipées, sécurité augmentée par l'IA.
 */
export function SmartCityMockup(): ReactElement {
  return (
    <svg
      viewBox="0 0 480 270"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aperçu — carte de chaleur urbaine Smart City"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="heatHot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(220,38,38,0.55)" />
          <stop offset="100%" stopColor="rgba(220,38,38,0)" />
        </radialGradient>
        <radialGradient id="heatWarm" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,90,0,0.45)" />
          <stop offset="100%" stopColor="rgba(255,90,0,0)" />
        </radialGradient>
      </defs>

      {/* Topbar */}
      <text
        x="20"
        y="28"
        fill="#FAF8F5"
        fontSize="14"
        fontWeight="600"
        fontFamily="system-ui"
      >
        Sécurité urbaine · Anticipation
      </text>
      <circle cx="300" cy="22" r="4" fill="#FF5A00">
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <text
        x="310"
        y="26"
        fill="rgba(250,248,245,0.7)"
        fontSize="10"
        fontFamily="system-ui"
      >
        Temps réel
      </text>

      {/* Carte (grille urbaine) */}
      <g transform="translate(20, 50)">
        <rect width="290" height="200" rx="8" fill="rgba(255,255,255,0.04)" />
        {/* Rues (grille) */}
        {[40, 90, 140, 190, 240].map((x) => (
          <line
            key={`v${x}`}
            x1={x}
            y1="10"
            x2={x}
            y2="190"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        {[40, 80, 120, 160].map((y) => (
          <line
            key={`h${y}`}
            x1="10"
            y1={y}
            x2="280"
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        {/* Zones de chaleur */}
        <circle cx="80" cy="70" r="50" fill="url(#heatWarm)" />
        <circle cx="200" cy="130" r="60" fill="url(#heatHot)" />
        <circle cx="220" cy="60" r="35" fill="url(#heatWarm)" />
        {/* Zone à risque anticipée */}
        <circle
          cx="200"
          cy="130"
          r="14"
          fill="none"
          stroke="#DC2626"
          strokeWidth="1.5"
        >
          <animate
            attributeName="r"
            values="10;18;10"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="200" cy="130" r="4" fill="#DC2626" />
      </g>

      {/* Panneau prédiction */}
      <g transform="translate(322, 50)">
        <rect width="138" height="95" rx="8" fill="rgba(220,38,38,0.12)" />
        <text
          x="14"
          y="20"
          fill="rgba(220,38,38,0.9)"
          fontSize="9"
          fontFamily="system-ui"
        >
          ZONE À RISQUE · 2 H
        </text>
        <text
          x="14"
          y="44"
          fill="#FAF8F5"
          fontSize="13"
          fontWeight="600"
          fontFamily="system-ui"
        >
          Secteur Plateau-Est
        </text>
        <text
          x="14"
          y="64"
          fill="rgba(250,248,245,0.7)"
          fontSize="9"
          fontFamily="system-ui"
        >
          Probabilité incident
        </text>
        <text
          x="14"
          y="84"
          fill="#FF5A00"
          fontSize="18"
          fontWeight="700"
          fontFamily="system-ui"
        >
          78 %
        </text>
      </g>

      {/* Panneau capacités */}
      <g transform="translate(322, 155)">
        <rect width="138" height="95" rx="8" fill="rgba(255,255,255,0.04)" />
        {['Anticiper', 'Modéliser', 'Protéger'].map((c, i) => (
          <g key={c} transform={`translate(14, ${26 + i * 24})`}>
            <circle cx="3" cy="-3" r="3" fill="#FF5A00" />
            <text
              x="14"
              y="0"
              fill="rgba(250,248,245,0.85)"
              fontSize="11"
              fontFamily="system-ui"
            >
              {c}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
