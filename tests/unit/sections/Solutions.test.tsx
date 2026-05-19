import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Solutions } from '@/components/sections/Solutions';

const EXPECTED_PRODUCTS = [
  { name: /NexusRH CI/i, href: '/solutions/nexusrh', status: /En production/i },
  { name: /NexusERP/i, href: '/solutions/nexuserp', status: /En production/i },
  {
    name: /SYGESCOM v2\.0/i,
    href: '/solutions/sygescom',
    status: /En production/i,
  },
  {
    name: /AgroSense CI/i,
    href: '/solutions/agrosense',
    status: /MVP avancé/i,
  },
  {
    name: /QualitOS/i,
    href: '/solutions/qualitos',
    status: /En développement/i,
  },
  {
    name: /OpenLab Fraud Shield/i,
    href: '/solutions/fraud-shield',
    status: /En production/i,
  },
  {
    name: /OpenLab Smart City/i,
    href: '/solutions/smart-city',
    status: /En pilote/i,
  },
];

describe('Solutions (homepage §6.6 — showcase 7 produits)', () => {
  it('rend la section labellée par son h2', () => {
    render(<Solutions />);
    const section = screen.getByRole('region', {
      name: /Sept logiciels propriétaires.*Un seul laboratoire/i,
    });
    expect(section.getAttribute('data-testid')).toBe('solutions');
  });

  it('affiche eyebrow + baseline', () => {
    render(<Solutions />);
    expect(screen.getByText(/L’écosystème OpenLab/i)).toBeInTheDocument();
    expect(screen.getByText(/Pas un catalogue/i)).toBeInTheDocument();
  });

  it('expose exactement 7 cards produit dans une <ul>', () => {
    render(<Solutions />);
    const section = screen.getByTestId('solutions');
    // Premier <ul> direct = la liste des produits ; on l'isole via role+name parent.
    const lists = within(section).getAllByRole('list');
    const productList = lists[0]!;
    expect(within(productList).getAllByRole('listitem')).toHaveLength(7);
  });

  it.each(EXPECTED_PRODUCTS)(
    'card "$href" : nom, href et statut corrects',
    ({ name, href, status }) => {
      render(<Solutions />);
      const link = screen.getByRole('link', { name });
      expect(link.getAttribute('href')).toBe(href);
      // Le statut doit apparaître à côté du nom dans la même card.
      const card = link.querySelector('article');
      expect(card).not.toBeNull();
      expect(within(card!).getByText(status)).toBeInTheDocument();
    },
  );

  it('chaque card a une icône Lucide (svg)', () => {
    render(<Solutions />);
    const section = screen.getByTestId('solutions');
    const articles = within(section).getAllByRole('article');
    expect(articles).toHaveLength(7);
    for (const article of articles) {
      expect(article.querySelector('svg')).not.toBeNull();
    }
  });

  it('expose un CTA "Comparer tous les produits" vers /solutions', () => {
    render(<Solutions />);
    const cta = screen.getByRole('link', {
      name: /Comparer tous les produits/i,
    });
    expect(cta.getAttribute('href')).toBe('/solutions');
  });

  it('ne contient aucun chiffre rond non sourcé (§4.10)', () => {
    render(<Solutions />);
    const text = screen.getByTestId('solutions').textContent ?? '';
    // Seul chiffre attendu : "v2.0" (version SYGESCOM) et "Sept" en lettres.
    expect(text).not.toMatch(/\b\d{2,}\s*%|\d{3,}\+|\b1\d{3,}\b/);
  });
});
