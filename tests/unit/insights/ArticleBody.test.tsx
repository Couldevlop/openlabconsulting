import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ArticleBody } from '@/components/insights/ArticleBody';
import type { ArticleContent } from '@/lib/articles';

function text(value: string): Record<string, unknown> {
  return {
    type: 'text',
    text: value,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    version: 1,
  };
}

const content = {
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'heading',
        tag: 'h2',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [text('Le coût réel')],
      },
      {
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          text('Un paragraphe avec un '),
          {
            type: 'link',
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
            fields: {
              linkType: 'custom',
              url: 'https://example.com',
              newTab: true,
            },
            children: [text('lien externe')],
          },
          {
            type: 'link',
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
            fields: {
              linkType: 'custom',
              url: 'javascript:alert(1)',
              newTab: false,
            },
            children: [text('lien dangereux')],
          },
        ],
      },
    ],
  },
} as unknown as ArticleContent;

describe('ArticleBody', () => {
  it('ajoute une ancre id slugifiée sur les titres H2', () => {
    const { container } = render(<ArticleBody content={content} />);
    const h2 = container.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2?.id).toBe('le-cout-reel');
    expect(h2?.textContent).toBe('Le coût réel');
  });

  it('sécurise les liens externes (rel noopener + target _blank)', () => {
    const { container } = render(<ArticleBody content={content} />);
    const links = Array.from(container.querySelectorAll('a'));
    const external = links.find((a) => a.textContent === 'lien externe');
    expect(external?.getAttribute('href')).toBe('https://example.com');
    expect(external?.getAttribute('target')).toBe('_blank');
    expect(external?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('neutralise les protocoles dangereux (javascript:) en #', () => {
    const { container } = render(<ArticleBody content={content} />);
    const links = Array.from(container.querySelectorAll('a'));
    const danger = links.find((a) => a.textContent === 'lien dangereux');
    expect(danger?.getAttribute('href')).toBe('#');
  });

  it('applique la classe prose premium au conteneur', () => {
    const { container } = render(<ArticleBody content={content} />);
    expect(container.querySelector('.article-prose')).not.toBeNull();
  });
});
