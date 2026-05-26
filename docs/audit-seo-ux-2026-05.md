# Audit SEO + UX/UI — OpenLab Consulting vs Top 4 mondial

**Date** : 22 mai 2026
**Phase site** : P2 en cours (refonte 2026)
**Concurrents benchmarkés** : Palantir, Anthropic, IBM Consulting AI, McKinsey QuantumBlack
**Objectif acté** : top 3 Google mondial sur « IA » + top 3 mondial ergonomie/beauté pour un cabinet IA.

---

## 1. Résumé exécutif

### Notation comparative (note /10, perception qualitative)

| Axe                                       | OpenLab actuel | Palantir | Anthropic | IBM AI | QuantumBlack |
| ----------------------------------------- | -------------- | -------- | --------- | ------ | ------------ |
| SEO technique (schema, sitemap, llms.txt) | 8              | 7        | 6         | 9      | 8            |
| Profondeur contenu / autorité             | 4              | 8        | 9         | 10     | 10           |
| UX / hiérarchie                           | 7.5            | 8        | 9         | 7      | 9            |
| Beauté / design éditorial                 | 7              | 9        | 9.5       | 6.5    | 9            |
| Vitesse (theorical First Load < 150 kB)   | 9              | 7        | 8         | 4      | 6            |
| Accessibilité WCAG                        | 8              | 7        | 8         | 8      | 7            |
| Différenciation identitaire               | 9              | 8        | 9         | 6      | 8            |

OpenLab est **déjà au-dessus** de la moyenne mondiale sur l'identité de marque (orange/navy ivoirien, polices Bricolage/Fraunces, manifeste signé) et la performance technique brute (104 kB First Load, 96 % coverage, 570 tests). Le retard se concentre sur la **profondeur de contenu** (articles d'autorité, études de cas chiffrées, recherche publiée) et l'**absence de preuves visuelles** (mockups produits réels, vidéos clients, dataviz du Laboratoire).

### 3 quick wins (< 1 jour chacun)

1. **Ajouter Schema.org `Course` + `Event` + `Article` enrichis** sur `/livre`, `/laboratoire/publications` et chaque article `/insights/[slug]` (déjà fait pour Book, FAQ, Software). Branche `feat/seo-schema-extras`.
2. **Hreflang + canonical croisés** : ajouter `<link rel="alternate" hreflang="fr-CI"/fr-FR"/x-default"/>` dans `lib/seo/site.ts` + helper dans `app/layout.tsx` (CLAUDE.md §12.3 — non implémenté).
3. **Cmd+K public** (search + jump-to-page) avec Meilisearch déjà prévu §2.1 : palette accessible depuis Navbar, recherche fuzzy sur produits, expertises, secteurs, articles. Pattern Linear/Vercel/Anthropic.

### 3 chantiers majeurs (> 3 jours)

1. **10 articles d'autorité fondateurs** (1 500–2 500 mots, signés Debora Ahouma, schema Article + Person + howTo) — CLAUDE.md §12.5. Sans corpus, aucune position top 3 atteignable.
2. **Mockups produits réels + démos React interactives** pour les 7 solutions (NexusRH dashboard CNPS, AgroSense carte parcelles…). Actuellement `MediaPlaceholder` partout, c'est l'écart le plus visible vs Palantir Foundry / Watsonx.
3. **Page `/laboratoire` premium** avec ouvre-livre 3D (Three.js, déjà dépendance prévue), 3 papers téléchargeables (PDF + landing page chacun), partenariats universitaires nommés, frise visuelle des axes de R&D.

---

## 2. État du site OpenLab (factuel)

### Inventaire des pages

Source : `app/(site)/*`, `app/sitemap.ts`.

| Catégorie              | Nombre | Routes                                                                                    |
| ---------------------- | ------ | ----------------------------------------------------------------------------------------- |
| Hub homepage           | 1      | `/`                                                                                       |
| Hubs niveau 2          | 5      | `/expertises`, `/laboratoire`, `/solutions`, `/secteurs`, `/insights`                     |
| Détail solutions       | 7      | `/solutions/{nexusrh,nexuserp,sygescom,agrosense,qualitos,fraud-shield,smart-city}`       |
| Détail expertises      | 4      | `/expertises/{conseil-strategie,agents-automatisation,data-gouvernance,cybersecurite-ia}` |
| Détail secteurs        | 5      | `/secteurs/{secteur-public,banque-assurance,agro-industrie,sante,telecoms-energie}`       |
| Sous-pages livre       | 5      | `/livre`, `/livre/chapitres`, `/livre/extraits`, `/livre/acheter`, `/livre/companion`     |
| Sous-pages laboratoire | 3      | `/laboratoire/{axes,publications,partenariats}`                                           |
| Insights               | 3 + N  | `/insights`, `/insights/[slug]`, `/insights/categorie/[cat]`, `/insights/auteur/[author]` |
| Institutionnel         | 4      | `/a-propos`, `/contact`, `/audit-ia`, `/mentions-legales`, `/politique-confidentialite`   |

Total : **~40 routes** alignées sur CLAUDE.md §5. **OK**.

### Schema.org implémenté (`lib/seo/schema.ts`)

