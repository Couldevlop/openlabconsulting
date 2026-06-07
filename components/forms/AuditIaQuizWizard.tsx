'use client';

import { useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { ArrowLeft, Check, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { Turnstile } from '@/components/atoms/Turnstile';
import { cn } from '@/lib/cn';
import {
  QUESTIONS,
  getRecommendation,
  summarizeAnswers,
  type QuizAnswers,
} from '@/lib/audit-ia/quiz';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string; fields?: Record<string, string> };

/**
 * Questionnaire interactif `/audit-ia` — chantier audit P2 §7 item #14.
 *
 * Wizard 7 étapes :
 *   - 5 questions (maturité, secteur, headcount, périmètre, urgence)
 *   - 1 écran « recommandation » contextuelle
 *   - 1 écran « coordonnées » qui soumet à /api/audit-ia
 *
 * Le quiz pré-remplit le champ `goal` du formulaire serveur avec un
 * résumé textuel, pour que le consultant senior ait tout le contexte
 * sans re-poser les questions au call.
 */
export function AuditIaQuizWizard(): ReactElement {
  const [step, setStep] = useState(0); // 0..4 = questions, 5 = reco, 6 = form
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const totalQuestionSteps = QUESTIONS.length;
  const isQuestionStep = step < totalQuestionSteps;
  const isRecoStep = step === totalQuestionSteps;
  const isFormStep = step === totalQuestionSteps + 1;

  const progress = Math.min(
    100,
    Math.round(((step + 1) / (totalQuestionSteps + 2)) * 100),
  );

  const recommendation = useMemo(
    () => (step >= totalQuestionSteps ? getRecommendation(answers) : null),
    [step, answers, totalQuestionSteps],
  );

  function selectAnswer<V extends string>(
    questionId: keyof QuizAnswers,
    value: V,
  ): void {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setStep((s) => s + 1);
  }

  function goBack(): void {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!recommendation) return;
    const form = e.currentTarget;
    setStatus({ kind: 'submitting' });

    try {
      const formData = new FormData(form);
      // Champs auto-injectés depuis le quiz pour valider auditIaSchema serveur.
      formData.set('maturity', answers.maturity ?? '');
      formData.set('headcount', answers.headcount ?? '');
      formData.set('goal', summarizeAnswers(answers, recommendation));

      const res = await fetch('/api/audit-ia', {
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
          message:
            data.message ??
            'Demande reçue. Votre rapport personnalisé est prêt sous 48 h ouvrées.',
        });
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
    <Card
      className="border-[var(--color-ol-mist)] bg-white p-6 sm:p-10"
      data-testid="audit-ia-quiz"
    >
      {/* Barre de progression */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs tracking-widest text-[var(--color-ol-graphite)]/55 uppercase">
          <span>Audit IA interactif</span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-[var(--color-ol-mist)]"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-[var(--color-ol-orange)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Étape question (0..4) */}
      {isQuestionStep ? (
        <QuestionStep
          question={QUESTIONS[step]!}
          selected={answers[QUESTIONS[step]!.id]}
          onSelect={(value) => selectAnswer(QUESTIONS[step]!.id, value)}
          onBack={step > 0 ? goBack : undefined}
        />
      ) : null}

      {/* Étape recommandation (5) */}
      {isRecoStep && recommendation ? (
        <RecommendationStep
          recommendation={recommendation}
          onContinue={() => setStep((s) => s + 1)}
          onBack={goBack}
        />
      ) : null}

      {/* Étape formulaire final (6) */}
      {isFormStep && recommendation ? (
        <ContactFormStep
          status={status}
          fieldError={fieldError}
          onBack={goBack}
          onSubmit={handleSubmit}
        />
      ) : null}
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Sous-composants internes
// ────────────────────────────────────────────────────────────

function QuestionStep<V extends string>({
  question,
  selected,
  onSelect,
  onBack,
}: {
  readonly question: (typeof QUESTIONS)[number];
  readonly selected: string | undefined;
  readonly onSelect: (value: V) => void;
  readonly onBack?: () => void;
}): ReactElement {
  return (
    <div>
      <Eyebrow tone="orange">{question.eyebrow}</Eyebrow>
      <Heading level={2} visualLevel={3} className="mt-4">
        {question.question}
      </Heading>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const isActive = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value as V)}
              aria-pressed={isActive}
              className={cn(
                'group flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2',
                isActive
                  ? 'border-[var(--color-ol-orange)] bg-[var(--color-ol-orange)]/10'
                  : 'border-[var(--color-ol-mist)] bg-white hover:border-[var(--color-ol-orange)]/40 hover:bg-[var(--color-ol-ivory)]',
              )}
            >
              <span className="text-base font-medium text-[var(--color-ol-night)]">
                {option.label}
              </span>
              <span className="text-sm text-[var(--color-ol-graphite)]/70">
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>

      {onBack ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-graphite)]/70 hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          >
            <ArrowLeft width={14} height={14} aria-hidden />
            Question précédente
          </button>
        </div>
      ) : null}
    </div>
  );
}

