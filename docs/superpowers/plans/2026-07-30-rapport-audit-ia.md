# Pipeline de rapport d'audit IA : plan d'implémentation

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE — utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`).

**Goal :** générer automatiquement un brouillon de rapport d'audit IA à partir du questionnaire `/audit-ia`, le faire valider par un consultant dans le back-office, puis livrer au prospect un PDF via un lien signé à durée limitée.

**Architecture :** trois unités pures et testables sans réseau (`skeleton`, `link`, `pdf`), un client HTTP isolé pour le modèle (`lucie`), une seule unité qui touche la base et le stockage (`store-server`), et une file de tâches Payload qui orchestre le tout hors du cycle de la requête HTTP. La route publique de téléchargement ne sert qu'un fichier, jamais une métadonnée.

**Tech Stack :** Next.js 15 (App Router) · TypeScript strict · Payload CMS v3 (jobs queue) · PostgreSQL 17 · MinIO (S3) · Ollama / Lucie-7B-Instruct v1.1 · `@react-pdf/renderer` · Vitest · Zod.

**Spec de référence :** `docs/superpowers/specs/2026-07-30-rapport-audit-ia-design.md`

## Global Constraints

- **Git Flow** : une branche `feat/p7-audit-report-<slug>` par tâche ou groupe de tâches, PR vers `develop`. Jamais de push direct sur `main`. Voir `CLAUDE.md`.
- **Portes vertes obligatoires avant toute PR** : `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. Aucun test existant ne doit casser (référence actuelle : **1070 tests verts**).
- **Interdits en code committé** : `TODO`, `any`, `console.log`, mocks oubliés. Le logging de production passe par `console.error` (OWASP A09).
- **Clean Architecture** : l'UI ne parle jamais à Payload directement. Seul `lib/audit-report/store-server.ts` importe `payload`. Tout helper serveur porte le suffixe `-server.ts` et l'import `'server-only'`.
- **Typographie des textes visibles** : jamais de tiret cadratin (`—`) dans le contenu destiné aux utilisateurs, ni dans les emails, ni dans le PDF. Utiliser deux points ou une virgule. Une campagne de nettoyage a retiré 275 occurrences du dépôt, ne pas les réintroduire.
- **Délai promis** : **24 h ouvrées**. Relance interne à **12 h**, email « échéance dépassée » à **24 h**.
- **Couleur de texte orange** : utiliser `--color-ol-orange-text`, jamais `--color-ol-orange` comme couleur de texte (contraste WCAG AA).
- **Windows** : si `%TEMP%` est saturé, exporter `TMPDIR=/d/tmp TMP=D:/tmp TEMP=D:/tmp` avant `pnpm test` et `pnpm build`.
- **Environnement Ollama** : `OLLAMA_BASE_URL` (défaut `http://10.42.0.1:11434`) et `OLLAMA_MODEL` (défaut `hf.co/OpenLLM-France/Lucie-7B-Instruct-v1.1-gguf:Q4_K_M`).

---

## Structure des fichiers

| Fichier                                                                      | Responsabilité                                          | Tâche |
| ---------------------------------------------------------------------------- | ------------------------------------------------------- | ----- |
| `lib/audit-ia/quiz.ts`                                                       | ajout de la 6e question libre au contrat existant       | 1     |
| `lib/validation.ts`                                                          | champ `challenge` dans `auditIaSchema`                  | 1     |
| `components/forms/AuditIaQuizWizard.tsx`                                     | 6e étape, textes en 24 h                                | 1     |
| `lib/audit-report/types.ts`                                                  | contrat `AuditReportSections` partagé                   | 2     |
| `lib/audit-report/skeleton.ts`                                               | squelette déterministe, fonction pure                   | 2     |
| `lib/audit-report/lucie.ts`                                                  | client Ollama, parsing, timeout                         | 3     |
| `collections/AuditReports.ts`                                                | modèle, statuts, droits                                 | 4     |
| `lib/audit-report/store-server.ts`                                           | création et mise à jour en base, dépôt et lecture MinIO | 5     |
| `lib/audit-report/jobs.ts`                                                   | tâches `generateAuditReport` et `remindPendingReports`  | 6, 9  |
| `lib/audit-report/pdf.tsx`                                                   | rendu PDF de marque                                     | 7     |
| `lib/audit-report/link.ts`                                                   | signature et vérification du jeton                      | 8     |
| `app/audit-ia/rapport/[token]/route.ts`                                      | diffusion du PDF sous jeton                             | 8     |
| `components/admin/ValidateReportButton.tsx`                                  | bouton « Valider et envoyer »                           | 10    |
| `app/api/audit-report/validate/route.ts`                                     | action de validation, authentifiée                      | 10    |
| `deploy/helm/.../networkpolicy.yaml` et `deploy/k8s/base/networkpolicy.yaml` | egress vers Ollama                                      | 11    |

---

### Task 1 : 6e question libre et passage à 24 h

**Files:**

- Modify: `lib/audit-ia/quiz.ts`
- Modify: `lib/validation.ts:33-49`
- Modify: `components/forms/AuditIaQuizWizard.tsx`
- Modify: `app/api/audit-ia/route.ts`
- Modify: `app/(site)/audit-ia/page.tsx:16`
- Modify: `lib/email.ts:170`
- Modify: `lib/cms/site-settings.ts:171-172`
- Test: `tests/unit/lib/audit-ia-quiz.test.ts`, `tests/unit/forms/AuditIaQuizWizard.test.tsx`

**Interfaces:**

- Consomme : rien.
- Produit : `QuizAnswers.challenge?: string` et `summarizeAnswers()` qui inclut le texte libre ; `auditIaSchema` accepte `challenge` (optionnel, 600 caractères max).

- [ ] **Step 1 : écrire le test d'échec sur le schéma**

Ajouter dans `tests/unit/lib/validation.test.ts` (fichier existant) :

```ts
it('accepte un challenge libre borné à 600 caractères', () => {
  const base = {
    name: 'Debora Ahouma',
    email: 'debora@openlabconsulting.com',
    organization: 'OpenLab',
    jobTitle: 'CEO',
    maturity: 'pilote',
    headcount: '50-200',
    goal: 'Nous voulons industrialiser notre pilote IA sur la filiale UEMOA.',
    consentRgpd: 'on',
  };
  expect(
    auditIaSchema.safeParse({
      ...base,
      challenge: 'Rapprochements bancaires : 4 jours par mois.',
    }).success,
  ).toBe(true);
  expect(auditIaSchema.safeParse({ ...base }).success).toBe(true);
  expect(
    auditIaSchema.safeParse({ ...base, challenge: 'x'.repeat(601) }).success,
  ).toBe(false);
});
```

- [ ] **Step 2 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- validation`
Expected: FAIL, `challenge: 'x'.repeat(601)` est accepté car le champ n'existe pas encore (Zod ignore les clés inconnues).

- [ ] **Step 3 : ajouter le champ au schéma**

Dans `lib/validation.ts`, à l'intérieur de `auditIaSchema`, après `goal` :

```ts
  // Texte libre facultatif : seule matière réellement personnelle dont
  // dispose la génération de rapport. Borné pour limiter la surface de
  // prompt injection et le coût d'inférence (OWASP A03).
  challenge: z.string().max(600).optional().or(z.literal('')),
```

- [ ] **Step 4 : vérifier que le test passe**

Run: `pnpm test -- validation`
Expected: PASS

- [ ] **Step 5 : écrire le test de la question dans le quiz**

Dans `tests/unit/lib/audit-ia-quiz.test.ts` :

```ts
it('expose une 6e étape libre et la reprend dans la synthèse', () => {
  const answers: QuizAnswers = {
    maturity: 'decouverte',
    sector: 'agro-industrie',
    headcount: '200-1000',
    scope: 'single-dept',
    urgency: 'exploration',
    challenge: 'Nos rapprochements bancaires prennent 4 jours par mois.',
  };
  const summary = summarizeAnswers(answers, getRecommendation(answers));
  expect(summary).toContain('rapprochements bancaires');
  expect(CHALLENGE_QUESTION.eyebrow).toBe('Question 6 sur 6 (facultative)');
});
```

- [ ] **Step 6 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- audit-ia-quiz`
Expected: FAIL, `CHALLENGE_QUESTION` n'est pas exporté.

- [ ] **Step 7 : implémenter dans `lib/audit-ia/quiz.ts`**

Modifier le type et ajouter la question. Les cinq questions existantes gardent leur libellé mais leur `eyebrow` passe de « sur 5 » à « sur 6 » :

```ts
export interface QuizAnswers {
  maturity?: Maturity;
  sector?: Sector;
  headcount?: Headcount;
  scope?: Scope;
  urgency?: Urgency;
  /** Texte libre facultatif : matière de la génération de rapport. */
  challenge?: string;
}

/**
 * 6e étape : question ouverte, facultative. Sans elle, deux entreprises
 * du même secteur et de la même taille reçoivent un rapport
 * interchangeable (cf. spec § 3).
 */
export const CHALLENGE_QUESTION = {
  id: 'challenge' as const,
  eyebrow: 'Question 6 sur 6 (facultative)',
  question:
    'En deux ou trois phrases, quel est le problème concret que vous voulez régler ?',
  placeholder:
    'Exemple : nos rapprochements bancaires prennent 4 jours par mois à deux comptables.',
  maxLength: 600,
} as const;
```

Puis, dans `summarizeAnswers`, ajouter la ligne finale avant le `join` :

```ts
    ...(answers.challenge?.trim()
      ? ['', `Problème décrit par le prospect : ${answers.challenge.trim()}`]
      : []),
```

- [ ] **Step 8 : vérifier que le test passe**

Run: `pnpm test -- audit-ia-quiz`
Expected: PASS

- [ ] **Step 9 : écrire le test du wizard**

Dans `tests/unit/forms/AuditIaQuizWizard.test.tsx` :

```tsx
it('affiche la 6e étape facultative et permet de la passer', async () => {
  render(<AuditIaQuizWizard />);
  // Répondre aux 5 questions à choix.
  for (const label of [
    'On en parle, on explore',
    'Agro-industrie',
    '200 à 1 000',
    'Un département',
    'Phase d’exploration',
  ]) {
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(label, 'i') }),
    );
  }
  expect(
    screen.getByRole('textbox', { name: /problème concret/i }),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /passer/i }));
  expect(screen.getByTestId('audit-ia-recommendation')).toBeInTheDocument();
});
```

- [ ] **Step 10 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- AuditIaQuizWizard`
Expected: FAIL, aucun champ texte après la 5e question.

- [ ] **Step 11 : implémenter l'étape dans le wizard**

Dans `components/forms/AuditIaQuizWizard.tsx` : insérer une étape entre les questions et la recommandation. `totalQuestionSteps` reste `QUESTIONS.length` ; ajouter `const isChallengeStep = step === totalQuestionSteps;` et décaler recommandation et formulaire de 1 (`totalQuestionSteps + 1` et `+ 2`). Le composant d'étape :

```tsx
function ChallengeStep({
  value,
  onChange,
  onContinue,
  onBack,
}: {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly onContinue: () => void;
  readonly onBack: () => void;
}): ReactElement {
  return (
    <div>
      <Eyebrow tone="orange">{CHALLENGE_QUESTION.eyebrow}</Eyebrow>
      <Heading level={2} visualLevel={3} className="mt-4">
        {CHALLENGE_QUESTION.question}
      </Heading>
      <p className="mt-3 text-sm text-[var(--color-ol-graphite)]/70">
        Plus votre réponse est concrète, plus le rapport sera utile. Vous pouvez
        aussi passer cette étape.
      </p>
      <label className="mt-6 block">
        <span className="sr-only">{CHALLENGE_QUESTION.question}</span>
        <textarea
          name="challenge"
          rows={4}
          maxLength={CHALLENGE_QUESTION.maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={CHALLENGE_QUESTION.placeholder}
          className="w-full rounded-md border border-[var(--color-ol-mist)] bg-white px-4 py-3 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        />
      </label>
      <p className="mt-2 text-xs text-[var(--color-ol-graphite)]/55">
        {value.length} / {CHALLENGE_QUESTION.maxLength}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button type="button" variant="primary" size="lg" onClick={onContinue}>
          Voir ma recommandation
        </Button>
        <button
          type="button"
          onClick={onContinue}
          className="text-sm font-medium text-[var(--color-ol-graphite)]/70 hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        >
          Passer
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ol-graphite)]/70 hover:text-[var(--color-ol-orange)] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
        >
          <ArrowLeft width={14} height={14} aria-hidden />
          Question précédente
        </button>
      </div>
    </div>
  );
}
```

Dans `handleSubmit`, transmettre le champ : `formData.set('challenge', answers.challenge ?? '');`

- [ ] **Step 12 : vérifier que le test passe**

Run: `pnpm test -- AuditIaQuizWizard`
Expected: PASS

- [ ] **Step 13 : propager `challenge` côté serveur**

Dans `app/api/audit-ia/route.ts`, ajouter le texte libre aux métadonnées du lead, sous `headcount` :

```ts
      challenge: parsed.data.challenge || null,
