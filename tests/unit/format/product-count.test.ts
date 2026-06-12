import { describe, it, expect } from 'vitest';
import {
  spellFrenchCount,
  interpolateCounts,
  toProductCount,
} from '@/lib/format/product-count';

describe('lib/format/product-count', () => {
  describe('spellFrenchCount', () => {
    it('écrit les nombres de 0 à 20 en lettres', () => {
      expect(spellFrenchCount(0)).toBe('zéro');
      expect(spellFrenchCount(7)).toBe('sept');
      expect(spellFrenchCount(8)).toBe('huit');
      expect(spellFrenchCount(20)).toBe('vingt');
    });

    it('retombe sur le chiffre au-delà de 20 ou pour une valeur invalide', () => {
      expect(spellFrenchCount(21)).toBe('21');
      expect(spellFrenchCount(-1)).toBe('-1');
      expect(spellFrenchCount(2.5)).toBe('2.5');
    });
  });

  describe('interpolateCounts', () => {
    const count = { count: 8, word: 'huit' };

    it('remplace les tokens chiffres et lettres', () => {
      expect(interpolateCounts('{products} produits', count)).toBe(
        '8 produits',
      );
      expect(interpolateCounts('{productsWord} logiciels', count)).toBe(
        'huit logiciels',
      );
    });

    it('capitalise la variante {ProductsWord} (début de phrase)', () => {
      expect(interpolateCounts('{ProductsWord} logiciels.', count)).toBe(
        'Huit logiciels.',
      );
    });

    it('laisse intact un texte sans token', () => {
      expect(interpolateCounts('Aucun token ici.', count)).toBe(
        'Aucun token ici.',
      );
    });
  });

  describe('toProductCount', () => {
    it('dérive le mot depuis le nombre', () => {
      expect(toProductCount(8)).toEqual({ count: 8, word: 'huit' });
    });
  });
});
