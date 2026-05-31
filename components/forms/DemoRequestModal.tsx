'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Turnstile } from '@/components/atoms/Turnstile';
import { SITE } from '@/lib/seo/site';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string; fields?: Record<string, string> };

interface DemoRequestModalProps {
  productSlug: string;
  productName: string;
  /** Libellé du bouton déclencheur. */
  triggerLabel?: string;
  /** Variante visuelle du bouton déclencheur (défaut: primary). */
  triggerVariant?: 'primary' | 'secondary' | 'ghost';
  /** Taille du bouton déclencheur (défaut: lg). */
  triggerSize?: 'sm' | 'md' | 'lg';
}

/**
 * DemoRequestModal — modale « Demander une démo » des pages produit (§7).
 *
 * Lead chaud, friction minimale : nom, email pro, organisation, téléphone
 * (optionnel), message (optionnel). Le produit est porté par des champs
 * cachés et REVALIDÉ côté serveur (/api/demo, A04) — le client ne décide
 * pas du libellé persisté.
 *
 * Accessibilité (WCAG 2.2 AA §4.7) :
 *   - `role="dialog"` + `aria-modal` + `aria-labelledby`.
 *   - Focus déplacé sur le 1er champ à l'ouverture, restauré au close.
 *   - Focus trappé dans la modale (Tab/Shift+Tab cyclent).
 *   - Échap ferme, clic sur l'overlay ferme, `body` scroll-locké.
 *
 * OWASP :
 *   - A01/A03 : soumission AJAX vers /api/demo (Zod strict + Turnstile +
 *     honeypot `website`). Aucune donnée sensible côté client.
 *   - A04 : productSlug en champ caché, format contraint serveur, produit
 *     revérifié en base avant persistance.
 */
