'use client';

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { Button } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';
import { Heading } from '@/components/atoms/Heading';

/**
 * Page de garde 2FA admin (`/admin-2fa`).
 *
 * Cible des redirections du middleware quand un admin authentifié n'a pas de
 * session 2FA valide (cf. middleware.ts, flag `ENFORCE_ADMIN_2FA`). Hors de
 * `/admin` pour éviter toute boucle de redirection.
 *
 * Deux modes auto-détectés via `GET /api/admin/2fa/setup` :
 *   - 200 → TOTP pas encore configuré → mode SETUP (QR + 1er code) ;
 *   - 409 → TOTP déjà activé → mode CHALLENGE (saisie du code) ;
 *   - 401 → pas connecté → invite à se connecter sur /admin.
 */

type Mode = 'loading' | 'unauth' | 'setup' | 'challenge';

interface SetupData {
  secret: string;
  qrCodeDataUrl: string;
}

export default function Admin2faPage(): ReactElement {
  const [mode, setMode] = useState<Mode>('loading');
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch('/api/admin/2fa/setup', { cache: 'no-store' });
        if (!active) return;
        if (res.status === 401) return setMode('unauth');
        if (res.status === 409) return setMode('challenge');
        if (res.ok) {
          const data = (await res.json()) as SetupData;
          setSetup(data);
          return setMode('setup');
        }
        setMode('challenge');
      } catch {
        if (active) setMode('challenge');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function submit(): Promise<void> {
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError('Entrez le code à 6 chiffres de votre application.');
      return;
    }
    setBusy(true);
    try {
      // En mode setup : activer d'abord le TOTP (persiste le secret).
      if (mode === 'setup' && setup) {
        const r = await fetch('/api/admin/2fa/setup', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ code, secret: setup.secret }),
        });
        if (!r.ok) {
          setError('Code invalide. Réessayez.');
          setBusy(false);
          return;
        }
      }
      // Dans tous les cas : valider le code pour ouvrir la session 2FA.
      const v = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!v.ok) {
        setError('Code invalide ou expiré. Réessayez.');
        setBusy(false);
        return;
      }
      window.location.assign('/admin');
    } catch {
      setError('Erreur réseau. Réessayez.');
      setBusy(false);
    }
  }

  return (
    <main
      id="main"
      className="flex min-h-[70vh] items-center bg-[var(--color-ol-night)] py-20"
    >
      <Container width="narrow">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-xl sm:p-10">
          <Heading level={1} visualLevel={3}>
            Vérification en deux étapes
          </Heading>

          {mode === 'loading' ? (
            <p className="mt-4 text-[var(--color-ol-graphite)]/75">
              Chargement…
            </p>
          ) : null}

          {mode === 'unauth' ? (
            <div className="mt-4 space-y-4">
              <p className="text-[var(--color-ol-graphite)]/80">
                Connectez-vous d’abord au back-office, puis revenez valider
                votre code 2FA.
              </p>
              <Button as="a" href="/admin" variant="primary">
                Aller à la connexion
              </Button>
            </div>
          ) : null}

          {mode === 'setup' && setup ? (
            <div className="mt-4 space-y-4">
              <p className="text-[var(--color-ol-graphite)]/80">
                Scannez ce QR-code avec Google Authenticator, Authy ou Aegis,
                puis saisissez le code généré pour activer la 2FA.
              </p>
              {/* QR en data URL — <img> simple (pas d'optimisation next/image). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setup.qrCodeDataUrl}
                alt="QR-code de configuration TOTP"
                width={200}
                height={200}
                className="mx-auto rounded-lg border border-[var(--color-ol-mist)]"
              />
              <p className="text-center font-mono text-xs break-all text-[var(--color-ol-graphite)]/60">
                {setup.secret}
              </p>
            </div>
          ) : null}

          {mode === 'challenge' ? (
            <p className="mt-4 text-[var(--color-ol-graphite)]/80">
              Saisissez le code à 6 chiffres de votre application
              d’authentification.
            </p>
          ) : null}

          {mode === 'setup' || mode === 'challenge' ? (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                aria-label="Code à 6 chiffres"
                placeholder="123456"
                className="w-full rounded-lg border border-[var(--color-ol-mist)] px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:ring-2 focus:ring-[var(--color-ol-orange)]/40 focus:outline-none"
              />
              {error ? (
                <p
                  role="alert"
                  className="text-sm text-[var(--color-ol-danger)]"
                >
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={busy}
                className="w-full"
              >
                {busy ? 'Vérification…' : 'Valider'}
              </Button>
            </form>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