function RecommendationStep({
  recommendation,
  onContinue,
  onBack,
}: {
  readonly recommendation: ReturnType<typeof getRecommendation>;
  readonly onContinue: () => void;
  readonly onBack: () => void;
}): ReactElement {
  return (
    <div data-testid="audit-ia-recommendation">
      <Eyebrow tone="orange">Notre recommandation pour vous</Eyebrow>
      <Heading level={2} visualLevel={2} className="mt-4">
        {recommendation.title}
      </Heading>
      <p className="mt-3 font-[family-name:var(--font-editorial)] text-xl text-[var(--color-ol-orange)] italic">
        {recommendation.subtitle}
      </p>

      <div className="mt-6 space-y-4 text-[var(--color-ol-graphite)]">
        {recommendation.body.map((paragraph, i) => (
          <p key={i} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <dl className="mt-8 grid gap-4 border-t border-[var(--color-ol-mist)] pt-6 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] tracking-widest text-[var(--color-ol-graphite)]/55 uppercase">
            Durée
          </dt>
          <dd className="mt-1 text-sm font-medium text-[var(--color-ol-night)]">
            {recommendation.duration}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-widest text-[var(--color-ol-graphite)]/55 uppercase">
            Livrable
          </dt>
          <dd className="mt-1 text-sm font-medium text-[var(--color-ol-night)]">
            {recommendation.deliverable}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onContinue}
          data-testid="audit-ia-continue-to-form"
        >
          <Sparkles width={20} height={20} aria-hidden />
          Demander cet audit
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-graphite)]/70 hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        >
          <ArrowLeft width={14} height={14} aria-hidden />
          Modifier mes réponses
        </button>
      </div>
    </div>
  );
}

function ContactFormStep({
  status,
  fieldError,
  onBack,
  onSubmit,
}: {
  readonly status: Status;
  readonly fieldError: (name: string) => string | undefined;
  readonly onBack: () => void;
  readonly onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}): ReactElement {
  if (status.kind === 'success') {
    return (
      <div className="py-6 text-center" data-testid="audit-ia-success">
        <div
          aria-hidden
          className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-ol-success)]/15 text-[var(--color-ol-success)]"
        >
          <Check width={28} height={28} />
        </div>
        <Heading level={2} visualLevel={3} className="mt-6">
          Demande reçue.
        </Heading>
        <p className="mx-auto mt-3 max-w-md text-[var(--color-ol-graphite)]/80">
          {status.message}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Coordonnées audit IA"
      noValidate
      data-testid="audit-ia-form"
    >
      <Eyebrow tone="orange">Vos coordonnées</Eyebrow>
      <Heading level={2} visualLevel={3} className="mt-4">
        Dernière étape — comment vous joindre ?
      </Heading>
      <p className="mt-3 text-sm text-[var(--color-ol-graphite)]/70">
        Vos réponses au questionnaire sont déjà transmises à votre consultant
        senior. Plus de questions répétées au call.
      </p>

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

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
            Email professionnel
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

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--color-ol-night)]">
            Organisation
          </span>
          <input
            name="organization"
            type="text"
            required
            autoComplete="organization"
            aria-invalid={fieldError('organization') ? true : undefined}
            className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          />
          {fieldError('organization') ? (
            <span className="text-xs text-[var(--color-ol-danger)]">
              {fieldError('organization')}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--color-ol-night)]">
            Fonction
          </span>
          <input
            name="jobTitle"
            type="text"
            required
            autoComplete="organization-title"
            aria-invalid={fieldError('jobTitle') ? true : undefined}
            className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
          />
          {fieldError('jobTitle') ? (
            <span className="text-xs text-[var(--color-ol-danger)]">
              {fieldError('jobTitle')}
            </span>
          ) : null}
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm text-[var(--color-ol-graphite)]/80">
        <input
          name="consentRgpd"
          type="checkbox"
          required
          value="on"
          aria-invalid={fieldError('consentRgpd') ? true : undefined}
          className="mt-0.5 h-4 w-4 rounded border-[var(--color-ol-mist)] text-[var(--color-ol-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        />
        <span>
          J&apos;accepte que mes coordonnées soient utilisées pour me
          transmettre le rapport d&apos;audit IA. Vos données restent en
          interne. RGPD UE + loi ivoirienne 2013-450.
        </span>
      </label>

      <div className="mt-5">
        <Turnstile action="audit-ia" />
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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={status.kind === 'submitting'}
        >
          <Send width={18} height={18} aria-hidden />
          {status.kind === 'submitting'
            ? 'Envoi…'
            : 'Recevoir mon audit personnalisé'}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-graphite)]/70 hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        >
          <ArrowLeft width={14} height={14} aria-hidden />
          Revoir la recommandation
        </button>
      </div>
    </form>
  );
}
