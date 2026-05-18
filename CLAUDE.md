# CLAUDE.md — OpenLab Consulting · Refonte 2026 (v2.0)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Projet** : Site web premium d'OpenLab Consulting + back-office d'administration, déployable sur cluster K3s Hetzner en moins de 10 minutes.
> **Mission de Claude Code** : construire un site qui dépasse les meilleurs cabinets africains et internationaux, assume une identité ivoirienne premium, expose l'écosystème produits OpenLab (NexusRH CI, NexusERP, SYGESCOM, AgroSense CI, QualitOS, Fraud Shield, Smart City) et le livre « Intelligence Artificielle : du Machine Learning aux Agents Autonomes ».
> **Règle d'or** : _Aucun visiteur ne doit pouvoir confondre ce site avec un autre cabinet de conseil dans le monde._
> **Règle de Claude Code** : _ne jamais refactoriser ou modifier ce qui n'a pas été explicitement demandé. Toute migration de stack, tout changement architectural non sollicité doit être proposé avant d'être exécuté._

---

## QUICK REFERENCE — à lire en premier

### État du repo

- **Phase courante : P1 terminée.** Design system & shell applicatif posés : polices self-hostées (Bricolage, Geist, JetBrains Mono, Fraunces), 5 atomes (Container, Heading, Eyebrow, Button, Logo), Navbar responsive avec menu mobile, Footer 4 colonnes, middleware sécurité (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP/CORP, HSTS prod). **51 tests verts** · coverage 93.68 % · First Load JS 103 kB.
- **Prochaine étape** : **P2 — Homepage 11 sections** (cf. §6) avec hero WebGL léger, bandeau réassurance, expertises, laboratoire signature, cas client, showcase produits, manifeste, encart livre, insights, audit IA, footer premium.
- Mettre à jour cette ligne dès qu'on franchit une nouvelle phase.

### Stack (résumé — détails en §2)

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind v4 · Motion v12 · Drizzle ORM + PostgreSQL 17 · Redis 7 · Payload CMS v3 · Better-Auth + Keycloak · MinIO · Meilisearch · pnpm · Docker multi-stage distroless · K3s Hetzner · Traefik · cert-manager · GitHub Actions → GHCR.

### Commandes disponibles

```bash
# Dev local
pnpm install
pnpm dev                              # Next.js dev server (Turbopack) → http://localhost:3000
docker compose up -d                  # Postgres + Redis + MinIO + Meilisearch

# Portes vertes (à passer avant chaque PR — cf. plan de phases)
pnpm format:check                     # Prettier vérification
pnpm lint                             # ESLint flat config
pnpm typecheck                        # tsc --noEmit
pnpm test                             # Vitest run unit
pnpm test:watch                       # Vitest watch
pnpm test:coverage                    # avec seuils 80 % lignes / 75 % branches
pnpm test -- home-page                # un seul fichier de test
pnpm test:e2e                         # Playwright (squelette à P0, vrais scénarios dès P2)
pnpm test:e2e --grep "smoke"          # un seul scénario E2E

# Build & image
pnpm build                            # Next.js production build (standalone)
docker build -t openlab-website:dev . # Image distroless (cf. §13)

# Déploiement (activé à P11 — cf. §14.5, cible < 10 min)
bash deploy/scripts/deploy.sh production <image-tag>
bash deploy/scripts/rollback.sh
```

> **Astuce Windows** : si `%TEMP%` est sur un disque saturé, exporter `TMPDIR=/d/tmp TMP=D:/tmp TEMP=D:/tmp` avant `pnpm test`/`pnpm build` (Vitest/Next.js y écrivent des artefacts temporaires).

### Où chercher quoi

| Question                              | Section |
| ------------------------------------- | ------- |
| Quelle stack, quelles versions ?      | §2      |
| Couleurs, polices, tokens design ?    | §3      |
| Routes / arborescence du site ?       | §5      |
| Que doit contenir la homepage ?       | §6      |
| Spec d'une page produit ?             | §7      |
| Espace livre IA ?                     | §8      |
| Modules admin Payload ?               | §9      |
| Headers HTTP, rate limiting, RGPD ?   | §10     |
| Rôles, RBAC, 2FA ?                    | §11     |
| SEO, schema.org, llms.txt ?           | §12     |
| Dockerfile, multi-stage ?             | §13     |
| Manifests K8s, script deploy.sh ?     | §14     |
| Backups, alertes Prometheus ?         | §15     |
| Quelle étape implémenter maintenant ? | §16.2   |
| Checklist avant mise en ligne ?       | §17     |
| Ton de marque, formules à éviter ?    | §18     |

### Règles non négociables (rappel)

1. **Ne rien refactoriser non demandé.** Proposer avant toute migration de stack.
2. **Pas de TODO / `any` / `console.log` / mocks** en code committé.
3. **Performance** : Lighthouse mobile ≥ 95, LCP < 1.8 s, bundle first-load < 150 kB gz (§2.3).
4. **Sécurité OWASP** : checklist §10 obligatoire à chaque PR sensible.
5. **Polices interdites** : Inter, Roboto, Open Sans, Poppins, Montserrat (§3.3).
6. **Orange < 15 %** de la surface visible à tout instant (§3.2).
7. **Commits sémantiques** : `feat(home): …`, `fix(auth): …` — 1 branche par feature.

### Architecture cible (vue d'avion)

Mono-repo Next.js qui embarque **trois surfaces** dans la même base de code et la même image Docker :

1. **Site public** (`app/(public)/...`) — marketing, produits, livre, insights. SSR/ISR.
2. **Back-office Payload CMS v3** (`app/(payload)/admin`, collections dans `payload.config.ts`) — partage la **même PostgreSQL** que le site, génère son propre back-office React.
3. **API & Server Actions** (`app/api/*`, `actions/*`) — health, metrics, contact, audit-ia, chat assistant Claude, webhooks.

Tout est servi par **un seul `Deployment` K8s** (cf. §14.3), derrière Traefik. Postgres / Redis / MinIO / Meilisearch sont des dépendances dans le même namespace `openlab`. Auth unifiée via Better-Auth + Keycloak SSO (partagé avec NexusRH déjà en prod).

---

## TABLE DES MATIÈRES

1. Contexte stratégique
2. Stack technique imposée
3. Identité visuelle
4. Principes UX/UI
5. Arborescence complète du site public
6. Structure homepage
7. Pages produits — l'écosystème OpenLab
8. Le livre « IA & Agents Autonomes » — espace dédié
9. Back-office d'administration premium
10. Sécurité — conformité OWASP ASVS / Top 10
11. Authentification & autorisation
12. SEO — stratégie complète & technique
13. Conteneurisation Docker — multi-stage
14. Déploiement K3s Hetzner < 10 minutes
15. Observabilité, sauvegardes, DR
16. Workflow Claude Code & ordre d'implémentation
17. Checklist de qualité avant mise en ligne
18. Phrases de marque & ton
19. Roadmap condensée
20. Critère final de réussite