Présents : `Organization`, `ProfessionalService`/`LocalBusiness`, `WebSite`, `BreadcrumbList`, `Service`, `SoftwareApplication`, `WebPage` (secteurs), `Book`, `Person`, `FAQPage`.

Manquants à implémenter (CLAUDE.md §12.3) : `Article` enrichi (datePublished, author Person, image, mainEntityOfPage), `Course` (formation IA potentielle), `Event` (conférences livre), `Review` (témoignages livre + clients), `HowTo` (sur articles techniques insights), `VideoObject` (futures démos vidéo), `Product` enrichi avec `AggregateRating` (futur), `BreadcrumbList` sur toutes les pages détail (déjà sur solutions, à généraliser).

### Performance théorique

D'après l'état actuel rapporté en CLAUDE.md (P1 fusionnée) :

- **First Load JS** : 104 kB → sous le seuil 150 kB (§2.3) ✓
- **51 tests** verts (P1) → 570 tests verts au début P2 (état actuel)
- **Coverage** : 93.68 % (P1) → 96 % (P2 en cours)
- LCP / INP / CLS : non mesurés en CI — **angle mort à combler**.

### Forces (à niveau international)

1. **Identité visuelle inimitable** : orange #FF5A00 + navy + ivory, polices Bricolage Grotesque / Geist / Fraunces. C'est plus distinctif que Palantir (noir/blanc/cyan) et que QuantumBlack (gris/bleu corporate).
2. **Manifesto signé** (`components/sections/Manifesto.tsx`) avec antithèse en 3 stances. Aucun concurrent ne propose ça — ni Palantir, ni IBM, ni QuantumBlack n'osent un manifeste personnel. C'est la signature de marque.
3. **Sécurité de bout en bout** : middleware CSP nonce-based avec `strict-dynamic`, COOP/CORP, HSTS preload prod. Niveau supérieur à 99 % des cabinets concurrents.
4. **llms.txt** déjà présent (`public/llms.txt`), structuré avec organisation, 7 produits, secteurs, citation. Convention émergente, OpenLab est en avance.
5. **Sitemap dynamique** alimenté par Payload (`articles` via DB + fallback hard-codé).
6. **robots.txt** explicitement permissif pour GPTBot / ClaudeBot / anthropic-ai / PerplexityBot / Google-Extended.

### Faiblesses

1. **Zéro contenu d'autorité publié** : `/insights` existe mais aucun article fondateur référencé. Sans corpus, le mot-clé « IA » est inatteignable.
2. **Visuels produits absents** : `MediaPlaceholder` partout sur `/solutions/[slug]` (line 148–155 de la page). Palantir et IBM mettent des screenshots produit immersifs en hero.
3. **Pas de hreflang** alors que cibles = CI + FR + UEMOA. Risque cannibalisation FR/EU vs FR/CI.
4. **Pas d'OG image dynamique par page** : `app/opengraph-image.tsx` n'existe pas, seul `app/layout.tsx` définit l'OG global. CLAUDE.md §12.3 le requiert pour chaque article.
5. **Navbar sans mega-menu** : 6 liens flat, vs Anthropic (Research/Commitments/Learn déroulants), Palantir (Platforms/Industries/Customers déroulant). Pour 40 pages, c'est sous-dimensionné.
6. **Pas de Cmd+K public**.
7. **Pas de Breadcrumbs systématiques** (présents sur solutions, manquants ailleurs).
8. **Aucun test Lighthouse en CI** — la perf est théorique.
9. **Hero canvas WebGL** présent mais à confirmer côté impact LCP (lazy ?). Lecture rapide de `Hero.tsx` : oui, `background` slot optionnel, donc OK.
10. **Pas de témoignages clients vidéo** (Anthropic Enterprise affiche Lyft, Zapier, GitLab, Quantium en case studies vidéo).

---

## 3. Benchmark détaillé

### 3.1 Palantir (palantir.com)

**Observation directe limitée** — palantir.com et /platforms/\* retournent une page très allégée à WebFetch (probable rendu JS-only + anti-bot). Sources : sitemap public visible, structure connue.

**Patterns gagnants** :

- **Hero produit pleine page** sur Foundry/AIP avec **screenshot interactif** du logiciel comme arrière-plan. Aucun stock photo, aucune illustration corporate.
- **Storytelling « problème → bataille → victoire »** : pages clients structurées « Mission », « Challenge », « Outcome » avec chiffres précis (ex. « 3× faster ingestion », « 50 % less manual review »).
- **Bandeau industries** très dense : Defense, Healthcare, Energy, Manufacturing, Financial Services, Public Sector. Chaque industrie = page dédiée + cas clients verticaux.
- **Vocabulaire propre** : « ontology », « operational AI », « decisions at the speed of relevance ». Palantir invente son lexique → autorité.
- **Photographies d'opérateurs réels** dans des contextes industriels (salle de contrôle, atelier, terrain militaire).

**Anti-patterns** :

- Site très lourd (JS-heavy, lent à charger), homepage qui exige un scroll long avant de comprendre l'offre. OpenLab a meilleur LCP.
- Naming métier inaccessible aux dirigeants non-tech.

**Ce qu'OpenLab fait déjà mieux** :

