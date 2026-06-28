/**
 * Données des landings géographiques — chantier audit P2 §7 item #13.
 *
 * Trois pages SEO local destinées à capter les requêtes longue traîne
 * « cabinet IA Abidjan », « consultant IA Cocody », « conseil IA UEMOA »
 * (cf. audit §4 « Densité mots-clés » et §6 « Mots-clés long-tail »).
 *
 * Règle : pas de chiffre rond non sourcé (CLAUDE.md §4.10). Le contenu
 * s'ancre uniquement sur des faits vérifiables (siège OpenLab à Cocody,
 * RCCM CI-ABJ, références produits déjà en prod, cadre réglementaire).
 */

export type LocationSlug = 'abidjan' | 'cocody' | 'uemoa';

export interface LocationContent {
  readonly slug: LocationSlug;
  readonly label: string;
  /** Mot-clé cible (Title + h1 + meta description). */
  readonly targetKeyword: string;
  /** Eyebrow orange affiché au-dessus du h1. */
  readonly eyebrow: string;
  /** H1 — doit contenir le mot-clé en début de phrase. */
  readonly h1: string;
  /** Sous-titre éditorial 2-3 lignes. */
  readonly subtitle: string;
  /** Description meta (≤ 155 caractères). */
  readonly metaDescription: string;
  /** Pitch principal — 2 paragraphes pour la section « Présence ». */
  readonly pitch: readonly [string, string];
  /** Preuves d'ancrage local (faits vérifiables, pas de chiffres ronds). */
  readonly proofs: readonly { label: string; value: string }[];
  /** Liste des services proposés à cette location avec lien href. */
  readonly services: readonly { title: string; href: string; body: string }[];
  /** Zone géographique au sens schema.org (areaServed). */
  readonly areaServed: readonly string[];
}

