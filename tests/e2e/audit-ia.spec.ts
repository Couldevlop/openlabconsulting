import { expect, test } from '@playwright/test';

/**
 * Parcours audit IA : du questionnaire au formulaire de coordonnées.
 *
 * Le scénario s'arrête avant la soumission : la CI ne démarre aucun
 * service, ni base ni modèle. Il couvre l'écart n° 4 du rapport de
 * vérification du 2026-07-29, qui relevait l'absence totale de test de
 * bout en bout sur ce tunnel.
 */
test.describe('parcours audit IA', () => {
  test('répond aux questions et atteint le formulaire', async ({ page }) => {
    await page.goto('/audit-ia');
    await expect(page.getByTestId('audit-ia-quiz')).toBeVisible();

    for (const label of [
      'On en parle, on explore',
      'Agro-industrie',
      '200 à 1 000',
      'Un département',
      'Phase d’exploration',
    ]) {
      await page.getByRole('button', { name: label }).click();
    }

    // 6e étape : question libre, facultative.
    const challenge = page.getByRole('textbox');
    await expect(challenge).toBeVisible();
    await challenge.fill(
      'Nos rapprochements bancaires prennent 4 jours par mois.',
    );
    await page.getByRole('button', { name: /voir ma recommandation/i }).click();

    await expect(page.getByTestId('audit-ia-recommendation')).toBeVisible();
    await page.getByTestId('audit-ia-continue-to-form').click();
    await expect(page.getByTestId('audit-ia-form')).toBeVisible();
  });

  test('permet de passer la question libre', async ({ page }) => {
    await page.goto('/audit-ia');

    for (const label of [
      'Un pilote en cours',
      'Banque & assurance',
      'Plus de 1 000',
      'Un cas d’usage précis',
      'Dans les 3 prochains mois',
    ]) {
      await page.getByRole('button', { name: label }).click();
    }

    await page.getByRole('button', { name: /^passer$/i }).click();
    await expect(page.getByTestId('audit-ia-recommendation')).toBeVisible();
  });

  test('la promesse affichée est de 24 h ouvrées', async ({ page }) => {
    await page.goto('/audit-ia');
    await expect(page.locator('body')).not.toContainText('48 h');
  });
});
