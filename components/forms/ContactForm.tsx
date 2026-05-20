'use client';

import { useState, type FormEvent, type ReactElement } from 'react';
import { Button } from '@/components/atoms/Button';
import { Heading } from '@/components/atoms/Heading';
import { Turnstile } from '@/components/atoms/Turnstile';
import { SITE } from '@/lib/seo/site';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string; fields?: Record<string, string> };

/**
 * ContactForm — formulaire contact §10.
 *
 * Soumission AJAX vers `/api/contact`. Affiche state submitting,
 * succès ou erreur sans rechargement. Inclut Turnstile + honeypot.
 *
 * Le honeypot `<input name="website">` est `position:absolute; left:-9999px`
 * → invisible humain, rempli par bots → Zod renvoie 400.
 */
export function ContactForm(): ReactElement {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: 'submitting' });

    try {
      const formData = new FormData(form);
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
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
          message: data.message ?? 'Message reçu, réponse sous 24 h ouvrées.',
        });
        form.reset();
        return;
      }

      if (res.status === 429) {
        setStatus({
          kind: 'error',
          message: `Trop de soumissions. Réessayez dans ${data.retryAfter ?? 60} secondes.`,
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

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Formulaire de contact"
      noValidate
      className="rounded-lg border border-[var(--color-ol-mist)] bg-white p-8 shadow-sm"
    >
      <Heading level={2} visualLevel={3}>
        Écrire à l’équipe.
      </Heading>
      <p className="mt-2 text-sm text-[var(--color-ol-graphite)]/65">
        Réponse sous 24 h ouvrées. Vous pouvez aussi écrire directement à{' '}
        <a
          href={`mailto:${SITE.contact.email}`}
          className="font-medium text-[var(--color-ol-orange)] underline-offset-2 hover:underline"
        >
          {SITE.contact.email}
        </a>
        .
      </p>

      {/* Honeypot : invisible humain, rempli par bots → rejeté par Zod. */}
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--color-ol-night)]">
            Nom complet
          </span>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-invalid={fieldError('name') ? true : undefined}
            className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          />
          {fieldError('name') ? (
            <span className="text-xs text-[var(--color-ol-danger)]">
              {fieldError('name')}
            </span>
          ) : null}
        </label>
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
            className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          />
          {fieldError('email') ? (
            <span className="text-xs text-[var(--color-ol-danger)]">
              {fieldError('email')}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-[var(--color-ol-night)]">
            Organisation
          </span>
          <input
            name="organization"
            type="text"
            autoComplete="organization"
            className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-[var(--color-ol-night)]">
            Sujet
          </span>
          <select
            name="subject"
            defaultValue=""
            required
            className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <option value="" disabled>
              Choisir un sujet…
            </option>
            <option value="audit-ia">Audit IA gratuit</option>
            <option value="demo-produit">Démo produit</option>
            <option value="conference">Conférence / intervention</option>
            <option value="partenariat">Partenariat universitaire</option>
            <option value="presse">Presse</option>
            <option value="autre">Autre</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-[var(--color-ol-night)]">
            Message
          </span>
          <textarea
            name="message"
            required
            rows={5}
            minLength={20}
            aria-invalid={fieldError('message') ? true : undefined}
            className="resize-y rounded-md border border-[var(--color-ol-mist)] bg-white px-4 py-3 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          />
          {fieldError('message') ? (
            <span className="text-xs text-[var(--color-ol-danger)]">
              {fieldError('message')}
            </span>
          ) : null}
        </label>
      </div>

      <div className="mt-6">
        <Turnstile action="contact" />
      </div>

      {/* Feedback en bas du form, accessible AT. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="mt-4 min-h-6 text-sm"
      >
        {status.kind === 'success' ? (
          <p className="rounded-md border border-[var(--color-ol-success)]/40 bg-[var(--color-ol-success)]/10 px-3 py-2 text-[var(--color-ol-success)]">
            {status.message}
          </p>
        ) : null}
        {status.kind === 'error' ? (
          <p className="rounded-md border border-[var(--color-ol-danger)]/40 bg-[var(--color-ol-danger)]/10 px-3 py-2 text-[var(--color-ol-danger)]">
            {status.message}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--color-ol-graphite)]/55">
          Vos données restent en interne chez OpenLab. RGPD UE + loi ivoirienne
          2013-450.
        </p>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={status.kind === 'submitting'}
        >
          {status.kind === 'submitting' ? 'Envoi…' : 'Envoyer le message'}
        </Button>
      </div>
    </form>
  );
}
