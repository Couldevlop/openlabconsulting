import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ArticleBody } from '@/components/insights/ArticleBody';
import type { ArticleContent } from '@/lib/articles';
import type { CodeRenderer } from '@/lib/insights/code-highlighter';

// `ArticleBody` est synchrone et reçoit le rendu de code par injection.
// On fournit un stub déterministe : l'échappement réel de Shiki est
// couvert par tests/unit/insights/code-highlighter.test.ts.
const renderCode: CodeRenderer = (code, language) =>
  `<pre class="shiki" data-lang="${language ?? 'text'}"><code>${code}</code></pre>`;

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

function paragraph(...children: Record<string, unknown>[]) {
  return {
    type: 'paragraph',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children,
  };
}

function cell(value: string): Record<string, unknown> {
  return {
    type: 'tablecell',
    headerState: 0,
    colSpan: 1,
    rowSpan: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [paragraph(text(value))],
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
      paragraph(
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
      ),
      {
        type: 'block',
        format: '',
        version: 2,
        fields: {
          blockType: 'Code',
          code: 'const x = 1;',
          language: 'ts',
        },
      },
      {
        type: 'block',
        format: '',
        version: 2,
        fields: {
          blockType: 'callout',
          variant: 'warning',
          title: 'À surveiller',
          content: 'Vérifiez la conformité avant publication.',
        },
      },
      {
        type: 'table',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'tablerow',
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
            children: [cell('Indicateur'), cell('Valeur')],
          },
        ],
      },
    ],
  },
} as unknown as ArticleContent;

describe('ArticleBody', () => {
  it('ajoute une ancre id slugifiée sur les titres H2', () => {
    const { container } = render(ArticleBody({ content, renderCode }));
    const h2 = container.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2?.id).toBe('le-cout-reel');
    expect(h2?.textContent).toBe('Le coût réel');
  });

  it('sécurise les liens externes (rel noopener + target _blank)', () => {
    const { container } = render(ArticleBody({ content, renderCode }));
    const links = Array.from(container.querySelectorAll('a'));
    const external = links.find((a) => a.textContent === 'lien externe');
    expect(external?.getAttribute('href')).toBe('https://example.com');
    expect(external?.getAttribute('target')).toBe('_blank');
    expect(external?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('neutralise les protocoles dangereux (javascript:) en #', () => {
    const { container } = render(ArticleBody({ content, renderCode }));
    const links = Array.from(container.querySelectorAll('a'));
    const danger = links.find((a) => a.textContent === 'lien dangereux');
    expect(danger?.getAttribute('href')).toBe('#');
  });

  it('applique la classe prose premium au conteneur', () => {
    const { container } = render(ArticleBody({ content, renderCode }));
    expect(container.querySelector('.article-prose')).not.toBeNull();
  });

  it('rend un bloc de code colorisé avec le badge langue', () => {
    const { container } = render(ArticleBody({ content, renderCode }));
    const code = container.querySelector('.article-code');
    expect(code).not.toBeNull();
    expect(code?.getAttribute('data-language')).toBe('ts');
    expect(code?.querySelector('pre.shiki')).not.toBeNull();
    expect(code?.textContent).toContain('const x = 1;');
  });

  it('rend un encadré (callout) avec sa variante et son titre', () => {
    const { container } = render(ArticleBody({ content, renderCode }));
    const callout = container.querySelector('.article-callout');
    expect(callout).not.toBeNull();
    expect(callout?.classList.contains('article-callout--warning')).toBe(true);
    expect(callout?.getAttribute('role')).toBe('note');
    expect(callout?.querySelector('.article-callout__title')?.textContent).toBe(
      'À surveiller',
    );
    expect(callout?.textContent).toContain('Vérifiez la conformité');
  });

  it('rend un tableau avec ses cellules', () => {
    const { container } = render(ArticleBody({ content, renderCode }));
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(table?.textContent).toContain('Indicateur');
    expect(table?.textContent).toContain('Valeur');
  });
});