---

## 1. CONTEXTE STRATÉGIQUE

### 1.1 Société

- **Raison sociale** : OpenLab Consulting SARL
- **RCCM** : CI-ABJ-03-2022-B13-03239
- **Siège** : Abidjan, Cocody, Riviera Faya Lauriers 8, Côte d'Ivoire
- **CEO** : Debora Ahouma
- **Contacts** : +225 07 09 33 42 38 · +33 06 19 24 53 29 · waopron@openlabconsulting.com · infos@openlabconsulting.com
- **Domaine** : openlabconsulting.com
- **Partenaire technique** : EXPERTISE-IA (Grasse, France) — co-éditeur du livre IA

### 1.2 Positionnement

> **« Cabinet ivoirien d'IA appliquée, R&D produit et publication de référence pour l'Afrique francophone. »**

Trois piliers :

1. **Conseil & Intégration IA** — diagnostiquer, déployer, gouverner
2. **R&D OpenLab** — laboratoire qui produit 7 logiciels propriétaires (différenciateur majeur)
3. **Édition & Acculturation** — livre IA, formations, conférences, livres blancs

### 1.3 Écosystème produits propriétaires

| Produit                  | Domaine                                                   | Marché cible                        | Statut                           |
| ------------------------ | --------------------------------------------------------- | ----------------------------------- | -------------------------------- |
| **NexusRH CI**           | SIRH IA (paie, CNPS, ITS, FDFP, Mobile Money)             | PME & grandes entreprises CI        | Production — déployé K3s Hetzner |
| **NexusERP**             | ERP nouvelle génération (SYSCOHADA, Java 21 + Angular 18) | PME multi-secteurs FR/UEMOA         | Production                       |
| **SYGESCOM v2.0**        | Gestion réseaux stations hydrocarbures                    | Afrique de l'Ouest                  | Production                       |
| **AgroSense CI**         | IoT précision agriculture (cacao, anacarde, coton)        | Coopératives & exploitants CI       | MVP avancé                       |
| **QualitOS**             | QMS multi-méthodes (PDCA, 5S, DMAIC, ISO)                 | Industrie, santé, services          | En développement                 |
| **OpenLab Fraud Shield** | Détection fraude documentaire par IA                      | Banques, assurances, administration | Production                       |
| **OpenLab Smart City**   | IA sécurité urbaine (anticiper, modéliser, protéger)      | Collectivités, ministères           | Pilote                           |

### 1.4 Publication phare

**Livre** : _Intelligence Artificielle : du Machine Learning aux Agents Autonomes_

- **Co-édition** : EXPERTISE-IA (Grasse) + Openlab Consulting (Abidjan)
- **Public** : étudiants ingénieurs, data scientists, dirigeants, professeurs
- **Couverture** : ML supervisé/non supervisé, séries temporelles, RAG, multi-agents, MLOps, sécurité IA, industrialisation Kubernetes
- **Capstone du livre** : AgroSense CI (étude de cas terrain ivoirienne)
- **Le site doit avoir un espace dédié au livre** (voir §8)

### 1.5 Concurrents à surclasser

- **International** : Palantir, Anthropic, IBM Consulting, Deloitte AI, Accenture, McKinsey QuantumBlack
- **Régional Afrique** : Forvis Mazars CI, Data Consulting Group CI, Yadec Consulting, Meraky Tech
- **Local Abidjan** : agences digitales génériques

**Notre triple avantage** : conseil stratégique + R&D produit + édition académique. Aucun concurrent local ne fait les trois. Aucun concurrent international n'a notre légitimité africaine.

---

## 2. STACK TECHNIQUE

### 2.1 Stack imposée

```
Framework        : Next.js 15 (App Router, Server Components, Turbopack, Server Actions)
Langage          : TypeScript 5.5+ strict
Styling          : Tailwind CSS v4 (CSS variables natives)
Animations       : Motion v12 (ex-Framer Motion)
3D / WebGL       : Three.js + React Three Fiber (hero & laboratoire uniquement)
Icônes           : Lucide React
Formulaires      : React Hook Form + Zod
Base de données  : PostgreSQL 17 (même cluster K3s)
ORM              : Drizzle ORM (typesafe, léger, parfait pour Next.js)
Cache            : Redis 7 (sessions, rate limit, file uploads)
CMS              : Payload CMS v3 (self-hosted, Node.js, intégré Next.js)
Authentification : Better-Auth (Next.js natif) + Keycloak (SSO unifié avec NexusRH)
i18n             : next-intl (FR par défaut, EN en S2)
Analytics        : Plausible self-hosted (RGPD)
Email transac    : Resend ou Brevo SMTP
Storage fichiers : MinIO self-hosted (S3-compatible, dans le cluster)
IA on-site       : Anthropic Claude API (assistant + audit IA + résumés blog)
Recherche        : Meilisearch self-hosted (rapide, faible RAM)
Conteneurisation : Docker multi-stage + Distroless
Orchestration    : K3s sur Hetzner (cluster existant NexusRH)
Ingress          : Traefik (natif K3s)
Certificats      : cert-manager + Let's Encrypt
Secrets          : SealedSecrets (Bitnami) ou External Secrets Operator
CI/CD            : GitHub Actions → GHCR → ArgoCD (GitOps)
Monitoring       : Prometheus + Grafana + Loki + Promtail (stack déjà en place pour NexusRH)
```

### 2.2 Pourquoi Payload CMS et non Sanity

Décision révisée après prise en compte du contexte K3s self-hosted :

- **Payload CMS v3** s'embarque directement dans le projet Next.js, partage la même base PostgreSQL et le même déploiement Docker. Aucune dépendance SaaS externe.
- **Sanity** aurait imposé une dépendance cloud externe (sanity.io), payante au-delà du free tier, et un déploiement séparé.
- Payload offre : back-office React généré automatiquement, API REST + GraphQL, draft/preview, versioning, access control par rôles, hooks, jobs queue — exactement ce dont nous avons besoin pour l'admin premium.

### 2.3 Performance — non négociable

- **Lighthouse Performance ≥ 95** sur mobile (4G simulé)
- **LCP < 1.8 s** · **CLS < 0.05** · **INP < 200 ms**
- **Bundle JS first-load < 150 kB** gzipped
- Images : AVIF avec fallback WebP, `next/image`, lazy loading natif
- Police : self-hosting via `next/font`, subset latin, font-display: swap
- ISR pour pages CMS (revalidate 60 s)

---

## 3. IDENTITÉ VISUELLE — RÈGLES STRICTES

### 3.1 Palette (extraite des 18 visuels OpenLab existants)

