'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { MegaMenuConfig } from '@/lib/navigation';

/**
 * Mega-menu navbar — audit P2 §7 item #9.
 *
 * Pattern Anthropic / Vercel / Linear : un bouton dans la navbar qui
 * ouvre un panneau structuré (colonnes + eyebrow + liens descriptifs).
 *
 * Interaction :
 *   - **Click** sur le label = toggle ouvert/fermé
 *   - **Hover** sur le label = ouvre (avec léger delay 60 ms pour éviter
 *     les ouvertures accidentelles au survol fugace)
 *   - **Hover out** vers l'extérieur = ferme après 150 ms
 *   - **Escape** = ferme et redonne le focus au bouton
 *   - **Click outside** = ferme
 *
 * Accessibilité (WCAG 2.2 AA) :
 *   - Bouton `aria-expanded`, `aria-controls`, `aria-haspopup="true"`
 *   - Panneau `role="region"` + `aria-label`
 *   - Focus visible (orange ring) sur tous les éléments
 *   - Navigation clavier complète (Tab/Shift+Tab traverse le panneau)
 *
 * Le label de la navbar est un **bouton** (pas un lien) — la page hub
 * (`/expertises`, `/solutions`, etc.) est accessible via le lien
 * « Vue d'ensemble » placé en tête du panneau, suivant le pattern
 * Anthropic. Évite l'ambiguïté hover-vs-click sur un même élément.
 */
export function MegaMenu({
  config,
}: {
  readonly config: MegaMenuConfig;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), 60);
  }, [clearTimers]);

  const closeMenu = useCallback(
    (immediate = false) => {
      clearTimers();
      if (immediate) {
        setOpen(false);
      } else {
        closeTimer.current = setTimeout(() => setOpen(false), 150);
      }
    },
    [clearTimers],
  );

  // Escape ferme + redonne focus au bouton.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        clearTimers();
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, clearTimers]);

  // Click outside.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  // Cleanup timers au démontage.
  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={() => closeMenu(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          clearTimers();
          setOpen((v) => !v);
        }}
        className={cn(
          'inline-flex items-center gap-1 text-sm font-medium transition-colors focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2',
          open
            ? 'text-[var(--color-ol-orange)]'
            : 'text-[var(--color-ol-graphite)] hover:text-[var(--color-ol-orange)]',
        )}
      >
        {config.label}
        <ChevronDown
          width={14}
          height={14}
          aria-hidden
          className={cn(
            'transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0',
          )}
        />
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-label={`Sous-menu ${config.label}`}
          data-testid={`mega-menu-${config.label.toLowerCase().replace(/\s+/g, '-')}`}
          className="absolute top-full left-1/2 z-50 mt-3 w-[640px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-[var(--color-ol-mist)] bg-white p-6 shadow-[0_24px_60px_-12px_rgba(10,14,26,0.18)]"
        >
          {/* Vue d'ensemble (lien hub) — en tête, eyebrow orange. */}
          <Link
            href={config.overview.href}
            onClick={() => setOpen(false)}
            className="block rounded-lg border border-[var(--color-ol-mist)]/60 bg-[var(--color-ol-ivory)] px-4 py-3 transition-colors hover:border-[var(--color-ol-orange)]/40 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <span className="text-[10px] font-semibold tracking-widest text-[var(--color-ol-orange)] uppercase">
              {config.label}
            </span>
            <span className="mt-1 block text-sm font-semibold text-[var(--color-ol-night)]">
              {config.overview.label}
            </span>
            {config.overview.description ? (
              <span className="mt-1 block text-xs text-[var(--color-ol-graphite)]/70">
                {config.overview.description}
              </span>
            ) : null}
          </Link>

          {/* Sections (1-3 colonnes selon le nombre) */}
          <div
            className={cn(
              'mt-5 grid gap-x-6 gap-y-5',
              config.sections.length === 1 ? 'grid-cols-1' : 'sm:grid-cols-2',
            )}
          >
            {config.sections.map((section, i) => (
              <div key={i}>
                {section.eyebrow ? (
                  <p className="px-3 pb-2 text-[10px] font-semibold tracking-widest text-[var(--color-ol-orange)] uppercase">
                    {section.eyebrow}
                  </p>
                ) : null}
                <ul className="flex flex-col gap-0.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm text-[var(--color-ol-graphite)] transition-colors hover:bg-[var(--color-ol-ivory)] hover:text-[var(--color-ol-night)] focus:outline-none focus-visible:bg-[var(--color-ol-ivory)] focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                      >
                        <span className="block font-medium">{link.label}</span>
                        {link.description ? (
                          <span className="mt-0.5 block text-xs text-[var(--color-ol-graphite)]/60">
                            {link.description}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA final optionnel (ex. « Demander un audit IA gratuit »). */}
          {config.cta ? (
            <div className="mt-5 border-t border-[var(--color-ol-mist)]/50 pt-4">
              <Link
                href={config.cta.href}
                onClick={() => setOpen(false)}
                className="inline-flex items-center text-sm font-medium text-[var(--color-ol-orange)] underline-offset-4 hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
              >
                {config.cta.label}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
