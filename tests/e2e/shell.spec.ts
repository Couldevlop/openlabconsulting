import { test, expect } from '@playwright/test';

test.describe('Shell applicatif (P1)', () => {
  test('homepage rend le Hero + skip-link', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /L’IA, au service/i,
      }),
    ).toBeVisible();
    await expect(page.getByTestId('hero')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByText(/Aller au contenu principal/i)).toBeFocused();
  });

  test('Navbar visible et CTA présent', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('navbar')).toBeVisible();
    const ctas = page.getByRole('link', { name: /Audit IA gratuit/i });
    await expect(ctas.first()).toBeVisible();
  });

  test('Footer visible avec coordonnées', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByTestId('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/Cocody, Abidjan/i)).toBeVisible();
  });

  test('headers de sécurité présents (CSP, X-Frame-Options)', async ({
    request,
  }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
    const headers = res.headers();
    expect(headers['content-security-policy']).toBeTruthy();
    expect(headers['content-security-policy']).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('GET /api/health renvoie 200 ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('ok');
  });
});
