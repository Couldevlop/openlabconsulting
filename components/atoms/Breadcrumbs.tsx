import type { ReactElement } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Container } from './Container';

export interface BreadcrumbItem {
  /** Libellé affiché. */
  label: string;
  /** URL relative. Si omis, item courant (non cliquable). */
  href?: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  /** Conteneur visuel autour (true par défaut, false si on veut l'inline). */
  contained?: boolean;
}

/**
 * Breadcrumbs — fil d'Ariane visuel + accessible (CLAUDE.md §12.3).
 *
 * Posés sur les pages détail (expertise, solution, secteur, livre,
 * insight, etc.) pour :
 *   - améliorer l'UX (navigation rapide vers les niveaux supérieurs)
 *   - améliorer le SEO (Google affiche les breadcrumbs dans les SERP)
 *
 * À combiner avec `breadcrumbSchema()` de `lib/seo/schema.ts` qui pose
 * le JSON-LD `BreadcrumbList`.
 *
 * Pattern d'usage typique :
 *
 *   <Breadcrumbs
 *     items={[
 *       { label: 'Solutions', href: '/solutions' },
 *       { label: product.name },  // courant, sans href
 *     ]}
 *   />
 *
 * L'item « Accueil » est ajouté automatiquement en tête (icône maison).
 */
export function Breadcrumbs({
  items,
  contained = true,
}: BreadcrumbsProps): ReactElement {
  const trail: readonly BreadcrumbItem[] = [
    { label: 'Accueil', href: '/' },
    ...items,
  ];

  const inner = (
    <nav
      aria-label="Fil d'Ariane"
      data-testid="breadcrumbs"
      className="text-sm"
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[var(--color-ol-graphite)]/65">
        {trail.map((item, i) => {
          const isLast = i === trail.length - 1;
          const isHome = i === 0;
          return (
            <li
              key={`${item.label}-${i}`}
              className="flex items-center gap-x-1.5"
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded transition-colors hover:text-[var(--color-ol-orange-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                >
                  {isHome ? <Home width={14} height={14} aria-hidden /> : null}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="inline-flex items-center gap-1 font-medium text-[var(--color-ol-night)]"
                >
                  {isHome ? <Home width={14} height={14} aria-hidden /> : null}
                  <span>{item.label}</span>
                </span>
              )}
              {!isLast ? (
                <ChevronRight
                  width={14}
                  height={14}
                  aria-hidden
                  className="text-[var(--color-ol-graphite)]/35"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  if (!contained) return inner;
  return (
    <div
      data-testid="breadcrumbs-container"
      className="border-b border-[var(--color-ol-mist)]/50 bg-[var(--color-ol-ivory)]/40 py-3"
    >
      <Container width="wide">{inner}</Container>
    </div>
  );
}
