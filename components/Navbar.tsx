'use client';

import { useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';
import { Logo } from '@/components/atoms/Logo';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/expertises', label: 'Expertises' },
  { href: '/laboratoire', label: 'Laboratoire' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/livre', label: 'Livre IA' },
  { href: '/insights', label: 'Insights' },
  { href: '/a-propos', label: 'À propos' },
] as const;

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
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-[var(--color-ol-graphite)] transition-colors hover:text-[var(--color-ol-orange)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
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
          open ? 'max-h-[80vh]' : 'max-h-0',
        )}
        aria-hidden={!open}
      >
        <Container as="nav" width="wide" className="py-6">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-3 text-base font-medium text-[var(--color-ol-graphite)] hover:bg-[var(--color-ol-mist)]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
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
