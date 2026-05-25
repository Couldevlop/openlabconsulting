import { SITE, absoluteUrl } from './site';
import type { Expertise } from '@/lib/data/expertises';
import type { Product } from '@/lib/data/products';
import type { Sector } from '@/lib/data/sectors';
import { BOOK } from '@/lib/data/book';

/**
 * Helpers de génération JSON-LD selon Schema.org — voir CLAUDE.md §12.3.
 *
 * Chaque helper retourne un objet sérialisable, à embarquer dans
 * <script type="application/ld+json"> via dangerouslySetInnerHTML.
 *
 * Validation : https://search.google.com/test/rich-results
 */

interface Thing {
  '@context': 'https://schema.org';
  '@type': string;
  [k: string]: unknown;
}

/** Organization schema — à mettre dans le layout root, partagé. */
export function organizationSchema(): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE.url,
    logo: absoluteUrl('/OPENLAB.png'),
    description: SITE.description,
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE.address.addressLocality,
        addressRegion: SITE.address.addressRegion,
        addressCountry: SITE.address.addressCountry,
      },
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.streetAddress,
      addressLocality: SITE.address.addressLocality,
      addressRegion: SITE.address.addressRegion,
      addressCountry: SITE.address.addressCountry,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE.contact.primaryPhone,
        contactType: 'sales',
        availableLanguage: ['fr'],
        areaServed: ['CI', 'FR', 'UEMOA'],
      },
    ],
    sameAs: [SITE.social.linkedin],
    knowsAbout: [
      'Intelligence Artificielle',
      'Machine Learning',
      'Agents autonomes',
      'MLOps',
      'Cybersécurité IA',
      'Gouvernance data',
      'AI Act',
      'RGPD',
      'SYSCOHADA',
      'CNPS Côte d’Ivoire',
    ],
  };
}

/** LocalBusiness schema — pour /contact et la mention adresse globale. */
export function localBusinessSchema(): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': absoluteUrl('/#localbusiness'),
    name: SITE.legalName,
    image: absoluteUrl('/OPENLAB.png'),
    url: SITE.url,
    telephone: SITE.contact.primaryPhone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.streetAddress,
      addressLocality: SITE.address.addressLocality,
      addressRegion: SITE.address.addressRegion,
      addressCountry: SITE.address.addressCountry,
    },
    priceRange: 'Sur devis',
    areaServed: ['Côte d’Ivoire', 'France', 'UEMOA'],
  };
}

/** WebSite schema — sitelinks searchbox + branding. */
export function webSiteSchema(): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { '@id': absoluteUrl('/#organization') },
  };
}

/** Breadcrumb schema réutilisable. */
export function breadcrumbSchema(
  items: { name: string; url: string }[],
): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

/** Service schema pour les pages /expertises/<slug>. */
export function serviceSchema(expertise: Expertise): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: expertise.title,
    description: expertise.intro,
    provider: { '@id': absoluteUrl('/#organization') },
    url: absoluteUrl(`/expertises/${expertise.slug}`),
    areaServed: ['Côte d’Ivoire', 'France', 'UEMOA'],
    serviceType: 'Conseil en intelligence artificielle',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      price: '0',
      description: 'Audit initial gratuit, devis sur cadrage.',
    },
  };
}

/** Product / SoftwareApplication schema pour /solutions/<slug>. */
export function softwareApplicationSchema(product: Product): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.intro,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Linux (K3s Hetzner)',
    url: absoluteUrl(`/solutions/${product.slug}`),
    provider: { '@id': absoluteUrl('/#organization') },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      price: '0',
      description:
        product.status === 'production'
          ? 'Sur devis — déploiement et licence selon volume.'
          : 'En développement — pilote sur dossier.',
    },
  };
}