```

et dans le bloc `details` de `sendLeadNotification` :

```ts
        'Problème décrit': parsed.data.challenge || undefined,
```

- [ ] **Step 14 : aligner tous les textes sur 24 h**

Cinq remplacements, aucun tiret cadratin :

| Fichier                                  | Avant                                             | Après                                             |
| ---------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| `app/api/audit-ia/route.ts`              | `est prêt sous 48 h ouvrées.`                     | `est prêt sous 24 h ouvrées.`                     |
| `components/forms/AuditIaQuizWizard.tsx` | `est prêt sous 48 h ouvrées.`                     | `est prêt sous 24 h ouvrées.`                     |
| `lib/email.ts`                           | `vous parviendra sous 48 h ouvrées.`              | `vous parviendra sous 24 h ouvrées.`              |
| `app/(site)/audit-ia/page.tsx`           | `un consultant senior sous 48 h.`                 | `un consultant senior sous 24 h.`                 |
| `lib/cms/site-settings.ts`               | `Consultant senior · 48 h` et `sous 48 h ouvrées` | `Consultant senior · 24 h` et `sous 24 h ouvrées` |

Mettre à jour les tests existants qui affirment « 48 » : `pnpm test -- audit-ia` puis corriger les assertions qui échouent.

- [ ] **Step 15 : porter la valeur en production**

`lib/cms/site-settings.ts` ne contient que des valeurs de **repli**. Le texte affiché vient du global `AuditIaProcessSettings` en base. Noter dans la PR que l'entrée correspondante doit être modifiée dans `/admin`, sinon la production continuera d'afficher 48 h. Procédure : `docs/reference/admin-backoffice.md` et `reference_edit_cms_prod_data`.

- [ ] **Step 16 : portes vertes et commit**

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
git add lib/audit-ia/quiz.ts lib/validation.ts components/forms/AuditIaQuizWizard.tsx app/api/audit-ia/route.ts "app/(site)/audit-ia/page.tsx" lib/email.ts lib/cms/site-settings.ts tests/
git commit -m "feat(audit-ia): 6e question libre et promesse ramenée à 24 h ouvrées"
```

---

### Task 2 : contrat de sections et squelette déterministe

**Files:**

- Create: `lib/audit-report/types.ts`
- Create: `lib/audit-report/skeleton.ts`
- Test: `tests/unit/lib/audit-report/skeleton.test.ts`

**Interfaces:**

- Consomme : `QuizAnswers`, `getRecommendation`, `Recommendation` de `lib/audit-ia/quiz.ts` ; `CHALLENGE_QUESTION` de la tâche 1.
- Produit :
  - `interface AuditReportStep { title: string; horizon: string; body: string }`
  - `interface AuditReportSections { title: string; synthesis: string; situation: string; recommendation: string; roadmap: AuditReportStep[]; nextSteps: string }`
  - `interface AuditReportInput { organization: string; jobTitle: string; answers: QuizAnswers }`
  - `buildSkeletonReport(input: AuditReportInput): AuditReportSections`

- [ ] **Step 1 : écrire le test**

```ts
import { describe, expect, it } from 'vitest';
import { buildSkeletonReport } from '@/lib/audit-report/skeleton';
import type { QuizAnswers } from '@/lib/audit-ia/quiz';

const answers: QuizAnswers = {
  maturity: 'pilote',
  sector: 'banque-assurance',
  headcount: '200-1000',
  scope: 'single-dept',
  urgency: '3-months',
};

describe('buildSkeletonReport', () => {
  it('remplit toutes les sections sans réseau', () => {
    const r = buildSkeletonReport({
      organization: 'Banque X',
      jobTitle: 'DSI',
      answers,
    });
    expect(r.title).toContain('Banque X');
    expect(r.synthesis.length).toBeGreaterThan(80);
    expect(r.situation).toContain('Banque & assurance');
    expect(r.recommendation).toContain('Audit IA éclair');
    expect(r.roadmap.length).toBeGreaterThanOrEqual(3);
    expect(r.roadmap.every((s) => s.title && s.horizon && s.body)).toBe(true);
    expect(r.nextSteps).toContain('24 h');
  });

  it('reprend le problème décrit quand il est fourni', () => {
    const r = buildSkeletonReport({
      organization: 'Banque X',
      jobTitle: 'DSI',
      answers: {
        ...answers,
        challenge: 'Le rapprochement bancaire prend 4 jours.',
      },
    });
    expect(r.situation).toContain('rapprochement bancaire');
  });

  it('reste complet même sans aucune réponse', () => {
    const r = buildSkeletonReport({
      organization: 'Inconnue',
      jobTitle: '',
      answers: {},
    });
    expect(r.roadmap.length).toBeGreaterThanOrEqual(3);
    expect(r.synthesis).not.toContain('undefined');
  });

  it('ne contient aucun tiret cadratin', () => {
    const r = buildSkeletonReport({
      organization: 'Banque X',
      jobTitle: 'DSI',
      answers,
    });
    expect(JSON.stringify(r)).not.toContain('—');
  });
});
```

- [ ] **Step 2 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- skeleton`
Expected: FAIL, module introuvable.

- [ ] **Step 3 : écrire `lib/audit-report/types.ts`**

```ts
import type { QuizAnswers } from '@/lib/audit-ia/quiz';

/** Une étape de feuille de route du rapport. */
export interface AuditReportStep {
  title: string;
  horizon: string;
  body: string;
}

/**
 * Contrat unique du contenu de rapport. Le modèle (lucie.ts) et le
 * squelette de repli (skeleton.ts) produisent tous deux cette forme,
 * ce qui permet au rendu PDF d'ignorer leur origine.
 */
export interface AuditReportSections {
  title: string;
  synthesis: string;
  situation: string;
  recommendation: string;
  roadmap: AuditReportStep[];
  nextSteps: string;
}

/** Entrée commune : ce que le prospect a déclaré. */
export interface AuditReportInput {
  organization: string;
  jobTitle: string;
  answers: QuizAnswers;
}
```

- [ ] **Step 4 : écrire `lib/audit-report/skeleton.ts`**

```ts
import {
  HEADCOUNT_QUESTION,
  MATURITY_QUESTION,
  SCOPE_QUESTION,
  SECTOR_QUESTION,
  URGENCY_QUESTION,
  getRecommendation,
} from '@/lib/audit-ia/quiz';
import type {
  AuditReportInput,
  AuditReportSections,
  AuditReportStep,
} from './types';

/**
 * Squelette déterministe du rapport d'audit.
 *
 * Sert de repli quand la génération par le modèle échoue ou dépasse le
 * délai : le consultant a toujours un document à corriger, jamais une
 * page blanche. Fonction pure, aucun accès réseau ni base.
 */

function labelFor<V extends string>(
  question: { options: readonly { value: V; label: string }[] },
  value: V | undefined,
  fallback: string,
): string {
  return question.options.find((o) => o.value === value)?.label ?? fallback;
}

const ROADMAP: readonly AuditReportStep[] = [
  {
    title: 'Cadrage et collecte',
    horizon: 'Semaines 1 à 2',
    body: 'Entretiens avec les responsables métier concernés, inventaire des données disponibles et de leur qualité, identification des contraintes réglementaires applicables.',
  },
  {
    title: 'Qualification des cas d’usage',
    horizon: 'Semaines 3 à 4',
    body: 'Positionnement de chaque piste sur la matrice impact et faisabilité, estimation de la valeur attendue et du coût de mise en oeuvre, arbitrage avec vos équipes.',
  },
  {
    title: 'Preuve de valeur',
    horizon: 'Mois 2 à 3',
    body: 'Mise en oeuvre du cas d’usage prioritaire sur un périmètre restreint, avec des indicateurs de succès définis avant le démarrage.',
  },
  {
    title: 'Industrialisation',
    horizon: 'Mois 4 et suivants',
    body: 'Passage en production, supervision, transfert de compétences et gouvernance des modèles dans la durée.',
  },
];

export function buildSkeletonReport(
  input: AuditReportInput,
): AuditReportSections {
  const { organization, jobTitle, answers } = input;
  const recommendation = getRecommendation(answers);
  const org = organization.trim() || 'votre organisation';

  const maturity = labelFor(
    MATURITY_QUESTION,
    answers.maturity,
    'non précisée',
  );
  const sector = labelFor(SECTOR_QUESTION, answers.sector, 'non précisé');
  const headcount = labelFor(
    HEADCOUNT_QUESTION,
    answers.headcount,
    'non précisé',
  );
  const scope = labelFor(SCOPE_QUESTION, answers.scope, 'non précisé');
  const urgency = labelFor(URGENCY_QUESTION, answers.urgency, 'non précisé');
  const challenge = answers.challenge?.trim();

  const situation = [
    `Secteur : ${sector}. Effectif : ${headcount}. Maturité IA déclarée : ${maturity}.`,
    `Périmètre visé : ${scope}. Horizon de démarrage souhaité : ${urgency}.`,
    challenge
      ? `Problème décrit par ${jobTitle.trim() || 'votre équipe'} : ${challenge}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    title: `Audit IA : ${org}`,
    synthesis: `Ce document restitue la lecture d’OpenLab Consulting sur la situation de ${org} au regard de l’intelligence artificielle appliquée, à partir des éléments que vous nous avez communiqués. Il propose un format d’intervention adapté à votre maturité et à votre calendrier, puis une feuille de route en quatre temps. Il ne remplace pas un diagnostic sur site : il en fixe le cadre et les priorités.`,
    situation,
    recommendation: [
      `${recommendation.title}.`,
      recommendation.subtitle,
      ...recommendation.body,
      `Durée annoncée : ${recommendation.duration}. Livrable : ${recommendation.deliverable}.`,
    ].join('\n\n'),
    roadmap: [...ROADMAP],
    nextSteps: `Un consultant senior d’OpenLab Consulting vous contacte sous 24 h ouvrées pour confronter cette lecture à votre réalité de terrain et ajuster le périmètre. Vous pouvez aussi nous écrire directement à infos@openlabconsulting.com.`,
  };
}
```

- [ ] **Step 5 : vérifier que les tests passent**

Run: `pnpm test -- skeleton`
Expected: PASS, 4 tests.

- [ ] **Step 6 : commit**

```bash
git add lib/audit-report/types.ts lib/audit-report/skeleton.ts tests/unit/lib/audit-report/skeleton.test.ts
git commit -m "feat(audit-report): contrat de sections et squelette déterministe"
```

---

### Task 3 : client Lucie-7B

**Files:**

- Create: `lib/audit-report/lucie.ts`
- Test: `tests/unit/lib/audit-report/lucie.test.ts`

**Interfaces:**

- Consomme : `AuditReportInput`, `AuditReportSections` de `./types` ; `buildSkeletonReport` de `./skeleton` (pour compléter une réponse partielle).
- Produit : `generateWithLucie(input: AuditReportInput): Promise<AuditReportSections | null>` — renvoie `null` sur échec, ne throw jamais.

- [ ] **Step 1 : écrire les tests**

````ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateWithLucie } from '@/lib/audit-report/lucie';

const input = {
  organization: 'Banque X',
  jobTitle: 'DSI',
  answers: { maturity: 'pilote', sector: 'banque-assurance' } as const,
};

function mockOllama(body: unknown, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );
}

