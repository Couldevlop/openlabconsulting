import { BOOK } from '@/lib/data/book';
import {
  renderOgImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from '@/lib/seo/og-image-template';

export const runtime = 'edge';
export const alt = 'Livre IA OpenLab — du ML aux agents autonomes';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function LivreOgImage(): Response {
  return renderOgImage({
    eyebrow: 'Édition OpenLab',
    title: BOOK.title,
    subtitle: BOOK.subtitle,
    footerLeft: `${BOOK.publicationYear} · Abidjan`,
  });
}
