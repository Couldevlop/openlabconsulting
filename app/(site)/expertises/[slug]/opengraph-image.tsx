import { EXPERTISES } from '@/lib/data/expertises';
import {
  renderOgImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from '@/lib/seo/og-image-template';

export const runtime = 'nodejs';
export const alt = 'Expertise OpenLab';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ExpertiseOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Response> {
  const { slug } = await params;
  const expertise = EXPERTISES.find((e) => e.slug === slug);
  return renderOgImage({
    eyebrow: 'Expertises OpenLab',
    title: expertise?.title ?? 'Expertise OpenLab',
    subtitle: expertise?.intro,
    footerLeft: 'Conseil · Intégration · Gouvernance',
  });
}
