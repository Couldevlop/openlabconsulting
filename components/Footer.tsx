import type { ReactElement } from 'react';
import Link from 'next/link';
import { Container } from '@/components/atoms/Container';
import { Logo } from '@/components/atoms/Logo';

interface FooterColumn {
  title: string;
  links: { href: string; label: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Expertises',
    links: [
      {
        href: '/expertises/conseil-strategie',
        label: 'Conseil & stratégie IA',
      },
      {
        href: '/expertises/agents-automatisation',
        label: 'Agents & automatisation',
      },
      { href: '/expertises/data-gouvernance', label: 'Data & gouvernance' },
      { href: '/expertises/cybersecurite-ia', label: 'Cybersécurité IA' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { href: '/solutions/nexusrh', label: 'NexusRH CI' },
      { href: '/solutions/nexuserp', label: 'NexusERP' },
      { href: '/solutions/sygescom', label: 'SYGESCOM' },
      { href: '/solutions/agrosense', label: 'AgroSense CI' },
      { href: '/solutions/qualitos', label: 'QualitOS' },
      { href: '/solutions/fraud-shield', label: 'Fraud Shield' },
      { href: '/solutions/smart-city', label: 'Smart City' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { href: '/livre', label: 'Livre IA' },
      { href: '/insights', label: 'Insights' },
      { href: '/laboratoire/publications', label: 'Publications' },
      { href: '/audit-ia', label: 'Audit IA gratuit' },
    ],
  },
  {
    title: 'OpenLab',
    links: [
      { href: '/a-propos', label: 'À propos' },
      { href: '/a-propos/equipe', label: 'Équipe' },
      { href: '/a-propos/carrieres', label: 'Carrières' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export function Footer(): ReactElement {
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
              Cabinet ivoirien d&apos;IA appliquée, R&amp;D produit et
              publication de référence pour l&apos;Afrique francophone.
            </p>
            <address className="mt-6 text-sm text-[var(--color-ol-ivory)]/70 not-italic">
              Riviera Faya Lauriers 8
              <br />
              Cocody, Abidjan — Côte d&apos;Ivoire
              <br />
              <a
                href="tel:+2250709334238"
                className="hover:text-[var(--color-ol-orange)]"
              >
                +225 07 09 33 42 38
              </a>
              <br />
              <a
                href="mailto:infos@openlabconsulting.com"
                className="hover:text-[var(--color-ol-orange)]"
              >
                infos@openlabconsulting.com
              </a>
            </address>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-semibold tracking-widest text-[var(--color-ol-orange)] uppercase">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-ol-ivory)]/80 hover:text-[var(--color-ol-orange)]"
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
            © {new Date().getFullYear()} OpenLab Consulting SARL — RCCM
            CI-ABJ-03-2022-B13-03239. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link
                href="/mentions-legales"
                className="hover:text-[var(--color-ol-orange)]"
              >
                Mentions légales
              </Link>
            </li>
            <li>
              <Link
                href="/politique-confidentialite"
                className="hover:text-[var(--color-ol-orange)]"
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
