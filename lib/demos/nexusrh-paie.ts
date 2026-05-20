/**
 * Calcul de paie CNPS / ITS / FDFP Côte d'Ivoire — barème 2025-2026.
 *
 * Sources (consolidées par l'équipe juridique OpenLab) :
 *   - CNPS : Loi 99-477 mod. + circulaire CNPS-DG-2024
 *   - ITS  : Code Général des Impôts annexe fiscale 2024
 *   - FDFP : Loi 77-995 + décrets d'application
 *
 * Cible d'usage : démo interactive page `/solutions/nexusrh`. Pas un
 * outil de paie officiel — le vrai calcul intègre ancienneté, primes
 * spécifiques, abattements catégoriels, statut conjoint, enfants à
 * charge etc. Ce simulateur est une vitrine de précision : déjà plus
 * juste qu'un Excel.
 */

export interface PaieInput {
  /** Salaire brut mensuel en F CFA. */
  brut: number;
  /** Statut : impacte les abattements (apprenti = exonéré ITS). */
  statut: 'cdi' | 'cdd' | 'apprenti' | 'stagiaire';
  /** Nombre d'enfants à charge — abattement ITS. */
  enfantsCharge?: number;
}

export interface PaieResult {
  brut: number;
  cnpsSalarie: number;
  cnpsEmployeur: number;
  its: number;
  fdfpSalarie: number;
  fdfpEmployeur: number;
  cmu: number;
  net: number;
  coutEmployeur: number;
  /** Détail des tranches ITS appliquées (pour transparence). */
  trancheIts: readonly {
    from: number;
    to: number;
    rate: number;
    amount: number;
  }[];
}

// ────────────────────────────────────────────────────────────
// Constantes 2025-2026 (vérifiables auprès de la CNPS / DGI)
// ────────────────────────────────────────────────────────────

/** Plafond mensuel CNPS branche prestations familiales et AT. */
const CNPS_PLAFOND_PF_AT = 70_000;
/** Plafond mensuel CNPS retraite (multiplié par le SMIG). */
const CNPS_PLAFOND_RETRAITE = 2_700_000;

const TAUX_CNPS_SALARIE_RETRAITE = 0.063; // 6,3 %
const TAUX_CNPS_EMPLOYEUR_RETRAITE = 0.077; // 7,7 %
const TAUX_CNPS_EMPLOYEUR_PF = 0.0575; // 5,75 % (prestations familiales)
const TAUX_CNPS_EMPLOYEUR_AT = 0.02; // 2 % (accident travail, moyenne)
const TAUX_FDFP_SALARIE = 0.012; // 1,2 % (taxe d'apprentissage)
const TAUX_FDFP_EMPLOYEUR = 0.006; // 0,6 % (formation continue)
const TAUX_CMU = 0.012; // 1,2 % couverture maladie universelle

/**
 * Barème ITS 2024 (par tranches mensuelles, F CFA).
 * Source : annexe fiscale CGI 2024 art. 91.
 */
const BAREME_ITS: readonly { upTo: number; rate: number }[] = [
  { upTo: 75_000, rate: 0 },
  { upTo: 240_000, rate: 0.16 },
  { upTo: 800_000, rate: 0.21 },
  { upTo: 2_400_000, rate: 0.24 },
  { upTo: 8_000_000, rate: 0.28 },
  { upTo: Infinity, rate: 0.32 },
];

// ────────────────────────────────────────────────────────────
// Calcul
// ────────────────────────────────────────────────────────────

function calculIts(
  baseImposable: number,
  enfantsCharge = 0,
): { its: number; tranches: PaieResult['trancheIts'] } {
  // Abattement enfants à charge : -10 % par enfant, plafonné à -50 %.
  const abattement = Math.min(0.5, 0.1 * enfantsCharge);
  const apresAbattement = baseImposable * (1 - abattement);

  const tranches: PaieResult['trancheIts'][number][] = [];
  let restant = apresAbattement;
  let cumul = 0;
  let from = 0;

  for (const t of BAREME_ITS) {
    const plafondTranche = t.upTo - from;
    const dansLaTranche = Math.min(restant, plafondTranche);
    const taxe = dansLaTranche * t.rate;
    if (dansLaTranche > 0) {
      tranches.push({
        from,
        to: from + dansLaTranche,
        rate: t.rate,
        amount: Math.round(taxe),
      });
    }
    cumul += taxe;
    restant -= dansLaTranche;
    from = t.upTo;
    if (restant <= 0) break;
  }

  return { its: Math.round(cumul), tranches };
}

export function calculerPaie(input: PaieInput): PaieResult {
  const brut = Math.max(0, Math.round(input.brut));

  // CNPS salarié : 6,3 % sur le brut plafonné retraite
  const baseCnpsRetraite = Math.min(brut, CNPS_PLAFOND_RETRAITE);
  const cnpsSalarie = Math.round(baseCnpsRetraite * TAUX_CNPS_SALARIE_RETRAITE);

  // CNPS employeur : retraite + PF + AT
  const cnpsEmployeurRetraite = Math.round(
    baseCnpsRetraite * TAUX_CNPS_EMPLOYEUR_RETRAITE,
  );
  const baseCnpsPfAt = Math.min(brut, CNPS_PLAFOND_PF_AT);
  const cnpsEmployeur =
    cnpsEmployeurRetraite +
    Math.round(baseCnpsPfAt * TAUX_CNPS_EMPLOYEUR_PF) +
    Math.round(baseCnpsPfAt * TAUX_CNPS_EMPLOYEUR_AT);

  // FDFP : 1,2 % salarié + 0,6 % employeur (sur brut)
  const fdfpSalarie = Math.round(brut * TAUX_FDFP_SALARIE);
  const fdfpEmployeur = Math.round(brut * TAUX_FDFP_EMPLOYEUR);

  // CMU : 1,2 % du salarié sur brut plafonné PF
  const cmu = Math.round(baseCnpsPfAt * TAUX_CMU);

  // ITS — apprentis et stagiaires exonérés
  const exonereIts =
    input.statut === 'apprenti' || input.statut === 'stagiaire';
  const baseImposable = brut - cnpsSalarie - fdfpSalarie - cmu;
  const { its, tranches } = exonereIts
    ? { its: 0, tranches: [] as PaieResult['trancheIts'] }
    : calculIts(baseImposable, input.enfantsCharge);

  const net = brut - cnpsSalarie - fdfpSalarie - cmu - its;
  const coutEmployeur = brut + cnpsEmployeur + fdfpEmployeur;

  return {
    brut,
    cnpsSalarie,
    cnpsEmployeur,
    its,
    fdfpSalarie,
    fdfpEmployeur,
    cmu,
    net,
    coutEmployeur,
    trancheIts: tranches,
  };
}

export function formatFcfa(amount: number): string {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount);
}
