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

/**
 * Normalise une chaîne produite par le modèle.
 *
 * Le prompt système interdit le tiret cadratin, mais une consigne n'est
 * pas une garantie : la sortie d'un modèle est une entrée non fiable et
 * ce texte finit dans un PDF envoyé à un prospect. On applique donc la
 * convention typographique du projet côté code, et on borne la longueur.
 */
function clean(value: string, maxLength: number): string {
  return value
    .replace(/\s*[—–]\s*/g, ', ')
    .trim()
    .slice(0, maxLength);
}

function parseSections(raw: string): AuditReportSections | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    const obj = JSON.parse(cleaned) as Partial<AuditReportSections>;
    // Reconstruction explicite de chaque étape : on ne laisse passer ni
    // propriété additionnelle inventée par le modèle, ni champ non borné.
    const roadmap = Array.isArray(obj.roadmap)
      ? obj.roadmap
          .filter(
            (s): s is AuditReportSections['roadmap'][number] =>
              typeof s?.title === 'string' &&
              typeof s?.horizon === 'string' &&
              typeof s?.body === 'string',
          )
          .map((s) => ({
            title: clean(s.title, 120),
            horizon: clean(s.horizon, 60),
            body: clean(s.body, 1500),
          }))
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
      title: clean(obj.title, 200),
      synthesis: clean(obj.synthesis, 3000),
      situation: clean(obj.situation, 3000),
      recommendation: clean(obj.recommendation, 5000),
      roadmap: roadmap.slice(0, 5),
      nextSteps: clean(obj.nextSteps, 2000),
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
