import { getLocation } from '@/lib/data/locations';
import {
  renderOgImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from '@/lib/seo/og-image-template';

const LOCATION = getLocation('cocody');

export const runtime = 'nodejs';
export const alt = `OpenLab Consulting : ${LOCATION.label}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function CocodyOgImage(): Response {
  return renderOgImage({
    eyebrow: LOCATION.eyebrow,
    title: LOCATION.h1.replace(/[.:].*$/, ''),
    subtitle: LOCATION.subtitle,
    footerLeft: 'Cabinet IA · Abidjan',
  });
}
