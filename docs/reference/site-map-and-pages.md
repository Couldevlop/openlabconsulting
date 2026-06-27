# Arborescence du site & spécifications de pages

> Référence extraite de `CLAUDE.md` (ex-§5, §7, §8). Arborescence publique complète, template des pages produits et spec de l'espace livre.

## 1. Arborescence complète du site public

```
/                                  Accueil
/expertises                        Hub expertises
  /expertises/conseil-strategie
  /expertises/agents-automatisation
  /expertises/data-gouvernance
  /expertises/cybersecurite-ia
/laboratoire                       Hub R&D
  /laboratoire/axes
  /laboratoire/publications
  /laboratoire/partenariats
/solutions                         Hub produits
  /solutions/nexusrh
  /solutions/nexuserp
  /solutions/sygescom
  /solutions/agrosense
  /solutions/qualitos
  /solutions/fraud-shield
  /solutions/smart-city
/secteurs
  /secteurs/secteur-public
  /secteurs/banque-assurance
  /secteurs/agro-industrie
  /secteurs/sante
  /secteurs/telecoms-energie
/livre                             Espace livre IA
  /livre/chapitres
  /livre/extraits
  /livre/acheter
  /livre/companion
/insights                          Blog premium
  /insights/[slug]
  /insights/categorie/[cat]
  /insights/auteur/[author]
/a-propos
  /a-propos/equipe
  /a-propos/carrieres
  /a-propos/partenaires
/contact
/audit-ia                          Lead magnet
/mentions-legales
/politique-confidentialite
/sitemap.xml
/robots.txt
/feed.xml                          RSS pour insights
/llms.txt                          Pour LLM crawlers (GEO)
```

Total : ~40 routes publiques + back-office.

## 2. Pages produits — l'écosystème OpenLab

### 2.1 Template commun de page produit

```
1. Hero produit (eyebrow, headline, tagline italique, 2 CTA, visuel mockup)
2. Bandeau preuves (3-4 chiffres clés sourcés)
3. « Le problème » (storytelling 3 phrases + visuel)
4. « La solution » (4-6 fonctionnalités, icône + 2 lignes)
5. Démo interactive (React fonctionnel, pas vidéo)
6. Architecture/Stack (diagramme léger + technos)
7. Témoignage ou cas client
8. Tarification (ou "Sur devis" + CTA)
9. FAQ produit (Schema.org FAQPage)
10. CTA final
```

### 2.2 Particularités par produit

**NexusRH CI**

- Mockups dashboard CNPS, paie, Mobile Money (déjà disponibles dans visuels)
- Démo : simulateur de paie CNPS conforme
- Lien vers https://nexusrh.openlabconsulting.com
- Pricing : 25 000 FCFA / utilisateur / mois (à confirmer)

**NexusERP**

- Architecture Java 21 + Angular 18 mise en avant
- Modules : compta SYSCOHADA, ventes, achats, stock, RH, projets
- Démo : tableau de bord financier multi-devises (FCFA, EUR, USD)
- Cibles : PME 50-500 employés FR + UEMOA

**SYGESCOM v2.0**

- Visuels avant/après déjà excellents — les reprendre
- Démo : dashboard temps réel multi-stations
- ROI < 3 mois, -12% pertes carburant

**AgroSense CI**

- Univers visuel chaleureux (terre, vert, soleil) différent du reste
- Démo : carte parcelles avec capteurs IoT temps réel
- Capstone du livre IA — faire le lien
- Cultures : cacao, anacarde, coton, hévéa
- Sources météo : SODEXAM, OpenMeteo, ERA5, CHIRPS

**QualitOS**

- Univers premium industriel
- Multi-secteurs : industrie, santé, agro, IT, BTP
- Modules : PDCA, 5S, DMAIC, CAPA, audit, risk
- Démo : Ishikawa interactif généré par IA

**Fraud Shield**

- Visuel "loupe sur facture suspecte" déjà disponible
- Démo : upload document → "analyse" IA simulée

**Smart City**

- Visuel illustratif sombre déjà disponible
- Démo : carte de chaleur urbaine
- Verticales : sécurité, mobilité, services publics

> Note : l'écosystème comporte désormais 8 produits (ajout **SentinelBTP** — surveillance structurelle par IA / SHM pour le BTP). Le compteur de produits est dynamique et paramétrable (cf. `lib/format/product-count.ts`).

## 3. Le livre — espace dédié

### 3.1 Pourquoi un espace dédié

Un livre publié change la perception de marque. OpenLab passe de « cabinet » à « cabinet-éditeur ». Cela renforce :

- la crédibilité académique (DGI, ministères, universités)
- le SEO sur "livre IA Afrique francophone"
- la légitimité de vendre des formations

### 3.2 Pages du sous-site /livre

**`/livre`** — Landing

- Hero avec couverture 3D (effet livre qui s'ouvre, Three.js)
- Titre, sous-titre, auteurs, édition
- Pitch en 5 lignes
- 3 CTA : Acheter (Amazon, Lulu, librairie) · Lire un extrait gratuit · Réserver une conférence
- Témoignages préfaciers
- 4 personae lecteurs

**`/livre/chapitres`** — Table interactive

- Pour chaque chapitre : titre, durée lecture, mots-clés, description courte
- Indicateurs : « avec exemples de code », « avec étude de cas »

**`/livre/extraits`** — Extraits gratuits

- 1 chapitre complet en libre accès
- Préface intégrale
- PDF téléchargeable contre email (lead magnet)

**`/livre/acheter`** — Page d'achat

- Liens : Amazon FR, Lulu, librairies CI, PDF direct sur le site (Stripe)
- Bundle livre + formation

**`/livre/companion`** — Ressources lecteurs

- Code source des exemples (GitHub)
- Datasets utilisés
- Errata
- Forum Discord ou Discourse self-hosted

### 3.3 Effet de halo

- Insights : articles renvoient à un chapitre
- Laboratoire : valorise les recherches publiées
- Footer : encart permanent « Notre livre IA »
- Schema.org : `Book` + `Author` + `Review`