/** WebPage schema pour les pages secteurs. */
export function sectorPageSchema(sector: Sector): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${sector.name} — Secteurs OpenLab`,
    description: sector.intro,
    url: absoluteUrl(`/secteurs/${sector.slug}`),
    isPartOf: { '@id': absoluteUrl('/#website') },
    about: sector.name,
    inLanguage: SITE.language,
  };
}

/** Book schema pour /livre et l'encart homepage. */
export function bookSchema(): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: BOOK.title,
    alternateName: `${BOOK.title} — ${BOOK.subtitle}`,
    bookFormat: 'EBook',
    inLanguage: 'fr',
    author: {
      '@type': 'Person',
      name: 'Debora Ahouma',
      jobTitle: 'CEO',
      affiliation: { '@id': absoluteUrl('/#organization') },
    },
    publisher: { '@id': absoluteUrl('/#organization') },
    datePublished: `${BOOK.publicationYear}-01-01`,
    numberOfPages: BOOK.pageCount,
    abstract: BOOK.longPitch[0],
    url: absoluteUrl('/livre'),
  };
}

/**
 * Person schema — boost E-E-A-T Google (§12.4).
 *
 * Posé sur /a-propos pour identifier formellement Debora Ahouma comme
 * CEO et auteure du livre IA. Google utilise ce signal pour
 * l'autorité du domaine sur les sujets IA / Afrique francophone.
 *
 * Champs minimaux : name, jobTitle, worksFor, sameAs (LinkedIn,
 * Google Scholar si disponible).
 */
export function personSchema(person: {
  name: string;
  jobTitle: string;
  description?: string;
  imageUrl?: string;
  knowsAbout?: readonly string[];
  sameAs?: readonly string[];
}): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: person.jobTitle,
    ...(person.description ? { description: person.description } : {}),
    ...(person.imageUrl ? { image: person.imageUrl } : {}),
    ...(person.knowsAbout ? { knowsAbout: person.knowsAbout } : {}),
    ...(person.sameAs ? { sameAs: person.sameAs } : {}),
    worksFor: { '@id': absoluteUrl('/#organization') },
    nationality: { '@type': 'Country', name: 'Côte d’Ivoire' },
  };
}

/** FAQPage schema — utilisé sur chaque page produit (§7.1 FAQ). */
export function faqPageSchema(
  faq: readonly { question: string; answer: string }[],
): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/** Champs minimaux d'un article requis pour le schema (découplé de Payload). */
export interface ArticleSchemaInput {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  /** ISO YYYY-MM-DD. */
  isoDate: string;
  categoryLabel: string;
  /** URL (relative ou absolue) de la couverture, ou null. */
  coverSrc: string | null;
}

/**
 * Article schema enrichi pour `/insights/[slug]` (CLAUDE.md §12.3 / GEO §12.4).
 * Auteur typé `Person` par défaut, `Organization` pour une équipe/laboratoire.
 */
export function articleSchema(article: ArticleSchemaInput): Thing {
  const url = absoluteUrl(`/insights/${article.slug}`);
  const isOrgAuthor = /^(équipe|equipe|laboratoire)/i.test(article.author);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.excerpt,
    inLanguage: SITE.language,
    datePublished: article.isoDate,
    dateModified: article.isoDate,
    articleSection: article.categoryLabel,
    image: article.coverSrc
      ? absoluteUrl(article.coverSrc)
      : absoluteUrl('/OPENLAB.png'),
    author: isOrgAuthor
      ? { '@type': 'Organization', name: article.author }
      : { '@type': 'Person', name: article.author },
    publisher: { '@id': absoluteUrl('/#organization') },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

/** Blog schema pour le hub `/insights`. */
export function blogSchema(): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': absoluteUrl('/insights#blog'),
    url: absoluteUrl('/insights'),
    name: 'Insights — OpenLab Consulting',
    description:
      'Retours de déploiements IA réels en Afrique francophone : souveraineté, conformité, fraude documentaire, agriculture précision, cybersécurité.',
    inLanguage: SITE.language,
    publisher: { '@id': absoluteUrl('/#organization') },
  };
}

/** Sérialise un objet Thing en chaîne JSON safe pour <script>. */
export function jsonLdString(thing: Thing | Thing[]): string {
  return JSON.stringify(thing).replace(/</g, '\\u003c');
}