export const LOCATIONS: readonly LocationContent[] = [
  {
    slug: 'abidjan',
    label: 'Abidjan',
    targetKeyword: 'cabinet IA Abidjan',
    eyebrow: 'OpenLab à Abidjan',
    h1: 'Cabinet IA à Abidjan : conseil, R&D, intégration.',
    subtitle:
      'Notre siège est à Cocody. Nos consultants interviennent dans toute la métropole abidjanaise, Plateau, Marcory, Treichville, Yopougon, Riviera, pour cadrer, intégrer et gouverner vos projets d’intelligence artificielle.',
    metaDescription:
      'Cabinet d’IA appliquée à Abidjan : audit, intégration, R&D produit. Siège Cocody, RCCM CI-ABJ. NexusRH, SYGESCOM, Fraud Shield en prod.',
    pitch: [
      'OpenLab Consulting est un cabinet ivoirien basé à Abidjan, immatriculé au RCCM Côte d’Ivoire sous le numéro CI-ABJ-03-2022-B13-03239. Nos consultants vivent ici, pas en visioconférence depuis Paris ou New York. Nous connaissons le terrain abidjanais : les usages Mobile Money de Wave et Orange Money, les contraintes CNPS, ITS et FDFP de la paie, les pics de trafic des banques de la place, les enjeux opérationnels des stations-service.',
      'Cette proximité change tout dans un projet d’IA. Un atelier de cadrage à Cocody le matin permet une démo terrain l’après-midi à Marcory et un déploiement le lendemain. Les itérations sont rapides, les décisions sont prises avec les bons interlocuteurs, et la conformité (Loi 2013-450, RGPD UE) est intégrée dès le premier sprint.',
    ],
    proofs: [
      {
        label: 'Siège',
        value: 'Cocody · Riviera Faya Lauriers 8',
      },
      {
        label: 'Immatriculation',
        value: 'RCCM CI-ABJ-03-2022-B13-03239',
      },
      {
        label: 'Logiciels propriétaires en production',
        value: 'NexusRH CI · NexusERP · SYGESCOM · Fraud Shield',
      },
      {
        label: 'Cadre réglementaire maîtrisé',
        value: 'Loi 2013-450 · RGPD · CNPS · ITS · FDFP · SYSCOHADA',
      },
    ],
    services: [
      {
        title: 'Conseil & stratégie IA',
        href: '/expertises/conseil-strategie',
        body: 'Cadrage des cas d’usage IA prioritaires, ROI estimé sous 30 jours, gouvernance compatible loi ivoirienne 2013-450.',
      },
      {
        title: 'Agents & automatisation',
        href: '/expertises/agents-automatisation',
        body: 'RAG fermé sur vos données, agents multi-étapes, intégration aux SI existants (NexusRH, NexusERP, métier).',
      },
      {
        title: 'Data & gouvernance',
        href: '/expertises/data-gouvernance',
        body: 'Cartographie des données, politiques de rétention, conformité AI Act + RGPD UE pour la zone UEMOA.',
      },
      {
        title: 'Cybersécurité IA',
        href: '/expertises/cybersecurite-ia',
        body: 'Détection de fraude documentaire (Fraud Shield), durcissement des modèles, audit prompt injection.',
      },
    ],
    areaServed: [
      'Abidjan',
      'Cocody',
      'Plateau',
      'Marcory',
      'Treichville',
      'Yopougon',
    ],
  },
  {
    slug: 'cocody',
    label: 'Cocody',
    targetKeyword: 'consultant IA Cocody',
    eyebrow: 'OpenLab à Cocody',
    h1: 'Consultant IA à Cocody, Riviera : interventions sur place.',
    subtitle:
      'Notre siège est à Cocody Riviera Faya Lauriers. Pour les entreprises basées à Cocody (Riviera, II Plateaux, Angré, Mermoz, Faya), nous intervenons sans frais de déplacement et nos consultants restent disponibles en moins de 30 minutes pour un atelier urgent.',
    metaDescription:
      'Consultant IA basé à Cocody, Riviera Faya Lauriers. Interventions sans déplacement. Audit IA, intégration, R&D produit pour la zone Cocody-II Plateaux.',
    pitch: [
      'Cocody concentre une grande partie de l’écosystème tech ivoirien : sièges de banques, ambassades, organisations internationales, cabinets de conseil, startups. OpenLab Consulting y est installée depuis 2022 et accompagne plusieurs de ces structures dans leurs projets d’IA appliquée, du cadrage stratégique à la mise en production.',
      'Pour les entreprises basées à Cocody, nous proposons des formats courts (atelier d’une demi-journée, audit éclair sur 5 jours, immersion produit sur 2 semaines) qui tirent parti de la proximité physique. Pas de visio interminable : on s’installe chez vous, on parle aux opérationnels, on revient avec un livrable décisionnel.',
    ],
    proofs: [
      {
        label: 'Adresse',
        value: 'Cocody · Riviera Faya Lauriers 8',
      },
      {
        label: 'Quartiers couverts sans frais de déplacement',
        value: 'Riviera · II Plateaux · Angré · Mermoz · Faya',
      },
      {
        label: 'Disponibilité atelier urgent',
        value: 'Sous 30 minutes en heures ouvrées',
      },
      {
        label: 'Ancrage ivoirien',
        value:
          'CEO ivoirienne · équipe résidente · pas de sous-traitance offshore',
      },
    ],
    services: [
      {
        title: 'Atelier de cadrage IA',
        href: '/audit-ia',
        body: 'Demi-journée chez vous à Cocody : identification des 3 cas d’usage IA à plus fort ROI, plan d’action 90 jours, livrable PDF.',
      },
      {
        title: 'Démos produits sur site',
        href: '/solutions',
        body: 'Présentation NexusRH, NexusERP ou SYGESCOM directement dans vos locaux Cocody, avec vos données réelles si vous le souhaitez.',
      },
      {
        title: 'Conférences & sensibilisation',
        href: '/laboratoire',
        body: 'Interventions auprès de comités de direction, écoles d’ingénieurs (FHB, ESATIC), incubateurs basés à Cocody.',
      },
      {
        title: 'Accompagnement long-terme',
        href: '/expertises',
        body: 'Format CTO-as-a-service (à temps partagé) pour les startups et PME tech de la Riviera.',
      },
    ],
    areaServed: ['Cocody', 'Riviera', 'II Plateaux', 'Angré', 'Mermoz', 'Faya'],
  },
  {
    slug: 'uemoa',
    label: 'UEMOA',
    targetKeyword: 'conseil IA UEMOA Afrique francophone',
    eyebrow: 'OpenLab pour l’UEMOA',
    h1: 'Conseil IA pour l’UEMOA : huit pays, un seul cadre.',
    subtitle:
      'L’Union économique et monétaire ouest-africaine partage une monnaie (F CFA), un cadre comptable (SYSCOHADA), un régulateur bancaire (BCEAO) et une langue de travail (français). Notre offre est calibrée pour cette unité réglementaire et linguistique.',
    metaDescription:
      'Cabinet d’IA pour l’UEMOA : Bénin, Burkina, Côte d’Ivoire, Guinée-Bissau, Mali, Niger, Sénégal, Togo. SYSCOHADA, BCEAO, F CFA, francophonie.',
    pitch: [
      'L’UEMOA regroupe huit pays, Bénin, Burkina Faso, Côte d’Ivoire, Guinée-Bissau, Mali, Niger, Sénégal, Togo, qui partagent un cadre comptable commun (SYSCOHADA révisé), une monnaie (le F CFA), un régulateur bancaire (BCEAO) et une langue administrative (le français). Cette unité change fondamentalement la façon de bâtir des produits IA pour la zone : on conçoit une fois, on déploie huit fois.',
      'OpenLab Consulting a fait ce choix dès sa création. NexusERP intègre nativement SYSCOHADA et le multi-devises (F CFA, EUR, USD). NexusRH gère les spécificités sociales ivoiriennes (CNPS, ITS, FDFP) tout en s’adaptant aux régimes des autres États UEMOA. Nos livres blancs (« IA souveraine en Côte d’Ivoire 2026 ») sont pensés pour s’étendre à la zone, et nos formations sont dispensées en français en présentiel ou à distance.',
    ],
    proofs: [
      {
        label: 'Pays UEMOA',
        value:
          'Bénin · Burkina Faso · Côte d’Ivoire · Guinée-Bissau · Mali · Niger · Sénégal · Togo',
      },
      {
        label: 'Cadre comptable',
        value: 'SYSCOHADA révisé (commun aux 8 pays)',
      },
      {
        label: 'Monnaie & régulateur',
        value: 'F CFA · BCEAO',
      },
      {
        label: 'Langue de travail',
        value: 'Français (administratif et technique)',
      },
    ],
    services: [
      {
        title: 'ERP SYSCOHADA multi-pays',
        href: '/solutions/nexuserp',
        body: 'NexusERP comptabilité SYSCOHADA, multi-devises F CFA/EUR/USD, conformité fiscale par pays UEMOA.',
      },
      {
        title: 'SIRH conformité régionale',
        href: '/solutions/nexusrh',
        body: 'Paramétrage des régimes sociaux par État (CNPS-CI, CNSS-BF, IPRES-SN), Mobile Money intégré (Wave, Orange, Moov).',
      },
      {
        title: 'Gouvernance data francophone',
        href: '/expertises/data-gouvernance',
        body: 'Cadres réglementaires comparés (Loi ivoirienne 2013-450, Loi sénégalaise 2008-12, Loi béninoise 2017-20, RGPD UE).',
      },
      {
        title: 'Formations à distance',
        href: '/laboratoire',
        body: 'Sessions en français pour comités de direction, DSI et équipes data des 8 pays UEMOA.',
      },
    ],
    areaServed: [
      'Bénin',
      'Burkina Faso',
      'Côte d’Ivoire',
      'Guinée-Bissau',
      'Mali',
      'Niger',
      'Sénégal',
      'Togo',
    ],
  },
];

/** Lookup helper — utilisé par les pages route. */
export function getLocation(slug: LocationSlug): LocationContent {
  const loc = LOCATIONS.find((l) => l.slug === slug);
  if (!loc) throw new Error(`Location inconnue : ${slug}`);
  return loc;
}
