import type { ReactElement } from 'react';

/**
 * Mockup synthétique — Document analysé par Fraud Shield avec zones
 * suspectes surlignées et score d'authenticité.
 */
export function FraudShieldMockup(): ReactElement {
  return (
    <svg
      viewBox="0 0 480 270"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aperçu — analyse document Fraud Shield"
      className="h-full w-full"
    >
      {/* Topbar */}
      <text
        x="20"
        y="26"
        fill="#FAF8F5"
        fontSize="13"
        fontWeight="600"
        fontFamily="system-ui"
      >
        Analyse · Attestation bancaire
      </text>
      <g transform="translate(340, 12)">
        <rect width="120" height="22" rx="11" fill="rgba(220,38,38,0.18)" />
        <text
          x="14"
          y="15"
          fill="#DC2626"
          fontSize="9"
          fontWeight="600"
          fontFamily="system-ui"
        >
          ⚠ Score 32 / 100
        </text>
      </g>

      {/* Document scanné stylisé */}
      <g transform="translate(20, 50)">
        <rect width="260" height="200" rx="6" fill="rgba(250,248,245,0.95)" />
        {/* Header doc */}
        <rect
          x="18"
          y="18"
          width="80"
          height="6"
          rx="2"
          fill="rgba(10,14,26,0.7)"
        />
        <rect
          x="18"
          y="30"
          width="120"
          height="4"
          rx="2"
          fill="rgba(10,14,26,0.3)"
        />
        <rect
          x="200"
          y="18"
          width="44"
          height="22"
          rx="3"
          fill="rgba(255,90,0,0.15)"
        />
        {/* Lignes de texte */}
        {[60, 74, 88, 102, 116].map((y) => (
          <rect
            key={y}
            x="18"
            y={y}
            width={y === 102 ? 180 : 220}
            height="3"
            rx="1.5"
            fill="rgba(10,14,26,0.2)"
          />
        ))}
        {/* Zone suspecte highlightée : montant retouché */}
        <rect
          x="160"
          y="74"
          width="80"
          height="14"
          fill="rgba(220,38,38,0.25)"
          stroke="#DC2626"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text
          x="148"
          y="68"
          fill="#DC2626"
          fontSize="8"
          fontFamily="system-ui"
          fontWeight="600"
        >
          ◀ montant retouché
        </text>
        {/* Signature suspecte */}
        <g transform="translate(140, 150)">
          <path
            d="M 0 20 Q 10 5 25 15 T 60 12 Q 70 8 80 18"
            stroke="rgba(10,14,26,0.6)"
            strokeWidth="1.5"
            fill="none"
          />
          <rect
            x="-6"
            y="6"
            width="100"
            height="28"
            fill="rgba(220,38,38,0.18)"
            stroke="#DC2626"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <text
            x="-30"
            y="-2"
            fill="#DC2626"
            fontSize="8"
            fontFamily="system-ui"
            fontWeight="600"
          >
            ✖ signature dupliquée (3×)
          </text>
        </g>
        {/* Cachet */}
        <circle
          cx="60"
          cy="170"
          r="22"
          stroke="rgba(10,14,26,0.3)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="2 2"
        />
        <rect
          x="34"
          y="146"
          width="50"
          height="48"
          fill="rgba(220,38,38,0.10)"
          stroke="#DC2626"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
      </g>

      {/* Panneau analyse */}
      <g transform="translate(295, 50)">
        <rect width="165" height="200" rx="6" fill="rgba(255,255,255,0.04)" />
        <text
          x="14"
          y="22"
          fill="rgba(255,90,0,0.85)"
          fontSize="9"
          fontFamily="system-ui"
        >
          PATTERNS DÉTECTÉS
        </text>
        {[
          { y: 46, label: 'Anti-aliasing incohérent', conf: '94 %' },
          { y: 72, label: 'Signature dupliquée 3×', conf: '99 %' },
          { y: 98, label: 'Métadonnées EXIF altérées', conf: '88 %' },
          { y: 124, label: 'Police mixte (Helvetica/Arial)', conf: '76 %' },
        ].map((p, i) => (
          <g key={i}>
            <rect
              x="14"
              y={p.y - 12}
              width="6"
              height="20"
              rx="1"
              fill="#DC2626"
            />
            <text
              x="26"
              y={p.y}
              fill="#FAF8F5"
              fontSize="9"
              fontFamily="system-ui"
            >
              {p.label}
            </text>
            <text
              x="26"
              y={p.y + 12}
              fill="rgba(250,248,245,0.55)"
              fontSize="8"
              fontFamily="system-ui"
            >
              Conf. {p.conf}
            </text>
          </g>
        ))}
        <rect
          x="14"
          y="158"
          width="138"
          height="28"
          rx="4"
          fill="rgba(220,38,38,0.85)"
        />
        <text
          x="26"
          y="176"
          fill="#FAF8F5"
          fontSize="10"
          fontWeight="600"
          fontFamily="system-ui"
        >
          Marquer suspect ▸
        </text>
      </g>
    </svg>
  );
}