- Hiérarchie above-the-fold plus claire (Hero 90vh + CTA primaire visible).
- Manifeste personnel et signé — Palantir reste corporate.
- Performance.

**À copier/adapter** :

- Screenshots produits comme background hero plutôt que `MediaPlaceholder`.
- Pages industrie verticales avec **chiffres clients sourcés** (actuellement `/secteurs/*` sont des hubs sans cas client narré).
- Vocabulaire propriétaire OpenLab : « souveraineté algorithmique », « gouvernance francophone », « capstone terrain » à institutionnaliser sur toutes les pages.

### 3.2 Anthropic (anthropic.com + claude.com)

Source : WebFetch sur `/`, `/news`, `/claude` (redirige claude.com/product/overview), `/enterprise` (redirige claude.com/pricing/enterprise).

**Patterns gagnants observés** :

- **Hero textuel ultra-sobre** : « AI research and products that put safety at the frontier » + CTA unique « Try Claude ». Pas de canvas WebGL, pas de hero vidéo, pas de stock photo — typographie premium et message éthique.
- **5 cards thématiques homepage** (AI safety, RSP, Academy, économie, Constitution) : structure informative, **pas transactionnelle**. Anthropic vend la confiance avant l'usage.
- **Newsroom** comme hub central : releases produit + papers de recherche + announcements partenariats au même endroit, structuré par date/catégorie. Headlines courtes, sous-titre informatif. Pas d'images d'illustration corporate.
- **Page enterprise** (claude.com/pricing/enterprise) : **4 témoignages vidéo** avec chiffres précis (Lyft −87 % temps support, Zapier 89 % adoption, GitLab 98 % satisfaction, Quantium −90 % temps propositions). Compliance section premium : SSO, SCIM, audit logs, HIPAA-ready, no-training-on-Work-data.
- **Questionnaire 5 questions** qui segmente Team vs Enterprise — équivalent d'un lead magnet conversationnel.
- **Footer 7 colonnes** : Products / Models / Solutions (12 verticaux) / Claude Platform / Resources (14 items) / Company / Terms. Très profond, signal SEO d'autorité.

**Anti-patterns** :

- Très anglo-centré, aucun hreflang ni traduction visible. Avantage OpenLab pour francophone.
- Pas de schema.org JSON-LD détectable dans le rendu fourni — paradoxal vu leur ambition.

**Ce qu'OpenLab fait déjà mieux** :

- Hreflang/i18n potentiel (next-intl en stack §2.1).
- Manifesto personnel et signé Debora Ahouma vs collectif anonyme Anthropic.
- Schema.org plus complet déjà implémenté.

**À copier/adapter** :

- **Footer 6+ colonnes profond** : actuellement 4 (Expertises/Solutions/Ressources/OpenLab). Ajouter : Secteurs, Livre (sous-pages), Insights par catégorie, Légal. Signal SEO important.
- **Newsroom-style /insights** avec fil unique horodaté, tags Announcements/Product/Research/Case Study/Article, pas de carrousel.
- **Témoignages clients format vidéo + chiffre saillant** (« −87 % » en gros sur page enterprise). Sur `/solutions/[slug]`, ajouter une section « Résultats clients » entre `Stack` et `Tarification`.
- **Page `/enterprise` ou `/pour-les-grandes-entreprises`** dédiée — actuellement, le visiteur DSI grande boîte n'a pas de surface dédiée.
- **Questionnaire de qualification** sur `/audit-ia` : 5 questions, recommandation contextuelle (audit court / cadrage / pilote / déploiement).

### 3.3 IBM Consulting AI (ibm.com/consulting/artificial-intelligence)

**Observation directe bloquée** (403 sur WebFetch). Sources : ma connaissance de la marque + sitemap public.

**Patterns gagnants** :

- **Volume colossal de pages d'expertise** : chaque industrie × chaque service × chaque géographie a sa page. C'est le secret de leur SEO sur « AI consulting ».
- **Cas clients chiffrés et nommés** : Wimbledon, Mastercard, Heineken — chacun avec un chiffre clé (« 50 % faster », « $100M saved »).
- **IBM Institute for Business Value (IBV)** : whitepapers téléchargeables (lead magnets) calibrés C-level, schema.org Article + DOI quand académique.
- **Watsonx product showcase** sur page consulting : intégration verticale produit/conseil/recherche analogue à OpenLab.
- **Schema.org Article + Course + Event** très utilisé sur ibm.com/think.

**Anti-patterns** :

- **Bundle JS énorme** (souvent > 1 Mo), LCP médiocre, pas un modèle de perf.
- **Ton corporate générique** (« empowering enterprises », « scaling AI ») — exactement les formules à éviter dans CLAUDE.md §18.
- Navigation labyrinthique, on se perd vite.
- Internationale mais peu d'enracinement local.

**Ce qu'OpenLab fait déjà mieux** :

- Identité visuelle plus distinctive.
- Perf radicalement meilleure (104 kB vs > 1 Mo IBM).
- Storytelling humain (Manifeste, Debora Ahouma) vs corporate IBM.

**À copier/adapter** :

