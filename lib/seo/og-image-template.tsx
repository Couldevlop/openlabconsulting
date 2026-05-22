import { ImageResponse } from 'next/og';

/**
 * Template OG image partagé — audit P2 §7 item #2.
 *
 * Réutilisé par chaque `opengraph-image.tsx` colocalisé (/solutions/[slug],
 * /expertises/[slug], /secteurs/[slug], /livre, etc.).
 *
 * Style aligné sur la charte OpenLab : fond night, halo orange, polices
 * Bricolage system-ui, accent #FF5A00.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png' as const;

export interface OgImageProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** « Section · OpenLab » par défaut. */
  footerLeft?: string;
}

export function renderOgImage(props: OgImageProps): Response {
  const titleSize = props.title.length > 80 ? 64 : 84;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        backgroundColor: '#0A0E1A',
        color: '#FAF8F5',
        fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: 9999,
          background:
            'radial-gradient(closest-side, rgba(255,90,0,0.45), transparent 70%)',
        }}
      />
      <div
        style={{
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: '#FF5A00',
        }}
      >
        {props.eyebrow}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            maxWidth: 1040,
          }}
        >
          {props.title}
        </div>
        {props.subtitle ? (
          <div
            style={{
              fontSize: 26,
              color: 'rgba(250,248,245,0.75)',
              maxWidth: 900,
            }}
          >
            {props.subtitle}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 22,
          color: 'rgba(250,248,245,0.6)',
        }}
      >
        <div>{props.footerLeft ?? 'OpenLab Consulting'}</div>
        <div style={{ color: '#FF5A00', fontWeight: 600 }}>
          openlabconsulting.com
        </div>
      </div>
    </div>,
    { ...OG_SIZE },
  );
}
