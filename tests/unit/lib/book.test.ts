import { describe, it, expect } from 'vitest';
import {
  BOOK,
  CHAPTERS,
  COMPANION_RESOURCES,
  PURCHASE_CHANNELS,
} from '@/lib/data/book';

describe('lib/data/book', () => {
  it('BOOK : titre, sous-titre, édition, capstone définis', () => {
    expect(BOOK.title).toBe('Intelligence Artificielle');
    expect(BOOK.subtitle).toBe('Du Machine Learning aux Agents Autonomes');
    expect(BOOK.edition).toMatch(/OpenLab Consulting/);
    expect(BOOK.edition).toMatch(/Abidjan/);
    expect(BOOK.capstone).toBe('AgroSense CI');
  });

  it('BOOK : aucune mention Expertise IA / Grasse (mémoire projet)', () => {
    const all = JSON.stringify(BOOK);
    expect(all).not.toMatch(/EXPERTISE-IA/i);
    expect(all).not.toMatch(/Expertise IA/i);
    expect(all).not.toMatch(/Grasse/i);
  });

  it('BOOK : 3 paragraphes de pitch long, chacun substantiel', () => {
    expect(BOOK.longPitch).toHaveLength(3);
    for (const p of BOOK.longPitch) {
      expect(p.length).toBeGreaterThan(80);
    }
  });

  it('BOOK : 4 publics ciblés avec description', () => {
    expect(BOOK.audiences).toHaveLength(4);
    for (const a of BOOK.audiences) {
      expect(a.label.length).toBeGreaterThan(3);
      expect(a.description.length).toBeGreaterThan(30);
    }
  });

  it('CHAPTERS : 11 chapitres ordonnés 01-11', () => {
    expect(CHAPTERS).toHaveLength(11);
    expect(CHAPTERS.map((c) => c.index)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
    ]);
  });

  it('CHAPTERS : chaque chapitre a title, summary, readingTime, keywords', () => {
    for (const c of CHAPTERS) {
      expect(c.title.length).toBeGreaterThan(5);
      expect(c.summary.length).toBeGreaterThan(30);
      expect(c.readingTime).toMatch(/min/);
      expect(c.keywords.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('CHAPTERS : au moins 1 chapitre a un capstone (chapitre 11)', () => {
    const capstones = CHAPTERS.filter((c) => c.hasCaseStudy);
    expect(capstones.length).toBeGreaterThanOrEqual(1);
    // Capstone explicite sur le chapitre 11
    expect(CHAPTERS[10]?.hasCaseStudy).toBe(true);
  });

  it('PURCHASE_CHANNELS : 4 canaux avec un seul "primary"', () => {
    expect(PURCHASE_CHANNELS).toHaveLength(4);
    expect(PURCHASE_CHANNELS.filter((c) => c.primary)).toHaveLength(1);
  });

  it('COMPANION_RESOURCES : 4 ressources, 1 par catégorie', () => {
    expect(COMPANION_RESOURCES).toHaveLength(4);
    const categories = COMPANION_RESOURCES.map((r) => r.category);
    expect(new Set(categories).size).toBe(4);
    expect(categories.sort()).toEqual(
      ['code', 'community', 'data', 'errata'].sort(),
    );
  });
});