```css
:root {
  /* Primaires */
  --ol-orange: #ff5a00;
  --ol-orange-light: #ff7a33;
  --ol-orange-dark: #cc4800;

  /* Structurantes */
  --ol-night: #0a0e1a;
  --ol-navy: #0b1b3d;
  --ol-navy-soft: #142654;

  /* Neutres */
  --ol-white: #ffffff;
  --ol-ivory: #faf8f5;
  --ol-graphite: #1a1d24;
  --ol-mist: #e8eaf0;

  /* Fonctionnelles */
  --ol-success: #22c55e;
  --ol-danger: #dc2626;
  --ol-info-blue: #2563eb;

  /* Dégradés signature */
  --ol-gradient-hero: linear-gradient(
    135deg,
    #ff5a00 0%,
    #c2185b 50%,
    #1a1d54 100%
  );
  --ol-gradient-rd: linear-gradient(180deg, #0a0e1a 0%, #1a0f2e 100%);
}
```

### 3.2 Règles couleur

- Orange < 15% de la surface visible à tout instant
- Noir profond #0A0E1A pour expertise IA, R&D, vision
- Bleu navy #0B1B3D pour univers produits (cohérent NexusRH/SYGESCOM)
- Ivory #FAF8F5 pour sections éditoriales (jamais #FFF en grande surface)

### 3.3 Typographie

```css
--font-display: 'Bricolage Grotesque', sans-serif; /* Titres hero */
--font-body: 'Geist', sans-serif; /* Corps */
--font-mono: 'JetBrains Mono', monospace; /* Code, data */
--font-editorial: 'Fraunces', serif; /* Citations, manifeste, livre */
```

**Interdit absolument** : Inter, Roboto, Open Sans, Poppins, Montserrat — marqueurs d'AI slop.

### 3.4 Logo

- Garder le logo orange existant
- Créer 3 variantes : `logo-dark.svg`, `logo-light.svg`, `logo-mark.svg`
- Espace de respiration : marge ≥ hauteur du "O"

---

## 4. PRINCIPES UX/UI

### 4.1 Règle des 3 clics

Toute info critique accessible en ≤ 3 clics depuis la home.

### 4.2 Hiérarchie

- 1 seul CTA primaire par section
- 1 CTA secondaire maximum
- Above-the-fold : valeur + preuve + action

### 4.3 Lisibilité

- Corps 17-18 px, line-height 1.65
- 60-75 caractères par ligne
- Contraste WCAG AAA sur texte principal (≥ 7:1)

### 4.4 Mobile-first absolu

70% du trafic africain est mobile. Touch targets ≥ 44 × 44 px.

### 4.5 Densité informationnelle

Les visuels OpenLab sont denses (dashboards, stats). Le site doit refléter cette signature — pas de "hero vide + 5 sections corporate".

### 4.6 Animations purpose-driven

- 200 ms (micro) · 400 ms (transitions) · 800 ms (révélations)
- Easing : `cubic-bezier(0.22, 1, 0.36, 1)`
- Respect `prefers-reduced-motion`

### 4.7 Accessibilité WCAG 2.2 AA minimum

- Navigation clavier complète
- Aria-labels sur tous les boutons icônes
- Focus ring orange custom (2px offset 2px)
- Skip-to-content link
- axe-core en CI

### 4.8 Système

Un seul `tokens.ts`. Spacing scale Tailwind. Aucun magic number.

### 4.9 Pas de cul-de-sac

Toute page se termine par un CTA contextuel.

### 4.10 No generic

Bannis : "Notre mission…", illustrations isométriques, "Pourquoi nous choisir ?" + 4 cards, chiffres ronds non sourcés, stock photos.

---

## 5. ARBORESCENCE COMPLÈTE DU SITE PUBLIC

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
/livre                             Espace livre IA (voir §8)
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

---

## 6. STRUCTURE HOMEPAGE

11 sections :

1. **Hero 100vh** — _« L'IA, au service des réalités africaines. »_ + canvas WebGL léger
2. **Bandeau réassurance** — logos clients SIDO, HCI, Sertemef, DOCI
3. **« Ce que nous transformons »** — 4 expertises en cards
4. **Laboratoire OpenLab** (signature, fond noir, soin maximal)
5. **Cas client narré** (SYGESCOM avant/après recommandé)
6. **Showcase produits** — les 7 produits propriétaires en carrousel
7. **Manifeste** « Cette fois, l'Afrique n'a plus d'excuse »
8. **Encart livre IA** — promo couverture + extrait gratuit
9. **Insights** — 3 derniers articles
10. **Audit IA gratuit** (lead magnet)
11. **Footer premium**

---

## 7. PAGES PRODUITS — L'ÉCOSYSTÈME OPENLAB

### 7.1 Template commun de page produit

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

### 7.2 Particularités par produit

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

---

## 8. LE LIVRE — ESPACE DÉDIÉ

### 8.1 Pourquoi un espace dédié

Un livre publié change la perception de marque. OpenLab passe de « cabinet » à « cabinet-éditeur ». Cela renforce :

- la crédibilité académique (DGI, ministères, universités)
- le SEO sur "livre IA Afrique francophone"
- la légitimité de vendre des formations

### 8.2 Pages du sous-site /livre

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

### 8.3 Effet de halo

- Insights : articles renvoient à un chapitre
- Laboratoire : valorise les recherches publiées
- Footer : encart permanent « Notre livre IA »
- Schema.org : `Book` + `Author` + `Review`

---

## 9. BACK-OFFICE D'ADMINISTRATION PREMIUM

L'admin est aussi soignée que le site public. Rédacteurs et admins y passent leur journée — elle doit être un plaisir.

### 9.1 Principes

1. **Même charte** que le site public
2. **Ergonomie cockpit** : tout atteignable en 2 clics
3. **Densité informationnelle** : pas de "vide UX"
4. **Aperçu temps réel** : draft/preview
5. **Recherche globale instantanée** (Cmd+K)
6. **Multi-langues** dès le départ
7. **Historique et versioning** sur chaque document
8. **Audit log** complet

### 9.2 Stack admin

Payload CMS v3 fournit nativement :

- Back-office React généré
- Auth + 2FA
- RBAC access control
- Versioning, draft, preview
- Live preview Next.js
- File uploads + sharp
- Localization
- REST + GraphQL API
- Hooks (before/after change)
- Jobs queue

À customiser visuellement pour respecter notre charte.

### 9.3 Modules admin

