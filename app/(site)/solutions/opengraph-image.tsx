import {
  renderOgImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from '@/lib/seo/og-image-template';

export const runtime = 'nodejs';
export const alt = 'Solutions OpenLab : huit logiciels propriétaires';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function SolutionsHubOgImage(): Response {
  return renderOgImage({
    eyebrow: 'Solutions OpenLab',
    title: 'Huit logiciels propriétaires',
    subtitle:
      'NexusRH, NexusERP, SYGESCOM, AgroSense, QualitOS, Fraud Shield, Smart City, SentinelBTP',
    footerLeft: 'Écosystème produit · K3s Hetzner',
  });
}
