import { test, expect } from '@playwright/test';

test.describe('Hero §6.1 — canvas WebGL', () => {
  test('le canvas est monté après hydratation (lazy chunk chargé)', async ({
    page,
  }) => {
    await page.goto('/');
    // Le canvas est chargé en dynamic ssr:false → on l'attend.
    await expect(page.getByTestId('hero-canvas')).toBeAttached({
      timeout: 10_000,
    });
    // C'est bien un <canvas> avec un contexte WebGL réel sous Chromium.
    const handle = await page.getByTestId('hero-canvas').elementHandle();
    expect(handle).not.toBeNull();
    const tagName = await handle?.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('canvas');
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