```
ADMIN /admin
├── Dashboard
│   ├── KPIs : visites/jour, leads, conversions audit IA
│   ├── Derniers leads (score IA de qualification)
│   ├── Articles en draft, à publier
│   ├── Démos produits demandées
│   └── Alertes (spam, build échec, certif expirant)
│
├── Contenu
│   ├── Articles (CRUD, catégories, tags, auteurs)
│   ├── Pages
│   ├── Études de cas
│   ├── Témoignages clients
│   ├── Livres blancs
│   └── FAQs
│
├── Produits
│   ├── 7 fiches produit
│   ├── Fonctionnalités composables
│   ├── Tarifications
│   └── Demandes de démo (CRM léger)
│
├── Livre
│   ├── Métadonnées
│   ├── Chapitres
│   ├── Extraits
│   ├── Préfaces & témoignages
│   └── Ventes (suivi Stripe)
│
├── Médias
│   ├── Bibliothèque MinIO
│   ├── Upload drag-and-drop
│   ├── Recherche par tag, couleur, date
│   └── Conversion auto AVIF/WebP
│
├── Leads & CRM
│   ├── Pipeline Kanban (Nouveau, Qualifié, RDV, Proposition, Signé, Perdu)
│   ├── Score IA par lead (Claude)
│   ├── Audit IA soumis
│   └── Export CSV
│
├── Insights IA
│   ├── Génération assistée d'articles (brouillon Claude)
│   ├── Résumé auto d'un article
│   ├── Suggestions mots-clés SEO
│   └── Détection plagiat (option)
│
├── SEO & Marketing
│   ├── Méta titres/descriptions par page
│   ├── Sitemaps auto
│   ├── Schema.org par contenu
│   ├── Redirections 301
│   ├── Newsletters (Brevo)
│   └── Tracking conversions
│
├── Utilisateurs & Rôles
│   ├── Admin · Éditeur · Auteur · Lecteur
│   ├── Permissions granulaires par collection
│   ├── 2FA obligatoire pour admin
│   └── Audit log
│
└── Système
    ├── Health checks (DB, Redis, MinIO, Claude API)
    ├── Sauvegardes (statut, restauration)
    ├── Logs (Loki integration)
    ├── Variables d'environnement (lecture seule)
    └── Webhooks
```

### 9.4 Design admin — règles

- Sidebar fixe à gauche (220 px), repliable
- Top bar : recherche Cmd+K, notifications, profil
- Tables : virtualisation > 100 lignes, filtres en haut, tri par colonne
- Formulaires : auto-save toutes les 15 s, indicateur visible
- Mode sombre activable
- Toasts non bloquants en bas à droite
- Onboarding : tour guidé première connexion

### 9.5 Génération assistée IA (différenciateur admin)

Dans `/admin/insights/ia` :

- **Générer brouillon article** : titre + brief → Claude → article 1500 mots
- **Améliorer un draft** : sélection texte → reformuler / raccourcir / allonger / changer ton
- **SEO optimizer** : analyse mots-clés + suggestions
- **Image alt automatique** : à l'upload, Claude génère alt + caption FR
- **Traduction FR → EN** en un clic (phase 2)

Coût plafonné : 30 €/mois max via rate-limiting serveur.

---

## 10. SÉCURITÉ — CONFORMITÉ OWASP

### 10.1 Référentiels suivis

- **OWASP Top 10 (2021)** — couverture intégrale
- **OWASP ASVS 4.0.3** — niveau 2 minimum
- **OWASP API Security Top 10 (2023)**
- **CNIL/RGPD** — droit ivoirien (Loi 2013-450) + européen
- **NIST Cybersecurity Framework**

### 10.2 Couverture OWASP Top 10

| #       | Risque                             | Mitigation                                                                                          |
| ------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| **A01** | Broken Access Control              | RBAC strict Payload, vérification serveur sur chaque route API, deny by default, tests E2E par rôle |
| **A02** | Cryptographic Failures             | TLS 1.3, HSTS max-age 1 an, AES-256 data at rest (PostgreSQL TDE), bcrypt cost 12, SealedSecrets    |
| **A03** | Injection                          | Drizzle ORM paramétré, Zod validation, échappement React, CSP stricte                               |
| **A04** | Insecure Design                    | Threat modeling sur features sensibles, tests d'abus en CI                                          |
| **A05** | Security Misconfiguration          | Distroless images, no shell prod, headers via middleware, .env jamais commit                        |
| **A06** | Vulnerable Components              | Renovate Bot, pnpm audit en CI, Trivy scan images, Snyk                                             |
| **A07** | Identification & Auth Failures     | Better-Auth + 2FA TOTP, rate limit login (5/15min), session rotation, password policy 12+ chars     |
| **A08** | Software & Data Integrity Failures | SBOM signé Cosign, images container signées, lockfiles committed                                    |
| **A09** | Security Logging & Monitoring      | Loki + Grafana, alertes 5xx > 1%, 401/403 > 10/min                                                  |
| **A10** | SSRF                               | Whitelist domaines outbound, validation URL Zod, NetworkPolicy K3s                                  |

### 10.3 Headers HTTP de sécurité

Via middleware Next.js (`middleware.ts`) :

```typescript
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-{NONCE}' https://plausible.openlabconsulting.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.anthropic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
'X-Frame-Options': 'DENY'
'X-Content-Type-Options': 'nosniff'
'Referrer-Policy': 'strict-origin-when-cross-origin'
'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)'
'Cross-Origin-Opener-Policy': 'same-origin'
'Cross-Origin-Embedder-Policy': 'credentialless'
'Cross-Origin-Resource-Policy': 'same-origin'
```

Cible : note A+ sur securityheaders.com

### 10.4 Rate limiting (Redis-backed)

| Endpoint                     | Limite                                              |
| ---------------------------- | --------------------------------------------------- |
| `POST /api/contact`          | 5 req / 15 min / IP                                 |
| `POST /api/audit-ia`         | 3 req / 1 h / IP                                    |
| `POST /api/chat` (assistant) | 20 req / 1 min / session                            |
| `POST /admin/login`          | 5 req / 15 min / IP, lockout 30 min après 10 échecs |
| `GET /*`                     | 200 req / 1 min / IP                                |
| `*` (global)                 | 1000 req / 1 min / IP                               |

### 10.5 Anti-bot & anti-spam

- **Cloudflare Turnstile** sur formulaires publics (gratuit, RGPD-friendly)
- **Honeypot fields** invisibles
- **Validation Zod stricte** serveur
- **Détection spam IA** : Claude API analyse en arrière-plan

### 10.6 Données personnelles & RGPD

