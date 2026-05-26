import { test, expect, devices } from '@playwright/test';

/**
 * Fichier dédié aux tests responsive mobile.
 *
 * Pourquoi un fichier séparé : Playwright interdit `test.use({...devices[X]})`
 * à l'intérieur d'un `test.describe()` car `devices[X]` contient
 * `defaultBrowserType` qui force un nouveau worker (erreur
 * « Cannot use({ defaultBrowserType }) in a describe group »).
 *
 * Solution officielle : ce `test.use(...)` doit être au top-level du
 * fichier — donc on isole les tests mobiles ici.
 */
test.use({ ...devices['Pixel 7'] });

test.describe('Responsive navbar (mobile)', () => {
  test('menu hamburger ouvre la nav mobile', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /Ouvrir le menu/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(
      page.getByRole('button', { name: /Fermer le menu/i }),
    ).toBeVisible();
  });
});
