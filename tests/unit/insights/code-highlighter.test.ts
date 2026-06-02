import { describe, it, expect } from 'vitest';
import { createCodeRenderer } from '@/lib/insights/code-highlighter';

/**
 * Tests du highlighter Shiki (server-only, stubbé `server-only` en
 * Vitest). On exerce le vrai Shiki : init du singleton, mapping d'alias,
 * fallback de langue, et surtout l'échappement (OWASP A03 / XSS).
 *
 * La 1re init charge les grammaires → timeout généreux.
 */
describe('createCodeRenderer', () => {
  it('colorise du TypeScript (alias ts → typescript)', async () => {
    const render = await createCodeRenderer();
    const html = render('const x = 1;', 'ts');
    expect(html).toContain('shiki');
    expect(html).toContain('<pre');
    expect(html).toContain('const');
  }, 20_000);

  it('échappe le code source — aucune balise utilisateur exécutable (A03)', async () => {
    const render = await createCodeRenderer();
    const payload = '<script>alert(1)</script>';
    const html = render(payload, 'javascript');
    // Le chevron ouvrant du payload est encodé par Shiki (&#x3C; / &lt;),
    // jamais rendu comme une vraie balise <script>.
    expect(html.toLowerCase()).not.toContain('<script');
    // Preuve robuste (indépendante de l'encodage d'entité) : après
    // parsing, le HTML colorisé ne contient AUCUN élément <script>.
    const probe = document.createElement('div');
    probe.innerHTML = html;
    expect(probe.querySelector('script')).toBeNull();
    expect(probe.textContent).toContain('alert(1)');
  }, 20_000);

  it('retombe sur du texte brut pour une langue inconnue (sans throw)', async () => {
    const render = await createCodeRenderer();
    const html = render('quelconque', 'langage-inexistant');
    expect(html).toContain('<pre');
    expect(html).toContain('quelconque');
  }, 20_000);
});