- Bandeau cookies minimal (Plausible n'en pose pas → souvent inutile)
- Politique confidentialité complète
- Droit à l'oubli : `/api/data-export` et `/api/data-delete` (auth)
- DPO désigné : nom et email dans mentions légales
- Registre des traitements (admin → système)
- Données en Allemagne (Hetzner Falkenstein/Nuremberg) — conforme RGPD UE

### 10.7 Sauvegardes & DR

- **PostgreSQL** : pgBackRest ou wal-g, incrémental horaire, full quotidien
- **MinIO** : réplication asynchrone vers second bucket
- **Rétention** : 30 jours quotidiens + 12 mois mensuels
- **Storage backups** : Backblaze B2 (off-site)
- **Test restauration** : CronJob automatisé toutes les 2 semaines
- **RPO** : 1 h · **RTO** : 30 min

---

## 11. AUTHENTIFICATION & AUTORISATION

### 11.1 Site public

- Pas de compte obligatoire
- Inscription optionnelle pour : audit IA, livre companion, extraits livre
- Better-Auth avec : email + password + 2FA optionnel, social login LinkedIn (B2B) + Google

### 11.2 Admin

- **Better-Auth + Keycloak SSO** unifié avec NexusRH déjà déployé
- **2FA OBLIGATOIRE** (TOTP via Aegis, Authy, Google Authenticator)
- **Politique mot de passe** : 12+ chars, zxcvbn ≥ 3, rotation 6 mois admins, historique 5 derniers interdits
- **Session** : cookie httpOnly secure sameSite=lax, rolling 30 min idle, 8 h absolu, rotation à chaque login
- **Account lockout** : 10 échecs / 30 min → blocage 30 min + alerte email admin
- **Audit log** : chaque action sensible (CRUD, login, export) loggée avec timestamp, user, IP, user-agent, ressource, action

### 11.3 Rôles admin

```
SUPER_ADMIN     Tous droits + gestion users + paramètres système
ADMIN           Tous droits sauf gestion users
EDITOR_CHIEF    CRUD complet contenu + produits + livre + voit leads
EDITOR          CRUD articles, médias, FAQs
AUTHOR          CRUD ses propres articles uniquement (soumission validation)
VIEWER          Lecture seule (dashboard, KPIs)
```

### 11.4 Implémentation

```typescript
// lib/auth/permissions.ts
export const permissions = {
  articles: {
    create: ['SUPER_ADMIN', 'ADMIN', 'EDITOR_CHIEF', 'EDITOR', 'AUTHOR'],
    update: (user, doc) => {
      if (
        ['SUPER_ADMIN', 'ADMIN', 'EDITOR_CHIEF', 'EDITOR'].includes(user.role)
      )
        return true;
      if (user.role === 'AUTHOR' && doc.author === user.id) return true;
      return false;
    },
    delete: ['SUPER_ADMIN', 'ADMIN', 'EDITOR_CHIEF'],
    publish: ['SUPER_ADMIN', 'ADMIN', 'EDITOR_CHIEF'],
  },
};
```

Toute route admin : `assertPermission(user, resource, action)` côté serveur.

---

## 12. SEO — STRATÉGIE COMPLÈTE & TECHNIQUE

### 12.1 Mots-clés cibles

**Faciles (longue traîne, action immédiate)**

- "cabinet IA Abidjan"
- "audit intelligence artificielle Côte d'Ivoire"
- "SIRH conforme CNPS Côte d'Ivoire"
- "ERP SYSCOHADA logiciel Afrique"
- "détection fraude documentaire IA Afrique"
- "consultant intelligence artificielle Cocody"
- "livre intelligence artificielle Afrique francophone"
- "logiciel agriculture précision cacao Côte d'Ivoire"

**Moyens (3-6 mois)**

- "intelligence artificielle entreprise Côte d'Ivoire"
- "transformation digitale Afrique francophone"
- "souveraineté numérique Afrique"
- "data gouvernance Afrique de l'Ouest"
- "smart city Abidjan"

**Long terme**

- "IA Afrique"
- "intelligence artificielle Afrique"

### 12.2 Pages piliers SEO

| Page                            | Mot-clé principal             |
| ------------------------------- | ----------------------------- |
| `/expertises/conseil-strategie` | "audit IA Côte d'Ivoire"      |
| `/solutions/nexusrh`            | "SIRH Côte d'Ivoire"          |
| `/solutions/nexuserp`           | "ERP SYSCOHADA"               |
| `/solutions/agrosense`          | "agriculture précision cacao" |
| `/laboratoire`                  | "R&D IA Afrique"              |
| `/livre`                        | "livre IA Afrique"            |

### 12.3 SEO technique — checklist

**Métadonnées par page**

- Title unique, ≤ 60 caractères, mot-clé en première moitié
- Meta description ≤ 155 caractères
- Canonical URL systématique
- Open Graph + Twitter Cards
- og:image dynamique généré pour chaque article (`opengraph-image.tsx`)

**Schema.org JSON-LD**

```typescript
// app/layout.tsx — Organization globale
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OpenLab Consulting",
  "url": "https://openlabconsulting.com",
  "logo": "https://openlabconsulting.com/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Riviera Faya Lauriers 8",
    "addressLocality": "Abidjan",
    "addressRegion": "Cocody",
    "addressCountry": "CI"
  },
  "contactPoint": [
    {"@type":"ContactPoint","telephone":"+225-07-09-33-42-38","contactType":"sales"}
  ],
  "sameAs": [
    "https://www.linkedin.com/company/openlab-consulting"
  ]
}
```

Types à implémenter :

- `Organization` (global)
- `LocalBusiness` (contact)
- `Article` + `BreadcrumbList` (blog)
- `Product` + `Offer` (produits)
- `Book` + `Author` (livre)
- `FAQPage` (FAQs)
- `Person` (équipe)

**Sitemap & robots**

```
/sitemap.xml          → généré par next-sitemap
/sitemap-index.xml    → si plusieurs sitemaps
/robots.txt           → autorise tout sauf /admin, /api
/feed.xml             → RSS insights
```

`robots.txt` :

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /_next

User-agent: GPTBot
Allow: /
Allow: /insights

User-agent: ClaudeBot
Allow: /
Allow: /insights

User-agent: PerplexityBot
Allow: /

Sitemap: https://openlabconsulting.com/sitemap.xml
```

**Hreflang**

```html
<link rel="alternate" hreflang="fr-CI" href="..." />
<link rel="alternate" hreflang="fr-FR" href="..." />
<link rel="alternate" hreflang="x-default" href="..." />
```

**Core Web Vitals (P75 mobile)**

- LCP < 1.8 s · INP < 200 ms · CLS < 0.05

### 12.4 Optimisation pour LLM crawlers (GEO)

- Robots.txt explicite pour GPTBot, ClaudeBot, PerplexityBot
- Résumé en 3 bullets en haut de chaque article (Claude API à la sauvegarde)
- Schema.org `Article` strict
- Données structurées (FAQs, tableaux, comment-faire)
- Page `/llms.txt` à la racine — convention émergente

```
# /public/llms.txt
# OpenLab Consulting
Cabinet ivoirien d'IA appliquée et de R&D pour l'Afrique francophone.

## Services principaux
- Conseil stratégique IA
- Intégration IA & agents
- Cybersécurité augmentée

## Produits propriétaires
- NexusRH CI : SIRH IA (paie, CNPS, Mobile Money)
- NexusERP : ERP SYSCOHADA
- SYGESCOM : gestion stations hydrocarbures
- AgroSense CI : agriculture précision
- QualitOS : QMS multi-secteurs
- Fraud Shield : détection fraude documentaire
- Smart City : IA sécurité urbaine

## Publication
Livre "Intelligence Artificielle : du Machine Learning aux Agents Autonomes"

## Contact
contact@openlabconsulting.com
+225 07 09 33 42 38
```

### 12.5 Contenu éditorial

**Cadence**

- 2 articles longs/semaine (1500-2500 mots)
- 1 livre blanc/trimestre
- 1 étude de cas/mois

**Catégories**

- IA en Afrique
- Souveraineté numérique
- Cybersécurité
- Conformité RH (CNPS, ITS, FDFP)
- Gouvernance data
- Smart Cities
- Fintech & Mobile Money
- Extraits du livre IA

**Format article optimal**

- H1 unique
- TOC sticky desktop
- H2 toutes les 300-400 mots
- Images AVIF + alt descriptifs
- Liens internes : 3-5
- Lien externe : 1-2 sources d'autorité
- Conclusion + CTA
- Auteur visible, dates pub + maj

### 12.6 Backlinks — plan d'action

**Mois 1 (gratuits)**

- Google Business Profile
- LinkedIn Company Page
- Crunchbase Africa
- Wikipedia (page "IA en Afrique")

**Mois 2-3 (presse)**

- Communiqué sortie livre IA → Jeune Afrique, Financial Afrik, Sika Finance
- Interview CEO Radio CI, RTI

**Mois 4-6 (contenu acquis)**

- Tribune Les Echos Afrique, Le Monde Afrique
- Conférence Africa Tech Week, Vivatech Africa
- Webinaires partenaires (universités, ministères)

---

## 13. CONTENEURISATION DOCKER

### 13.1 Stratégie multi-stage

Image finale **distroless**, < 200 Mo, surface d'attaque minimale, no shell.

**`Dockerfile`** :

```dockerfile
# syntax=docker/dockerfile:1.7-labs

# Stage 1: deps
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm config set store-dir /root/.local/share/pnpm/store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# Stage 2: builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN corepack enable && pnpm build

# Stage 3: runner (distroless)
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static
COPY --from=builder --chown=nonroot:nonroot /app/public ./public

USER nonroot
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1))"]

