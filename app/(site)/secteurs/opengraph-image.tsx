import {
  renderOgImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from '@/lib/seo/og-image-template';

export const runtime = 'nodejs';
export const alt = 'Secteurs OpenLab : l’IA appliquée par industrie';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function SecteursHubOgImage(): Response {
  return renderOgImage({
    eyebrow: 'Secteurs OpenLab',
    title: 'L’IA appliquée par industrie',
    subtitle:
      'Public, banque-assurance, agro-industrie, santé, télécoms & énergie',
    footerLeft: 'IA sectorielle · Afrique francophone',
  });
}
