import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Couvre le chemin « Payload disponible » de lib/products-server
 * (mapping toProduct + filtre slug + validations), en surchargeant les
 * modules `payload` et `@payload-config` normalement stubbés pour throw.
 */
const findMock = vi.fn();

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ find: findMock }),
}));

import { getPublishedProducts, getProductBySlug } from '@/lib/products-server';
import { FALLBACK_PRODUCTS } from '@/lib/data/products';

function rawDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p-1',
    slug: 'nexusrh',
    iconKey: 'users',
    name: 'NexusRH CI (CMS)',
    tagline: 'Tagline depuis Payload.',
    target: 'PME · Côte d’Ivoire',
    maturity: 'production',
    statusLabel: 'En production',
    eyebrow: 'SIRH IA',
    intro: 'Intro produit depuis la base de données.',
    problem: 'Le problème avant le produit.',
    features: [
      { iconKey: 'users', title: 'Feature A', body: 'Corps de la feature A.' },
      {
        iconKey: 'badge-check',
        title: 'Feature B',
        body: 'Corps de la feature B.',
      },
    ],
    stack: [{ value: 'Spring Boot 3' }, { value: 'PostgreSQL 17' }],
    proofs: [{ value: '+247', label: 'agents', source: 'déploiement client' }],
    pricing: {
      model: 'saas',
      headline: 'À partir de 25 000 F CFA',
      details: [{ value: 'Paie illimitée' }, { value: 'Support 24h' }],
      note: 'Engagement 12 mois.',
    },
    faq: [{ question: 'Question ?', answer: 'Réponse.' }],
    expertisesLies: [{ slug: 'data-gouvernance', title: 'Data & gouvernance' }],
    ...overrides,
  };
}

beforeEach(() => {
  findMock.mockReset();
});

describe('getPublishedProducts — Payload disponible', () => {
  it('mappe les documents publiés (toProduct)', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc()] });
    const products = await getPublishedProducts();
    expect(products[0]?.name).toBe('NexusRH CI (CMS)');
    expect(products[0]?.iconKey).toBe('users');
    expect(products[0]?.stack).toEqual(['Spring Boot 3', 'PostgreSQL 17']);
    expect(products[0]?.pricing.details).toEqual([
      'Paie illimitée',
      'Support 24h',
    ]);
    expect(products[0]?.pricing.note).toBe('Engagement 12 mois.');
    expect(products[0]?.features).toHaveLength(2);
  });

  it('retombe sur le fallback si la collection est vide', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const products = await getPublishedProducts();
    expect(products).toEqual(FALLBACK_PRODUCTS);
  });

  it('accepte un slug libre kebab-case inconnu du fallback (produit créé depuis l’admin)', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ slug: 'sentinelbtp' })] });
    const products = await getPublishedProducts();
    expect(products[0]?.slug).toBe('sentinelbtp');
  });

  it('ignore les documents invalides (slug mal formé) → fallback si plus aucun valide', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ slug: 'Pas Un Slug !' })] });
    const products = await getPublishedProducts();
    expect(products).toEqual(FALLBACK_PRODUCTS);
  });

  it('ignore un document sans pricing (toProduct → null)', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ pricing: null })] });
    const products = await getPublishedProducts();
    expect(products).toEqual(FALLBACK_PRODUCTS);
  });
});

describe('getProductBySlug — Payload disponible', () => {
  it('mappe le produit trouvé et filtre par slug', async () => {
    findMock.mockResolvedValue({ docs: [rawDoc({ slug: 'sygescom' })] });
    const product = await getProductBySlug('sygescom');
    expect(product?.slug).toBe('sygescom');
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'products', limit: 1 }),
    );
  });

  it('retombe sur le fallback réel si aucun document', async () => {
    findMock.mockResolvedValue({ docs: [] });
    const product = await getProductBySlug('agrosense');
    expect(product?.slug).toBe('agrosense');
    expect(product?.name).toBe('AgroSense CI');
  });
});