CMD ["server.js"]
```

### 13.2 next.config.ts (extrait clé)

```typescript
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@payloadcms/db-postgres', 'sharp'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

### 13.3 docker-compose.yml (développement local)

```yaml
version: '3.9'
name: openlab-website

services:
  app:
    build: { context: ., target: builder }
    command: pnpm dev
    ports: ['3000:3000']
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      DATABASE_URL: postgresql://openlab:devpass@postgres:5432/openlab
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio:9000
    depends_on: [postgres, redis, minio]

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: openlab
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: openlab
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports: ['5432:5432']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports: ['9000:9000', '9001:9001']

  meilisearch:
    image: getmeili/meilisearch:v1.10
    environment:
      MEILI_MASTER_KEY: devmasterkey
    volumes:
      - meili_data:/meili_data
    ports: ['7700:7700']

volumes:
  postgres_data:
  minio_data:
  meili_data:
```

### 13.4 Build & registry

- **GHCR** (gratuit, intégré GitHub)
- **Tags** : `latest`, `sha-<short>`, `v<semver>`
- **Multi-arch** : `linux/amd64` (suffit pour K3s Hetzner)
- **Scan sécurité** : Trivy en CI, blocage si CVE HIGH/CRITICAL
- **Signature** : Cosign keyless via OIDC GitHub

---

## 14. DÉPLOIEMENT K3S HETZNER < 10 MIN

### 14.1 Infrastructure existante

- **Cluster K3s** sur Hetzner (cf. NexusRH déjà déployé)
- **Ingress** : Traefik (natif K3s)
- **TLS** : cert-manager + Let's Encrypt
- **Monitoring** : Prometheus + Grafana + Loki déjà déployés
- **Storage** : Longhorn ou local-path
- **DNS** : openlabconsulting.com → IP load balancer Hetzner

### 14.2 Structure deploy/

```
deploy/
├── k8s/
│   ├── base/
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.sealedsecret.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── hpa.yaml
│   │   ├── networkpolicy.yaml
│   │   ├── pdb.yaml
│   │   └── migrate-job.yaml
│   ├── postgres/
│   │   ├── statefulset.yaml
│   │   ├── service.yaml
│   │   └── backup-cronjob.yaml
│   ├── redis/
│   ├── minio/
│   ├── meilisearch/
│   └── overlays/
│       ├── staging/
│       └── production/
└── scripts/
    ├── deploy.sh
    ├── rollback.sh
    └── seed-cms.sh
```

### 14.3 deployment.yaml essentiel

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: openlab-website
  namespace: openlab
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: openlab-website
  template:
    metadata:
      labels:
        app: openlab-website
    spec:
      serviceAccountName: openlab-website
      securityContext:
        runAsNonRoot: true
        runAsUser: 65532
        fsGroup: 65532
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: app
          image: ghcr.io/openlab-consulting/website:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
              name: http
          envFrom:
            - configMapRef:
                name: openlab-website-config
            - secretRef:
                name: openlab-website-secrets
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          livenessProbe:
            httpGet:
              path: /api/health
              port: http
            initialDelaySeconds: 15
            periodSeconds: 30
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /api/health
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ['ALL']
          volumeMounts:
            - name: tmp
              mountPath: /tmp
            - name: nextjs-cache
              mountPath: /app/.next/cache
      volumes:
        - name: tmp
          emptyDir: {}
        - name: nextjs-cache
          emptyDir: {}
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: openlab-website
```

### 14.4 ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: openlab-website
  namespace: openlab
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    traefik.ingress.kubernetes.io/router.middlewares: openlab-security-headers@kubernetescrd
spec:
  ingressClassName: traefik
  tls:
    - hosts: [openlabconsulting.com, www.openlabconsulting.com]
      secretName: openlab-tls
  rules:
    - host: openlabconsulting.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: openlab-website
                port:
                  number: 3000
    - host: www.openlabconsulting.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: openlab-website
                port:
                  number: 3000
```

### 14.5 Script de déploiement < 10 min

`deploy/scripts/deploy.sh` :