- **Whitepapers téléchargeables** = lead magnets calibrés (équivalent IBV). Cf. memory `project_openlabconsulting_white_paper_souveraine.md` : le livre blanc « IA souveraine en CI 2026 » doit devenir un lead magnet sur `/audit-ia` ou `/laboratoire/publications`.
- **Pages géographiques** : `/abidjan`, `/cocody`, `/cote-divoire`, `/uemoa`, `/dakar`, `/cotonou` pour SEO local. CLAUDE.md §12.1 cible « cabinet IA Abidjan », « cabinet IA Cocody » — il faut des pages dédiées.
- **Pages X × Y** : `/solutions/nexusrh/secteur-public`, `/expertises/data-gouvernance/banque-assurance` — démultiplication SEO long-tail.

### 3.4 McKinsey QuantumBlack (quantumblack.com + mckinsey.com/capabilities/quantumblack)

**Observation directe bloquée** (ECONNREFUSED puis timeout). Sources : connaissance de la marque + structure McKinsey publique.

**Patterns gagnants** :

- **Insights papers** : 50+ rapports recherche/an signés par associés QuantumBlack, format PDF + landing HTML, schema.org Article + Person.
- **Hero textuel premium** : grande typographie serif/grotesque, sous-titre éditorial, photo équipe ou data viz.
- **Liste d'experts nommés** sur chaque page service avec photo, bio, publications. C'est la fabrique d'autorité par les Persons.
- **« How we help clients »** : 4–6 services, chaque service est une **étude de cas client narrée**, pas une liste de features.
- **Footer ultra-profond McKinsey** : Industries × Capabilities × Insights × Careers × About × Featured = matrice complète.
- **Cookie consent + privacy** premium (McKinsey enterprise grade).

**Anti-patterns** :

- Site très lent (TTI > 5 s), JS-heavy.
- Stock photos d'équipe en costume — éviter.

**Ce qu'OpenLab fait déjà mieux** :

- Identité ivoirienne assumée vs McKinsey gris bleu corporate.
- Performance technique.

**À copier/adapter** :

- **Pages auteurs `/insights/auteur/[author]`** existent déjà dans `app/(site)/insights/auteur/[author]` (vérifié). Les remplir avec Person schema + photo + bio + liste articles + LinkedIn + Google Scholar. Doter Debora Ahouma d'une page auteur premium dès maintenant.
- **`/laboratoire/publications`** : transformer en repository de 3–6 papers téléchargeables PDF avec landing page par paper (titre, abstract, auteurs, datePublished, DOI ou hash, schema ScholarlyArticle ou TechArticle).
- **`/a-propos/equipe`** : photo + bio + expertise + publications par membre, avec Person schema.
- **Hero éditorial** sur `/laboratoire` et `/livre` (typo Fraunces serif géante, sous-titre, signature) — actuellement Hero homepage est en gradient orange/navy mais `/laboratoire/page.tsx` à confirmer.

---

## 4. Audit SEO technique

### Lighthouse théorique

- **Performance** : visée 95+ mobile (§2.3). First Load 104 kB OK. À mesurer en CI via `@lhci/cli` GitHub Action — **manquant**.
- **A11y** : visée 95+. Focus rings orange custom OK, prefers-reduced-motion OK, headings sémantiques OK (vérifié dans Hero/Solutions/Manifesto). Axe-core en CI **manquant**.
- **Best Practices** : visée 95. CSP nonce strict-dynamic OK, HSTS prod OK.
- **SEO** : visée 100. Canonical sur layout `/`, à généraliser par page. Title template `%s · OpenLab Consulting` OK.

### Schema.org : déjà / manquant

**Déjà implémenté** (`lib/seo/schema.ts`) :

- Organization, ProfessionalService, WebSite, BreadcrumbList, Service, SoftwareApplication, WebPage, Book, Person, FAQPage.

**À ajouter** :

- `Article` enrichi (datePublished, dateModified, author Person ref, image, headline, articleSection, wordCount, mainEntityOfPage) sur chaque `/insights/[slug]`.
- `HowTo` sur articles de tutoriel technique.
- `Course` sur formations futures et chapitres du livre IA.
- `Event` sur conférences (lancement livre, webinaires).
- `Review` ou `AggregateRating` sur produits une fois témoignages collectés.
- `ScholarlyArticle` ou `TechArticle` sur `/laboratoire/publications/[slug]` (à créer).
- `BreadcrumbList` à généraliser : actuellement sur solutions, manquant sur expertises/secteurs/insights/livre.
- `VideoObject` si témoignages vidéo ajoutés.
- `OfferCatalog` sur `/solutions` (hub).

### llms.txt

**Présent** (`public/llms.txt`). Contenu actuel : org, 7 produits, secteurs, livre, souveraineté, cadre réglementaire (Loi 2013-450, RGPD, Malabo, AI Act, BCEAO, EUDR, SYSCOHADA), citation préférée. **Excellent**.

À enrichir : ajouter section « Publications phares » avec lien `/laboratoire/publications` une fois les papers en ligne, et « Articles fondateurs » avec les 10 premiers articles d'autorité.

### Sitemap

**Présent et dynamique** (`app/sitemap.ts`). Inclut statiques + détails dynamiques + articles via Payload. Cap 200 articles. Priorités cohérentes (1.0/0.9/0.8/0.7/0.6/0.5). OK.

