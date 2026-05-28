import {
  RichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react';
import { lexicalNodeText, slugifyHeading } from '@/lib/articles';
import type { ArticleContent } from '@/lib/articles';

/**
 * Rendu du corps d'un article (Lexical → JSX) — couche présentation.
 *
 * Isole entièrement le rendu richText : la page ne connaît que le type
 * domaine `Article`, jamais Payload ni Lexical directement (clean arch).
 *
 * Sécurité (OWASP A03 / open redirect) :
 *   - `safeHref` n'autorise que http(s), mailto, tel, ancres et liens
 *     relatifs ; tout `javascript:` / `data:` est neutralisé en `#`.
 *   - tout lien externe reçoit `rel="noopener noreferrer"`.
 *
 * SEO / a11y :
 *   - chaque titre H2/H3 reçoit une ancre `id` stable (slug), partagée
 *     avec le sommaire via `slugifyHeading`.
 *
 * Composant serveur (aucun hook) — rendu côté serveur, zéro JS client.
 */

const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;

function safeHref(raw: unknown): string {
  if (typeof raw !== 'string') return '#';
  const href = raw.trim();
  return SAFE_HREF.test(href) ? href : '#';
}

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const Tag = node.tag;
    const id = slugifyHeading(lexicalNodeText(node));
    return (
      <Tag id={id || undefined}>{nodesToJSX({ nodes: node.children })}</Tag>
    );
  },
  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    const isInternal = node.fields?.linkType === 'internal';
    const href = safeHref(node.fields?.url);
    const newTab = Boolean(node.fields?.newTab);
    // Liens externes : toujours noopener noreferrer (anti-tabnabbing).
    const rel = isInternal && !newTab ? undefined : 'noopener noreferrer';
    return (
      <a href={href} target={newTab ? '_blank' : undefined} rel={rel}>
        {children}
      </a>
    );
  },
});

interface ArticleBodyProps {
  content: ArticleContent;
}

export function ArticleBody({ content }: ArticleBodyProps): React.ReactElement {
  return (
    <RichText
      data={content}
      converters={jsxConverters}
      className="article-prose"
    />
  );
}
