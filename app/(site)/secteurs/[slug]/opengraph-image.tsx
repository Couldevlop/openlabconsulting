import { SECTORS } from '@/lib/data/sectors';
import {
  renderOgImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from '@/lib/seo/og-image-template';

export const runtime = 'nodejs';
export const alt = 'Secteur OpenLab';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function SectorOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Response> {
  const { slug } = await params;
  const sector = SECTORS.find((s) => s.slug === slug);
  return renderOgImage({
    eyebrow: 'Secteurs OpenLab',
    title: sector?.name ?? 'Secteur OpenLab',
    subtitle: sector?.intro,
    footerLeft: 'IA appliquée · Afrique francophone',
  });
}
