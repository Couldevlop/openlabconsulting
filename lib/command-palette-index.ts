/**
 * Index statique des routes publiques pour la Cmd+K palette
 * (audit P2 §7 #10 — différenciation forte Linear/Vercel/Anthropic).
 *
 * Avantages d'un index statique :
 *   - Aucun service externe (pas de Meilisearch dans la stack MVP).
 *   - Bundle ≈ 2 ko gzipped, filtre côté client.
 *   - Toutes les routes principales (~40) tiennent en RAM sans souci.
 *
 * Pour scaler à des centaines d'articles : remplacer par un endpoint
 * `/api/search` qui interroge Payload + Meilisearch (P11 prévu).
 */

export interface CommandEntry {
  readonly title: string;
  readonly href: string;
  /** Section pour le regroupement visuel et le filtre par catégorie. */
  readonly section:
    | 'Accueil'
    | 'Expertises'
    | 'Solutions'
    | 'Secteurs'
    | 'Laboratoire'
    | 'Livre IA'
    | 'Insights'
    | 'Institutionnel';
  /** Mots-clés cachés boostant la recherche (non affichés). */
  readonly keywords?: readonly string[];
  /** Icône caractère monogramme (sobre, sans dépendance Lucide ici). */
  readonly badge?: string;
}

export const COMMAND_INDEX: readonly CommandEntry[] = [
  // --- Accueil & hubs ---
  {
    title: 'Accueil',
    href: '/',
    section: 'Accueil',
    keywords: ['home', 'page', 'openlab'],
  },

  // --- Expertises ---
  {
    title: 'Expertises — vue d’ensemble',
    href: '/expertises',
    section: 'Expertises',
  },
  {
    title: 'Conseil & stratégie IA',
    href: '/expertises/conseil-strategie',
    section: 'Expertises',
    keywords: ['audit', 'conseil', 'strategie'],
  },
  {
    title: 'Agents & automatisation',
    href: '/expertises/agents-automatisation',
    section: 'Expertises',
    keywords: ['agent', 'rag', 'rpa', 'workflow'],
  },
  {
    title: 'Data & gouvernance',
    href: '/expertises/data-gouvernance',
    section: 'Expertises',
    keywords: ['data', 'rgpd', 'ai act', 'gouvernance'],
  },
  {
    title: 'Cybersécurité IA',
    href: '/expertises/cybersecurite-ia',
    section: 'Expertises',
    keywords: ['security', 'cyber', 'prompt injection', 'owasp'],
  },

  // --- Solutions (8 produits) ---
  {
    title: 'Solutions — vue d’ensemble',
    href: '/solutions',
    section: 'Solutions',
  },
  {
    title: 'NexusRH CI',
    href: '/solutions/nexusrh',
    section: 'Solutions',
    keywords: ['sirh', 'paie', 'cnps', 'its', 'fdfp', 'mobile money', 'rh'],
    badge: 'RH',
  },
  {
    title: 'NexusERP',
    href: '/solutions/nexuserp',
    section: 'Solutions',
    keywords: ['erp', 'syscohada', 'comptabilite', 'pme'],
    badge: 'ERP',
  },
  {
    title: 'SYGESCOM',
    href: '/solutions/sygescom',
    section: 'Solutions',
    keywords: ['stations', 'hydrocarbures', 'carburant'],
    badge: 'STA',
  },
  {
    title: 'AgroSense CI',
    href: '/solutions/agrosense',
    section: 'Solutions',
    keywords: ['agriculture', 'cacao', 'anacarde', 'iot', 'sodexam'],
    badge: 'AGRO',
  },
  {
    title: 'QualitOS',
    href: '/solutions/qualitos',
    section: 'Solutions',
    keywords: ['qms', 'iso', 'pdca', '5s', 'dmaic', 'qualite'],
    badge: 'QMS',
  },
  {
    title: 'Fraud Shield',
    href: '/solutions/fraud-shield',
    section: 'Solutions',
    keywords: ['fraude', 'detection', 'document', 'banque', 'assurance'],
    badge: 'FRD',
  },
  {
    title: 'Smart City',
    href: '/solutions/smart-city',
    section: 'Solutions',
    keywords: ['smart city', 'collectivites', 'securite urbaine'],
    badge: 'SC',
  },
  {
    title: 'SentinelBTP',
    href: '/solutions/sentinelbtp',
    section: 'Solutions',
    keywords: [
      'btp',
      'shm',
      'structure',
      'batiment',
      'effondrement',
      'capteurs',
      'iot',
    ],
    badge: 'BTP',
  },

  // --- Secteurs ---
  {
    title: 'Secteurs — vue d’ensemble',
    href: '/secteurs',
    section: 'Secteurs',
  },
  {
    title: 'Secteur public',
    href: '/secteurs/secteur-public',
    section: 'Secteurs',
    keywords: ['public', 'ministere', 'administration'],
  },
  {
    title: 'Banque & assurance',
    href: '/secteurs/banque-assurance',
    section: 'Secteurs',
    keywords: ['banque', 'assurance', 'kyc', 'fraude'],
  },
  {
    title: 'Agro-industrie',
    href: '/secteurs/agro-industrie',
    section: 'Secteurs',
    keywords: ['agro', 'cacao', 'anacarde'],
  },
  {
    title: 'Santé',
    href: '/secteurs/sante',
    section: 'Secteurs',
    keywords: ['sante', 'hopital'],
  },
  {
    title: 'Télécoms & énergie',
    href: '/secteurs/telecoms-energie',
    section: 'Secteurs',
    keywords: ['telecoms', 'energie'],
  },

  // --- Laboratoire ---
  {
    title: 'Laboratoire — vue d’ensemble',
    href: '/laboratoire',
    section: 'Laboratoire',
  },
  {
    title: 'Axes R&D',
    href: '/laboratoire/axes',
    section: 'Laboratoire',
    keywords: ['recherche', 'mlops', 'rag'],
  },
  {
    title: 'Publications',
    href: '/laboratoire/publications',
    section: 'Laboratoire',
    keywords: ['publications', 'livre blanc', 'papers'],
  },
  {
    title: 'Partenariats',
    href: '/laboratoire/partenariats',
    section: 'Laboratoire',
    keywords: ['universite', 'esatic', 'fhb', 'sodexam'],
  },

  // --- Livre IA ---
  {
    title: 'Livre — Intelligence Artificielle : du ML aux Agents Autonomes',
    href: '/livre',
    section: 'Livre IA',
    keywords: ['livre', 'book', 'ia', 'ml', 'agents', 'debora'],
  },
  {
    title: 'Chapitres du livre',
    href: '/livre/chapitres',
    section: 'Livre IA',
  },
  {
    title: 'Extraits gratuits',
    href: '/livre/extraits',
    section: 'Livre IA',
  },
  {
    title: 'Acheter le livre',
    href: '/livre/acheter',
    section: 'Livre IA',
    keywords: ['amazon', 'lulu'],
  },
  {
    title: 'Companion lecteurs',
    href: '/livre/companion',
    section: 'Livre IA',
    keywords: ['code', 'github', 'datasets'],
  },

  // --- Insights ---
  {
    title: 'Insights — blog OpenLab',
    href: '/insights',
    section: 'Insights',
    keywords: ['blog', 'articles', 'news'],
  },

  // --- Institutionnel ---
  {
    title: 'À propos',
    href: '/a-propos',
    section: 'Institutionnel',
    keywords: ['equipe', 'mission'],
  },
  {
    title: 'Contact',
    href: '/contact',
    section: 'Institutionnel',
    keywords: ['email', 'telephone', 'rendez-vous'],
  },
  {
    title: 'Audit IA gratuit',
    href: '/audit-ia',
    section: 'Institutionnel',
    keywords: ['audit', 'gratuit', 'lead', 'devis'],
  },
  {
    title: 'Mentions légales',
    href: '/mentions-legales',
    section: 'Institutionnel',
  },
  {
    title: 'Politique de confidentialité',
    href: '/politique-confidentialite',
    section: 'Institutionnel',
    keywords: ['rgpd', 'privacy', 'donnees'],
  },
];

/**
 * Filtre simple : match insensible à la casse + accents, sur title et keywords.
 * Pas de Fuse.js/MiniSearch pour rester < 2 ko bundle.
 */
export function filterCommands(
  query: string,
  index: readonly CommandEntry[] = COMMAND_INDEX,
): readonly CommandEntry[] {
  const q = normalize(query);
  if (q.length === 0) return index;
  return index.filter((entry) => {
    const haystack = normalize(
      `${entry.title} ${entry.section} ${(entry.keywords ?? []).join(' ')}`,
    );
    return haystack.includes(q);
  });
}

/** Lowercase + retire les accents. Stable cross-browser. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