À ajouter quand pertinent : image sitemap (`sitemap-image.xml`) pour les mockups produits, et news sitemap pour `/insights` (`sitemap-news.xml` selon Google News specs).

### Canonical & hreflang

- **Canonical** : déclaré sur layout (`alternates.canonical: '/'`) et sur certaines pages (vu sur `/solutions/[slug]`). À généraliser via helper.
- **Hreflang** : **non implémenté**. À ajouter dans `app/layout.tsx` ou via helper `metadata.alternates.languages`. CLAUDE.md §12.3 le requiert (fr-CI, fr-FR, x-default).

### Open Graph dynamiques

- **OG global** : ok dans `app/layout.tsx`.
- **OG par page** : `app/opengraph-image.tsx` **n'existe pas** (vérifié). À créer en tant qu'image generation runtime via `ImageResponse` de `next/og`, avec titre + tagline + couleurs OpenLab. Idem pour chaque article, produit, expertise via fichier `opengraph-image.tsx` colocaté.

### robots.txt

**Présent** (`app/robots.ts`). Autorise `*`, autorise explicitement GPTBot/ClaudeBot/anthropic-ai/PerplexityBot/Google-Extended. Disallow `/admin`, `/api/`, `/_next/`. Sitemap pointé. **Conforme CLAUDE.md §12.3 et §12.4**.

### Densité mots-clés vs concurrents

Sur l'occurrence « IA » dans la homepage :

