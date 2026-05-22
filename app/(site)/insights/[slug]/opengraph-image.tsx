import { ImageResponse } from 'next/og';
import { getArticleBySlug } from '@/lib/articles-server';

export const runtime = 'nodejs';
export const alt = 'Couverture article OpenLab Insights';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * OG image dynamique par article — CLAUDE.md §12.3.
 *
 * Charge l'article via le helper server, intercale titre + catégorie +
 * auteur dans la composition. Si l'article n'existe pas, on retombe
 * sur une carte générique "Insights OpenLab".
 *
 * Runtime nodejs (et non edge) pour bénéficier de l'accès Payload via
 * le helper server. Cache HTTP géré par Next (revalidate ISR du parent).
 */
export default async function ArticleOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Response> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const title = article?.title ?? 'Insights OpenLab';
  const category = article?.categoryLabel ?? 'Article';
  const author = article?.author ?? 'OpenLab Consulting';
  const dateStr = article?.publishedAt ?? '';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        backgroundColor: '#FAF8F5',
        color: '#0A0E1A',
        fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
      }}
    >
      {/* Bande orange en haut */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background:
            'linear-gradient(90deg, #FF5A00 0%, #FF7A33 50%, #FF5A00 100%)',
        }}
      />

      {/* Eyebrow catégorie */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#FF5A00',
            padding: '8px 16px',
            border: '2px solid #FF5A00',
            borderRadius: 6,
          }}
        >
          {category}
        </span>
        <span
          style={{
            fontSize: 18,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'rgba(10,14,26,0.5)',
          }}
        >
          OpenLab · Insights
        </span>
      </div>

      {/* Headline article */}
      <div
        style={{
          fontSize: title.length > 80 ? 56 : 72,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          maxWidth: 1040,
        }}
      >
        {title}
      </div>

      {/* Footer auteur + date + URL */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 22,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ color: 'rgba(10,14,26,0.6)' }}>Par {author}</span>
          {dateStr ? (
            <span style={{ color: 'rgba(10,14,26,0.4)', fontSize: 18 }}>
              {dateStr}
            </span>
          ) : null}
        </div>
        <span style={{ color: '#FF5A00', fontWeight: 600 }}>
          openlabconsulting.com
        </span>
      </div>
    </div>,
    { ...size },
  );
}
