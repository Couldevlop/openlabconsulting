import { test, expect } from '@playwright/test';

// Le canvas WebGL est purement décoratif (aria-hidden). En CI headless,
// seul Chromium dispose d'un WebGL logiciel (SwiftShader) ; WebKit headless
// n'a pas de contexte WebGL → R3F ne monte pas le <canvas>. On couvre donc
// le rendu du canvas sur Chromium uniquement (les tests non-canvas — titre
// accessible, etc. — restent exécutés sur tous les navigateurs).
const SKIP_WEBKIT_CANVAS =
  'Canvas WebGL non rendu en WebKit headless (CI) — décoratif, couvert par Chromium.';

test.describe('Hero §6.1 — canvas WebGL', () => {
  test('le canvas est monté après hydratation (lazy chunk chargé)', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', SKIP_WEBKIT_CANVAS);
    await page.goto('/');
    // Le canvas est chargé en dynamic ssr:false → on l'attend.
    await expect(page.getByTestId('hero-canvas')).toBeAttached({
      timeout: 15_000,
    });
    // R3F enveloppe le <canvas> WebGL dans un <div> conteneur qui porte le
    // testid + aria-hidden. On vérifie donc que ce conteneur contient bien un
    // élément <canvas> (robuste en CI headless, WebGL logiciel SwiftShader).
    await expect(
      page.getByTestId('hero-canvas').locator('canvas'),
    ).toBeAttached({ timeout: 15_000 });
  });

  test('le canvas est aria-hidden (purement décoratif)', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', SKIP_WEBKIT_CANVAS);
    await page.goto('/');
    const canvas = page.getByTestId('hero-canvas');
    await expect(canvas).toBeAttached();
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  test('le titre du Hero reste prioritaire et lisible par-dessus le canvas', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: /L’IA, au service/i }),
    ).toBeVisible();
  });
});
