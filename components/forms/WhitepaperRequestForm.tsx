'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactElement } from 'react';
import { Download, Mail } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Turnstile } from '@/components/atoms/Turnstile';
import { WHITEPAPER_ORGANIZATION_OPTIONS } from '@/lib/validation';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; pdfUrl: string; redirectTo: string }
  | { kind: 'error'; message: string; fields?: Record<string, string> };

interface Props {
  /** Slug du livre blanc (whitelisté côté serveur via Zod). */
  slug: string;
  /** Nombre de pages estimé du PDF, affiché sous le bouton (0 = masqué). */
  pageCount?: number;
  /** Si `true`, montre la note « bientôt disponible » (statut draft). */
  draft?: boolean;
}

/**
 * Formulaire de capture email pour téléchargement d'un livre blanc.
 * Pattern identique à `ContactForm` — fetch JSON → /api/whitepapers/request,
 * Turnstile + honeypot, feedback aria-live.
 *
 * Sur succès : redirige vers `/livres-blancs/<slug>/merci` (le PDF y est
 * proposé en bouton de téléchargement). Pas de redirection automatique
 * en `<form action>` parce qu'on a besoin du fetch pour récupérer le
 * lien PDF signé renvoyé par l'API (préparation future MinIO).
 */
export function WhitepaperRequestForm({
  slug,
  pageCount = 0,
  draft = false,
}: Props): ReactElement {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: 'submitting' });

    try {
      const formData = new FormData(form);
      const res = await fetch('/api/whitepapers/request', {
        method: 'POST',
        body: formData,
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        pdfUrl?: string;
        redirectTo?: string;
        error?: string;
        fields?: Record<string, string>;
        retryAfter?: number;
      };

      if (res.status === 200 && data.ok && data.pdfUrl && data.redirectTo) {
        setStatus({
          kind: 'success',
          pdfUrl: data.pdfUrl,
          redirectTo: data.redirectTo,
        });
        router.push(data.redirectTo);
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
              : 'Vérifiez les champs ci-dessous.',
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

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Recevoir le livre blanc par e-mail"
      noValidate
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="slug" value={slug} />

      {/* Honeypot — invisible humain, rempli par bots → rejeté par Zod. */}
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
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[var(--color-ol-night)]">
          Email professionnel
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="prenom@votre-entreprise.com"
          aria-invalid={fieldError('email') ? true : undefined}
          className="min-h-12 rounded-md border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        />
        {fieldError('email') ? (
          <span className="text-xs text-[var(--color-ol-danger)]">
            {fieldError('email')}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[var(--color-ol-night)]">
          Nom{' '}
          <span className="text-[var(--color-ol-graphite)]/55">
            (optionnel)
          </span>
        </span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Prénom Nom"
          className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[var(--color-ol-night)]">
          Organisation
        </span>
        <select
          name="organization"
          required
          defaultValue=""
          aria-invalid={fieldError('organization') ? true : undefined}
          className="min-h-12 rounded-md border border-[var(--color-ol-mist)] bg-[var(--color-ol-ivory)] px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        >
          <option value="" disabled>
            Sélectionnez votre domaine…
          </option>
          {WHITEPAPER_ORGANIZATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {fieldError('organization') ? (
          <span className="text-xs text-[var(--color-ol-danger)]">
            {fieldError('organization')}
          </span>
        ) : null}
      </label>

      <label className="flex items-start gap-3 text-sm text-[var(--color-ol-graphite)]/80">
        <input
          name="consentRgpd"
          type="checkbox"
          required
          value="on"
          aria-invalid={fieldError('consentRgpd') ? true : undefined}
          className="mt-0.5 h-4 w-4 rounded border-[var(--color-ol-mist)] text-[var(--color-ol-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        />
        <span>
          J&apos;accepte que mon email soit utilisé pour me transmettre le livre
          blanc et les mises à jour OpenLab. Désabonnement en un clic. RGPD UE +
          loi ivoirienne 2013-450.
        </span>
      </label>
      {fieldError('consentRgpd') ? (
        <span className="text-xs text-[var(--color-ol-danger)]">
          {fieldError('consentRgpd')}
        </span>
      ) : null}

      <label className="flex items-start gap-3 text-sm text-[var(--color-ol-graphite)]/80">
        <input
          name="newsletter"
          type="checkbox"
          value="on"
          className="mt-0.5 h-4 w-4 rounded border-[var(--color-ol-mist)] text-[var(--color-ol-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        />
        <span>
          Je souhaite m&apos;abonner au fil d&apos;actualité OpenLab, sorties de
          livres, nouveaux articles, solutions, formations et webinaires.
          (Facultatif, désabonnement en un clic.)
        </span>
      </label>

      <Turnstile action="whitepaper" />

      <div aria-live="polite" aria-atomic="true" className="min-h-6 text-sm">
        {status.kind === 'error' ? (
          <p className="rounded-md border border-[var(--color-ol-danger)]/40 bg-[var(--color-ol-danger)]/10 px-3 py-2 text-[var(--color-ol-danger)]">
            {status.message}
          </p>
        ) : null}
        {status.kind === 'success' ? (
          <p className="rounded-md border border-[var(--color-ol-success)]/40 bg-[var(--color-ol-success)]/10 px-3 py-2 text-[var(--color-ol-success)]">
            Demande reçue, redirection…
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status.kind === 'submitting'}
      >
        <Mail width={20} height={20} aria-hidden />
        {status.kind === 'submitting'
          ? 'Envoi…'
          : draft
            ? 'Réserver le PDF dès la sortie'
            : 'Recevoir le livre blanc'}
      </Button>

      <p className="flex items-center gap-2 text-xs text-[var(--color-ol-graphite)]/55">
        <Download width={14} height={14} aria-hidden />
        {pageCount > 0
          ? `PDF · ~${pageCount} pages · français`
          : 'PDF · français'}
      </p>
    </form>
  );
}
