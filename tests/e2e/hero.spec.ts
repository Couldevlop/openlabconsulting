import { test, expect } from '@playwright/test';

test.describe('Hero §6.1 — canvas WebGL', () => {
  test('le canvas est monté après hydratation (lazy chunk chargé)', async ({
    page,
  }) => {
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

  test('le canvas est aria-hidden (purement décoratif)', async ({ page }) => {
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
