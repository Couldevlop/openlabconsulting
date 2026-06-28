import { PRODUCTS } from '@/lib/data/products';
import {
  renderOgImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from '@/lib/seo/og-image-template';

export const runtime = 'nodejs';
export const alt = 'Produit OpenLab : fiche solution';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ProductOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Response> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  return renderOgImage({
    eyebrow: 'Solutions OpenLab',
    title: product?.name ?? 'Solution OpenLab',
    subtitle: product?.tagline ?? product?.intro,
    footerLeft: 'Écosystème produit · K3s Hetzner',
  });
}