```bash
#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT=${1:-production}
IMAGE_TAG=${2:-latest}
NAMESPACE=openlab

echo "🚀 Déploiement OpenLab Website — env=$ENVIRONMENT, tag=$IMAGE_TAG"
START_TIME=$SECONDS

# 1. Pre-checks (< 30 s)
kubectl config use-context openlab-hetzner
kubectl get namespace $NAMESPACE >/dev/null 2>&1 || kubectl create namespace $NAMESPACE

# 2. Secrets SealedSecrets (< 10 s)
kubectl apply -f deploy/k8s/base/secret.sealedsecret.yaml

# 3. ConfigMaps (< 10 s)
kubectl apply -f deploy/k8s/base/configmap.yaml

# 4. Dépendances (postgres, redis, minio, meilisearch) — idempotent (< 2 min)
kubectl apply -f deploy/k8s/postgres/
kubectl apply -f deploy/k8s/redis/
kubectl apply -f deploy/k8s/minio/
kubectl apply -f deploy/k8s/meilisearch/

# 5. Wait postgres (< 1 min)
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=120s

# 6. Migrations DB (< 1 min)
kubectl apply -f deploy/k8s/base/migrate-job.yaml
kubectl wait --for=condition=complete job/migrate -n $NAMESPACE --timeout=180s

# 7. Update image (< 10 s)
kubectl set image deployment/openlab-website \
  app=ghcr.io/openlab-consulting/website:$IMAGE_TAG \
  -n $NAMESPACE

# 8. Rollout (< 4 min, rolling sans interruption)
kubectl rollout status deployment/openlab-website -n $NAMESPACE --timeout=300s

# 9. Smoke test (< 30 s)
INGRESS_IP=$(kubectl get ingress openlab-website -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -fsS --max-time 10 -H "Host: openlabconsulting.com" "https://$INGRESS_IP/api/health" \
  || (echo "❌ Health check failed" && exit 1)

ELAPSED=$((SECONDS - START_TIME))
echo "✅ Déploiement terminé en ${ELAPSED}s"
```

**Budget temps réel attendu : 7-8 minutes** ✅

### 14.6 GitOps avec ArgoCD (phase suivante)

Une fois stabilisé :

- Repo séparé `openlab-website-deploy` avec manifests Kustomize
- ArgoCD watche le repo, sync auto
- PR = déploiement · git revert = rollback

### 14.7 CI/CD GitHub Actions

`.github/workflows/deploy.yml` :

```yaml
name: Build & Deploy
on:
  push:
    branches: [main]
    tags: ['v*']

permissions:
  contents: read
  packages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/openlab-consulting/website
          tags: |
            type=sha,prefix=sha-
            type=ref,event=branch
            type=semver,pattern={{version}}
      - uses: docker/build-push-action@v6
        id: build
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/openlab-consulting/website:${{ steps.meta.outputs.version }}
          format: sarif
          output: trivy-results.sarif
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
      - uses: sigstore/cosign-installer@v3
      - run: cosign sign --yes ghcr.io/openlab-consulting/website@${{ steps.build.outputs.digest }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: azure/setup-kubectl@v4
      - name: Set kubeconfig
        run: echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
      - run: bash deploy/scripts/deploy.sh production ${{ needs.build.outputs.image_tag }}
        env:
          KUBECONFIG: ./kubeconfig
```

### 14.8 Variables & secrets

**ConfigMap** (non sensible) :

```yaml
NODE_ENV: production
NEXT_PUBLIC_SITE_URL: https://openlabconsulting.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN: openlabconsulting.com
PAYLOAD_PUBLIC_SERVER_URL: https://openlabconsulting.com
REDIS_URL: redis://redis.openlab.svc.cluster.local:6379
MINIO_ENDPOINT: minio.openlab.svc.cluster.local:9000
MEILISEARCH_URL: http://meilisearch.openlab.svc.cluster.local:7700
```

**SealedSecret** (chiffré, commité dans Git) :

```yaml
DATABASE_URL
PAYLOAD_SECRET
ANTHROPIC_API_KEY
BETTER_AUTH_SECRET
RESEND_API_KEY
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
MEILISEARCH_MASTER_KEY
```

---

## 15. OBSERVABILITÉ, SAUVEGARDES, DR

### 15.1 Monitoring

Stack en place pour NexusRH — réutiliser :

- **Prometheus** scrape `/api/metrics`
- **Grafana** dashboard custom OpenLab Website
- **Loki** + **Promtail** pour logs structurés JSON
- **Alertmanager** : alertes Slack/email

### 15.2 Endpoints

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkMinio(),
  ]);
  const status = checks.every((c) => c.status === 'fulfilled') ? 200 : 503;
  return Response.json({ checks }, { status });
}

// app/api/metrics/route.ts — Prometheus
```

### 15.3 Alertes critiques

| Métrique          | Seuil           | Action             |
| ----------------- | --------------- | ------------------ |
| Disponibilité     | < 99.5% / 5 min | Slack + email CEO  |
| Latence P95       | > 2 s / 5 min   | Slack              |
| Erreurs 5xx       | > 1% / 5 min    | Slack + email tech |
| Pods crashlooping | ≥ 1             | Slack immédiat     |
| Disque PV         | > 80%           | Slack              |
| Certif SSL        | < 14 jours      | Email tech         |
| Backups échoués   | 1 fail          | Email + Slack      |

### 15.4 Sauvegardes

- **PostgreSQL** : pgBackRest/wal-g dans CronJob K3s
  - Full quotidien 03:00 Europe/Paris
  - Incrémental horaire
  - WAL streaming continu (PITR)
- **MinIO** : réplication async vers bucket secondaire (cross-region Hetzner)
- **SealedSecrets** : sauvegarde clé privée controller dans coffre-fort externe

### 15.5 Test restauration

CronJob hebdomadaire :

1. Spawn namespace `dr-test`
2. Restaure dernier backup
3. Smoke tests
4. Cleanup
5. Rapport email

---

## 16. WORKFLOW CLAUDE CODE & ORDRE D'IMPLÉMENTATION

### 16.1 Règles de collaboration

1. **Précision absolue** — ne rien refactoriser non demandé. Toute proposition de migration → validation explicite.
2. **Production-grade** — pas de TODO, console.log, `any`, mocks oubliés en prod.
3. **Tests sur chaque interactif** — Playwright sur flows critiques.
4. **Commits sémantiques** — `feat(home): add hero section`, `fix(auth): csrf rotation`.
5. **1 branche / feature** — `feat/home-hero`, `feat/admin-leads-pipeline`.
6. **Checklist OWASP à chaque PR** — intégrée au template GitHub.

### 16.2 Ordre (10 semaines)

**S1 — Fondations**

1. Repo Next.js 15 + Tailwind v4 + TS strict
2. Tokens design + polices self-hostées
3. Dockerfile multi-stage + docker-compose
4. CI GitHub Actions (build + Trivy)
5. Layout root + navbar + footer
6. Composants atomiques

**S2-S3 — Marketing** 7. Homepage 11 sections 8. Expertises (hub + 4) 9. Laboratoire (signature, soin extrême)

**S4-S5 — Produits & livre** 10. 7 pages produits + démos interactives 11. Espace `/livre` complet 12. Pages secteurs (5)

**S6 — CMS Payload** 13. Setup Payload v3 + collections 14. Customisation visuelle back-office 15. Live preview 16. Migration contenus existants

**S7 — IA** 17. Endpoint Claude API (assistant chat) 18. Audit IA interactif + PDF generation 19. Génération assistée articles admin 20. Détection spam IA

**S8 — Sécurité & SEO** 21. Middleware headers sécurité 22. Rate limiting Redis 23. CAPTCHA Turnstile 24. Sitemap, schema.org, OG images dynamiques 25. Better-Auth + 2FA + Keycloak SSO 26. RBAC granulaire 27. Audit log

**S9 — Infra** 28. Manifests K8s complets 29. SealedSecrets 30. cert-manager Let's Encrypt 31. Script deploy.sh < 10 min 32. CronJobs backup 33. Dashboards Grafana

**S10 — QA & lancement** 34. Tests E2E Playwright (10 scénarios) 35. axe-core a11y 36. Lighthouse 95+ 37. OWASP ZAP scan 38. Soft launch 39. Mise en ligne + redirections 301 40. Plan éditorial 3 mois

### 16.3 Prompts Claude Code utiles

```bash
# Session focalisée
claude "Lis CLAUDE.md et implémente la Phase 2 étape 7 (homepage) sans toucher au reste"