describe('generateWithLucie', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('transforme une réponse conforme en sections', async () => {
    mockOllama({
      response: JSON.stringify({
        title: 'Audit IA : Banque X',
        synthesis: 'Synthèse suffisamment longue pour être utile au lecteur.',
        situation: 'Situation décrite.',
        recommendation: 'Recommandation détaillée.',
        roadmap: [
          { title: 'Cadrage', horizon: 'S1 à S2', body: 'Entretiens.' },
        ],
        nextSteps: 'Prise de contact sous 24 h ouvrées.',
      }),
    });
    const out = await generateWithLucie(input);
    expect(out?.title).toBe('Audit IA : Banque X');
    expect(out?.roadmap[0]?.horizon).toBe('S1 à S2');
  });

  it('tolère un JSON entouré de balises markdown', async () => {
    mockOllama({
      response:
        '```json\n{"title":"T","synthesis":"S","situation":"Si","recommendation":"R","roadmap":[{"title":"a","horizon":"b","body":"c"}],"nextSteps":"N"}\n```',
    });
    expect((await generateWithLucie(input))?.title).toBe('T');
  });

  it('renvoie null si la réponse n’est pas exploitable', async () => {
    mockOllama({ response: 'Bonjour, voici mon rapport en texte libre.' });
    expect(await generateWithLucie(input)).toBeNull();
  });

  it('renvoie null sur erreur HTTP', async () => {
    mockOllama({ error: 'model not found' }, 404);
    expect(await generateWithLucie(input)).toBeNull();
  });

  it('renvoie null si le service est injoignable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    expect(await generateWithLucie(input)).toBeNull();
  });

  it('n’envoie jamais l’email ni le nom du prospect au modèle', async () => {
    const spy = vi.fn(
      async () => new Response(JSON.stringify({ response: '{}' })),
    );
    vi.stubGlobal('fetch', spy);
    await generateWithLucie({ ...input, organization: 'Banque X' });
    const body = String((spy.mock.calls[0]?.[1] as RequestInit).body);
    expect(body).not.toContain('@');
  });
});
````

- [ ] **Step 2 : lancer les tests et vérifier qu'ils échouent**

Run: `pnpm test -- lucie`
Expected: FAIL, module introuvable.

- [ ] **Step 3 : implémenter le client**

````ts
import {
  HEADCOUNT_QUESTION,
  MATURITY_QUESTION,
  SCOPE_QUESTION,
  SECTOR_QUESTION,
  URGENCY_QUESTION,
  getRecommendation,
} from '@/lib/audit-ia/quiz';
import type { AuditReportInput, AuditReportSections } from './types';

/**
 * Client Ollama pour Lucie-7B-Instruct (OpenLLM-France), hébergé dans le
 * cluster. Le choix d'un modèle souverain implique que les données du
 * prospect ne quittent pas l'infrastructure.
 *
 * Contrat : ne throw jamais. Renvoie `null` sur toute anomalie (service
 * absent, timeout, réponse non exploitable) et laisse l'appelant basculer
 * sur le squelette déterministe.
 *
 * Aucune donnée nominative n'est transmise : ni nom, ni email. Seuls le
 * nom de l'organisation, la fonction et les réponses au questionnaire
 * partent dans le prompt.
 */

const DEFAULT_BASE_URL = 'http://10.42.0.1:11434';
const DEFAULT_MODEL = 'hf.co/OpenLLM-France/Lucie-7B-Instruct-v1.1-gguf:Q4_K_M';
const TIMEOUT_MS = 120_000;

const SYSTEM_PROMPT = `Tu es consultant senior en intelligence artificielle appliquée chez OpenLab Consulting, cabinet ivoirien basé à Abidjan. Tu rédiges en français professionnel : phrases courtes, ton factuel, adresse directe au lecteur. Tu n'inventes aucun chiffre, aucun nom de client, aucune référence. Tu n'emploies jamais le tiret cadratin. Tu réponds STRICTEMENT en JSON valide, sans texte autour, selon le schéma demandé.`;

interface OllamaResponse {
  response?: string;
}

function buildPrompt(input: AuditReportInput): string {
  const { answers, jobTitle, organization } = input;
  const recommendation = getRecommendation(answers);
  const label = <V extends string>(
    q: { options: readonly { value: V; label: string }[] },
    v: V | undefined,
  ): string => q.options.find((o) => o.value === v)?.label ?? 'non précisé';

  return [
    `Rédige un rapport d'audit IA pour l'organisation « ${organization} ».`,
    `Interlocuteur : ${jobTitle || 'non précisé'}.`,
    `Maturité IA déclarée : ${label(MATURITY_QUESTION, answers.maturity)}.`,
    `Secteur : ${label(SECTOR_QUESTION, answers.sector)}.`,
    `Effectif : ${label(HEADCOUNT_QUESTION, answers.headcount)}.`,
    `Périmètre souhaité : ${label(SCOPE_QUESTION, answers.scope)}.`,
    `Horizon de démarrage : ${label(URGENCY_QUESTION, answers.urgency)}.`,
    answers.challenge?.trim()
      ? `Problème décrit par le prospect : « ${answers.challenge.trim()} ».`
      : `Le prospect n'a pas décrit de problème précis : reste prudent et propose un cadrage.`,
    `Format d'intervention retenu par notre moteur de recommandation : ${recommendation.title} (${recommendation.duration}, livrable : ${recommendation.deliverable}). Appuie-toi dessus, ne le contredis pas.`,
    '',
    'Schéma JSON attendu :',
    '{"title":string,"synthesis":string,"situation":string,"recommendation":string,"roadmap":[{"title":string,"horizon":string,"body":string}],"nextSteps":string}',
    '',
    'Contraintes : synthesis entre 3 et 5 phrases ; roadmap entre 3 et 5 étapes ; nextSteps mentionne un contact sous 24 h ouvrées.',
  ].join('\n');
}

function parseSections(raw: string): AuditReportSections | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    const obj = JSON.parse(cleaned) as Partial<AuditReportSections>;
    const roadmap = Array.isArray(obj.roadmap)
      ? obj.roadmap.filter(
          (s): s is AuditReportSections['roadmap'][number] =>
            typeof s?.title === 'string' &&
            typeof s?.horizon === 'string' &&
            typeof s?.body === 'string',
        )
      : [];
    if (
      typeof obj.title !== 'string' ||
      typeof obj.synthesis !== 'string' ||
      typeof obj.situation !== 'string' ||
      typeof obj.recommendation !== 'string' ||
      typeof obj.nextSteps !== 'string' ||
      roadmap.length === 0
    ) {
      return null;
    }
    return {
      title: obj.title.slice(0, 200),
      synthesis: obj.synthesis.slice(0, 3000),
      situation: obj.situation.slice(0, 3000),
      recommendation: obj.recommendation.slice(0, 5000),
      roadmap: roadmap.slice(0, 5),
      nextSteps: obj.nextSteps.slice(0, 2000),
    };
  } catch {
    return null;
  }
}

export async function generateWithLucie(
  input: AuditReportInput,
): Promise<AuditReportSections | null> {
  const baseUrl = process.env.OLLAMA_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.OLLAMA_MODEL || DEFAULT_MODEL;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        system: SYSTEM_PROMPT,
        prompt: buildPrompt(input),
        options: { temperature: 0.3, num_ctx: 8192, num_predict: 1800 },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  try {
    const data = (await res.json()) as OllamaResponse;
    return parseSections(data.response ?? '');
  } catch {
    return null;
  }
}
````

- [ ] **Step 4 : vérifier que les tests passent**

Run: `pnpm test -- lucie`
Expected: PASS, 6 tests.

- [ ] **Step 5 : commit**

```bash
git add lib/audit-report/lucie.ts tests/unit/lib/audit-report/lucie.test.ts
git commit -m "feat(audit-report): client Lucie-7B fail-soft avec parsing strict"
```

---

### Task 4 : collection AuditReports et migration

**Files:**

- Create: `collections/AuditReports.ts`
- Modify: `payload.config.ts:184-201` (import et liste `collections`)
- Test: `tests/unit/security/audit-reports-access.test.ts`

**Interfaces:**

- Consomme : rien.
- Produit : collection `audit-reports` avec les champs `lead`, `status`, `sections` (groupe), `generatedBy`, `generationError`, `validatedBy`, `validatedAt`, `pdfKey`, `sentAt`, `downloadCount`, `remindedAt`.

- [ ] **Step 1 : écrire le test d'accès**

```ts
import { describe, expect, it } from 'vitest';
import { AuditReports } from '@/collections/AuditReports';

type AccessFn = (args: { req: { user: { role?: string } | null } }) => boolean;

describe('AuditReports : contrôle d’accès (OWASP A01)', () => {
  const read = AuditReports.access?.read as AccessFn;
  const del = AuditReports.access?.delete as AccessFn;

  it('refuse toute lecture anonyme', () => {
    expect(read({ req: { user: null } })).toBe(false);
  });

  it('autorise admin et editor-chief', () => {
    for (const role of ['super-admin', 'admin', 'editor-chief']) {
      expect(read({ req: { user: { role } } })).toBe(true);
    }
  });

  it('refuse la lecture aux autres rôles', () => {
    expect(read({ req: { user: { role: 'author' } } })).toBe(false);
  });

  it('réserve la suppression au super-admin', () => {
    expect(del({ req: { user: { role: 'admin' } } })).toBe(false);
    expect(del({ req: { user: { role: 'super-admin' } } })).toBe(true);
  });

  it('interdit la création manuelle depuis l’admin', () => {
    expect((AuditReports.access?.create as () => boolean)()).toBe(false);
  });
});
```

- [ ] **Step 2 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- audit-reports-access`
Expected: FAIL, module introuvable.

- [ ] **Step 3 : écrire la collection**

```ts
import type { CollectionConfig } from 'payload';

/**
 * AuditReports : rapports d'audit IA générés depuis /audit-ia.
 *
 * Cycle de vie : `brouillon-ia` (produit par la file de tâches) puis
 * `en-revue`, `valide`, `envoye`. `echec-generation` signale un repli sur
 * squelette après échec du modèle.
 *
 * Accès (OWASP A01) : jamais lisible en anonyme. La création passe
 * exclusivement par la file de tâches avec `overrideAccess`, comme les
 * leads : aucune création manuelle depuis l'admin, pour garantir qu'un
 * rapport est toujours rattaché à une demande réelle.
 */

const isStaff = (role: string | undefined): boolean =>
  role === 'super-admin' || role === 'admin' || role === 'editor-chief';

const roleOf = (req: { user: { role?: string } | null }): string | undefined =>
  (req.user as { role?: string } | null)?.role;

