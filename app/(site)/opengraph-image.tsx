import { ImageResponse } from 'next/og';
import { PRODUCTS } from '@/lib/data/products';

export const runtime = 'edge';
export const alt =
  'OpenLab Consulting : IA, R&D et publication de référence pour l’Afrique francophone';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Image OpenGraph racine — voir CLAUDE.md §12.3.
 *
 * Générée dynamiquement à l'edge runtime de Next.js. Les pages
 * dynamiques (expertises, solutions, secteurs, livre) hériteront de
 * cette image par défaut ; on pourra spécifier des OG images
 * spécifiques en ajoutant `opengraph-image.tsx` dans chaque dossier
 * `[slug]/` en P9 raffinement.
 */
export default function OpenGraphImage(): Response {
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
      {/* Halo orange */}
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

      {/* Eyebrow */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: '#FF5A00',
        }}
      >
        OpenLab Consulting
      </div>

      {/* Headline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          L’IA, au service
          <br />
          <span style={{ color: '#FF5A00' }}>des réalités africaines.</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(250,248,245,0.75)',
            maxWidth: 900,
          }}
        >
          Cabinet ivoirien d’IA appliquée · {PRODUCTS.length} produits
          propriétaires · Livre de référence · Abidjan
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 22,
          color: 'rgba(250,248,245,0.6)',
        }}
      >
        <div>openlabconsulting.com</div>
        <div style={{ color: '#FF5A00', fontWeight: 600 }}>
          Audit IA gratuit
        </div>
      </div>
    </div>,
    { ...size },
  );
}
