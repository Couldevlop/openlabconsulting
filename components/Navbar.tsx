'use client';

import { useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { CommandPalette } from '@/components/atoms/CommandPalette';
import { Container } from '@/components/atoms/Container';
import { Logo } from '@/components/atoms/Logo';
import { MegaMenu } from '@/components/atoms/MegaMenu';
import { cn } from '@/lib/cn';
import { NAV_ITEMS, type MegaMenuConfig } from '@/lib/navigation';

export function Navbar(): ReactElement {
  const [open, setOpen] = useState(false);
  // Détecte le scroll pour intensifier le glassmorphism — la navbar
  // devient plus translucide + une ombre douce apparaît dès que l'on
  // commence à scroller. Sentiment de profondeur premium.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll(): void {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300 ease-out',
        scrolled
          ? 'border-b border-[var(--color-ol-mist)]/60 bg-[var(--color-ol-ivory)]/80 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl'
          : 'border-b border-transparent bg-[var(--color-ol-ivory)]/95 backdrop-blur-md',
      )}
      data-testid="navbar"
    >
      <Container
        as="div"
        width="wide"
        className="flex h-16 items-center justify-between"
      >
        <Link href="/" aria-label="Accueil OpenLab Consulting">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV_ITEMS.map((item) =>
              item.kind === 'link' ? (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-[var(--color-ol-graphite)] transition-colors hover:text-[var(--color-ol-orange)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.config.label}>
                  <MegaMenu config={item.config} />
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <CommandPalette />
          <Button as="a" href="/audit-ia" variant="primary" size="md">
            Audit IA gratuit
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--color-ol-night)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </Container>

      <div
        id="mobile-nav"
        className={cn(
          'overflow-hidden border-t border-[var(--color-ol-mist)] transition-[max-height] duration-300 lg:hidden',
          open ? 'max-h-[85vh] overflow-y-auto' : 'max-h-0',
        )}
        aria-hidden={!open}
      >
        <Container as="nav" width="wide" className="py-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) =>
              item.kind === 'link' ? (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-3 text-base font-medium text-[var(--color-ol-graphite)] hover:bg-[var(--color-ol-mist)]"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.config.label}>
                  <MobileMegaSection
                    config={item.config}
                    onNavigate={() => setOpen(false)}
                  />
                </li>
              ),
            )}
            <li className="mt-4">
              <Button
                as="a"
                href="/audit-ia"
                variant="primary"
                size="md"
                className="w-full"
              >
                Audit IA gratuit
              </Button>
            </li>
          </ul>
        </Container>
      </div>
    </header>
  );
}

/**
 * Section collapsible utilisée dans le drawer mobile pour rendre les
 * méga-menus en accordéon (un seul ouvert à la fois côté visuel,
 * indépendamment côté état — l'utilisateur peut en ouvrir plusieurs
 * s'il veut comparer).
 */
function MobileMegaSection({
  config,
  onNavigate,
}: {
  readonly config: MegaMenuConfig;
  readonly onNavigate: () => void;
}): ReactElement {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-md">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-3 py-3 text-base font-medium text-[var(--color-ol-graphite)] hover:bg-[var(--color-ol-mist)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
      >
        {config.label}
        <ChevronDown
          width={16}
          height={16}
          aria-hidden
          className={cn(
            'transition-transform duration-200',
            expanded ? 'rotate-180' : 'rotate-0',
          )}
        />
      </button>
      {expanded ? (
        <div className="ml-3 border-l border-[var(--color-ol-mist)] pl-3">
          <Link
            href={config.overview.href}
            onClick={onNavigate}
            className="block py-2 text-sm font-medium text-[var(--color-ol-orange)]"
          >
            {config.overview.label}
          </Link>
          {config.sections.map((section, i) => (
            <div key={i} className="mt-2">
              {section.eyebrow ? (
                <p className="text-[10px] font-semibold tracking-widest text-[var(--color-ol-orange)] uppercase">
                  {section.eyebrow}
                </p>
              ) : null}
              <ul className="mt-1 flex flex-col gap-0.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className="block py-1.5 text-sm text-[var(--color-ol-graphite)] hover:text-[var(--color-ol-orange)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