export const AuditReports: CollectionConfig = {
  slug: 'audit-reports',
  labels: { singular: 'Rapport d’audit', plural: 'Rapports d’audit' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'generatedBy', 'createdAt', 'sentAt'],
    description:
      'Rapports d’audit IA. Un brouillon attend votre relecture avant tout envoi au prospect.',
    listSearchableFields: ['title'],
  },
  access: {
    read: ({ req }): boolean => isStaff(roleOf(req)),
    create: (): boolean => false,
    update: ({ req }): boolean => isStaff(roleOf(req)),
    delete: ({ req }): boolean => roleOf(req) === 'super-admin',
  },
  versions: { drafts: false },
  fields: [
    {
      name: 'validate',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/ValidateReportButton.tsx#default',
        },
      },
    },
    { name: 'title', type: 'text', required: true, maxLength: 200 },
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      required: true,
      admin: { description: 'Demande d’audit à l’origine de ce rapport.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'brouillon-ia',
      options: [
        { label: 'Brouillon IA', value: 'brouillon-ia' },
        { label: 'En revue', value: 'en-revue' },
        { label: 'Validé', value: 'valide' },
        { label: 'Envoyé', value: 'envoye' },
        { label: 'Échec de génération', value: 'echec-generation' },
      ],
    },
    {
      name: 'sections',
      type: 'group',
      fields: [
        { name: 'synthesis', type: 'textarea', required: true },
        { name: 'situation', type: 'textarea', required: true },
        { name: 'recommendation', type: 'textarea', required: true },
        {
          name: 'roadmap',
          type: 'array',
          minRows: 1,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'horizon', type: 'text', required: true },
            { name: 'body', type: 'textarea', required: true },
          ],
        },
        { name: 'nextSteps', type: 'textarea', required: true },
      ],
    },
    {
      name: 'generatedBy',
      type: 'select',
      required: true,
      defaultValue: 'squelette',
      options: [
        { label: 'Lucie-7B', value: 'lucie-7b' },
        { label: 'Squelette de repli', value: 'squelette' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'generationError',
      type: 'textarea',
      admin: {
        readOnly: true,
        description:
          'Renseigné si la génération a échoué et que le squelette a pris le relais.',
      },
    },
    {
      name: 'validatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    { name: 'validatedAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'pdfKey',
      type: 'text',
      admin: {
        readOnly: true,
        description:
          'Clé de l’objet dans le bucket privé. Jamais exposée publiquement.',
      },
    },
    { name: 'sentAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'remindedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Dernière relance envoyée à l’équipe.',
      },
    },
    {
      name: 'downloadCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Notes internes, non transmises au prospect.' },
    },
  ],
  timestamps: true,
};
```

- [ ] **Step 4 : enregistrer la collection**

Dans `payload.config.ts` : ajouter `import { AuditReports } from './collections/AuditReports';` avec les autres imports de collections, puis `AuditReports,` dans le tableau `collections`, juste après `Leads,`.

- [ ] **Step 5 : vérifier que les tests passent**

Run: `pnpm test -- audit-reports-access`
Expected: PASS, 5 tests.

- [ ] **Step 6 : générer les types et la migration**

```bash
pnpm cms:generate-types
pnpm db:migrate:create:tsx
```

Vérifier que le fichier créé dans `migrations/` contient bien `audit_reports` et ses tables filles (`audit_reports_sections_roadmap`). Ne pas éditer la migration à la main.

**Attention** : la génération de migration exige une base accessible. Si le port 5433 est occupé par un autre projet, adapter `DATABASE_URL` le temps de la commande. Voir `project_parametrage_total_p6` pour l'incident déjà rencontré.

- [ ] **Step 7 : commit**

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
git add collections/AuditReports.ts payload.config.ts payload-types.ts migrations/ tests/unit/security/audit-reports-access.test.ts
git commit -m "feat(audit-report): collection AuditReports, accès durci et migration"
```

---

### Task 5 : persistance et stockage MinIO

**Files:**

- Create: `lib/audit-report/store-server.ts`
- Modify: `package.json` (dépendance `@aws-sdk/client-s3`)
- Test: `tests/unit/lib/audit-report/store-server.test.ts`

**Interfaces:**

- Consomme : `AuditReportSections` de `./types`.
- Produit :
  - `createDraftReport(args: { leadId: number | string; title: string; sections: AuditReportSections; generatedBy: 'lucie-7b' | 'squelette'; generationError?: string }): Promise<string | null>` — renvoie l'identifiant du rapport, ou `null` si Payload est indisponible.
  - `putReportPdf(reportId: string, pdf: Buffer): Promise<string>` — renvoie la clé MinIO.
  - `getReportPdf(pdfKey: string): Promise<Buffer | null>`
  - `REPORTS_BUCKET` : nom du bucket privé.

- [ ] **Step 1 : installer la dépendance**

```bash
pnpm add @aws-sdk/client-s3
```

Le paquet est déjà présent en transitif via `@payloadcms/storage-s3` ; le déclarer explicitement rend la dépendance honnête et stable.

- [ ] **Step 2 : écrire le test**

```ts
import { describe, expect, it, vi } from 'vitest';

const send = vi.fn(async () => ({}));
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = send;
  },
  PutObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
  GetObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
}));

const { buildReportKey } = await import('@/lib/audit-report/store-server');

describe('buildReportKey', () => {
  it('produit une clé stable, préfixée et sans caractère douteux', () => {
    const key = buildReportKey('42');
    expect(key).toBe('audit-reports/42.pdf');
  });

  it('rejette un identifiant non alphanumérique', () => {
    expect(() => buildReportKey('../../etc/passwd')).toThrow();
  });
});
```

- [ ] **Step 3 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- store-server`
Expected: FAIL, module introuvable.

- [ ] **Step 4 : implémenter**

```ts
import 'server-only';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { AuditReportSections } from './types';

/**
 * Seule unité du pipeline autorisée à toucher Payload et MinIO
 * (Clean Architecture : l'UI et les unités pures ne connaissent ni la
 * base ni le stockage).
 *
 * Le bucket des rapports est distinct de celui des médias : un rapport
 * nominatif ne doit jamais se retrouver derrière une URL publique.
 */

export const REPORTS_BUCKET =
  process.env.MINIO_REPORTS_BUCKET ?? 'openlab-audit-reports';

/** Empêche toute traversée de chemin dans la clé d'objet (OWASP A03). */
export function buildReportKey(reportId: string): string {
  if (!/^[A-Za-z0-9-]+$/.test(reportId)) {
    throw new Error(`Identifiant de rapport invalide : ${reportId}`);
  }
  return `audit-reports/${reportId}.pdf`;
}

function s3(): S3Client {
  const endpoint = process.env.MINIO_ENDPOINT?.startsWith('http')
    ? process.env.MINIO_ENDPOINT
    : `http://${process.env.MINIO_ENDPOINT ?? 'localhost:9000'}`;
  return new S3Client({
    endpoint,
    region: 'us-east-1',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    },
  });
}

export async function putReportPdf(
  reportId: string,
  pdf: Buffer,
): Promise<string> {
  const key = buildReportKey(reportId);
  await s3().send(
    new PutObjectCommand({
      Bucket: REPORTS_BUCKET,
      Key: key,
      Body: pdf,
      ContentType: 'application/pdf',
    }),
  );
  return key;
}

export async function getReportPdf(pdfKey: string): Promise<Buffer | null> {
  try {
    const res = await s3().send(
      new GetObjectCommand({ Bucket: REPORTS_BUCKET, Key: pdfKey }),
    );
    const bytes = await res.Body?.transformToByteArray();
    return bytes ? Buffer.from(bytes) : null;
  } catch (err) {
    console.error(
      '[audit-report] lecture PDF impossible:',
      (err as Error).message,
    );
    return null;
  }
}

export async function createDraftReport(args: {
  leadId: number | string;
  title: string;
  sections: AuditReportSections;
  generatedBy: 'lucie-7b' | 'squelette';
  generationError?: string;
}): Promise<string | null> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });

    const created = (await payload.create({
      collection: 'audit-reports',
      overrideAccess: true,
      data: {
        title: args.title,
        lead: args.leadId,
        status: args.generationError ? 'echec-generation' : 'brouillon-ia',
        generatedBy: args.generatedBy,
        generationError: args.generationError ?? null,
        sections: args.sections,
      },
    })) as { id: number | string };

    return String(created.id);
  } catch (err) {
    // OWASP A09 : un rapport perdu doit laisser une trace, y compris en
    // production. L'incident silencieux constaté sur les emails ne doit
    // pas se reproduire ici.
    console.error(
      '[audit-report] création du brouillon impossible:',
      (err as Error).message,
    );
    return null;
  }
}
```

- [ ] **Step 5 : vérifier que les tests passent**

Run: `pnpm test -- store-server`
Expected: PASS, 2 tests.

- [ ] **Step 6 : créer le bucket privé en développement**

```bash
docker compose up -d minio
docker compose exec minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker compose exec minio mc mb --ignore-existing local/openlab-audit-reports
```

Ne pas rendre ce bucket public : contrairement à `openlab-media`, aucune politique anonyme ne doit être posée.

- [ ] **Step 7 : commit**

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
git add package.json pnpm-lock.yaml lib/audit-report/store-server.ts tests/unit/lib/audit-report/store-server.test.ts
git commit -m "feat(audit-report): persistance Payload et stockage MinIO privé"
```

---

### Task 6 : tâche de génération et alerte équipe

**Files:**

- Create: `lib/audit-report/jobs.ts`
- Modify: `payload.config.ts` (bloc `jobs`)
- Modify: `app/api/audit-ia/route.ts` (mise en file après le 202)
- Modify: `lib/email.ts` (nouvelle fonction `sendReportReviewAlert`)
- Test: `tests/unit/lib/audit-report/generate-job.test.ts`

**Interfaces:**

- Consomme : `generateWithLucie`, `buildSkeletonReport`, `createDraftReport`, `AuditReportInput`.
- Produit :
  - `generateAuditReportTask` : définition de tâche Payload, slug `generateAuditReport`, `retries: 2`.
  - `runGeneration(input: AuditReportInput & { leadId: number | string }): Promise<{ reportId: string | null; generatedBy: 'lucie-7b' | 'squelette' }>` — logique testable hors Payload.
  - `sendReportReviewAlert(input: { reportId: string; organization: string; aiScore?: number; overdue?: boolean }): Promise<SendEmailResult>`

- [ ] **Step 1 : écrire le test**

```ts
import { describe, expect, it, vi } from 'vitest';

const createDraftReport = vi.fn(async () => '7');
vi.mock('@/lib/audit-report/store-server', () => ({ createDraftReport }));
const generateWithLucie = vi.fn();
vi.mock('@/lib/audit-report/lucie', () => ({ generateWithLucie }));

const { runGeneration } = await import('@/lib/audit-report/jobs');

const input = {
  leadId: 18,
  organization: 'EXPERTISE IA',
  jobTitle: 'CTO',
  answers: { maturity: 'decouverte', sector: 'agro-industrie' } as const,
};

describe('runGeneration', () => {
  it('utilise le texte de Lucie quand elle répond', async () => {
    generateWithLucie.mockResolvedValueOnce({
      title: 'T',
      synthesis: 'S',
      situation: 'Si',
      recommendation: 'R',
      roadmap: [{ title: 'a', horizon: 'b', body: 'c' }],
      nextSteps: 'N',
    });
    const out = await runGeneration(input);
    expect(out.generatedBy).toBe('lucie-7b');
    expect(createDraftReport).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedBy: 'lucie-7b',
        generationError: undefined,
      }),
    );
  });

  it('bascule sur le squelette quand Lucie échoue, et trace la raison', async () => {
    generateWithLucie.mockResolvedValueOnce(null);
    const out = await runGeneration(input);
    expect(out.generatedBy).toBe('squelette');
    expect(createDraftReport).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedBy: 'squelette',
        generationError: expect.stringContaining('indisponible'),
      }),
    );
  });

  it('crée un rapport dans les deux cas', async () => {
    generateWithLucie.mockResolvedValueOnce(null);
    expect((await runGeneration(input)).reportId).toBe('7');
  });
});
```

- [ ] **Step 2 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- generate-job`
Expected: FAIL, module introuvable.

- [ ] **Step 3 : implémenter `lib/audit-report/jobs.ts`**

```ts
import type { QuizAnswers } from '@/lib/audit-ia/quiz';
import { generateWithLucie } from './lucie';
import { buildSkeletonReport } from './skeleton';
import { createDraftReport } from './store-server';
import type { AuditReportInput } from './types';

/**
 * Orchestration de la génération de rapport.
 *
 * Exécutée hors du cycle de la requête HTTP : le prospect reçoit son 202
 * immédiatement, sans attendre un modèle qui met plusieurs dizaines de
 * secondes sur CPU. Deux tentatives sont assurées par la file Payload
 * (`retries: 2`) ; au-delà, le squelette prend le relais et le rapport
 * existe quand même.
 */

export interface GenerationInput extends AuditReportInput {
  leadId: number | string;
}

