import type { ReactElement } from 'react';
import Link from 'next/link';
import { Container } from '@/components/atoms/Container';
import { Logo } from '@/components/atoms/Logo';
import { FOOTER_FALLBACK, type FooterContent } from '@/lib/cms/site-settings';

interface FooterProps {
  /** Contenu CMS injecté par le wrapper async. Fallback statique si absent. */
  content?: FooterContent;
}

export function Footer({
  content = FOOTER_FALLBACK,
}: FooterProps = {}): ReactElement {
  return (
    <footer
      className="bg-[var(--color-ol-night)] text-[var(--color-ol-ivory)]"
      data-testid="footer"
    >
      <Container width="wide" className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo className="text-[var(--color-ol-ivory)]" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[var(--color-ol-ivory)]/70">
              {content.tagline}
            </p>
            <address className="mt-6 text-sm text-[var(--color-ol-ivory)]/70 not-italic">
              Riviera Faya Lauriers 8
              <br />
              Cocody, Abidjan — Côte d&apos;Ivoire
              <br />
              <a
                href="tel:+2250709334238"
                className="hover:text-[var(--color-ol-orange-text)]"
              >
                +225 07 09 33 42 38
              </a>
              <br />
              <a
                href="mailto:infos@openlabconsulting.com"
                className="hover:text-[var(--color-ol-orange-text)]"
              >
                infos@openlabconsulting.com
              </a>
            </address>
          </div>

          {content.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-semibold tracking-widest text-[var(--color-ol-orange-text)] uppercase">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-ol-ivory)]/80 hover:text-[var(--color-ol-orange-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-[var(--color-ol-ivory)]/10 pt-8 text-xs text-[var(--color-ol-ivory)]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {content.copyright}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link
                href="/mentions-legales"
                className="hover:text-[var(--color-ol-orange-text)]"
              >
                Mentions légales
              </Link>
            </li>
            <li>
              <Link
                href="/politique-confidentialite"
                className="hover:text-[var(--color-ol-orange-text)]"
              >
                Confidentialité
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
