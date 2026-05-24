/**
 * Contenu des articles fondateurs (Insights) — source rédactionnelle.
 *
 * Rédigés en Markdown puis convertis en Lexical au seed
 * (scripts/seed-articles.ts → convertMarkdownToLexical). Une fois seedés,
 * ces articles sont **entièrement éditables dans l'admin Payload** : ce
 * fichier ne sert qu'à l'amorçage initial / idempotent.
 *
 * Règles éditoriales (CLAUDE.md §12.5, §17.9, §18) :
 *   - titres H2/H3 toutes les 300-400 mots ;
 *   - chaque chiffre est sourcé (tableau `sources`) ;
 *   - ton de marque : phrases courtes, antithèse, adresse directe.
 */
import type { ArticleCategory } from '../lib/articles';

export interface SeedSource {
  label: string;
  url: string;
}

export interface SeedArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  author: string;
  /** ISO YYYY-MM-DD. */
  publishedAt: string;
  keywords: string[];
  summary: string[];
  sources: SeedSource[];
  markdown: string;
}

export const SEED_ARTICLES: readonly SeedArticle[] = [
  // ───────────────────────────────────────────── 1. Fraude documentaire
  {
    slug: 'fraude-documentaire-ia-banques-assurances',
    title:
      'Détection de fraude documentaire : ce que l’IA voit que vos contrôleurs manquent',
    excerpt:
      'La fraude est devenue invisible. L’IA la rend détectable. Trois patterns qu’un œil humain ne peut pas voir — et comment les expliquer à un comité d’audit.',
    category: 'cybersecurite',
    author: 'Équipe Fraud Shield',
    publishedAt: '2026-03-20',
    keywords: [
      'fraude documentaire',
      'détection fraude IA',
      'banque',
      'assurance',
      'Côte d’Ivoire',
      'cybersécurité',
    ],
    summary: [
      'En 2024, la PLCC ivoirienne a traité 12 100 affaires de cybercriminalité pour près de 7 milliards FCFA de préjudice.',
      'La part des Ivoiriens « très préoccupés » par la cybercriminalité est passée de 29 % à 58 % en un an.',
      'L’IA isole en moins de deux secondes des incohérences qu’un contrôleur humain ne peut pas voir à l’œil nu.',
    ],
    sources: [
      {
        label:
          'KOACI — Cybercriminalité : la PLCC a enregistré 12 100 affaires en 2024 (préjudice ~7 milliards FCFA)',
        url: 'https://www.koaci.com/article/2025/05/27/cote-divoire/societe/cote-divoire-cybercriminalite-la-plcc-a-enregistre-12100-affaires-en-2024-pour-un-prejudice-de-pres-de-7-milliards-fcfa_187200.html',
      },
      {
        label:
          'AIP — Cybercriminalité en Afrique : une inquiétude croissante face aux pertes financières (étude)',
        url: 'https://www.aip.ci/157070/cote-divoire-aip-inter-cybercriminalite-en-afrique-une-inquietude-croissante-face-aux-pertes-financieres-etude/',
      },
      {
        label:
          'CTMS — La fraude documentaire et identitaire en Afrique francophone',
        url: 'https://ctms.fr/la-fraude-documentaire-et-identitaire-en-afrique-francophone/',
      },
      {
        label:
          'McKinsey — Leading, not lagging: Africa’s gen AI opportunity (banque : 4,7 à 7,9 Md$/an)',
        url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/leading-not-lagging-africas-gen-ai-opportunity',
      },
    ],
    markdown: `Un faux n’a plus l’air faux. Un relevé bancaire trafiqué, une facture gonflée, un justificatif de domicile recomposé : à l’écran, tout paraît authentique. C’est précisément le problème. La fraude documentaire ne se voit plus à l’œil nu — elle se calcule.

## Le coût réel, chiffré

La Plateforme de Lutte Contre la Cybercriminalité (PLCC) ivoirienne a enregistré **12 100 affaires en 2024**, pour un préjudice de **près de 7 milliards FCFA**. La fraude strictement bancaire y pèse à elle seule plus de 191 millions FCFA. Ces montants ne sont qu’une partie émergée : ils ne comptent que les fraudes détectées, déclarées, instruites.

Le climat a changé aussi vite que les méthodes. En un an, la part des personnes **« très préoccupées »** par la cybercriminalité en Afrique est passée de **29 % à 58 %**. La fraude n’est plus un risque abstrait pour les directions des risques : c’est une attente de protection exprimée par les clients eux-mêmes.

## Trois patterns invisibles à l’œil humain

Un contrôleur expérimenté lit un document. Un modèle, lui, mesure des milliers de signaux par document. Trois familles d’anomalies échappent presque toujours à l’inspection manuelle.

### 1. Les incohérences typographiques

Une police substituée sur trois caractères, un montant ré-aligné au demi-pixel, une couche de compression qui ne correspond pas au reste du fichier. L’IA compare la signature numérique de chaque zone du document. Là où l’œil voit un tout cohérent, le modèle voit une greffe.

### 2. Les ruptures de métadonnées

Date de création postérieure à la date de signature, logiciel d’édition incompatible avec l’émetteur supposé, historique de modifications tronqué. Ces traces ne sont pas visibles dans le rendu — elles vivent dans la structure du fichier.

### 3. Les anomalies de cohérence métier

Un IBAN qui ne respecte pas la clé de contrôle du pays émetteur, un cumul de bulletins de paie qui ne tombe pas juste, un numéro de pièce déjà vu dans un autre dossier. Croiser ces règles à la main prendrait des heures. Le modèle le fait en continu.

## Expliquer la décision à un comité d’audit

Détecter ne suffit pas. Une alerte qu’on ne peut pas justifier ne tient pas devant un comité de crédit. La bonne approche n’est pas une boîte noire qui dit « suspect » : c’est un système qui **montre où** et **explique pourquoi**.

> La fraude est devenue invisible. L’IA la rend détectable — à condition de rendre la détection lisible.

Concrètement, chaque alerte doit pointer la zone incriminée, nommer la règle déclenchée et donner un score d’incertitude. Le contrôleur garde la main : il valide, infirme, escalade. L’IA ne remplace pas le jugement humain, elle le concentre là où il compte.

## Pourquoi c’est un sujet africain

Le potentiel n’est pas théorique. McKinsey estime que l’IA générative pourrait créer **4,7 à 7,9 milliards de dollars de valeur annuelle** pour le seul secteur bancaire africain. Une partie de cette valeur est défensive : chaque fraude évitée est une perte qui ne se produit pas, un client qui garde confiance, un régulateur rassuré.

La fraude documentaire prospère sur la lenteur des contrôles manuels. La réponse n’est pas plus de contrôleurs — c’est de donner à ceux qui sont en poste un copilote qui ne cligne jamais des yeux.`,
  },

  // ───────────────────────────────────────────── 2. IA souveraine
  {
    slug: 'migration-ia-souveraine-k3s-hetzner',
    title: 'Migration vers une IA souveraine en Afrique francophone',
    excerpt:
      'L’IA générative pourrait créer jusqu’à 103 milliards $/an en Afrique. Encore faut-il que la valeur — et les données — restent sur le continent.',
    category: 'souverainete',
    author: 'Debora Ahouma',
    publishedAt: '2026-05-01',
    keywords: [
      'souveraineté numérique',
      'IA souveraine',
      'Afrique francophone',
      'Kubernetes',
      'K3s',
      'hébergement données',
    ],
    summary: [
      'L’IA générative pourrait créer 61 à 103 milliards $ de valeur annuelle en Afrique (McKinsey, 2025).',
      'Plus de 40 % des organisations africaines expérimentent déjà l’IA générative.',
      'Maîtriser son socle d’hébergement, c’est garder la conformité, la donnée et la valeur sur le continent.',
    ],
    sources: [
      {
        label:
          'McKinsey — Leading, not lagging: Africa’s gen AI opportunity (61 à 103 Md$/an, >40 % d’organisations)',
        url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/leading-not-lagging-africas-gen-ai-opportunity',
      },
      {
        label:
          'Ecofin Agency — Africa could unlock $103bn a year from generative AI, McKinsey says',
        url: 'https://www.ecofinagency.com/news/1605-46857-africa-could-unlock-103bn-a-year-from-generative-ai-mckinsey-says',
      },
      {
        label:
          'GSMA — The Mobile Economy Sub-Saharan Africa 2024 (mobile : 140 Md$, 7 % du PIB)',
        url: 'https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-economy/sub-saharan-africa-2024/',
      },
    ],
    markdown: `La question n’est plus de savoir si l’Afrique adoptera l’IA. C’est de savoir **où** vivront ses modèles, ses données et sa valeur. Souveraineté n’est pas un slogan : c’est une décision d’architecture.

## Le marché est déjà là

McKinsey chiffre le potentiel de l’IA générative en Afrique entre **61 et 103 milliards de dollars de valeur annuelle**. Et ce n’est pas une promesse lointaine : **plus de 40 % des organisations africaines** — entreprises privées comme institutions publiques — expérimentent ou déploient déjà des solutions d’IA générative.

Le socle de connectivité suit. En 2023, l’industrie mobile a contribué pour **140 milliards de dollars**, soit **7 % du PIB** de l’Afrique subsaharienne, une contribution attendue à 170 milliards d’ici 2030 selon la GSMA. La demande existe, l’infrastructure monte. Reste la question qui décide de tout : qui héberge ?

## Souveraineté ≠ autarcie

Être souverain ne veut pas dire tout réinventer. Cela veut dire **garder le contrôle** : sur l’endroit où les données sont stockées, sur qui peut y accéder, sur la capacité à migrer sans être prisonnier d’un fournisseur.

> La data est votre pétrole. Laisser quelqu’un d’autre la raffiner ailleurs, c’est exporter votre valeur brute.

Trois leviers concrets :

- **La localisation** — héberger dans une juridiction maîtrisée et conforme. Nos déploiements vivent sur un cluster en Allemagne (Hetzner, Falkenstein/Nuremberg), conforme RGPD, sous notre seul contrôle opérationnel.
- **La portabilité** — un socle Kubernetes standard se redéploie ailleurs. Aucune dépendance à une API propriétaire qui vous enferme.
- **La réversibilité** — pouvoir tout rapatrier. La souveraineté se mesure à la facilité avec laquelle on peut partir.

## La leçon NexusRH

Nous opérons NexusRH, notre SIRH, sur un cluster K3s en production. La bascule complète d’un environnement — base PostgreSQL, cache, stockage objet, migrations, rollout sans coupure — tient en **moins de dix minutes**, script à l’appui. Cette discipline n’est pas un luxe d’ingénieur : c’est la condition pour qu’une institution puisse dire « nous maîtrisons notre système », pas « notre prestataire le maîtrise pour nous ».

Un déploiement reproductible, versionné, testé, c’est aussi un déploiement **auditable**. Pour un ministère ou une banque, l’auditabilité du socle vaut autant que la performance du modèle.

## Ce que la souveraineté change pour un dirigeant

Une IA souveraine ne coûte pas forcément plus cher. Elle déplace le coût : moins de rente versée à un fournisseur cloud étranger, plus d’investissement dans des compétences locales et un socle réutilisable. La valeur reste là où elle est créée.

Cette fois, l’Afrique n’a plus d’excuse. La technologie est mûre, le marché est prouvé, les compétences existent. Ce qui manque souvent, c’est la décision d’architecture prise tôt — avant que la donnée ne parte, avant que le verrou ne se referme.`,
  },

  // ───────────────────────────────────────────── 3. Conformité RH
  {
    slug: 'cnps-its-fdfp-conformite-sirh-ivoirien',
    title: 'CNPS, ITS, FDFP : ce que la conformité paie attend de votre SIRH',
    excerpt:
      'Le diable est dans le détail des cotisations. Barèmes 2024, plafonds, taxes : comment un SIRH bien conçu transforme l’audit annuel en formalité.',
    category: 'conformite-rh',
    author: 'Équipe NexusRH',
    publishedAt: '2026-04-15',
    keywords: [
      'CNPS',
      'ITS',
      'FDFP',
      'conformité paie',
      'SIRH Côte d’Ivoire',
      'cotisations sociales',
    ],
    summary: [
      'Depuis janvier 2024, la retraite CNPS est à 14 % (7,7 % employeur + 6,3 % salarié), plafond 3 375 000 FCFA/mois.',
      'Prestations familiales 5,75 % et accidents du travail 2 à 5 % restent à 100 % à la charge de l’employeur.',
      'Le FDFP ajoute 1,2 % (formation continue) + 0,4 % (apprentissage) sur la masse salariale.',
    ],
    sources: [
      {
        label: 'CNPS Côte d’Ivoire — Taux de cotisation (document officiel)',
        url: 'https://www.cnps.ci/wp-content/uploads/2020/08/Recouvrement.pdf',
      },
      {
        label: 'CLEISS — Les cotisations en Côte d’Ivoire',
        url: 'https://www.cleiss.fr/docs/cotisations/cotedivoire.html',
      },
      {
        label:
          'Cabinet A.F.A. — Nouveaux barèmes CNPS 2024 : impacts pour les employeurs',
        url: 'https://afa.ci/nouveaux-baremes-cnps-2024-impacts-pour-les-employeurs/',
      },
      {
        label:
          'FDFP — Présentation et taxes (1,2 % formation continue + 0,4 % apprentissage)',
        url: 'https://fdfp.ci/presentation-du-fdfp/',
      },
    ],
    markdown: `Vos RH produisent-elles des décisions… ou juste des fichiers ? La paie ivoirienne ne pardonne pas l’à-peu-près. Un taux mal appliqué, un plafond oublié, une taxe omise : le redressement arrive, avec ses pénalités.

## Les barèmes 2024 qu’un SIRH doit appliquer sans y penser

Depuis **janvier 2024**, de nouveaux barèmes CNPS s’appliquent. Trois blocs structurent les cotisations sociales.

### Retraite (assurance vieillesse)

Cotisation totale de **14 %**, répartie entre **7,7 % à la charge de l’employeur** et **6,3 % à la charge du salarié**. Elle s’applique dans la limite d’un plafond de **3 375 000 FCFA par mois** (soit 40 500 000 FCFA par an). Au-delà, la cotisation ne court plus — encore faut-il que le système le sache.

### Prestations familiales

**5,75 %** (dont 0,75 % au titre de l’assurance maternité), **entièrement à la charge de l’employeur**, dans la limite d’un plafond de 840 000 FCFA par an et par salarié.

### Accidents du travail

De **2 % à 5 % selon le secteur** d’activité et le niveau de risque, là encore **100 % employeur**, sur le même plafond que les prestations familiales.

## Le FDFP : la taxe qu’on oublie

Au-delà des cotisations CNPS, l’employeur verse au Fonds de Développement de la Formation Professionnelle :

- **1,2 %** de la masse salariale au titre de la taxe additionnelle à la formation professionnelle continue ;
- **0,4 %** au titre de la taxe d’apprentissage.

Ce n’est pas une charge perdue : une partie est récupérable sous forme de plans de formation agréés. Encore faut-il déclarer juste et dans les temps.

## L’ITS, prélevé à la source

L’Impôt sur les Traitements et Salaires (ITS) est retenu par l’employeur sur le bulletin, selon un barème progressif. Sa logique : chaque tranche de revenu supporte un taux croissant. L’erreur classique n’est pas dans le taux — elle est dans l’assiette : primes, avantages en nature et exonérations mal qualifiés faussent tout le calcul en aval.

## Ce qu’un bon SIRH change vraiment

> Vos coûts de conformité vous étouffent. Un système bien réglé peut les diviser.

Un SIRH conçu pour la Côte d’Ivoire ne se contente pas de « faire la paie ». Il :

- applique automatiquement les **barèmes et plafonds à jour**, et trace la version utilisée ;
- bloque l’incohérence **avant** la clôture, pas après le redressement ;
- génère les **déclarations CNPS, ITS et FDFP** prêtes à transmettre ;
- conserve une **piste d’audit** : qui a changé quoi, quand, sur quelle base légale.

Résultat : l’audit annuel cesse d’être une épreuve. Les pièces existent, les calculs sont reproductibles, les écarts s’expliquent. La conformité n’est plus un risque qu’on subit — c’est une propriété du système.

La non-conformité n’est pas une question de *si*, mais de *quand*. Autant faire en sorte que, le jour venu, la réponse soit déjà prête.`,
  },

  // ───────────────────────────────────────────── 4. Data = pétrole (nouveau)
  {
    slug: 'data-petrole-ia-raffinerie-entreprises-ivoiriennes',
    title: 'Vos données dorment. Ce qu’une raffinerie IA leur ferait gagner.',
    excerpt:
      'La data est votre pétrole. L’IA est votre raffinerie. Tant que la donnée reste brute, elle ne vaut rien — voici par où commencer.',
    category: 'data-gouvernance',
    author: 'Laboratoire OpenLab',
    publishedAt: '2026-05-10',
    keywords: [
      'gouvernance data',
      'valorisation données',
      'IA entreprise',
      'Côte d’Ivoire',
      'transformation digitale',
      'data',
    ],
    summary: [
      'L’IA générative pourrait créer 61 à 103 milliards $/an en Afrique, dont 6,6 à 10,4 Md$ pour le seul commerce de détail (McKinsey).',
      'Plus de 40 % des organisations africaines expérimentent déjà l’IA — l’écart se creuse vite entre celles qui structurent leur donnée et les autres.',
      'La valeur ne vient pas du volume de données, mais de leur gouvernance : qualité, accès, traçabilité.',
    ],
    sources: [
      {
        label:
          'McKinsey — Leading, not lagging: Africa’s gen AI opportunity (valeur par secteur)',
        url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/leading-not-lagging-africas-gen-ai-opportunity',
      },
      {
        label:
          'Ecofin Agency — Africa could unlock $103bn a year from generative AI',
        url: 'https://www.ecofinagency.com/news/1605-46857-africa-could-unlock-103bn-a-year-from-generative-ai-mckinsey-says',
      },
      {
        label: 'GSMA — The Mobile Economy Sub-Saharan Africa 2024',
        url: 'https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-economy/sub-saharan-africa-2024/',
      },
    ],
    markdown: `Toutes les entreprises ivoiriennes ont des données. Très peu en font de la performance. Entre les deux, il n’y a pas un logiciel magique — il y a une discipline : la gouvernance.

## La valeur est mesurée, secteur par secteur

McKinsey chiffre le potentiel annuel de l’IA générative en Afrique entre **61 et 103 milliards de dollars**. Ce total se décompose par secteur, et le détail parle aux dirigeants :

- **Commerce de détail** : 6,6 à 10,4 milliards $/an ;
- **Télécommunications** : 6 à 9,6 milliards $/an ;
- **Banque** : 4,7 à 7,9 milliards $/an ;
- **Secteur public** : 2,9 à 4,8 milliards $/an.

Aucun de ces gains ne tombe du ciel. Tous supposent une matière première exploitable : des données propres, accessibles, fiables.

## Pourquoi vos données ne valent rien (pour l’instant)

Le pétrole brut ne fait pas avancer une voiture. La donnée brute ne fait pas tourner un modèle. Quatre obstacles reviennent partout :

### Des silos

Le CRM ignore la compta, qui ignore le terrain. La même information existe en trois versions contradictoires. Personne ne sait laquelle croire.

### Une qualité incertaine

Doublons, champs vides, formats incohérents, dates au mauvais standard. Un modèle entraîné sur des données sales apprend surtout à se tromper avec assurance.

### Aucune traçabilité

D’où vient ce chiffre ? Qui l’a saisi ? Quand a-t-il été mis à jour ? Sans réponse, aucune décision sérieuse ne peut s’y appuyer.

### Pas de gouvernance d’accès

Qui a le droit de voir quoi ? Une donnée sans politique d’accès est à la fois un risque de fuite et un frein à l’usage.

## Raffiner, étape par étape

> La data est votre pétrole. L’IA est votre raffinerie. Mais une raffinerie a besoin d’un pipeline propre.

La bonne séquence n’est pas « acheter de l’IA ». C’est :

1. **Cartographier** les sources réellement utiles à une décision précise ;
2. **Nettoyer et unifier** ces sources autour d’un référentiel commun ;
3. **Gouverner** : règles de qualité, traçabilité, droits d’accès ;
4. **Alors seulement, automatiser** la décision avec un modèle.

Commencer par l’IA sans données gouvernées, c’est mettre du carburant raffiné dans un moteur encrassé.

## L’écart se creuse maintenant

Plus de **40 % des organisations africaines** expérimentent déjà l’IA générative. La connectivité suit : l’industrie mobile pèse désormais **7 % du PIB** de l’Afrique subsaharienne. Le terrain est prêt.

L’avantage n’ira pas à celles qui ont le plus de données, mais à celles qui les ont **mises en ordre** en premier. Vos coûts vous étouffent ? Votre donnée, bien raffinée, peut les diviser. Le travail commence aujourd’hui, et il commence par la gouvernance — pas par l’algorithme.`,
  },

  // ───────────────────────────────────── 5. SYGESCOM carburant (étude de cas)
  {
    slug: 'pertes-carburant-stations-pilotage-temps-reel',
    title:
      'Vous perdez du carburant sans le savoir : la fin de la gestion à l’aveugle',
    excerpt:
      'Des dizaines de millions de litres détournés en Afrique de l’Ouest. Quand un réseau de stations se pilote à l’œil, l’argent s’évapore.',
    category: 'etude-de-cas',
    author: 'Équipe SYGESCOM',
    publishedAt: '2026-04-28',
    keywords: [
      'gestion stations-service',
      'fraude carburant',
      'hydrocarbures',
      'Afrique de l’Ouest',
      'temps réel',
      'SYGESCOM',
    ],
    summary: [
      'Au Burkina Faso, ~34 millions de litres d’hydrocarbures ont été détournés en 2020-2024, soit 7,7 milliards FCFA de pertes pour l’État.',
      'Au Niger, la fraude sur les hydrocarbures représente ~11 milliards FCFA de manque à gagner.',
      'Le pilotage temps réel multi-stations supprime l’angle mort où se logent fuites et fraudes.',
    ],
    sources: [
      {
        label:
          'Horonya Finance — 34 millions de litres détournés, 7,7 milliards FCFA de perte (Burkina)',
        url: 'https://horonyafinance.com/2025/06/03/burkina-fraude-sur-les-hydrocarbures-subventionnes-pres-de-34-millions-de-litres-de-carburant-detournes-par-un-vaste-reseau-causant-une-perte-de-plus-de-7-7-milliards-fcfa-a-letat/',
      },
      {
        label:
          'L’Économiste du Faso — Carburant de plus de 7 milliards FCFA indûment servi',
        url: 'https://www.leconomistedufaso.com/2025/06/16/fraude-dhydrocarbures-du-carburant-de-plus-de-7-milliards-fcfa-indument-servi/',
      },
      {
        label:
          'VOA Afrique — Fraude des hydrocarbures au Niger (~11 milliards FCFA)',
        url: 'https://www.voaafrique.com/a/fraude-des-hydrocarbures-au-niger/5049585.html',
      },
      {
        label:
          'APA News — Le pétrole, vecteur des contrebandes en Afrique de l’Ouest',
        url: 'https://fr.apanews.net/news/lor-noir-vecteur-de-toutes-les-contrebandes-en-afrique-de-louest/',
      },
    ],
    markdown: `Chaque jour, des écarts, des fuites et des erreurs coûtent des millions. Sans visibilité, impossible d’agir. Le pire n’est pas la fraude : c’est de ne pas la voir.

## Le trou noir des hydrocarbures

La fraude sur les carburants n’est pas une anecdote, c’est un fléau régional. Au **Burkina Faso**, un réseau a détourné près de **34 millions de litres** d’hydrocarbures entre 2020 et 2024, causant **7,7 milliards FCFA** de pertes à l’État. Au **Niger**, le manque à gagner lié à la fraude sur les hydrocarbures est estimé à **environ 11 milliards FCFA**. À l’échelle régionale, le pétrole est devenu le premier vecteur de contrebande.

Ces chiffres concernent les États. Mais la même mécanique frappe chaque exploitant de réseau de stations : volumes qui ne correspondent pas aux ventes, écarts de cuve inexpliqués, paiements qui s’égarent. Tant que la mesure est manuelle et différée, la perte est invisible — donc impunie.

## Pourquoi Excel ne peut pas gérer un réseau de stations

Le tableur a une limite fatale : il décrit le passé, station par station, avec retard. Or la fraude et les fuites vivent dans **l’écart en temps réel** entre ce qui entre, ce qui est vendu et ce qui reste en cuve.

Quatre angles morts typiques :

- **Réconciliation tardive** — l’écart d’hier se découvre la semaine prochaine, quand il est trop tard pour agir ;
- **Données dispersées** — chaque station tient ses chiffres, aucune vue consolidée ;
- **Pas d’alerte** — rien ne signale l’anomalie au moment où elle se produit ;
- **Contrôle humain saturé** — personne ne peut surveiller dix stations en continu.

## Ce que change un pilotage temps réel

> Voyez tout. Contrôlez tout. Gagnez plus.

SYGESCOM consolide ventes, stocks et flux financiers de toutes les stations sur un seul tableau de bord, et détecte automatiquement les anomalies **avant** qu’elles ne deviennent des pertes :

- réconciliation bancaire automatique et traçable ;
- détection des écarts de cuve et de volume en continu ;
- alertes instantanées sur les comportements suspects ;
- décisions prises depuis une vue unique, à tout moment.

Le résultat observé chez les exploitants : jusqu’à **-12 % de pertes carburant** et un retour sur investissement en **moins de trois mois**. Pas parce qu’on ajoute des contrôleurs — parce qu’on supprime l’angle mort.

## L’enjeu n’est pas le logiciel, c’est la visibilité

Un réseau de stations qui se pilote à l’aveugle finance, sans le savoir, sa propre hémorragie. La technologie ne crée pas la rigueur : elle la rend possible à l’échelle. Passer de l’approximation au contrôle total, c’est cesser de payer pour ce qu’on ne voit pas.`,
  },

  // ───────────────────────────────────────── 6. Smart City (agents & IA)
  {
    slug: 'ia-securite-urbaine-villes-africaines-2050',
    title: 'Quand l’IA protège la ville : anticiper, modéliser, protéger',
    excerpt:
      '414 millions d’urbains aujourd’hui, 1,2 milliard en 2050. La sécurité des villes africaines ne se gérera plus caméra par caméra.',
    category: 'agents-ia',
    author: 'Laboratoire OpenLab',
    publishedAt: '2026-05-15',
    keywords: [
      'smart city',
      'sécurité urbaine',
      'IA prédictive',
      'Afrique',
      'urbanisation',
      'collectivités',
    ],
    summary: [
      'La population urbaine africaine passera de 414 millions aujourd’hui à plus de 1,2 milliard en 2050 (ONU).',
      'Près de 70 % des Africains vivront en ville en 2050, contre 40 % en 2020.',
      'À cette échelle, la sécurité urbaine devient un problème de modélisation, pas de surveillance manuelle.',
    ],
    sources: [
      {
        label: 'Agence Ecofin — 1,2 milliard d’urbains en Afrique en 2050',
        url: 'https://www.agenceecofin.com/investissement/1204-4336-1-2-milliard-d-urbains-en-afrique-en-2050',
      },
      {
        label: 'ONU DAES — World Urbanization Prospects',
        url: 'https://www.un.org/development/desa/fr/news/population/world-urbanization-prospects.html',
      },
      {
        label: 'Afrimag — Plus de 950 millions de nouveaux urbains d’ici 2050',
        url: 'https://afrimag.net/afrique-plus-de-950-millions-nouveaux-urbains-a-accueillir-dici-2050/',
      },
    ],
    markdown: `La ville africaine de 2050 est déjà en train de naître. La question n’est pas de savoir si elle grandira, mais si elle restera sûre en grandissant.

## Le choc démographique urbain

Les chiffres de l’ONU donnent le vertige : la population urbaine du continent passera de **414 millions aujourd’hui à plus de 1,2 milliard en 2050**. La part des Africains vivant en ville grimpera de **40 % en 2020 à près de 70 % en 2050** — soit **plus de 950 millions de nouveaux citadins** à accueillir.

Cette densification met sous tension tout ce qui fait une ville vivable : mobilité, services, et surtout sécurité. À cette échelle, les méthodes héritées — un agent, une caméra, un registre papier — ne tiennent plus.

## De la surveillance à l’anticipation

La vidéosurveillance classique regarde le passé : elle filme ce qui s’est déjà produit. La sécurité urbaine de demain doit **anticiper**.

Trois capacités changent la donne :

- **Anticiper** — repérer les signaux faibles (concentrations anormales, schémas récurrents) avant l’incident ;
- **Modéliser** — simuler l’impact d’un événement (manifestation, accident, météo extrême) sur les flux de la ville ;
- **Protéger** — orienter les moyens humains là où le risque est le plus élevé, en temps réel.

> Une ville ne se sécurise pas en filmant tout. Elle se sécurise en comprenant ce qui va arriver.

## L’IA comme multiplicateur, pas comme remplaçant

Le risque d’une smart city mal pensée, c’est la surveillance de masse. La bonne approche est inverse : l’IA traite le volume pour que **l’humain décide mieux**, sur les bons signaux, dans le respect des libertés.

Cela suppose une gouvernance claire : quelles données, pour quel usage, avec quels droits d’accès et quelle traçabilité. La sécurité urbaine augmentée n’est légitime que si elle est auditable.

## Un enjeu de souveraineté

Modéliser une ville africaine demande des données africaines, des modèles entraînés sur des réalités locales, et une infrastructure maîtrisée. Importer une « smart city » clé en main, c’est confier la sécurité de ses citoyens à une boîte noire étrangère. Construire la sienne, c’est garder la main sur ce qui compte le plus : protéger, sans renoncer à comprendre.`,
  },

  // ───────────────────────────────────────────── 7. Manifeste (souveraineté)
  {
    slug: 'ia-ivoirienne-notre-futur-manifeste',
    title:
      'L’IA ivoirienne, notre futur : pourquoi l’Afrique n’a plus d’excuse',
    excerpt:
      'La technologie est mûre, le marché prouvé, les talents présents. Cette fois, l’Afrique n’a plus d’excuse — il reste à décider.',
    category: 'souverainete',
    author: 'Debora Ahouma',
    publishedAt: '2026-05-22',
    keywords: [
      'IA Afrique',
      'souveraineté numérique',
      'Côte d’Ivoire',
      'transformation digitale',
      'talents',
      'manifeste',
    ],
    summary: [
      'L’IA générative représente 61 à 103 milliards $ de valeur annuelle potentielle pour l’Afrique (McKinsey).',
      'Plus de 40 % des organisations africaines expérimentent déjà l’IA ; l’industrie mobile pèse 7 % du PIB subsaharien.',
      'Le facteur limitant n’est plus la technologie ni le marché : c’est la décision de construire localement.',
    ],
    sources: [
      {
        label: 'McKinsey — Leading, not lagging: Africa’s gen AI opportunity',
        url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/leading-not-lagging-africas-gen-ai-opportunity',
      },
      {
        label:
          'Ecofin Agency — Africa could unlock $103bn a year from generative AI',
        url: 'https://www.ecofinagency.com/news/1605-46857-africa-could-unlock-103bn-a-year-from-generative-ai-mckinsey-says',
      },
      {
        label: 'GSMA — The Mobile Economy Sub-Saharan Africa 2024',
        url: 'https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-economy/sub-saharan-africa-2024/',
      },
    ],
    markdown: `Pendant longtemps, l’Afrique a eu des excuses pour rater une révolution technologique : pas l’infrastructure, pas les compétences, pas le marché. Pour l’IA, ces excuses ne tiennent plus.

## Le marché est prouvé

Ce n’est plus une promesse de consultants. McKinsey chiffre la valeur annuelle de l’IA générative pour l’Afrique entre **61 et 103 milliards de dollars**. Et l’adoption est déjà engagée : **plus de 40 % des organisations africaines** expérimentent ou déploient l’IA générative. La demande existe, ici et maintenant.

## L’infrastructure tient

Le socle numérique n’est plus un obstacle. L’industrie mobile pèse désormais **7 % du PIB** de l’Afrique subsaharienne, et les réseaux progressent plus vite que partout ailleurs. Une entreprise ivoirienne peut, aujourd’hui, déployer une IA en production sur une infrastructure maîtrisée — sans dépendre d’un acteur étranger pour la moindre requête.

## Les talents sont là

La diaspora rentre, les écoles d’ingénieurs forment, les communautés tech d’Abidjan, de Lagos et de Dakar produisent des praticiens reconnus. Le problème n’a jamais été le talent. Il a été de lui donner un terrain — des projets ambitieux, des produits à construire, une raison de rester.

> Cette fois, l’Afrique n’a plus d’excuse.

## Ce qui manque encore : la décision

Si le marché, l’infrastructure et les talents sont réunis, qu’est-ce qui bloque ? Une seule chose : **la décision de construire localement** plutôt que d’importer.

Construire localement, c’est :

- **garder la donnée** sur le continent, sous une gouvernance maîtrisée ;
- **capter la valeur** au lieu d’exporter de la matière première numérique ;
- **former en faisant** — chaque projet est une montée en compétence ;
- **assumer une identité** : une IA pensée pour nos langues, nos secteurs, nos réalités.

## Transformer aujourd’hui, construire demain

L’IA ivoirienne ne sera pas une copie. Elle protégera des villes qui doublent de taille, sécurisera des paiements mobiles, raffinera des données agricoles, rendra la fraude détectable. Elle sera utile parce qu’elle sera ancrée.

Le futur ne s’attend pas, il se décide. Données sécurisées, compétences locales, technologie souveraine, conformité, impact durable : les briques sont là. Reste à les assembler — et à commencer maintenant.`,
  },
] as const;