export async function runGeneration(
  input: GenerationInput,
): Promise<{ reportId: string | null; generatedBy: 'lucie-7b' | 'squelette' }> {
  const fromLucie = await generateWithLucie(input);
  const sections = fromLucie ?? buildSkeletonReport(input);
  const generatedBy = fromLucie ? 'lucie-7b' : 'squelette';

  const reportId = await createDraftReport({
    leadId: input.leadId,
    title: sections.title,
    sections,
    generatedBy,
    generationError: fromLucie
      ? undefined
      : 'Génération Lucie indisponible ou réponse inexploitable : squelette de repli utilisé, contenu à rédiger.',
  });

  return { reportId, generatedBy };
}

/** Définition de tâche pour la file Payload. */
export const generateAuditReportTask = {
  slug: 'generateAuditReport',
  retries: 2,
  inputSchema: [
    { name: 'leadId', type: 'text', required: true },
    { name: 'organization', type: 'text' },
    { name: 'jobTitle', type: 'text' },
    { name: 'answers', type: 'json' },
  ],
  handler: async ({ input }: { input: Record<string, unknown> }) => {
    const { reportId, generatedBy } = await runGeneration({
      leadId: String(input.leadId),
      organization: String(input.organization ?? ''),
      jobTitle: String(input.jobTitle ?? ''),
      answers: (input.answers ?? {}) as QuizAnswers,
    });

    if (!reportId) {
      throw new Error(
        'Création du rapport impossible : voir les logs de persistance.',
      );
    }

    const { sendReportReviewAlert } = await import('@/lib/email');
    await sendReportReviewAlert({
      reportId,
      organization: String(input.organization ?? 'organisation non précisée'),
    });

    return { output: { reportId, generatedBy } };
  },
} as const;
```

- [ ] **Step 4 : vérifier que les tests passent**

Run: `pnpm test -- generate-job`
Expected: PASS, 3 tests.

- [ ] **Step 5 : écrire l'email d'alerte**

Dans `lib/email.ts`, après `sendLeadNotification`, en réutilisant `readConfig`, `shell`, `row`, `esc`, `send` déjà importés :

```ts
export interface ReportReviewAlertInput {
  reportId: string;
  organization: string;
  aiScore?: number;
  /** true à partir de 24 h sans validation : objet distinct, ton plus direct. */
  overdue?: boolean;
}

/**
 * Alerte l'équipe qu'un brouillon de rapport attend sa relecture.
 * Premier des trois signaux prévus (email, compteur admin, relance) : il
 * est le seul à dépendre d'un transport externe, d'où les deux autres.
 */
export async function sendReportReviewAlert(
  input: ReportReviewAlertInput,
): Promise<SendEmailResult> {
  const cfg = readConfig();
  if (!cfg) return { ok: false, skipped: true };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://openlabconsulting.com';
  const adminUrl = `${siteUrl}/admin/collections/audit-reports/${input.reportId}`;
  const subject = input.overdue
    ? `Échéance dépassée : rapport d’audit à valider (${input.organization})`
    : `Rapport d’audit à valider : ${input.organization}`;

  const inner = `
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">${
    input.overdue
      ? 'Ce rapport attend une validation depuis plus de 24 heures. Le prospect a reçu la promesse d’un rapport sous 24 h ouvrées.'
      : 'Un brouillon de rapport d’audit vient d’être généré et attend votre relecture.'
  }</p>
<table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
${row('Organisation', esc(input.organization))}
${typeof input.aiScore === 'number' ? row('Score IA', `${input.aiScore} / 100`) : ''}
</table>
<a href="${adminUrl}" style="display:inline-block;background:#ff5a00;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">Relire et valider</a>`;

  return send(cfg, {
    to: cfg.team,
    replyTo: cfg.team,
    subject,
    html: shell(subject, inner),
    text: `${subject}\n\nOrganisation : ${input.organization}\n\nRelire et valider : ${adminUrl}`,
  });
}
```

Test associé, `tests/unit/lib/email-report-alert.test.ts` :

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('sendReportReviewAlert', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.ZEPTOMAIL_TOKEN;
  });

  it('est neutre quand ZeptoMail n’est pas configuré', async () => {
    const { sendReportReviewAlert } = await import('@/lib/email');
    expect(
      await sendReportReviewAlert({ reportId: '42', organization: 'Banque X' }),
    ).toEqual({
      ok: false,
      skipped: true,
    });
  });

  it('distingue l’objet quand l’échéance est dépassée', async () => {
    Object.assign(process.env, {
      ZEPTOMAIL_TOKEN: 'token-de-test',
      EMAIL_FROM: 'noreply@openlabconsulting.com',
      EMAIL_TEAM: 'waopron@openlabconsulting.com',
    });
    const sent: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        sent.push(String(init.body));
        return new Response(JSON.stringify({ data: [] }), { status: 201 });
      }),
    );

    const { sendReportReviewAlert } = await import('@/lib/email');
    await sendReportReviewAlert({ reportId: '42', organization: 'Banque X' });
    await sendReportReviewAlert({
      reportId: '42',
      organization: 'Banque X',
      overdue: true,
    });

    expect(sent[0]).toContain('Rapport d');
    expect(sent[1]).toContain('chéance dépassée');
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 6 : activer la file dans `payload.config.ts`**

Ajouter, au même niveau que `collections` :

```ts
  jobs: {
    tasks: [generateAuditReportTask, remindPendingReportsTask],
    // Exécution automatique côté serveur : la file tourne sur les cinq
    // répliques, le verrouillage des tâches est assuré par la base.
    autoRun: [{ cron: '* * * * *', queue: 'default', limit: 3 }],
    shouldAutoRun: async (): Promise<boolean> =>
      process.env.PAYLOAD_DISABLE_JOBS !== 'true',
  },
```

`remindPendingReportsTask` arrive en tâche 9 : jusque-là, ne référencer que `generateAuditReportTask`.

Si la signature de `jobs` diffère dans la version installée, vérifier avec `pnpm why payload` puis lire `node_modules/payload/dist/queues/config/types` plutôt que de deviner.

- [ ] **Step 7 : mettre la génération en file depuis la route**

Dans `app/api/audit-ia/route.ts`, après `persistLead` et avant les emails :

```ts
// Mise en file de la génération de rapport (hors requête HTTP : le
// modèle met plusieurs dizaines de secondes). Fail-soft : une file
// indisponible ne doit jamais faire échouer une soumission de lead.
await queueReportGeneration({
  leadId: lead.leadId,
  organization: parsed.data.organization,
  jobTitle: parsed.data.jobTitle,
  answers: {
    maturity: parsed.data.maturity,
    headcount: parsed.data.headcount,
    challenge: parsed.data.challenge || undefined,
  },
});
```

`persistLead` doit désormais renvoyer aussi l'identifiant créé. Modifier son retour en `{ score: number; summary: string; leadId: string | null }` et adapter les appels existants dans les quatre routes ainsi que `tests/unit/lib/leads-payload.test.ts`.

`queueReportGeneration` vit dans `lib/audit-report/store-server.ts` :

```ts
export async function queueReportGeneration(input: {
  leadId: string | null;
  organization?: string | null;
  jobTitle?: string | null;
  answers: Record<string, unknown>;
}): Promise<void> {
  if (!input.leadId) return;
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    await payload.jobs.queue({
      task: 'generateAuditReport',
      input: {
        leadId: input.leadId,
        organization: input.organization ?? '',
        jobTitle: input.jobTitle ?? '',
        answers: input.answers,
      },
    });
  } catch (err) {
    console.error(
      '[audit-report] mise en file impossible:',
      (err as Error).message,
    );
  }
}
```

- [ ] **Step 8 : vérifier la non-régression**

Run: `pnpm test`
Expected: PASS, tous les tests, y compris les quatre routes lead adaptées au nouveau retour de `persistLead`.

- [ ] **Step 9 : commit**

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
git add lib/audit-report/ lib/email.ts payload.config.ts app/api/ tests/
git commit -m "feat(audit-report): file de génération, repli squelette et alerte équipe"
```

---

### Task 7 : rendu PDF

**Files:**

- Create: `lib/audit-report/pdf.tsx`
- Modify: `package.json` (dépendance `@react-pdf/renderer`)
- Test: `tests/unit/lib/audit-report/pdf.test.ts`

**Interfaces:**

- Consomme : `AuditReportSections`.
- Produit : `renderReportPdf(args: { sections: AuditReportSections; organization: string; generatedOn: Date }): Promise<Buffer>`

- [ ] **Step 1 : installer la dépendance**

```bash
pnpm add @react-pdf/renderer
```

Choisi plutôt qu'un rendu par navigateur sans tête : aucun Chromium à embarquer dans une image distroless.

- [ ] **Step 2 : écrire le test**

```ts
import { describe, expect, it } from 'vitest';
import { renderReportPdf } from '@/lib/audit-report/pdf';

const sections = {
  title: 'Audit IA : Banque X',
  synthesis: 'Synthèse du rapport.',
  situation: 'Situation constatée.',
  recommendation: 'Recommandation retenue.',
  roadmap: [
    { title: 'Cadrage', horizon: 'Semaines 1 à 2', body: 'Entretiens.' },
  ],
  nextSteps: 'Contact sous 24 h ouvrées.',
};

describe('renderReportPdf', () => {
  it('produit un PDF valide', async () => {
    const buf = await renderReportPdf({
      sections,
      organization: 'Banque X',
      generatedOn: new Date('2026-07-30T10:00:00Z'),
    });
    expect(buf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(buf.length).toBeGreaterThan(2000);
  }, 30_000);
});
```

- [ ] **Step 3 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- pdf`
Expected: FAIL, module introuvable.

- [ ] **Step 4 : implémenter le rendu**

```tsx
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import type { AuditReportSections } from './types';

/**
 * Rendu PDF du rapport d'audit. Mise en page sobre, marque OpenLab,
 * polices système pour éviter d'embarquer des fichiers dans l'image.
 * L'orange reste un accent : jamais de grande surface pleine.
 */

const NIGHT = '#1a1d24';
const GRAPHITE = '#5b6170';
const ORANGE = '#d94800';

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 11,
    color: NIGHT,
    lineHeight: 1.55,
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 1.6,
    color: ORANGE,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: { fontSize: 22, marginBottom: 6 },
  meta: { fontSize: 9, color: GRAPHITE, marginBottom: 28 },
  h2: { fontSize: 13, marginTop: 22, marginBottom: 8, color: NIGHT },
  rule: {
    borderTopWidth: 2,
    borderTopColor: ORANGE,
    width: 44,
    marginBottom: 14,
  },
  paragraph: { marginBottom: 10, textAlign: 'justify' },
  stepTitle: { fontSize: 11, marginBottom: 2 },
  stepHorizon: {
    fontSize: 8,
    color: ORANGE,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  step: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#e3e5ea',
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    fontSize: 8,
    color: GRAPHITE,
    borderTopWidth: 1,
    borderTopColor: '#e3e5ea',
    paddingTop: 8,
  },
});

function paragraphs(text: string): ReactElement[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => (
      <Text key={i} style={styles.paragraph}>
        {line}
      </Text>
    ));
}

