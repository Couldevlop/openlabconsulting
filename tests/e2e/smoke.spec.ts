import { test, expect } from '@playwright/test';

test.describe('Smoke (P0)', () => {
  test('homepage répond et affiche le titre du scaffold', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: /Site OpenLab Consulting — scaffold initial/i,
      }),
    ).toBeVisible();
  });

  test('GET /api/health renvoie status ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('ok');
  });
});
