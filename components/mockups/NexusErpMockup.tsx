import type { ReactElement } from 'react';

/**
 * Mockup synthétique — Tableau de bord financier NexusERP : multi-devises
 * (FCFA / EUR / USD), conformité SYSCOHADA, modules intégrés.
 */
export function NexusErpMockup(): ReactElement {
  return (
    <svg
      viewBox="0 0 480 270"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aperçu — tableau de bord financier NexusERP"
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
        Pilotage financier · Groupe
      </text>
      <g transform="translate(330, 16)">
        <rect width="130" height="18" rx="9" fill="rgba(34,197,94,0.15)" />
        <circle cx="14" cy="9" r="3" fill="#22C55E" />
        <text
          x="24"
          y="13"
          fill="#22C55E"
          fontSize="9"
          fontWeight="600"
          fontFamily="system-ui"
        >
          SYSCOHADA conforme
        </text>
      </g>

      {/* KPI multi-devises */}
      <g transform="translate(20, 50)">
        {[
          { label: 'CHIFFRE D’AFFAIRES', value: '1,24 Md', unit: 'FCFA' },
          { label: 'TRÉSORERIE', value: '312 K', unit: 'EUR' },
          { label: 'MARGE NETTE', value: '+18 %', unit: 'YTD' },
        ].map((kpi, i) => (
          <g key={kpi.label} transform={`translate(${i * 150}, 0)`}>
            <rect
              width="138"
              height="64"
              rx="8"
              fill="rgba(255,255,255,0.04)"
            />
            <text
              x="12"
              y="20"
              fill="rgba(250,248,245,0.55)"
              fontSize="8"
              fontFamily="system-ui"
            >
              {kpi.label}
            </text>
            <text
              x="12"
              y="44"
              fill={i === 2 ? '#22C55E' : '#FF5A00'}
              fontSize="22"
              fontWeight="700"
              fontFamily="system-ui"
            >
              {kpi.value}
            </text>
            <text
              x="118"
              y="44"
              fill="rgba(250,248,245,0.5)"
              fontSize="9"
              textAnchor="end"
              fontFamily="system-ui"
            >
              {kpi.unit}
            </text>
          </g>
        ))}
      </g>

      {/* Graphe barres multi-devises */}
      <g transform="translate(20, 132)">
        <rect width="288" height="118" rx="8" fill="rgba(255,255,255,0.04)" />
        <text
          x="14"
          y="22"
          fill="rgba(250,248,245,0.55)"
          fontSize="9"
          fontFamily="system-ui"
        >
          PRODUITS PAR TRIMESTRE
        </text>
        {[48, 64, 56, 80, 72, 92].map((h, i) => (
          <rect
            key={i}
            x={20 + i * 44}
            y={104 - h}
            width="26"
            height={h}
            rx="3"
            fill={i === 5 ? '#FF5A00' : 'rgba(255,90,0,0.35)'}
          />
        ))}
      </g>

      {/* Modules intégrés */}
      <g transform="translate(320, 132)">
        <rect width="140" height="118" rx="8" fill="rgba(255,90,0,0.10)" />
        <text
          x="14"
          y="22"
          fill="rgba(255,90,0,0.85)"
          fontSize="9"
          fontFamily="system-ui"
        >
          MODULES ACTIFS
        </text>
        {['Compta', 'Ventes', 'Achats', 'Stock', 'RH', 'Projets'].map(
          (m, i) => (
            <g key={m} transform={`translate(14, ${36 + i * 13})`}>
              <circle cx="3" cy="-3" r="2.5" fill="#22C55E" />
              <text
                x="12"
                y="0"
                fill="rgba(250,248,245,0.8)"
                fontSize="9"
                fontFamily="system-ui"
              >
                {m}
              </text>
            </g>
          ),
        )}
      </g>
    </svg>
  );
}
