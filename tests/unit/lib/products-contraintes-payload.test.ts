import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '@/lib/data/products';

/**
 * Les fiches de repli doivent tenir dans le schéma Payload.
 *
 * `collections/Products.ts` impose des `maxLength` et des `minRows`/`maxRows`
 * que ni TypeScript ni le rendu ne vérifient : une chaîne trop longue passe la
 * compilation, passe les tests, s'affiche correctement sur le site — et fait
 * échouer le seed en production avec un 400 dont le détail est masqué.
 *
 * C'est arrivé le 2026-08-09 : le corps de la première fonctionnalité de
 * MaturIA faisait 373 caractères pour une limite de 320. Découvert en
 * poussant en base, alors que la CI était verte.
 *
 * Ce test rejoue les contraintes de la collection. Il doit être mis à jour
 * quand le schéma change — c'est le prix d'une duplication assumée, et il est
 * moins cher qu'un seed qui casse à l'exécution.
 */
const LONGUEURS = {
  name: 80,
  tagline: 160,
  target: 120,
  statusLabel: 40,
  eyebrow: 80,
  intro: 600,
  problem: 600,
} as const;

const BORNES_TABLEAUX = {
  features: { min: 4, max: 6 },
  stack: { min: 3, max: 8 },
  proofs: { min: 2, max: 4 },
  faq: { min: 0, max: 10 },
} as const;

describe('lib/data/products — contraintes du schéma Payload', () => {
  it.each(PRODUCTS.map((p) => [p.slug, p] as const))(
    '%s respecte les longueurs de champs',
    (_slug, produit) => {
      for (const [champ, max] of Object.entries(LONGUEURS)) {
        const valeur = produit[champ as keyof typeof LONGUEURS];
        expect(
          valeur.length,
          `${champ} : ${valeur.length} caractères pour un maximum de ${max}`,
        ).toBeLessThanOrEqual(max);
      }
    },
  );

  it.each(PRODUCTS.map((p) => [p.slug, p] as const))(
    '%s respecte le nombre de lignes des tableaux',
    (_slug, produit) => {
      for (const [champ, bornes] of Object.entries(BORNES_TABLEAUX)) {
        const lignes = produit[champ as keyof typeof BORNES_TABLEAUX];
        expect(
          lignes.length,
          `${champ} : ${lignes.length} entrées`,
        ).toBeGreaterThanOrEqual(bornes.min);
        expect(
          lignes.length,
          `${champ} : ${lignes.length} entrées`,
        ).toBeLessThanOrEqual(bornes.max);
      }
    },
  );

  it.each(PRODUCTS.map((p) => [p.slug, p] as const))(
    '%s respecte les longueurs internes aux tableaux',
    (_slug, produit) => {
      for (const f of produit.features) {
        expect(
          f.title.length,
          `feature « ${f.title} » : titre`,
        ).toBeLessThanOrEqual(80);
        expect(
          f.body.length,
          `feature « ${f.title} » : corps`,
        ).toBeLessThanOrEqual(320);
      }
      for (const s of produit.stack) {
        expect(s.length, `stack « ${s} »`).toBeLessThanOrEqual(120);
      }
      for (const p of produit.proofs) {
        expect(
          p.value.length,
          `preuve « ${p.value} » : valeur`,
        ).toBeLessThanOrEqual(16);
        expect(
          p.label.length,
          `preuve « ${p.value} » : libellé`,
        ).toBeLessThanOrEqual(80);
        expect(
          p.source.length,
          `preuve « ${p.value} » : source`,
        ).toBeLessThanOrEqual(160);
      }
      expect(
        produit.pricing.headline.length,
        'pricing.headline',
      ).toBeLessThanOrEqual(120);
      expect(
        produit.pricing.details.length,
        'pricing.details',
      ).toBeLessThanOrEqual(8);
      for (const d of produit.pricing.details) {
        expect(d.length, `pricing.details « ${d} »`).toBeLessThanOrEqual(160);
      }
      if (produit.pricing.note) {
        expect(produit.pricing.note.length, 'pricing.note').toBeLessThanOrEqual(
          200,
        );
      }
      for (const q of produit.faq) {
        expect(q.question.length, `faq « ${q.question} »`).toBeLessThanOrEqual(
          200,
        );
      }
    },
  );
});
