import {
  RichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react';
import { lexicalNodeText, slugifyHeading } from '@/lib/articles';
import type { ArticleContent } from '@/lib/articles';
import type { CodeRenderer } from '@/lib/insights/code-highlighter';

/**
 * Rendu du corps d'un article (Lexical → JSX) — couche présentation.
 *
 * Isole entièrement le rendu richText : la page ne connaît que le type
 * domaine `Article`, jamais Payload ni Lexical directement (clean arch).
 *
 * Sécurité (OWASP A03 / open redirect / XSS) :
 *   - `safeHref` n'autorise que http(s), mailto, tel, ancres et liens
 *     relatifs ; tout `javascript:` / `data:` est neutralisé en `#`.
 *   - tout lien externe reçoit `rel="noopener noreferrer"`.
 *   - le contenu textuel (paragraphes, callouts) est échappé par React.
 *   - les blocs de code sont colorisés par Shiki, qui échappe le code
 *     source : la sortie HTML injectée ne contient que ses propres
 *     `<span>` de coloration (cf. lib/insights/code-highlighter).
 *
 * SEO / a11y :
 *   - chaque titre H2/H3 reçoit une ancre `id` stable (slug), partagée
 *     avec le sommaire via `slugifyHeading`.
 *
 * Composant serveur PUR et synchrone (aucun hook, zéro JS client). La
 * coloration du code est calculée côté serveur mais l'init asynchrone du
 * highlighter Shiki est INJECTÉE par la page (prop `renderCode`) : un
 * composant async imbriqué ne se rend pas hors RSC (tests jsdom), et la
 * page est déjà un Server Component asynchrone — c'est sa responsabilité.
 */

const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;

function safeHref(raw: unknown): string {
  if (typeof raw !== 'string') return '#';
  const href = raw.trim();
  return SAFE_HREF.test(href) ? href : '#';
}

const CALLOUT_VARIANTS = new Set(['info', 'tip', 'warning', 'danger']);

function calloutVariant(value: unknown): string {
  return typeof value === 'string' && CALLOUT_VARIANTS.has(value)
    ? value
    : 'info';
}

/**
 * Construit le jeu de converters JSX. Le rendu du code est injecté
 * (fonction synchrone déjà résolue) pour rester compatible avec l'API
 * synchrone de `RichText`.
 */
function buildConverters(renderCode: CodeRenderer): JSXConvertersFunction {
  return ({ defaultConverters }) => ({
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
    blocks: {
      // Bloc de code (slug Payload « Code ») → coloration Shiki serveur.
      Code: ({
        node,
      }: {
        node: { fields: { code?: unknown; language?: unknown } };
      }) => {
        const fields = node.fields;
        const code = typeof fields.code === 'string' ? fields.code : '';
        const language =
          typeof fields.language === 'string' ? fields.language : undefined;
        const html = renderCode(code, language);
        return (
          <figure className="article-code" data-language={language ?? 'text'}>
            <div
              className="article-code__surface"
              // Sortie Shiki : code source intégralement échappé (A03).
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </figure>
        );
      },
      // Encadré éditorial (info / astuce / avertissement / danger).
      callout: ({
        node,
      }: {
        node: {
          fields: { variant?: unknown; title?: unknown; content?: unknown };
        };
      }) => {
        const fields = node.fields;
        const variant = calloutVariant(fields.variant);
        const title =
          typeof fields.title === 'string' && fields.title.trim().length > 0
            ? fields.title
            : null;
        const body = typeof fields.content === 'string' ? fields.content : '';
        return (
          <aside
            className={`article-callout article-callout--${variant}`}
            role="note"
          >
            {title && <p className="article-callout__title">{title}</p>}
            <p className="article-callout__body">{body}</p>
          </aside>
        );
      },
    },
  });
}

interface ArticleBodyProps {
  content: ArticleContent;
  /** Rendu de code colorisé, créé par la page (cf. createCodeRenderer). */
  renderCode: CodeRenderer;
}

export function ArticleBody({
  content,
  renderCode,
}: ArticleBodyProps): React.ReactElement {
  return (
    <RichText
      data={content}
      converters={buildConverters(renderCode)}
      className="article-prose"
    />
  );
}
