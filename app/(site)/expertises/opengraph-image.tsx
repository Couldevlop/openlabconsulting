import {
  renderOgImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from '@/lib/seo/og-image-template';

export const runtime = 'nodejs';
export const alt =
  'Expertises OpenLab : conseil, agents, data, cybersécurité IA';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function ExpertisesHubOgImage(): Response {
  return renderOgImage({
    eyebrow: 'Expertises OpenLab',
    title: 'Conseil, agents, data, cybersécurité IA',
    subtitle: 'Transformer l’IA en levier mesurable',
    footerLeft: 'Conseil & intégration IA',
  });
}