export async function renderReportPdf(args: {
  sections: AuditReportSections;
  organization: string;
  generatedOn: Date;
}): Promise<Buffer> {
  const { sections, organization, generatedOn } = args;
  const date = generatedOn.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const doc = (
    <Document title={sections.title} author="OpenLab Consulting">
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>OpenLab Consulting · Audit IA</Text>
        <Text style={styles.title}>{sections.title}</Text>
        <Text style={styles.meta}>
          {organization} · {date}
        </Text>

        <Text style={styles.h2}>Synthèse</Text>
        <View style={styles.rule} />
        {paragraphs(sections.synthesis)}

        <Text style={styles.h2}>Votre situation</Text>
        <View style={styles.rule} />
        {paragraphs(sections.situation)}

        <Text style={styles.h2}>Ce que nous recommandons</Text>
        <View style={styles.rule} />
        {paragraphs(sections.recommendation)}

        <Text style={styles.h2}>Feuille de route</Text>
        <View style={styles.rule} />
        {sections.roadmap.map((step, i) => (
          <View key={i} style={styles.step}>
            <Text style={styles.stepHorizon}>{step.horizon}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text>{step.body}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Prochaines étapes</Text>
        <View style={styles.rule} />
        {paragraphs(sections.nextSteps)}

        <Text style={styles.footer} fixed>
          OpenLab Consulting SARL · RCCM CI-ABJ-03-2022-B13-03239 · Abidjan,
          Cocody, Riviera Faya Lauriers 8 · infos@openlabconsulting.com
        </Text>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
```

- [ ] **Step 5 : vérifier que le test passe**

Run: `pnpm test -- pdf`
Expected: PASS

- [ ] **Step 6 : vérifier que le build standalone embarque bien la dépendance**

Run: `pnpm build`
Expected: build OK. Vérifier ensuite que `@react-pdf/renderer` est bien tracé : `ls .next/standalone/node_modules | grep react-pdf`. Si absent, l'ajouter à `serverExternalPackages` dans `next.config.ts`. Ce piège a déjà coûté une CVE non corrigée en production avec `sharp` : ce qui vit dans l'image et ce que déclare `package.json` doivent concorder.

- [ ] **Step 7 : commit**

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
git add package.json pnpm-lock.yaml lib/audit-report/pdf.tsx tests/unit/lib/audit-report/pdf.test.ts
git commit -m "feat(audit-report): rendu PDF de marque"
```

---

### Task 8 : lien signé et route de téléchargement

**Files:**

- Create: `lib/audit-report/link.ts`
- Create: `app/audit-ia/rapport/[token]/route.ts`
- Modify: `lib/rate-limit.ts` (entrée `reportDownload`)
- Test: `tests/unit/lib/audit-report/link.test.ts`, `tests/unit/security/report-download-route.test.ts`

**Interfaces:**

- Consomme : `getReportPdf` de `./store-server`.
- Produit :
  - `signReportToken(reportId: string, ttlDays?: number): string`
  - `verifyReportToken(token: string): { reportId: string } | { error: 'expired' | 'invalid' }`

- [ ] **Step 1 : écrire les tests du jeton**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signReportToken, verifyReportToken } from '@/lib/audit-report/link';

beforeEach(() => {
  Object.assign(process.env, {
    PAYLOAD_SECRET: 'secret-de-test-suffisamment-long',
  });
});

describe('jeton de téléchargement', () => {
  it('accepte un jeton fraîchement signé', () => {
    expect(verifyReportToken(signReportToken('42'))).toEqual({
      reportId: '42',
    });
  });

  it('refuse un jeton expiré', () => {
    vi.useFakeTimers();
    const token = signReportToken('42', 1);
    vi.advanceTimersByTime(2 * 24 * 60 * 60 * 1000);
    expect(verifyReportToken(token)).toEqual({ error: 'expired' });
    vi.useRealTimers();
  });

  it('refuse une signature falsifiée', () => {
    const token = signReportToken('42');
    const [payload] = token.split('.');
    expect(verifyReportToken(`${payload}.0000`)).toEqual({ error: 'invalid' });
  });

  it('refuse un jeton dont la charge a été modifiée', () => {
    const forged = Buffer.from(
      JSON.stringify({ r: '99', e: Date.now() + 10_000 }),
    ).toString('base64url');
    const sig = signReportToken('42').split('.')[1];
    expect(verifyReportToken(`${forged}.${sig}`)).toEqual({ error: 'invalid' });
  });

  it('refuse une entrée qui n’est pas un jeton', () => {
    expect(verifyReportToken('n-importe-quoi')).toEqual({ error: 'invalid' });
  });
});
```

- [ ] **Step 2 : lancer les tests et vérifier qu'ils échouent**

Run: `pnpm test -- link`
Expected: FAIL, module introuvable.

- [ ] **Step 3 : implémenter `lib/audit-report/link.ts`**

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Jeton de téléchargement du rapport : HMAC-SHA256 sur { reportId, exp },
 * signé avec PAYLOAD_SECRET.
 *
 * Pourquoi pas une URL publique imprévisible : un rapport nominatif
 * transféré, historisé ou indexé resterait accessible indéfiniment. Ici le
 * lien expire, et repasser le rapport hors du statut « envoyé » le révoque.
 */

const DEFAULT_TTL_DAYS = 30;

interface TokenPayload {
  /** identifiant du rapport */
  r: string;
  /** expiration, en millisecondes epoch */
  e: number;
}

function secret(): string {
  const value = process.env.PAYLOAD_SECRET;
  if (!value)
    throw new Error(
      'PAYLOAD_SECRET manquant : impossible de signer un lien de rapport.',
    );
  return value;
}

function sign(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

export function signReportToken(
  reportId: string,
  ttlDays = DEFAULT_TTL_DAYS,
): string {
  const payload: TokenPayload = {
    r: reportId,
    e: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifyReportToken(
  token: string,
): { reportId: string } | { error: 'expired' | 'invalid' } {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return { error: 'invalid' };

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    return { error: 'invalid' };

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString(),
    ) as TokenPayload;
    if (typeof payload.r !== 'string' || typeof payload.e !== 'number')
      return { error: 'invalid' };
    if (payload.e < Date.now()) return { error: 'expired' };
    return { reportId: payload.r };
  } catch {
    return { error: 'invalid' };
  }
}
```

- [ ] **Step 4 : vérifier que les tests passent**

Run: `pnpm test -- link`
Expected: PASS, 5 tests.

- [ ] **Step 5 : ajouter la limite de débit**

Dans `lib/rate-limit.ts`, dans `RATE_LIMITS` :

```ts
  reportDownload: { limit: 30, windowSec: 60 * 60 }, // 30 / 1 h / IP (anti-balayage de jetons)
```

- [ ] **Step 6 : écrire le test de la route**

```ts
import { describe, expect, it, vi } from 'vitest';
import { __resetMemoryStore } from '@/lib/rate-limit';

const findByID = vi.fn();
const update = vi.fn(async () => ({}));
vi.mock('@/lib/audit-report/store-server', () => ({
  getReportPdf: vi.fn(async () => Buffer.from('%PDF-1.7 fake')),
  findReportForDownload: findByID,
  incrementDownloadCount: update,
}));

const { GET } = await import('@/app/audit-ia/rapport/[token]/route');
const { signReportToken } = await import('@/lib/audit-report/link');

function req(token: string): Request {
  return new Request(`http://localhost:3000/audit-ia/rapport/${token}`, {
    headers: {
      'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 254) + 1}`,
    },
  });
}

describe('GET /audit-ia/rapport/[token]', () => {
  it('sert le PDF pour un rapport envoyé', async () => {
    __resetMemoryStore();
    Object.assign(process.env, {
      PAYLOAD_SECRET: 'secret-de-test-suffisamment-long',
    });
    findByID.mockResolvedValueOnce({
      id: '42',
      status: 'envoye',
      pdfKey: 'audit-reports/42.pdf',
    });
    const token = signReportToken('42');
    const res = await GET(req(token), { params: Promise.resolve({ token }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('x-robots-tag')).toContain('noindex');
    expect(update).toHaveBeenCalled();
  });

  it('renvoie 403 sur signature invalide', async () => {
    __resetMemoryStore();
    const res = await GET(req('faux.jeton'), {
      params: Promise.resolve({ token: 'faux.jeton' }),
    });
    expect(res.status).toBe(403);
  });

  it('renvoie 404 si le rapport n’est pas au statut envoyé', async () => {
    __resetMemoryStore();
    findByID.mockResolvedValueOnce({
      id: '42',
      status: 'brouillon-ia',
      pdfKey: 'audit-reports/42.pdf',
    });
    const token = signReportToken('42');
    const res = await GET(req(token), { params: Promise.resolve({ token }) });
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 7 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- report-download-route`
Expected: FAIL, route introuvable.

- [ ] **Step 8 : implémenter la route et ses deux helpers**

Ajouter dans `lib/audit-report/store-server.ts` :

```ts
export async function findReportForDownload(reportId: string): Promise<{
  id: string;
  status: string;
  pdfKey: string | null;
  downloadCount: number;
} | null> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const doc = (await payload.findByID({
      collection: 'audit-reports',
      id: reportId,
      overrideAccess: true,
      depth: 0,
    })) as {
      id: string | number;
      status: string;
      pdfKey?: string | null;
      downloadCount?: number | null;
    };
    return {
      id: String(doc.id),
      status: doc.status,
      pdfKey: doc.pdfKey ?? null,
      downloadCount: doc.downloadCount ?? 0,
    };
  } catch {
    return null;
  }
}

export async function incrementDownloadCount(
  reportId: string,
  current: number,
): Promise<void> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    await payload.update({
      collection: 'audit-reports',
      id: reportId,
      overrideAccess: true,
      data: { downloadCount: current + 1 },
    });
  } catch (err) {
    console.error(
      '[audit-report] compteur de téléchargement non incrémenté:',
      (err as Error).message,
    );
  }
}
```

Puis `app/audit-ia/rapport/[token]/route.ts` :

```ts
import { NextResponse } from 'next/server';
import { verifyReportToken } from '@/lib/audit-report/link';
import {
  findReportForDownload,
  getReportPdf,
  incrementDownloadCount,
} from '@/lib/audit-report/store-server';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { getRequestIp } from '@/lib/request-ip';

/**
 * Diffusion du rapport d'audit sous jeton signé.
 *
 * Cette route ne renvoie qu'un fichier : jamais de métadonnée, jamais de
 * liste, jamais de message distinguant « rapport inexistant » de « rapport
 * non encore envoyé » (OWASP A01, énumération).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const ip = getRequestIp(req);
  const rl = await rateLimit(
    `report-download:${ip}`,
    RATE_LIMITS.reportDownload,
  );
  if (!rl.ok)
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const { token } = await ctx.params;
  const verified = verifyReportToken(token);
  if ('error' in verified) {
    return NextResponse.json(
      { error: verified.error },
      { status: verified.error === 'expired' ? 410 : 403 },
    );
  }

  const report = await findReportForDownload(verified.reportId);
  if (!report || report.status !== 'envoye' || !report.pdfKey) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const pdf = await getReportPdf(report.pdfKey);
  if (!pdf) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await incrementDownloadCount(report.id, report.downloadCount);

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="audit-ia-openlab-${report.id}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  }) as NextResponse;
}
```

- [ ] **Step 9 : vérifier que les tests passent**

Run: `pnpm test -- report-download-route link`
Expected: PASS

- [ ] **Step 10 : exclure la route du sitemap et des robots**

Vérifier que `app/robots.ts` interdit `/audit-ia/rapport/` et que `app/sitemap.ts` ne l'énumère pas. Ajouter l'entrée `Disallow` si absente, et un test dans le fichier de tests existant du robots.

- [ ] **Step 11 : commit**

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
git add lib/audit-report/ app/audit-ia/ lib/rate-limit.ts app/robots.ts tests/
git commit -m "feat(audit-report): lien signé et route de téléchargement durcie"
```

---

### Task 9 : relance à 12 h et échéance à 24 h

**Files:**

- Modify: `lib/audit-report/jobs.ts`
- Modify: `payload.config.ts` (ajout de la tâche à la file)
- Test: `tests/unit/lib/audit-report/remind-job.test.ts`

**Interfaces:**

- Consomme : `sendReportReviewAlert` de `lib/email.ts`.
- Produit :
  - `selectReportsToRemind(now: Date, reports: PendingReport[]): { report: PendingReport; overdue: boolean }[]`
  - `remindPendingReportsTask` : tâche Payload, slug `remindPendingReports`.
  - `interface PendingReport { id: string; organization: string; createdAt: string; remindedAt: string | null }`

- [ ] **Step 1 : écrire le test**

```ts
import { describe, expect, it } from 'vitest';
import { selectReportsToRemind } from '@/lib/audit-report/jobs';

const now = new Date('2026-07-30T12:00:00Z');
const at = (hoursAgo: number): string =>
  new Date(now.getTime() - hoursAgo * 3600_000).toISOString();

describe('selectReportsToRemind', () => {
  it('ignore un rapport de moins de 12 h', () => {
    expect(
      selectReportsToRemind(now, [
        { id: '1', organization: 'A', createdAt: at(6), remindedAt: null },
      ]),
    ).toEqual([]);
  });

  it('relance un rapport de plus de 12 h jamais relancé', () => {
    const out = selectReportsToRemind(now, [
      { id: '1', organization: 'A', createdAt: at(13), remindedAt: null },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]?.overdue).toBe(false);
  });

  it('marque le dépassement au-delà de 24 h', () => {
    const out = selectReportsToRemind(now, [
      { id: '1', organization: 'A', createdAt: at(30), remindedAt: at(20) },
    ]);
    expect(out[0]?.overdue).toBe(true);
  });

  it('ne relance pas deux fois dans la même journée', () => {
    expect(
      selectReportsToRemind(now, [
        { id: '1', organization: 'A', createdAt: at(30), remindedAt: at(2) },
      ]),
    ).toEqual([]);
  });
});
```

- [ ] **Step 2 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- remind-job`
Expected: FAIL, `selectReportsToRemind` n'est pas exporté.

- [ ] **Step 3 : implémenter la sélection puis la tâche**

Dans `lib/audit-report/jobs.ts` :

```ts
export interface PendingReport {
  id: string;
  organization: string;
  createdAt: string;
  remindedAt: string | null;
}

const FIRST_REMINDER_H = 12;
const DEADLINE_H = 24;
const MIN_GAP_H = 20;

/**
 * Sélectionne les rapports à relancer. Fonction pure : la lecture en base
 * reste dans la tâche, la règle métier se teste sans Payload.
 *
 * Règle : première relance à 12 h (mi-parcours de la promesse de 24 h),
 * puis rappel au plus une fois par jour, avec un objet distinct passé
 * l'échéance.
 */
export function selectReportsToRemind(
  now: Date,
  reports: PendingReport[],
): { report: PendingReport; overdue: boolean }[] {
  const hoursSince = (iso: string): number =>
    (now.getTime() - new Date(iso).getTime()) / 3600_000;

  return reports
    .filter((r) => hoursSince(r.createdAt) >= FIRST_REMINDER_H)
    .filter(
      (r) => r.remindedAt === null || hoursSince(r.remindedAt) >= MIN_GAP_H,
    )
    .map((r) => ({
      report: r,
      overdue: hoursSince(r.createdAt) >= DEADLINE_H,
    }));
}

export const remindPendingReportsTask = {
  slug: 'remindPendingReports',
  retries: 1,
  handler: async (): Promise<{ output: { reminded: number } }> => {
    const { listPendingReports, markReminded } = await import('./store-server');
    const { sendReportReviewAlert } = await import('@/lib/email');

    const pending = await listPendingReports();
    const due = selectReportsToRemind(new Date(), pending);

    for (const { report, overdue } of due) {
      await sendReportReviewAlert({
        reportId: report.id,
        organization: report.organization,
        overdue,
      });
      await markReminded(report.id);
    }

    return { output: { reminded: due.length } };
  },
} as const;
```

Puis, dans `lib/audit-report/store-server.ts` :

```ts
export async function listPendingReports(): Promise<
  {
    id: string;
    organization: string;
    createdAt: string;
    remindedAt: string | null;
  }[]
> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const res = (await payload.find({
      collection: 'audit-reports',
      overrideAccess: true,
      depth: 1,
      limit: 100,
      where: {
        status: { in: ['brouillon-ia', 'en-revue', 'echec-generation'] },
      },
    })) as {
      docs: {
        id: string | number;
        createdAt: string;
        remindedAt?: string | null;
        lead?: { organization?: string | null } | number | string;
      }[];
    };

    return res.docs.map((d) => ({
      id: String(d.id),
      organization:
        typeof d.lead === 'object' && d.lead
          ? (d.lead.organization ?? 'organisation non précisée')
          : 'organisation non précisée',
      createdAt: d.createdAt,
      remindedAt: d.remindedAt ?? null,
    }));
  } catch (err) {
    console.error(
      '[audit-report] lecture des rapports en attente impossible:',
      (err as Error).message,
    );
    return [];
  }
}

export async function markReminded(reportId: string): Promise<void> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    await payload.update({
      collection: 'audit-reports',
      id: reportId,
      overrideAccess: true,
      data: { remindedAt: new Date().toISOString() },
    });
  } catch (err) {
    console.error(
      '[audit-report] horodatage de relance impossible:',
      (err as Error).message,
    );
  }
}
```

- [ ] **Step 4 : brancher la tâche sur une exécution horaire**

Dans `payload.config.ts`, compléter `jobs.tasks` avec `remindPendingReportsTask` et ajouter une seconde entrée d'exécution automatique :

```ts
    autoRun: [
      { cron: '* * * * *', queue: 'default', limit: 3 },
      { cron: '0 * * * *', queue: 'reminders', limit: 1 },
    ],
