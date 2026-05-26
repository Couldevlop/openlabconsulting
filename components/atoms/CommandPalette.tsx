'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  COMMAND_INDEX,
  filterCommands,
  type CommandEntry,
} from '@/lib/command-palette-index';

/**
 * Cmd+K palette publique — audit P2 §7 item #10 (différenciation forte).
 *
 * Ouverture :
 *   - `Cmd+K` (macOS) / `Ctrl+K` (Win/Linux) depuis n'importe où
 *   - clic sur le bouton « Recherche ⌘K » de la Navbar
 *
 * Navigation :
 *   - flèches haut/bas pour parcourir les résultats
 *   - Entrée pour ouvrir le résultat sélectionné
 *   - Échap pour fermer
 *
 * Performance :
 *   - Index statique 38 entrées, filtre `includes()` insensible à la
 *     casse + accents (lib/command-palette-index.ts).
 *   - Bundle ≈ 2 ko gzipped, aucune dépendance externe ajoutée.
 *
 * Accessibilité (WCAG §4.7) :
 *   - `role="dialog"` + `aria-modal` + `aria-label`.
 *   - Focus trappé sur l'input à l'ouverture, restauré au close.
 *   - Liste annoncée via `role="listbox"` + `aria-activedescendant`.
 *
 * OWASP :
 *   - Index statique = pas d'input arbitraire envoyé au serveur.
 *   - Liens internes uniquement (pas d'URL constituée à partir de la
 *     query, donc pas d'open redirect possible).
 */
export function CommandPalette(): ReactElement {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const results = useMemo(() => filterCommands(query, COMMAND_INDEX), [query]);

  // Reset l'index actif quand la query change.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Ouverture clavier Cmd/Ctrl+K + fermeture Escape global.
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Focus management.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      setTimeout(() => inputRef.current?.focus(), 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previouslyFocused.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const onSelect = useCallback(
    (entry: CommandEntry) => {
      close();
      router.push(entry.href);
    },
    [close, router],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = results[activeIndex];
        if (target) onSelect(target);
      }
    },
    [results, activeIndex, onSelect],
  );

  // Regroupement par section pour l'affichage.
  const grouped = useMemo(() => {
    const groups = new Map<string, CommandEntry[]>();
    for (const entry of results) {
      const arr = groups.get(entry.section) ?? [];
      arr.push(entry);
      groups.set(entry.section, arr);
    }
    return Array.from(groups.entries());
  }, [results]);

  return (
    <>
      {/* Trigger button (placé dans la Navbar) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="command-palette-trigger"
        aria-label="Ouvrir la recherche (Cmd+K)"
        className="inline-flex items-center gap-2 rounded-md border border-[var(--color-ol-mist)] bg-white/60 px-3 py-1.5 text-sm text-[var(--color-ol-graphite)]/70 backdrop-blur-sm transition-colors hover:border-[var(--color-ol-orange)]/40 hover:text-[var(--color-ol-graphite)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
      >
        <Search width={14} height={14} aria-hidden />
        <span className="hidden sm:inline">Recherche</span>
        <kbd className="hidden rounded border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-ol-graphite)]/60 sm:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-[var(--color-ol-night)]/65 p-4 backdrop-blur-sm sm:p-8"
          data-testid="command-palette-overlay"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Recherche dans le site"
            className="mt-[10vh] w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--color-ol-mist)] bg-white shadow-[0_24px_60px_-12px_rgba(10,14,26,0.45)]"
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-[var(--color-ol-mist)] px-4 py-3">
              <Search
                width={18}
                height={18}
                className="text-[var(--color-ol-graphite)]/50"
                aria-hidden
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cherche une page, un produit, un secteur…"
                aria-controls="cmdk-listbox"
                aria-activedescendant={`cmdk-item-${activeIndex}`}
                className="w-full bg-transparent text-base text-[var(--color-ol-night)] placeholder:text-[var(--color-ol-graphite)]/45 focus:outline-none"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Fermer la recherche"
                className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded text-[var(--color-ol-graphite)]/55 hover:bg-[var(--color-ol-ivory)] hover:text-[var(--color-ol-graphite)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)]"
              >
                <X width={14} height={14} aria-hidden />
              </button>
            </div>

            {/* Results */}
            <div
              id="cmdk-listbox"
              role="listbox"
              data-testid="command-palette-results"
              className="max-h-[60vh] overflow-y-auto py-2"
            >
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--color-ol-graphite)]/55">
                  Aucun résultat pour « {query} ». Essaie « livre », « audit »,
                  « cnps », « cacao », « rgpd »…
                </p>
              ) : (
                grouped.map(([section, entries]) => (
                  <div
                    key={section}
                    className="border-t border-[var(--color-ol-mist)]/40 first:border-0"
                  >
                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-[var(--color-ol-orange)] uppercase">
                      {section}
                    </p>
                    <ul>
                      {entries.map((entry) => {
                        const globalIdx = results.indexOf(entry);
                        const isActive = globalIdx === activeIndex;
                        return (
                          <li key={entry.href}>
                            <button
                              type="button"
                              id={`cmdk-item-${globalIdx}`}
                              role="option"
                              aria-selected={isActive}
                              onMouseEnter={() => setActiveIndex(globalIdx)}
                              onClick={() => onSelect(entry)}
                              className={cn(
                                'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                                isActive
                                  ? 'bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-night)]'
                                  : 'text-[var(--color-ol-graphite)] hover:bg-[var(--color-ol-ivory)]',
                              )}
                            >
                              <span className="flex items-center gap-3">
                                {entry.badge ? (
                                  <span
                                    aria-hidden
                                    className="inline-flex h-5 min-w-[40px] items-center justify-center rounded bg-[var(--color-ol-orange)]/15 px-1.5 text-[10px] font-semibold tracking-wider text-[var(--color-ol-orange)] uppercase"
                                  >
                                    {entry.badge}
                                  </span>
                                ) : null}
                                <span>{entry.title}</span>
                              </span>
                              <span className="text-[10px] tracking-wider text-[var(--color-ol-graphite)]/45 uppercase">
                                {entry.href}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>

            {/* Footer indications clavier */}
            <div className="flex items-center justify-between border-t border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] px-4 py-2 text-[11px] text-[var(--color-ol-graphite)]/55">
              <span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-medium">
                  ↑↓
                </kbd>{' '}
                naviguer ·{' '}
                <kbd className="rounded bg-white px-1.5 py-0.5 font-medium">
                  ↵
                </kbd>{' '}
                ouvrir ·{' '}
                <kbd className="rounded bg-white px-1.5 py-0.5 font-medium">
                  Esc
                </kbd>{' '}
                fermer
              </span>
              <span>{results.length} résultat(s)</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
