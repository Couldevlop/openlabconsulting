import type { ReactElement } from 'react';

/**
 * Mockup synthétique — Carte parcelles AgroSense CI avec capteurs IoT
 * et indicateurs de maladie / humidité.
 */
export function AgrosenseMockup(): ReactElement {
  return (
    <svg
      viewBox="0 0 480 270"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aperçu — carte parcelles AgroSense CI"
      className="h-full w-full"
    >
      {/* Fond carte */}
      <rect width="480" height="270" fill="rgba(20,38,84,0.25)" />

      {/* Parcelles stylisées */}
      <g>
        <path
          d="M 40 50 L 180 40 L 200 130 L 60 150 Z"
          fill="rgba(34,197,94,0.18)"
          stroke="rgba(34,197,94,0.4)"
          strokeWidth="1"
        />
        <path
          d="M 200 130 L 60 150 L 80 220 L 220 230 Z"
          fill="rgba(255,90,0,0.10)"
          stroke="rgba(255,90,0,0.35)"
          strokeWidth="1"
        />
        <path
          d="M 200 40 L 320 50 L 340 140 L 200 130 Z"
          fill="rgba(34,197,94,0.22)"
          stroke="rgba(34,197,94,0.45)"
          strokeWidth="1"
        />
        <path
          d="M 340 50 L 460 60 L 450 200 L 340 180 Z"
          fill="rgba(34,197,94,0.14)"
          stroke="rgba(34,197,94,0.3)"
          strokeWidth="1"
        />
        <path
          d="M 220 230 L 340 240 L 360 180 L 230 170 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(250,248,245,0.15)"
          strokeWidth="1"
        />
      </g>

      {/* Capteurs IoT */}
      {[
        { x: 100, y: 90, ok: true },
        { x: 250, y: 90, ok: true },
        { x: 400, y: 130, ok: true },
        { x: 140, y: 180, ok: false },
        { x: 280, y: 200, ok: true },
      ].map((s, i) => (
        <g key={i}>
          <circle
            cx={s.x}
            cy={s.y}
            r="7"
            fill={s.ok ? 'rgba(34,197,94,0.25)' : 'rgba(255,90,0,0.25)'}
          >
            {!s.ok && (
              <animate
                attributeName="r"
                values="6;10;6"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx={s.x} cy={s.y} r="3" fill={s.ok ? '#22C55E' : '#FF5A00'} />
        </g>
      ))}

      {/* Légende top */}
      <g transform="translate(20, 16)">
        <text
          fill="#FAF8F5"
          fontSize="13"
          fontWeight="600"
          fontFamily="system-ui"
        >
          Coopérative Daloa · 47 parcelles · cacao
        </text>
      </g>
      <g transform="translate(360, 16)">
        <rect width="100" height="22" rx="11" fill="rgba(34,197,94,0.20)" />
        <text
          x="14"
          y="15"
          fill="#22C55E"
          fontSize="9"
          fontWeight="600"
          fontFamily="system-ui"
        >
          Récolte J+12
        </text>
      </g>

      {/* Card panel droite */}
      <g transform="translate(330, 50)">
        <rect width="140" height="170" rx="6" fill="rgba(10,14,26,0.85)" />
        <text
          x="14"
          y="22"
          fill="rgba(255,90,0,0.85)"
          fontSize="9"
          fontFamily="system-ui"
        >
          ALERTE PARCELLE
        </text>
        <text
          x="14"
          y="40"
          fill="#FAF8F5"
          fontSize="11"
          fontWeight="600"
          fontFamily="system-ui"
        >
          Parcelle 14-B
        </text>
        <text
          x="14"
          y="58"
          fill="rgba(250,248,245,0.7)"
          fontSize="9"
          fontFamily="system-ui"
        >
          Humidité sol : 22 %
        </text>
        <text
          x="14"
          y="74"
          fill="rgba(250,248,245,0.7)"
          fontSize="9"
          fontFamily="system-ui"
        >
          Modèle CHIRPS · J+14
        </text>
        <text
          x="14"
          y="98"
          fill="rgba(255,90,0,0.95)"
          fontSize="9"
          fontWeight="600"
          fontFamily="system-ui"
        >
          ⚠ Risque pourriture brune
        </text>
        <text
          x="14"
          y="114"
          fill="rgba(250,248,245,0.55)"
          fontSize="9"
          fontFamily="system-ui"
        >
          Conf. 86 %
        </text>
        <rect
          x="14"
          y="130"
          width="112"
          height="22"
          rx="4"
          fill="rgba(255,90,0,0.85)"
        />
        <text
          x="22"
          y="145"
          fill="#FAF8F5"
          fontSize="9"
          fontWeight="600"
          fontFamily="system-ui"
        >
          Notifier le coopérant
        </text>
      </g>
    </svg>
  );
}