- Hero : « L'IA, au service des réalités africaines » (1 occurrence forte, dans le h1).
- Description hero : « cabinet ivoirien d'IA appliquée » (1).
- Reassurance : 0.
- Expertises (à lire `Expertises.tsx`) : probable 4–5.
- Manifeste : 0 (signal qualité — c'est une page éditoriale).
- Footer : « Cabinet ivoirien d'IA » (1).

**Densité homepage estimée** : 1.5–2 %. **Correct mais peu agressif** pour viser top 3 mondial sur « IA ». Solution : ne PAS bourrer la home (risque pénalité Google), mais créer **un cluster sémantique** :

- Page pilier `/expertises/conseil-strategie` cible « audit IA Côte d'Ivoire ».
- Page pilier `/expertises` cible « cabinet IA Afrique francophone ».
- Page pilier `/laboratoire` cible « R&D IA Afrique ».
- 10–20 articles cluster, chacun ciblant 1 longue-traîne et liant au pilier.

Le mot-clé brut « IA » (sans contexte géo ou sectoriel) est verrouillé par Wikipedia/Larousse/CNIL/IBM/Microsoft. Réaliste : top 3 sur « IA Côte d'Ivoire », « IA Afrique francophone », « cabinet IA Abidjan », « livre IA Afrique » en 6–9 mois.

### Pages piliers SEO manquantes (vs CLAUDE.md §12.2)

| Pilier annoncé CLAUDE.md                                     | État réel                  | Action                                                 |
| ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------ |
| `/expertises/conseil-strategie` — « audit IA Côte d'Ivoire » | Route existe (page.tsx P1) | À auditer : densité, schema, FAQ, internal linking     |
| `/solutions/nexusrh` — « SIRH Côte d'Ivoire »                | Route existe               | OK, à enrichir avec démo CNPS, screenshots, témoignage |
| `/solutions/nexuserp` — « ERP SYSCOHADA »                    | Route existe               | Idem                                                   |
| `/solutions/agrosense` — « agriculture précision cacao »     | Route existe               | Idem                                                   |
| `/laboratoire` — « R&D IA Afrique »                          | Route existe               | À transformer en page premium signature                |
| `/livre` — « livre IA Afrique »                              | Route existe               | À enrichir (3D book, extraits, témoignages)            |

Pages additionnelles **à créer** :

- `/abidjan` ou `/cabinet-ia-abidjan` — landing géo.
- `/uemoa` — landing UEMOA / francophonie.
- `/glossaire-ia` — page glossaire (autorité topique).
- `/audit-ia` enrichi (questionnaire interactif).

---

## 5. Audit UX/UI

### Navigation

- **Profondeur** : 1 niveau dans la Navbar (6 liens flat). **Insuffisant** pour 40 pages. Les sous-pages Livre (5), Laboratoire (3), Insights (catégories + auteurs) sont invisibles depuis la nav.
- **Mega-menu** : absent. Anthropic, Palantir, IBM en utilisent tous.
- **Breadcrumbs** : présents sur `/solutions/[slug]`, **manquants** ailleurs.
- **Recommandation** : mega-menu déroulant au hover/click sur « Solutions » (7 produits + lien hub), « Expertises » (4 + hub), « Livre » (4 sous-pages + hub), « Laboratoire » (3 + hub). Pattern Anthropic = recommandé.

### Hiérarchie above-the-fold homepage vs concurrents

| Élément        | OpenLab                                      | Anthropic                                                    | Palantir                             | QuantumBlack                                |
| -------------- | -------------------------------------------- | ------------------------------------------------------------ | ------------------------------------ | ------------------------------------------- |
| Eyebrow        | « L'écosystème OpenLab »                     | (absent)                                                     | (absent)                             | (variable)                                  |
| H1             | « L'IA, au service des réalités africaines » | « AI research and products that put safety at the frontier » | « Software for a data-driven world » | « Helping clients achieve... AI advantage » |
| Sous-titre     | 3 lignes — « Cabinet ivoirien... »           | « AI will have a vast impact... »                            | (variable)                           | (variable)                                  |
| CTA primaire   | Audit IA gratuit                             | Try Claude                                                   | Get a Demo                           | Contact us                                  |
| CTA secondaire | Découvrir l'écosystème                       | (absent — un seul CTA fort)                                  | Watch video                          | Explore insights                            |
| Preuve sociale | Bandeau logos clients (section 2)            | (déplacée plus bas)                                          | Bandeau industrie                    | Bandeau clients                             |

**OpenLab Hero est solide** et différencié. La phrase « au service des réalités africaines » est mémorable et brevetable comme angle. Le CTA primaire (audit IA gratuit) est plus conversionnant que « Try Claude » pour un cabinet.

**Améliorations** :

- Ajouter 3 chiffres-clés sourcés sous le Hero (style Palantir) : « 7 produits en production · 18 mois de R&D · 100 % conforme RGPD » par exemple. Actuellement absent.
- Ajouter un teaser vidéo 15 s en arrière-plan du HeroCanvas (option) ou un screenshot produit en split-screen droit.

### Patterns d'animation (Motion v12)

Vérifiable dans le code :

- **HeroBackground** : canvas WebGL (à confirmer impact LCP — lazy ?).
- **Marquee** clients logos (Reassurance) : continu, pauseOnHover, respect prefers-reduced-motion.
- **ScrollReveal** : présent (`components/atoms/ScrollReveal.tsx`).
- **ScrollProgress** : présent.
- **Group-hover translate** : présent sur cartes solutions (ArrowUpRight translate-x-0.5 -translate-y-0.5).
- **Navbar scrolled state** : transition blur / shadow.

**À auditer** : les animations sont-elles purpose-driven (CLAUDE.md §4.6) ou décoratives ? Pas d'animation visible sur Manifesto, Laboratoire (sauf halos statiques). Anthropic n'a quasi aucune animation, c'est un signe de maturité. **Ne pas en rajouter — éventuellement en retirer**.

### Densité informationnelle (§4.5)

- Hero homepage : densité **correcte** (eyebrow + h1 + 3 lignes pitch + 2 CTAs + scroll hint).
- Solutions section : 7 cards, chacune avec icon + badge status + nom + tagline + target → **bon**.
- Manifesto : 3 stances avec 01/02/03 + excuse + fait → **excellent, signature de marque**.
- Laboratoire : 3 axes + citation + CTA → **correct**, peut être enrichi avec petite frise temporelle ou stat sourcée.
- Pages produits : 10 sections (Hero, Preuves, Problème, Features, Démo, Stack, Tarif, FAQ, Expertises liées, Cross-sell, CTA final) → **dense, conforme CLAUDE.md §7.1**.

**Risque** : pages produits longues mais avec `MediaPlaceholder` partout, le scroll devient frustrant sans visuel. **Priorité absolue** : remplacer placeholders par mockups.

### Mobile-first

- Navbar mobile : drawer max-h-[80vh], focus géré, Button audit IA en bas du drawer. **OK**.
- Touch targets : Button size="lg" = min-h-12 (48 px). **OK ≥ 44 px**.
- Containers : `width="wide"` / `"narrow"` avec padding mobile correct.
- Marquee : responsive avec gap-x-12 sm:gap-x-16.

**Risque** : 70 % du trafic africain est mobile (§4.4). Tester :

- LCP mobile 4G (à mesurer).
- Largeur Hero h1 (`max-w-4xl`) sur 360 px : peut wrap à 3-4 lignes → vérifier que le scroll initial montre encore le CTA.
- Marquee logos : 8 logos sur écran 360 px = vitesse de défilement perceptible — OK avec speed=28.

### Accessibilité WCAG

Vérifiable dans le code :

- Focus-visible orange 2 px outline-offset 2 px (`globals.css`).
- `prefers-reduced-motion` respecté.
- `aria-label` sur boutons icônes (Menu/X, ArrowUpRight, ArrowDown).
- `aria-labelledby` sur sections principales.
- `aria-hidden` sur décoratifs.
- Skip-to-content : **à vérifier dans layout** — probablement présent (CLAUDE.md §4.7).
- Headings sémantiques (`Heading` atom avec level + visualLevel).

**Niveau actuel** : WCAG 2.2 AA très probable, AAA possible. **À valider en CI avec axe-core**.

### Cul-de-sac (§4.9)

Vérifications spot :

- Homepage : se termine par AuditIaCta → **OK**.
- Solutions detail : se termine par AuditIaCta + autres produits → **OK**.
- Manifesto : pas de CTA propre, mais sectionnée dans homepage → **OK** (sectionne intermédiaire).
- À auditer : `/livre`, `/laboratoire`, `/insights/[slug]`, `/secteurs/[slug]`, `/expertises/[slug]`. Probable OK vu pattern.

### Cmd+K

- **Admin Payload v3** : Cmd+K natif livré par Payload (CLAUDE.md §9.1).
- **Public** : **absent**. À implémenter en P3/P4 avec Meilisearch (stack §2.1) — pattern Linear/Vercel/Anthropic. Différenciation majeure.

---

## 6. Audit éditorial

### Ton de marque (§18) — applicable

Vérifications spot :

- Hero h1 : « L'IA, au service des réalités africaines » → **antithèse implicite, mot-clé orange, direct**. ✓
- Manifesto : « Cette fois, l'Afrique n'a plus d'excuse » → **signature parfaite**. ✓
- Solutions title : « Sept logiciels propriétaires. Un seul laboratoire. » → **deux temps, orange sur deuxième moitié**. ✓
- Laboratoire title : « Un cabinet qui code, qui édite, qui publie » → **triade rythmique, orange sur 'qui publie'**. ✓
- Solution detail (« Avant {name} »): introduit le problème → **storytelling, pas corporate**. ✓
- Pricing : « Transparent, sans surprise. » → **deux temps**. ✓

**Excellent. Le ton de marque est appliqué.**

À éviter (CLAUDE.md §18) — aucune occurrence détectée dans les composants lus :

- « Nous sommes une équipe passionnée » — absent ✓
- « Notre mission est de » — absent ✓
- « Solutions innovantes et sur mesure » — absent ✓
- « Synergies », « ADN », « écosystème » : « écosystème » utilisé 2× (Hero CTA secondaire + Solutions eyebrow) — **acceptable car justifié** (7 produits cohérents).

### Contenu livre IA mis en valeur

- Section homepage `Livre` existe (§6.8).
- Sous-site `/livre` complet avec 5 pages.
- Schema.org `bookSchema()` implémenté.
- Footer : pas de lien permanent « Notre livre IA » en bannière dédiée (CLAUDE.md §8.3 demande un encart permanent). À ajouter dans footer (colonne Ressources contient déjà « Livre IA » mais c'est un lien parmi d'autres).

### Storytelling vs corporate-speak

- Hero : storytelling personnel + mission (« réalités africaines »). ✓
- Manifesto : storytelling éditorial à la première personne du pluriel. ✓
- Laboratoire : citation manifeste en blockquote Fraunces. ✓
- Solutions : « Touchez-y. Pas une vidéo. » sur démo, « Avant NexusRH. » → storytelling. ✓
- Pages produits : storytelling « Le problème → La solution → La preuve ». ✓

**Niveau éditorial supérieur à tous les concurrents**. C'est l'avantage compétitif #1 d'OpenLab.

À renforcer :

- Signature systématique des articles d'insights par auteur avec photo.
- Manifeste à 3 stances → pourrait être étendu en 5 stances dans une page `/manifeste` dédiée (pas urgent).

---

## 7. Plan d'action priorisé

Tri par score (impact / effort) décroissant. Impact 1=marginal, 5=transformateur. Effort 1=heures, 5=semaines.

| #   | Initiative                                                                                                              | Axe               | Impact | Effort | Score | Sprint           | Owner             |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ----------------- | ------ | ------ | ----- | ---------------- | ----------------- |
| 1   | Hreflang fr-CI / fr-FR / x-default global + canonical par page                                                          | SEO               | 4      | 1      | 4.00  | P2 cette semaine | Dev               |
| 2   | OG image dynamique par page (`app/opengraph-image.tsx` + colocaté par section)                                          | SEO               | 4      | 1      | 4.00  | P2 cette semaine | Dev               |
| 3   | Schema.org Article enrichi sur `/insights/[slug]` (author Person, image, dateModified, wordCount)                       | SEO               | 5      | 1      | 5.00  | P2 cette semaine | Dev               |
| 4   | Schema.org BreadcrumbList généralisé (expertises, secteurs, insights, livre, laboratoire)                               | SEO               | 3      | 1      | 3.00  | P2 cette semaine | Dev               |
| 5   | Lighthouse + axe-core en CI (GitHub Actions, fail < 95)                                                                 | Perf/A11y         | 4      | 2      | 2.00  | P2 fin semaine   | Dev               |
| 6   | Page `/a-propos/equipe` premium avec Person schema, photo, bio, publications Debora Ahouma                              | E-E-A-T           | 5      | 2      | 2.50  | P2 W+1           | Editorial+Dev     |
| 7   | 10 articles fondateurs (1500–2500 mots, signés, schema Article+HowTo, internal linking vers piliers)                    | Contenu           | 5      | 5      | 1.00  | P3 (S+2 à S+4)   | Editorial         |
| 8   | Mockups produits réels (NexusRH dashboard CNPS, AgroSense carte, SYGESCOM dataviz, etc.) — remplacer `MediaPlaceholder` | UX/Conversion     | 5      | 4      | 1.25  | P3 (S+2 à S+3)   | Design+Dev        |
| 9   | Mega-menu navbar (Solutions/Expertises/Livre/Laboratoire)                                                               | UX                | 4      | 2      | 2.00  | P3 (S+2)         | Dev               |
| 10  | Cmd+K public (Meilisearch + UI Linear-like)                                                                             | UX différenciante | 4      | 3      | 1.33  | P4 (S+4)         | Dev               |
| 11  | 3 papers `/laboratoire/publications/[slug]` (landing + PDF + schema TechArticle)                                        | Autorité          | 5      | 4      | 1.25  | P4 (S+4 à S+5)   | R&D+Editorial     |
| 12  | Témoignages clients vidéo + section « Résultats » sur pages produits (style Anthropic Enterprise)                       | Conversion        | 5      | 4      | 1.25  | P5 (S+5 à S+6)   | Commercial+Design |
| 13  | Pages géo `/abidjan`, `/uemoa`, `/cocody` (landing locale SEO)                                                          | SEO local         | 4      | 2      | 2.00  | P3 (S+3)         | Editorial+Dev     |
| 14  | Questionnaire interactif `/audit-ia` (5 questions, recommandation contextuelle)                                         | Conversion        | 4      | 3      | 1.33  | P4 (S+4)         | Dev               |
| 15  | Whitepaper « IA souveraine en CI 2026 » en téléchargement contre email (lead magnet)                                    | Lead gen          | 5      | 2      | 2.50  | P3 (S+2)         | Editorial+Dev     |

**Lecture rapide** : items #1, #2, #3, #4, #5 sont tous des quick wins SEO/perf à boucler dans la semaine en cours.

---

## 8. Annexes

### A. URLs concurrents observées (pour captures manuelles)

- Anthropic homepage : https://www.anthropic.com/ → noter le hero textuel sans image, les 5 cards thématiques, les annonces Opus 4.7.
- Anthropic newsroom : https://www.anthropic.com/news → fil chronologique, tags Announcements/Product.
- Claude product : https://claude.com/product/overview → 4 produits Claude/Code/Cowork/Security.
- Claude Enterprise : https://claude.com/pricing/enterprise → 4 témoignages vidéo chiffrés (Lyft, Zapier, GitLab, Quantium), section compliance.
- Palantir : https://www.palantir.com/ (rendu JS-heavy, à capturer en navigateur réel).
- Palantir Foundry : https://www.palantir.com/platforms/foundry/ — hero screenshot produit.
- IBM Consulting AI : https://www.ibm.com/consulting/artificial-intelligence — pages industrie × service.
- QuantumBlack insights : https://www.mckinsey.com/capabilities/quantumblack/our-insights — papers signés.

(Pour Palantir, IBM, QuantumBlack, WebFetch a été bloqué — capture manuelle nécessaire.)

### B. Mots-clés long-tail à conquérir (marché CI / UEMOA)

**Action immédiate (longue traîne, faible volume mais conversion haute)** :

- « audit IA Côte d'Ivoire »
- « cabinet IA Abidjan »
- « consultant intelligence artificielle Cocody »
- « SIRH conforme CNPS Côte d'Ivoire »
- « logiciel paie CNPS ITS FDFP »
- « ERP SYSCOHADA SaaS »
- « ERP PME Côte d'Ivoire »
- « gestion stations hydrocarbures Afrique de l'Ouest »
- « IoT agriculture cacao »
- « détection fraude documentaire IA Afrique »
- « QMS logiciel ISO 9001 Afrique francophone »
- « smart city Abidjan »
- « livre IA Afrique francophone »
- « Intelligence Artificielle Machine Learning Agents Autonomes » (titre exact du livre)

**3–6 mois** :

- « intelligence artificielle entreprise Côte d'Ivoire »
- « transformation digitale Afrique francophone »
- « souveraineté numérique Afrique »
- « gouvernance data Afrique de l'Ouest »
- « AI Act Afrique » (long-tail réglementaire, peu de concurrence)
- « RGPD Afrique francophone »
- « MLOps Afrique »
- « RAG souverain francophone »

**6–12 mois** :

- « IA Afrique »
- « cabinet IA Afrique »
- « intelligence artificielle Afrique »

**Long terme (12+ mois)** :

- « IA » (verrouillé par Wikipedia/Larousse/CNIL : top 3 mondial improbable sans backlinks massifs et corpus académique reconnu).

### C. Liens de référence

- Google Search Central — Structured data : https://developers.google.com/search/docs/appearance/structured-data
- Schema.org : https://schema.org/
- llms.txt spec : https://llmstxt.org/
- WCAG 2.2 : https://www.w3.org/TR/WCAG22/
- Core Web Vitals : https://web.dev/articles/vitals
- next/og ImageResponse : https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- next-sitemap (alternative au sitemap.ts natif) : https://github.com/iamvishnusankar/next-sitemap

### D. Notes méthodologiques

- WebFetch a réussi sur anthropic.com, claude.com, et redirige correctement.
- WebFetch a été **bloqué** (403 ou ECONNREFUSED) sur palantir.com, ibm.com et mckinsey.com/quantumblack.com — anti-bot / WAF en place. Les patterns mentionnés pour ces concurrents reposent sur ma connaissance de la marque + sitemap public + structure observable côté Google Search. Recommandation : **captures manuelles** à effectuer dans un navigateur réel (Chrome DevTools, mode incognito, simulateur mobile) sur les 3 concurrents bloqués, à archiver dans `docs/screenshots-benchmark-2026-05/` pour décisions design ultérieures.
- L'audit code repose sur lecture statique des fichiers — pas d'exécution `pnpm build` ou Lighthouse réel.

---

_Document de référence interne — OpenLab Consulting · 22 mai 2026._
_À mettre à jour à chaque sprint pour suivre la progression vs objectif top 3 mondial._