# Audit
claude "Audite la page Laboratoire vs CLAUDE.md §6 section 4 et liste les écarts sans modifier"

# Performance
claude "Optimise la home pour Lighthouse 95+ mobile, montre les changements avant d'appliquer"

# Sécurité
claude "Implémente le middleware §10.3 avec nonce CSP dynamique"

# Déploiement
claude "Génère ConfigMap + SealedSecret pour production à partir de .env.production.example"
```

---

## 17. CHECKLIST DE QUALITÉ AVANT MISE EN LIGNE

### 17.1 Design

- [ ] Aucune police générique
- [ ] Orange < 15% à tout écran
- [ ] Testé 360 / 768 / 1024 / 1440 / 2560 px
- [ ] Aucun stock photo générique
- [ ] `prefers-reduced-motion` respecté

### 17.2 UX

- [ ] Règle des 3 clics validée
- [ ] CTA primaire above-the-fold partout
- [ ] Aucune page cul-de-sac
- [ ] Cmd+K admin fonctionnel

### 17.3 Performance

- [ ] Lighthouse mobile : Perf ≥ 95 · A11y ≥ 95 · BP ≥ 95 · SEO ≥ 100
- [ ] LCP < 1.8 s · INP < 200 ms · CLS < 0.05
- [ ] Bundle JS first-load < 150 kB

### 17.4 Accessibilité

- [ ] axe-core : 0 erreur critique
- [ ] Navigation clavier 100%
- [ ] Contrastes WCAG AAA

### 17.5 SEO

- [ ] Sitemap.xml + soumis Search Console
- [ ] robots.txt configuré
- [ ] Schema.org pages clés
- [ ] /llms.txt présent

### 17.6 Sécurité OWASP

- [ ] Headers sécurité présents → securityheaders.com note A+
- [ ] CSP stricte testée
- [ ] Rate limiting actif
- [ ] CAPTCHA sur formulaires publics
- [ ] 2FA obligatoire admin
- [ ] Audit log opérationnel
- [ ] OWASP ZAP scan sans HIGH/CRITICAL
- [ ] Trivy scan image sans HIGH/CRITICAL
- [ ] Pentest manuel (optionnel mais recommandé)

### 17.7 Conformité

- [ ] Mentions légales + DPO
- [ ] Politique confidentialité
- [ ] Bandeau cookies (si requis)
- [ ] Registre traitements

### 17.8 Infra

- [ ] HTTPS forcé + HSTS preload
- [ ] Sauvegardes PG + MinIO testées
- [ ] Monitoring Prometheus + alertes
- [ ] Health checks (liveness + readiness)
- [ ] HPA min 2, max 5
- [ ] PodDisruptionBudget
- [ ] NetworkPolicy restrictive
- [ ] Deploy < 10 min validé en prod

### 17.9 Contenu

- [ ] Zéro faute (Antidote / LanguageTool)
- [ ] Tous chiffres sourcés
- [ ] 10 articles publiés au lancement
- [ ] Page livre complète
- [ ] 7 pages produits remplies

---

## 18. PHRASES DE MARQUE & TON

### À reproduire

> « La fraude est devenue invisible. L'IA la rend indétectable. »
> « Vos coûts vous étouffent. L'IA peut les diviser. »
> « Vos RH produisent-elles des décisions… ou juste des fichiers ? »
> « La data est votre pétrole. L'IA est votre raffinerie. »
> « Cette fois, l'Afrique n'a plus d'excuse. »
> « Voyez tout. Contrôlez tout. Gagnez plus. »

**Caractéristiques** : phrases courtes, deux temps, antithèse, mot-clé orange, adresse directe ("vous").

### À éviter

- "Nous sommes une équipe passionnée…"
- "Notre mission est de…"
- "Solutions innovantes et sur mesure"
- "Synergies", "ADN", "écosystème" (sauf justifié)
- Anglicismes évitables ("leverager", "scaler")

---

## 19. ROADMAP CONDENSÉE

| Semaine | Objectif                 | Livrable                                                     |
| ------- | ------------------------ | ------------------------------------------------------------ |
| S1      | Fondations + Docker + CI | Repo + image Docker + pipeline                               |
| S2      | Homepage                 | 11 sections + animations                                     |
| S3      | Expertises + Laboratoire | 5 pages premium                                              |
| S4      | Produits (1/2)           | NexusRH, NexusERP, SYGESCOM                                  |
| S5      | Produits (2/2) + Livre   | AgroSense, QualitOS, Fraud Shield, Smart City + espace livre |
| S6      | Admin Payload            | Back-office customisé + génération IA                        |
| S7      | Sécurité + SEO           | OWASP, sitemap, schema, auth admin                           |
| S8      | Infrastructure K3s       | Manifests, secrets, ingress, certs                           |
| S9      | QA + tests               | Playwright, axe, Lighthouse, ZAP                             |
| S10     | Lancement                | Mise en ligne + redirections 301 + monitoring                |

**Total : 10 semaines** pour un site de référence africaine.

---

## 20. CRITÈRE FINAL DE RÉUSSITE

> _Le site est réussi quand un DG d'une grande entreprise ivoirienne, un directeur de cabinet ministériel et un investisseur tech parisien tombent tous les trois d'accord, sans se concerter, sur la phrase suivante :_
>
> **« Ce cabinet joue dans la cour internationale, mais il est résolument africain. C'est ce qu'on attendait. »**

Signature mesurable :

- **+50% leads qualifiés/mois** vs site actuel
- **Top 3 Google** "cabinet IA Côte d'Ivoire" en 6 mois
- **300+ téléchargements** d'extraits du livre en 3 mois
- **15+ démos produits** demandées/mois
- **Déploiement < 10 min** vérifié à chaque release

---

_Document de référence — version 2.0 · Mai 2026_
_Mis à jour avec : écosystème complet (NexusRH, NexusERP, SYGESCOM, AgroSense CI, QualitOS, Fraud Shield, Smart City), livre IA, back-office admin premium, OWASP, déploiement K3s Hetzner < 10 min._
_À mettre à jour à chaque décision majeure de design, stack ou sécurité._
