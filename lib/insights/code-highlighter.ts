import 'server-only';
import { createHighlighter, type Highlighter } from 'shiki';

/**
 * Coloration syntaxique des blocs de code des articles — server-only.
 *
 * Pourquoi Shiki côté serveur :
 *   - rendu dans un Server Component → ZÉRO JavaScript expédié au client
 *     (cohérent avec le budget bundle < 150 kB, CLAUDE.md §2.3) ;
 *   - qualité « meilleurs sites tech » (mêmes grammaires que VS Code).
 *
 * Sécurité (OWASP A03 — Injection / XSS) :
 *   Shiki échappe INTÉGRALEMENT le code source ; la sortie HTML ne
 *   contient que ses propres `<span>` de coloration (classes + styles
 *   inline du thème). Elle peut donc être injectée via
 *   `dangerouslySetInnerHTML` sans risque d'exécution de balise
 *   utilisateur. La langue provient d'un `select` fermé (bloc `Code`)
 *   et retombe sur `text` si elle n'est pas dans la liste chargée.
 *
 * Le highlighter est un singleton : le coût d'initialisation (chargement
 * des grammaires) est payé une seule fois par process.
 */

export const CODE_THEME = 'github-dark';

/** Grammaires chargées — jeu curé pour une publication IA/ML & dev. */
const LANGS = [
  'typescript',
  'tsx',
  'javascript',
  'jsx',
  'python',
  'bash',
  'json',
  'yaml',
  'sql',
  'docker',
  'go',
  'rust',
  'java',
  'csharp',
  'cpp',
  'html',
  'css',
  'markdown',
  'diff',
  'http',
] as const;

/**
 * Le bloc `Code` de Payload utilise les identifiants Monaco ; on les
 * mappe vers les identifiants Shiki quand ils diffèrent.
 */
const LANG_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  shell: 'bash',
  dockerfile: 'docker',
  yml: 'yaml',
  md: 'markdown',
  'c#': 'csharp',
  cs: 'csharp',
  'c++': 'cpp',
  plaintext: 'text',
  txt: 'text',
};

let highlighterPromise: Promise<Highlighter> | null = null;

function loadHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [CODE_THEME],
      langs: [...LANGS],
    });
  }
  return highlighterPromise;
}

/** Rend un extrait de code en HTML colorisé (déjà échappé par Shiki). */
export type CodeRenderer = (code: string, language?: string) => string;

/**
 * Construit le rendu de code colorisé. Asynchrone (init du highlighter),
 * mais renvoie une fonction SYNCHRONE — utilisable dans les converters
 * synchrones de `RichText`. À appeler une fois par rendu d'article.
 */
export async function createCodeRenderer(): Promise<CodeRenderer> {
  const highlighter = await loadHighlighter();
  const loaded = new Set(highlighter.getLoadedLanguages());
  return (code, language) => {
    const requested = (language ?? '').toLowerCase();
    const mapped = LANG_ALIASES[requested] ?? requested;
    const lang = mapped && loaded.has(mapped) ? mapped : 'text';
    return highlighter.codeToHtml(code, { lang, theme: CODE_THEME });
  };
}
