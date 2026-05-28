import { describe, it, expect } from 'vitest';
import {
  estimateReadingTime,
  lexicalNodeText,
  slugifyHeading,
  extractHeadings,
  type ArticleContent,
} from '@/lib/articles';

describe('estimateReadingTime', () => {
  it('renvoie 0 pour un texte vide', () => {
    expect(estimateReadingTime('')).toBe(0);
    expect(estimateReadingTime('   ')).toBe(0);
  });

  it('renvoie au minimum 1 min pour un texte court', () => {
    expect(estimateReadingTime('quelques mots seulement')).toBe(1);
  });

  it('arrondit ~200 mots/min', () => {
    const text = Array.from({ length: 400 }, () => 'mot').join(' ');
    expect(estimateReadingTime(text)).toBe(2);
  });
});

describe('slugifyHeading', () => {
  it('supprime les accents et met en tirets', () => {
    expect(slugifyHeading('Le coût réel, chiffré')).toBe(
      'le-cout-reel-chiffre',
    );
  });

  it('retire les tirets de début/fin et la ponctuation', () => {
    expect(slugifyHeading('  Hello!! World  ')).toBe('hello-world');
  });

  it('renvoie une chaîne vide pour une entrée sans alphanumérique', () => {
    expect(slugifyHeading('!!! ???')).toBe('');
  });
});

describe('lexicalNodeText', () => {
  it('extrait le texte d’un nœud feuille', () => {
    expect(lexicalNodeText({ text: 'bonjour' })).toBe('bonjour');
  });

  it('concatène récursivement les enfants', () => {
    expect(
      lexicalNodeText({
        children: [{ text: 'a' }, { children: [{ text: 'b' }] }, { text: 'c' }],
      }),
    ).toBe('abc');
  });

  it('renvoie une chaîne vide pour un nœud non textuel', () => {
    expect(lexicalNodeText(null)).toBe('');
    expect(lexicalNodeText(42)).toBe('');
    expect(lexicalNodeText({ type: 'horizontalrule' })).toBe('');
  });
});

function heading(tag: string, text: string): unknown {
  return { type: 'heading', tag, children: [{ text }] };
}

describe('extractHeadings', () => {
  it('renvoie [] quand le contenu est null', () => {
    expect(extractHeadings(null)).toEqual([]);
  });

  it('renvoie [] quand la racine n’a pas d’enfants', () => {
    expect(extractHeadings({ root: {} } as unknown as ArticleContent)).toEqual(
      [],
    );
  });

  it('extrait les H2/H3 avec id, texte et niveau ; ignore H4 et non-titres', () => {
    const content = {
      root: {
        children: [
          heading('h2', 'Premier titre'),
          { type: 'paragraph', children: [{ text: 'ignore' }] },
          heading('h3', 'Sous-titre'),
          heading('h4', 'Trop profond'),
          heading('h2', '   '), // vide → ignoré
        ],
      },
    } as unknown as ArticleContent;

    expect(extractHeadings(content)).toEqual([
      { id: 'premier-titre', text: 'Premier titre', level: 2 },
      { id: 'sous-titre', text: 'Sous-titre', level: 3 },
    ]);
  });
});
