import type { ReactElement } from 'react';

/**
 * Mockup synthétique — Dashboard paie NexusRH conforme CNPS/ITS/FDFP.
 * SVG pur, aucun asset externe. Sera remplacé par capture réelle
 * uploadée via Payload admin (P6).
 */
export function NexusRhMockup(): ReactElement {
  return (
    <svg
      viewBox="0 0 480 270"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aperçu : dashboard paie NexusRH"
      className="h-full w-full"
    >
      {/* Sidebar */}
      <rect x="0" y="0" width="80" height="270" fill="rgba(255,255,255,0.06)" />
      <rect
        x="14"
        y="14"
        width="52"
        height="6"
        rx="3"
        fill="rgba(255,90,0,0.7)"
      />
      <rect
        x="14"
        y="40"
        width="42"
        height="4"
        rx="2"
        fill="rgba(250,248,245,0.4)"
      />
      <rect
        x="14"
        y="54"
        width="46"
        height="4"
        rx="2"
        fill="rgba(250,248,245,0.25)"
      />
      <rect
        x="14"
        y="68"
        width="40"
        height="4"
        rx="2"
        fill="rgba(250,248,245,0.25)"
      />
      <rect
        x="14"
        y="82"
        width="48"
        height="4"
        rx="2"
        fill="rgba(250,248,245,0.25)"
      />
      <rect
        x="14"
        y="96"
        width="44"
        height="4"
        rx="2"
        fill="rgba(250,248,245,0.25)"
      />
      <rect
        x="14"
        y="240"
        width="38"
        height="4"
        rx="2"
        fill="rgba(250,248,245,0.2)"
      />

      {/* Header */}
      <text
        x="100"
        y="32"
        fill="rgba(250,248,245,0.95)"
        fontSize="14"
        fontWeight="600"
        fontFamily="system-ui"
      >
        Paie · Mai 2026
      </text>
      <rect
        x="380"
        y="20"
        width="80"
        height="20"
        rx="10"
        fill="rgba(34,197,94,0.18)"
      />
      <text
        x="396"
        y="34"
        fill="#22C55E"
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui"
      >
        CNPS ✓ ITS ✓
      </text>

      {/* KPIs */}
      <g transform="translate(100, 56)">
        <rect width="110" height="58" rx="6" fill="rgba(255,255,255,0.04)" />
        <text
          x="12"
          y="20"
          fill="rgba(250,248,245,0.55)"
          fontSize="9"
          fontFamily="system-ui"
        >
          Masse salariale
        </text>
        <text
          x="12"
          y="42"
          fill="#FAF8F5"
          fontSize="18"
          fontWeight="700"
          fontFamily="system-ui"
        >
          184 250 K
        </text>
      </g>
      <g transform="translate(220, 56)">
        <rect width="110" height="58" rx="6" fill="rgba(255,255,255,0.04)" />
        <text
          x="12"
          y="20"
          fill="rgba(250,248,245,0.55)"
          fontSize="9"
          fontFamily="system-ui"
        >
          Effectif
        </text>
        <text
          x="12"
          y="42"
          fill="#FAF8F5"
          fontSize="18"
          fontWeight="700"
          fontFamily="system-ui"
        >
          247
        </text>
      </g>
      <g transform="translate(340, 56)">
        <rect width="120" height="58" rx="6" fill="rgba(255,90,0,0.12)" />
        <text
          x="12"
          y="20"
          fill="rgba(255,90,0,0.85)"
          fontSize="9"
          fontFamily="system-ui"
        >
          Cotisation CNPS
        </text>
        <text
          x="12"
          y="42"
          fill="#FF5A00"
          fontSize="18"
          fontWeight="700"
          fontFamily="system-ui"
        >
          24 250 K
        </text>
      </g>

      {/* Liste paies */}
      <g transform="translate(100, 130)">
        <rect width="360" height="120" rx="6" fill="rgba(255,255,255,0.04)" />
        {/* Header de table */}
        <text
          x="14"
          y="20"
          fill="rgba(250,248,245,0.45)"
          fontSize="8"
          fontFamily="system-ui"
        >
          AGENT
        </text>
        <text
          x="180"
          y="20"
          fill="rgba(250,248,245,0.45)"
          fontSize="8"
          fontFamily="system-ui"
        >
          NET PAYÉ
        </text>
        <text
          x="280"
          y="20"
          fill="rgba(250,248,245,0.45)"
          fontSize="8"
          fontFamily="system-ui"
        >
          STATUT
        </text>
        {/* Rows */}
        {[36, 56, 76, 96].map((y, i) => (
          <g key={y}>
            <rect
              x="0"
              y={y - 12}
              width="360"
              height="18"
              fill={i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
            />
            <circle cx="20" cy={y - 3} r="6" fill="rgba(255,90,0,0.4)" />
            <rect
              x="32"
              y={y - 7}
              width="100"
              height="6"
              rx="2"
              fill="rgba(250,248,245,0.7)"
            />
            <rect
              x="180"
              y={y - 7}
              width="60"
              height="6"
              rx="2"
              fill="rgba(250,248,245,0.85)"
            />
            <rect
              x="280"
              y={y - 8}
              width="36"
              height="9"
              rx="4"
              fill="rgba(34,197,94,0.25)"
            />
            <text
              x="284"
              y={y - 1}
              fill="#22C55E"
              fontSize="7"
              fontWeight="600"
              fontFamily="system-ui"
            >
              Payé MoMo
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