```

La tâche de relance est mise en file sur la queue `reminders` par un `payload.jobs.queue({ task: 'remindPendingReports', queue: 'reminders' })` appelé au démarrage de cette même exécution horaire.

- [ ] **Step 5 : vérifier que les tests passent**

Run: `pnpm test -- remind-job`
Expected: PASS, 4 tests.

- [ ] **Step 6 : commit**

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
git add lib/audit-report/ payload.config.ts tests/
git commit -m "feat(audit-report): relance à 12 h et alerte d’échéance à 24 h"
```

---

### Task 10 : validation dans l'admin et envoi au prospect

**Files:**

- Create: `components/admin/ValidateReportButton.tsx`
- Create: `app/api/audit-report/validate/route.ts`
- Modify: `lib/email.ts` (fonction `sendReportDelivery`)
- Modify: `lib/audit-report/store-server.ts` (`markReportSent`)
- Test: `tests/unit/security/report-validate-route.test.ts`

**Interfaces:**

- Consomme : `renderReportPdf`, `putReportPdf`, `signReportToken`, `findReportForDownload`.
- Produit :
  - `POST /api/audit-report/validate` : corps `{ reportId: string }`, exige un utilisateur Payload authentifié de rôle `super-admin`, `admin` ou `editor-chief`.
  - `sendReportDelivery(input: { name: string; email: string; organization: string; downloadUrl: string }): Promise<SendEmailResult>`

- [ ] **Step 1 : écrire le test de la route**

```ts
import { describe, expect, it, vi } from 'vitest';

const auth = vi.fn();
vi.mock('payload', () => ({
  getPayload: async () => ({
    auth,
    findByID: async () => ({
      id: '42',
      status: 'brouillon-ia',
      sections: {
        synthesis: 'S',
        situation: 'Si',
        recommendation: 'R',
        roadmap: [{ title: 'a', horizon: 'b', body: 'c' }],
        nextSteps: 'N',
      },
      title: 'Audit IA : Banque X',
      lead: {
        name: 'Debora',
        email: 'debora@example.ci',
        organization: 'Banque X',
      },
    }),
    update: async () => ({}),
  }),
}));
vi.mock('@/lib/audit-report/pdf', () => ({
  renderReportPdf: async () => Buffer.from('%PDF-'),
}));
vi.mock('@/lib/audit-report/store-server', () => ({
  putReportPdf: async () => 'audit-reports/42.pdf',
  markReportSent: async () => undefined,
}));
const sendReportDelivery = vi.fn(async () => ({ ok: true }));
vi.mock('@/lib/email', () => ({ sendReportDelivery }));

const { POST } = await import('@/app/api/audit-report/validate/route');

function req(): Request {
  return new Request('http://localhost:3000/api/audit-report/validate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reportId: '42' }),
  });
}

describe('POST /api/audit-report/validate', () => {
  it('refuse un appel anonyme', async () => {
    auth.mockResolvedValueOnce({ user: null });
    expect((await POST(req())).status).toBe(401);
  });

  it('refuse un rôle sans droit', async () => {
    auth.mockResolvedValueOnce({ user: { role: 'author' } });
    expect((await POST(req())).status).toBe(403);
  });

  it('génère, dépose et envoie pour un admin', async () => {
    Object.assign(process.env, {
      PAYLOAD_SECRET: 'secret-de-test-suffisamment-long',
    });
    auth.mockResolvedValueOnce({ user: { id: 1, role: 'admin' } });
    const res = await POST(req());
    expect(res.status).toBe(200);
    expect(sendReportDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'debora@example.ci',
        downloadUrl: expect.stringContaining('/audit-ia/rapport/'),
      }),
    );
  });
});
```

- [ ] **Step 2 : lancer le test et vérifier qu'il échoue**

Run: `pnpm test -- report-validate-route`
Expected: FAIL, route introuvable.

- [ ] **Step 3 : implémenter la route**

```ts
import { NextResponse } from 'next/server';
import { signReportToken } from '@/lib/audit-report/link';
import { renderReportPdf } from '@/lib/audit-report/pdf';
import { markReportSent, putReportPdf } from '@/lib/audit-report/store-server';
import { sendReportDelivery } from '@/lib/email';

/**
 * Validation d'un rapport puis envoi au prospect.
 *
 * Déclenchée depuis le bouton du back-office. L'authentification est celle
 * de Payload (cookie de session) et le rôle est vérifié côté serveur :
 * un bouton masqué dans l'interface ne protège rien (OWASP A01).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = new Set(['super-admin', 'admin', 'editor-chief']);

export async function POST(req: Request): Promise<NextResponse> {
  const { getPayload } = await import('payload');
  const config = (await import('@payload-config')).default;
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: req.headers });
  if (!user)
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!ALLOWED_ROLES.has((user as { role?: string }).role ?? '')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: { reportId?: unknown };
  try {
    body = (await req.json()) as { reportId?: unknown };
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (typeof body.reportId !== 'string') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const report = (await payload.findByID({
    collection: 'audit-reports',
    id: body.reportId,
    overrideAccess: true,
    depth: 1,
  })) as {
    id: string | number;
    title: string;
    sections: Parameters<typeof renderReportPdf>[0]['sections'];
    lead:
      | { name?: string; email?: string; organization?: string }
      | number
      | string;
  };

  const lead =
    typeof report.lead === 'object' && report.lead ? report.lead : null;
  if (!lead?.email) {
    return NextResponse.json({ error: 'lead_sans_email' }, { status: 409 });
  }

  const organization = lead.organization ?? 'votre organisation';
  const pdf = await renderReportPdf({
    sections: { ...report.sections, title: report.title },
    organization,
    generatedOn: new Date(),
  });
  const pdfKey = await putReportPdf(String(report.id), pdf);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://openlabconsulting.com';
  const downloadUrl = `${siteUrl}/audit-ia/rapport/${signReportToken(String(report.id))}`;

  const delivery = await sendReportDelivery({
    name: lead.name ?? 'Bonjour',
    email: lead.email,
    organization,
    downloadUrl,
  });

  await markReportSent(String(report.id), {
    pdfKey,
    validatedBy: (user as { id: number | string }).id,
  });

  return NextResponse.json(
    { ok: true, emailSent: delivery.ok, downloadUrl },
    { status: 200 },
  );
}
```

- [ ] **Step 4 : implémenter `markReportSent` et l'email de livraison**

Dans `lib/audit-report/store-server.ts` :

```ts
export async function markReportSent(
  reportId: string,
  args: { pdfKey: string; validatedBy: number | string },
): Promise<void> {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const now = new Date().toISOString();
    await payload.update({
      collection: 'audit-reports',
      id: reportId,
      overrideAccess: true,
      data: {
        status: 'envoye',
        pdfKey: args.pdfKey,
        validatedBy: args.validatedBy,
        validatedAt: now,
        sentAt: now,
      },
    });
  } catch (err) {
    console.error(
      '[audit-report] statut d’envoi non enregistré:',
      (err as Error).message,
    );
  }
}
```

Dans `lib/email.ts` :

