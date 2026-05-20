/**
 * Politique de mot de passe — CLAUDE.md §11.2.
 *
 * - 12 caractères minimum
 * - Au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
 * - Pas de mot du dictionnaire commun (top 100 mots de passe)
 *
 * On évite la dépendance lourde `zxcvbn` (~700 kB) en faisant nos
 * propres heuristiques : entropie de Shannon + blacklist. Pour
 * production durcie, brancher zxcvbn en P10+ via lazy import.
 */

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  'azerty',
  'azerty123',
  '123456',
  '12345678',
  '123456789',
  'qwerty',
  'qwerty123',
  'motdepasse',
  'admin',
  'administrator',
  'welcome',
  'letmein',
  'changeme',
  'iloveyou',
  'monkey',
  'dragon',
  'football',
  'baseball',
  'mustang',
  'master',
  'shadow',
  'starwars',
  'sunshine',
  'princess',
  'passw0rd',
  'p@ssw0rd',
  'openlab',
  'openlab2026',
]);

export interface PasswordValidation {
  ok: boolean;
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidation {
  const errors: string[] = [];

  if (typeof password !== 'string' || password.length < 12) {
    errors.push('Le mot de passe doit contenir au moins 12 caractères.');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre.');
  }
  // Caractères spéciaux ASCII imprimables hors lettres/chiffres.
  if (!/[!-/:-@[-`{-~]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial.');
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Ce mot de passe est trop commun et facilement devinable.');
  }

  // Entropie Shannon — heuristique anti-répétition.
  if (password.length >= 12 && shannonEntropy(password) < 2.5) {
    errors.push(
      'Le mot de passe est trop répétitif. Utilisez davantage de caractères distincts.',
    );
  }

  return { ok: errors.length === 0, errors };
}

function shannonEntropy(s: string): number {
  const freq = new Map<string, number>();
  for (const c of s) freq.set(c, (freq.get(c) ?? 0) + 1);
  const len = s.length;
  let h = 0;
  for (const count of freq.values()) {
    const p = count / len;
    h -= p * Math.log2(p);
  }
  return h;
}
