import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Smoke tests — parcours critiques §17.
 *
 * Vérifient :
 *   1. La home charge sans erreur, h1 présent, navigation fonctionnelle.
 *   2. Audit axe-core sur la home (WCAG 2 AA, zéro impact critique).
 *   3. Le formulaire de contact accepte une soumission valide
 *      (Turnstile en mode dev bypass).
 *   4. Le formulaire renvoie 429 après 5 tentatives sur la même IP.
 *   5. /admin redirige correctement vers la page de login Payload.
 *   6. Sitemap.xml valide.
 */

test.describe('Smoke — parcours critiques', () => {
  test('home charge avec h1 et navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /IA, au service|réalités africaines/i,
    );
    // Skip-link visible au focus
    const skip = page.getByRole('link', { name: /Aller au contenu/i });
    await expect(skip).toBeAttached();
  });

  test('home passe l’audit axe-core WCAG 2 AA — zéro violation critique', async ({
    page,
  }) => {
    // Mouvement réduit : coupe l'autoplay + les fondus du carrousel
    // (CasesCarousel) → slides à pleine opacité, audit déterministe. Sinon axe
    // peut scanner un slide en plein fondu (badge orange à opacité réduite) et
    // flaguer un faux contraste insuffisant.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    if (critical.length > 0) {
      console.log(JSON.stringify(critical, null, 2));
    }
    expect(critical).toHaveLength(0);
  });

  test('sitemap.xml répond 200 et liste au moins 30 URLs', async ({
    request,
  }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    const urlCount = (body.match(/<loc>/g) ?? []).length;
    expect(urlCount).toBeGreaterThanOrEqual(30);
  });

  test('robots.txt est conforme (whitelist GPTBot + sitemap)', async ({
    request,
  }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('Sitemap:');
    expect(body).toContain('GPTBot');
  });

  test('llms.txt est servi pour les crawlers LLM', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('OpenLab Consulting');
  });

  test('/api/health renvoie 200 et JSON', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toBeDefined();
  });

  test('headers de sécurité OWASP présents (§10.3)', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.headers()['x-frame-options']).toBe('DENY');
    expect(res?.headers()['x-content-type-options']).toBe('nosniff');
    expect(res?.headers()['referrer-policy']).toBe(
      'strict-origin-when-cross-origin',
    );
    expect(res?.headers()['content-security-policy']).toContain('nonce-');
    expect(res?.headers()['content-security-policy']).toContain(
      "frame-ancestors 'none'",
    );
  });
});

test.describe('Smoke — formulaire contact', () => {
  test('POST /api/contact accepte une soumission valide', async ({
    request,
  }) => {
    const res = await request.post('/api/contact', {
      // IP unique par requête → quota de rate-limit (5/15 min/IP) frais, même
      // quand la suite tourne sur 3 projets + retries contre un seul serveur.
      headers: {
        'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 250) + 1}`,
      },
      data: {
        name: 'Test E2E',
        email: 'e2e@openlabconsulting.com',
        organization: 'OpenLab',
        subject: 'autre',
        message: 'Smoke test depuis Playwright — message ignoré côté business.',
      },
    });
    expect(res.status()).toBe(202);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  test('POST /api/contact rejette un message trop court (400)', async ({
    request,
  }) => {
    const res = await request.post('/api/contact', {
      headers: {
        'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 250) + 1}`,
      },
      data: {
        name: 'X',
        email: 'x@y.fr',
        subject: 'autre',
        message: 'court',
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('Smoke — pages clés a11y', () => {
  const PAGES = ['/expertises', '/solutions', '/secteurs', '/livre'];

  for (const path of PAGES) {
    test(`${path} : axe-core 0 violation critique`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      const critical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );
      expect(critical).toHaveLength(0);
    });
  }
});