export function DemoRequestModal({
  productSlug,
  productName,
  triggerLabel = 'Demander une démo',
  triggerVariant = 'primary',
  triggerSize = 'lg',
}: DemoRequestModalProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setStatus({ kind: 'idle' });
  }, []);

  // Échap global + scroll lock + focus management (mirror CommandPalette).
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => firstFieldRef.current?.focus(), 0);

    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        close();
        return;
      }
      // Focus trap : maintient le focus dans la modale.
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(timer);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus();
    };
  }, [open, close]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: 'submitting' });

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        body: new FormData(form),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
        fields?: Record<string, string>;
        retryAfter?: number;
      };

      if (res.status === 202 && data.ok) {
        setStatus({
          kind: 'success',
          message:
            data.message ?? 'Demande reçue. Un consultant vous recontacte.',
        });
        form.reset();
        return;
      }
      if (res.status === 429) {
        setStatus({
          kind: 'error',
          message: `Trop de demandes. Réessayez dans ${data.retryAfter ?? 60} secondes.`,
        });
        return;
      }
      if (res.status === 400) {
        setStatus({
          kind: 'error',
          message:
            data.error === 'captcha_failed'
              ? 'Vérification anti-bot échouée. Rechargez la page et réessayez.'
              : 'Vérifiez les champs en rouge ci-dessous.',
          fields: data.fields,
        });
        return;
      }
      setStatus({
        kind: 'error',
        message: 'Erreur inattendue. Réessayez dans quelques minutes.',
      });
    } catch {
      setStatus({
        kind: 'error',
        message: 'Connexion impossible. Vérifiez votre réseau.',
      });
    }
  }

  const fieldError = (name: string): string | undefined =>
    status.kind === 'error' ? status.fields?.[name] : undefined;

  const inputClass =
    'min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2';

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => setOpen(true)}
        data-testid="demo-modal-trigger"
        aria-haspopup="dialog"
      >
        {triggerLabel}
        <ArrowUpRight
          width={triggerSize === 'lg' ? 20 : 16}
          height={triggerSize === 'lg' ? 20 : 16}
          aria-hidden
        />
      </Button>

      {open ? (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[var(--color-ol-night)]/65 p-4 backdrop-blur-sm sm:p-8"
          data-testid="demo-modal-overlay"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="mt-[6vh] mb-8 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-ol-mist)] bg-white shadow-[0_24px_60px_-12px_rgba(10,14,26,0.45)]"
          >
            {/* En-tête signature OpenLab (night + accent orange) */}
            <div className="relative bg-[var(--color-ol-night)] px-6 py-7 sm:px-8">
              <span className="text-xs font-semibold tracking-widest text-[var(--color-ol-orange)] uppercase">
                Démo produit
              </span>
              <h2
                id={titleId}
                className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white"
              >
                Découvrez {productName}
              </h2>
              <p id={descId} className="mt-2 text-sm text-white/70">
                Laissez vos coordonnées : un consultant vous recontacte sous
                24&nbsp;h ouvrées pour une démonstration adaptée à votre
                contexte.
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Fermer la fenêtre"
                className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)]"
              >
                <X width={18} height={18} aria-hidden />
              </button>
            </div>

            {status.kind === 'success' ? (
              <div className="px-6 py-10 text-center sm:px-8" role="status">
                <span
                  aria-hidden
                  className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-ol-success)]/15 text-[var(--color-ol-success)]"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="m4 12 5 5 11-11"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="mt-4 text-lg font-medium text-[var(--color-ol-night)]">
                  Demande envoyée.
                </p>
                <p className="mt-2 text-sm text-[var(--color-ol-graphite)]/75">
                  {status.message}
                </p>
                <div className="mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={close}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                aria-label={`Demander une démo de ${productName}`}
                className="px-6 py-6 sm:px-8"
              >
                {/* Champs cachés : produit (revalidé serveur) */}
                <input type="hidden" name="productSlug" value={productSlug} />
                <input type="hidden" name="productName" value={productName} />

                {/* Honeypot anti-bot : invisible humain, rempli par bots. */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <label>
                    Site web (laissez vide)
                    <input
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </label>
                </div>

                <div className="grid gap-4">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-[var(--color-ol-night)]">
                      Nom complet
                    </span>
                    <input
                      ref={firstFieldRef}
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      aria-invalid={fieldError('name') ? true : undefined}
                      className={inputClass}
                    />
                    {fieldError('name') ? (
                      <span className="text-xs text-[var(--color-ol-danger)]">
                        {fieldError('name')}
                      </span>
                    ) : null}
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-[var(--color-ol-night)]">
                        Email pro
                      </span>
                      <input
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        aria-invalid={fieldError('email') ? true : undefined}
                        className={inputClass}
                      />
                      {fieldError('email') ? (
                        <span className="text-xs text-[var(--color-ol-danger)]">
                          {fieldError('email')}
                        </span>
                      ) : null}
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-[var(--color-ol-night)]">
                        Téléphone{' '}
                        <span className="font-normal text-[var(--color-ol-graphite)]/55">
                          (optionnel)
                        </span>
                      </span>
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        aria-invalid={fieldError('phone') ? true : undefined}
                        className={inputClass}
                      />
                      {fieldError('phone') ? (
                        <span className="text-xs text-[var(--color-ol-danger)]">
                          {fieldError('phone')}
                        </span>
                      ) : null}
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-[var(--color-ol-night)]">
                      Organisation
                    </span>
                    <input
                      name="organization"
                      type="text"
                      required
                      autoComplete="organization"
                      aria-invalid={
                        fieldError('organization') ? true : undefined
                      }
                      className={inputClass}
                    />
                    {fieldError('organization') ? (
                      <span className="text-xs text-[var(--color-ol-danger)]">
                        {fieldError('organization')}
                      </span>
                    ) : null}
                  </label>

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-[var(--color-ol-night)]">
                      Votre besoin{' '}
                      <span className="font-normal text-[var(--color-ol-graphite)]/55">
                        (optionnel)
                      </span>
                    </span>
                    <textarea
                      name="message"
                      rows={3}
                      maxLength={2000}
                      placeholder={`Ce que vous aimeriez voir sur ${productName}…`}
                      className="resize-y rounded-md border border-[var(--color-ol-mist)] bg-white px-4 py-3 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                    />
                  </label>
                </div>

                <div className="mt-5">
                  <Turnstile action="demo" />
                </div>

                <div
                  aria-live="polite"
                  aria-atomic="true"
                  className="mt-4 min-h-6 text-sm"
                >
                  {status.kind === 'error' ? (
                    <p className="rounded-md border border-[var(--color-ol-danger)]/40 bg-[var(--color-ol-danger)]/10 px-3 py-2 text-[var(--color-ol-danger)]">
                      {status.message}
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={status.kind === 'submitting'}
                    className="w-full"
                  >
                    {status.kind === 'submitting'
                      ? 'Envoi…'
                      : 'Envoyer la demande'}
                  </Button>
                  <p className="text-center text-xs text-[var(--color-ol-graphite)]/65">
                    Vos données restent en interne chez OpenLab. RGPD UE + loi
                    ivoirienne 2013-450. Ou écrivez à{' '}
                    <a
                      href={`mailto:${SITE.contact.salesEmail}`}
                      className="font-medium text-[var(--color-ol-orange-text)] underline-offset-2 hover:underline"
                    >
                      {SITE.contact.salesEmail}
                    </a>
                    .
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