```ts
export interface ReportDeliveryInput {
  name: string;
  email: string;
  organization: string;
  downloadUrl: string;
}

/**
 * Livre le rapport d'audit au prospect. Le PDF n'est pas joint : il est
 * servi par une route sous jeton signé, ce qui permet de faire expirer le
 * lien et de le révoquer.
 */
export async function sendReportDelivery(
  input: ReportDeliveryInput,
): Promise<SendEmailResult> {
  const cfg = readConfig();
  if (!cfg) return { ok: false, skipped: true };

  const firstName = input.name.split(' ')[0] || input.name;
  const subject = `Votre rapport d’audit IA : ${input.organization}`;

  const inner = `
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">Bonjour ${esc(firstName)},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">Votre rapport d’audit IA est prêt. Il reprend votre contexte, le format d’intervention que nous recommandons et une feuille de route en quatre temps.</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#1a1d24;">Le lien ci-dessous reste valable 30 jours.</p>
<a href="${esc(input.downloadUrl)}" style="display:inline-block;background:#ff5a00;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">Télécharger mon rapport</a>
<p style="margin:24px 0 0;font-size:13px;color:#5b6170;">Une question sur son contenu ? Répondez simplement à cet email, il arrive directement chez le consultant qui a préparé votre dossier.</p>
<p style="margin:16px 0 0;font-size:13px;color:#5b6170;">L’équipe OpenLab Consulting</p>`;

  const text = `Bonjour ${firstName},

Votre rapport d'audit IA est prêt. Le lien ci-dessous reste valable 30 jours.

${input.downloadUrl}

Une question sur son contenu ? Répondez simplement à cet email.

L'équipe OpenLab Consulting`;

  return send(cfg, {
    to: { address: input.email, name: input.name },
    replyTo: cfg.team,
    subject,
    html: shell(subject, inner),
    text,
  });
}
```

- [ ] **Step 5 : implémenter le bouton d'admin**

`components/admin/ValidateReportButton.tsx`, sur le modèle de `components/admin/LeadReplyButton.tsx` :

```tsx
'use client';

import { useState, type ReactElement } from 'react';
import { useDocumentInfo } from '@payloadcms/ui';

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'done'; emailSent: boolean }
  | { kind: 'error'; message: string };

/**
 * Bouton « Valider et envoyer » du back-office.
 *
 * L'action réelle vit dans /api/audit-report/validate, qui revérifie
 * l'authentification et le rôle : masquer un bouton ne protège rien.
 */
export default function ValidateReportButton(): ReactElement | null {
  const { id } = useDocumentInfo();
  const [state, setState] = useState<State>({ kind: 'idle' });

  if (!id) return null;

  async function validate(): Promise<void> {
    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/audit-report/validate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: String(id) }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        emailSent?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setState({
          kind: 'error',
          message: data.error ?? `Erreur ${res.status}`,
        });
        return;
      }
      setState({ kind: 'done', emailSent: data.emailSent === true });
    } catch {
      setState({
        kind: 'error',
        message: 'Requête impossible. Vérifiez votre connexion.',
      });
    }
  }

  if (state.kind === 'done') {
    return (
      <p style={{ margin: '0 0 16px', fontSize: 13 }}>
        {state.emailSent
          ? 'Rapport envoyé au prospect. Le lien expire dans 30 jours.'
          : 'Rapport marqué comme envoyé, mais le transport email l’a refusé. Vérifiez la configuration ZeptoMail avant de prévenir le prospect.'}
      </p>
    );
  }

  return (
    <div style={{ margin: '0 0 16px' }}>
      <button
        type="button"
        className="btn btn--style-primary"
        disabled={state.kind === 'sending'}
        onClick={() => {
          if (
            window.confirm('Le rapport va être envoyé au prospect. Confirmer ?')
          )
            void validate();
        }}
      >
        {state.kind === 'sending' ? 'Envoi en cours…' : 'Valider et envoyer'}
      </button>
      {state.kind === 'error' ? (
        <p style={{ marginTop: 8, fontSize: 13, color: '#c0392b' }}>
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
```

Puis régénérer la carte d'imports : `pnpm cms:generate-importmap`.

- [ ] **Step 6 : afficher le compteur permanent dans le back-office**

Deuxième des trois signaux d'alerte, et le seul qui ne dépende d'aucun transport externe.

Créer `components/admin/PendingReportsBadge.tsx` :

```tsx
'use client';

import { useEffect, useState, type ReactElement } from 'react';

/**
 * Compteur des rapports en attente, affiché en permanence dans la
 * navigation de l'admin. Survit à une panne d'email : c'est précisément
 * son rôle.
 */
export default function PendingReportsBadge(): ReactElement | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      '/api/audit-reports?limit=0&depth=0&where[status][in]=brouillon-ia,en-revue,echec-generation',
      { credentials: 'include', signal: controller.signal },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { totalDocs?: number } | null) =>
        setCount(d?.totalDocs ?? null),
      )
      .catch(() => setCount(null));
    return () => controller.abort();
  }, []);

  if (!count) return null;

  return (
    <a
      href="/admin/collections/audit-reports?where[status][in]=brouillon-ia,en-revue,echec-generation"
      style={{
        display: 'block',
        margin: '0 0 12px',
        padding: '8px 12px',
        borderRadius: 6,
        background: '#ff5a00',
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      {count === 1 ? '1 rapport à valider' : `${count} rapports à valider`}
    </a>
  );
}
```

Le brancher dans `payload.config.ts`, dans le bloc `admin.components` existant :

```ts
      beforeNavLinks: ['/components/admin/PendingReportsBadge.tsx#default'],
```

Puis `pnpm cms:generate-importmap`.

- [ ] **Step 7 : vérifier que les tests passent**

Run: `pnpm test -- report-validate-route`
Expected: PASS, 3 tests.

- [ ] **Step 8 : commit**

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
git add components/admin/ValidateReportButton.tsx components/admin/PendingReportsBadge.tsx app/api/audit-report/ lib/email.ts lib/audit-report/store-server.ts payload.config.ts app/\(payload\)/admin/importMap.js tests/
git commit -m "feat(audit-report): validation dans l’admin, compteur permanent et envoi du lien"
```

---

### Task 11 : ouverture réseau, configuration et documentation

**Files:**

- Modify: `deploy/helm/openlab-website/templates/networkpolicy.yaml`
- Modify: `deploy/k8s/base/networkpolicy.yaml`
- Modify: `deploy/helm/openlab-website/values.yaml` et le ConfigMap correspondant
- Modify: `.env.example`, `docs/reference/infrastructure-deploy.md`, `docs/reference/admin-backoffice.md`

**Interfaces:**

- Consomme : les variables lues par `lucie.ts` et `store-server.ts`.
- Produit : accès réseau du site vers Ollama, bucket privé documenté.

- [ ] **Step 1 : ajouter la règle d'egress vers Ollama**

Dans les deux fichiers de NetworkPolicy, à la suite des règles existantes :

```yaml
# Ollama (Lucie-7B) : génération des rapports d'audit IA. Le service
# écoute sur l'IP du bridge CNI, dans une plage privée exclue de la
# règle 443 vers Internet. Règle nominative : une IP, un port.
- ports:
    - port: 11434
      protocol: TCP
  to:
    - ipBlock:
        cidr: 10.42.0.1/32
```

- [ ] **Step 2 : vérifier la règle sans redéployer l'application**

```bash
ssh root@62.238.11.20 "kubectl -n openlab get networkpolicy openlab-website -o yaml | grep -A4 11434"
```

Puis tester depuis un pod :

```bash
ssh root@62.238.11.20 "POD=\$(kubectl -n openlab get pods -o name | grep openlab-website- | head -1); kubectl -n openlab exec \${POD#pod/} -- node -e \"fetch('http://10.42.0.1:11434/api/tags').then(r=>console.log('HTTP',r.status)).catch(e=>console.log('ERR',e.message))\""
```

Expected: `HTTP 200`. Avant la règle, le même test renvoie `ERR fetch failed` : c'est le comportement constaté le 30/07.

- [ ] **Step 3 : déclarer les variables**

Dans `.env.example` et le ConfigMap :

```
OLLAMA_BASE_URL=http://10.42.0.1:11434
OLLAMA_MODEL=hf.co/OpenLLM-France/Lucie-7B-Instruct-v1.1-gguf:Q4_K_M
MINIO_REPORTS_BUCKET=openlab-audit-reports
```

- [ ] **Step 4 : créer le bucket privé en production**

```bash
ssh root@62.238.11.20 "kubectl -n openlab exec deploy/minio -- mc mb --ignore-existing local/openlab-audit-reports"
```

Ne poser aucune politique d'accès anonyme sur ce bucket.

- [ ] **Step 5 : documenter**

Ajouter dans `docs/reference/admin-backoffice.md` une section « Valider un rapport d'audit » décrivant le parcours consultant : où trouver les brouillons, ce qu'il faut relire en priorité quand `generatedBy` vaut `squelette`, l'effet du bouton d'envoi, et la révocation d'un lien en repassant le rapport hors du statut « envoyé ».

Ajouter dans `docs/reference/infrastructure-deploy.md` la règle d'egress et le bucket privé.

- [ ] **Step 6 : commit**

```bash
pnpm format:check
git add deploy/ .env.example docs/
git commit -m "chore(audit-report): egress Ollama, bucket privé et documentation"
```

---

### Task 12 : test de bout en bout

**Files:**

- Create: `tests/e2e/audit-ia.spec.ts`

**Interfaces:**

- Consomme : le parcours complet en environnement de test.
- Produit : couverture E2E du tunnel, écart n° 4 du rapport de vérification.

- [ ] **Step 1 : écrire le scénario**

```ts
import { expect, test } from '@playwright/test';

test.describe('parcours audit IA', () => {
  test('répond aux 6 questions et atteint le formulaire', async ({ page }) => {
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

    await page
      .getByRole('textbox')
      .fill('Nos rapprochements bancaires prennent 4 jours par mois.');
    await page.getByRole('button', { name: /voir ma recommandation/i }).click();

    await expect(page.getByTestId('audit-ia-recommendation')).toBeVisible();
    await page.getByTestId('audit-ia-continue-to-form').click();
    await expect(page.getByTestId('audit-ia-form')).toBeVisible();
  });
});
```

- [ ] **Step 2 : lancer le scénario**

Run: `pnpm test:e2e --grep "audit IA"`
Expected: PASS. La CI ne démarre aucun service : ne rien attendre de la base ni du modèle dans ce scénario, il s'arrête avant la soumission.

- [ ] **Step 3 : commit**

```bash
git add tests/e2e/audit-ia.spec.ts
git commit -m "test(audit-ia): parcours E2E du questionnaire jusqu’au formulaire"
```

---

## Vérification finale avant la PR

- [ ] `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test` : tout vert, aucun test existant cassé.
- [ ] `pnpm build` : réussi, First Load JS sous 150 kB.
- [ ] `pnpm test:e2e --grep "audit IA"` : vert.
- [ ] Aucun `TODO`, `any`, `console.log` introduit : `git diff develop --unified=0 | grep -nE "TODO|: any|console\.log"` ne renvoie rien.
- [ ] Aucun tiret cadratin dans le contenu visible : `git diff develop --unified=0 | grep "^+" | grep "—"` ne renvoie rien.
- [ ] Le global `AuditIaProcessSettings` de production est passé à 24 h dans `/admin`.
- [ ] Le compteur « rapports à valider » s'affiche dans la navigation de l'admin, et disparaît quand la liste est vide.
- [ ] La règle d'egress est en place et le test in-pod vers Ollama renvoie 200.
- [ ] Le bucket `openlab-audit-reports` existe et n'a aucune politique anonyme.

## Dépendance externe bloquante

L'envoi au prospect passe par ZeptoMail, dont le token est actuellement rejeté (`401 SERR_157 Invalid API Token`, vérifié le 30/07 depuis un pod de production sur les deux régions). La chaîne se construit, se teste et se valide sans lui : la génération, la relecture, le PDF et le lien signé sont vérifiables indépendamment. Mais tant que le token n'est pas remplacé dans le secret `openlab-website-secrets`, aucun email ne part : ni l'alerte à l'équipe, ni le rapport au prospect. Le compteur permanent dans le back-office est précisément là pour que cette panne ne rende plus le dispositif muet.
