# CLAUDE.md — OpenLab Consulting · Refonte 2026 (v2.1)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Projet** : Site web premium d'OpenLab Consulting + back-office d'administration, déployable sur cluster K3s Hetzner en moins de 10 minutes.
> **Mission de Claude Code** : construire un site qui dépasse les meilleurs cabinets africains et internationaux, assume une identité ivoirienne premium, expose l'écosystème produits OpenLab (NexusRH CI, NexusERP, SYGESCOM, AgroSense CI, QualitOS, Fraud Shield, Smart City, SentinelBTP) et le livre « Intelligence Artificielle : du Machine Learning aux Agents Autonomes ».
> **Règle d'or** : _Aucun visiteur ne doit pouvoir confondre ce site avec un autre cabinet de conseil dans le monde._
> **Règle de Claude Code** : _ne jamais refactoriser ou modifier ce qui n'a pas été explicitement demandé. Toute migration de stack, tout changement architectural non sollicité doit être proposé avant d'être exécuté._

> **Note d'organisation (v2.1)** : ce fichier est le **noyau** chargé à chaque session. Les spécifications détaillées (design, sécurité, SEO, infra, admin, pages) vivent dans `docs/reference/` et sont à lire **à la demande** quand la tâche les concerne — voir le tableau « Où chercher quoi » et la section « Documentation de référence ».

---

## QUICK REFERENCE — à lire en premier

### État du repo

- **Phase courante : P2 en cours.** P0 (scaffold) et P1 (design system + shell + middleware sécurité) terminées et fusionnées. P2 démarre avec la décomposition Homepage (cf. §3) en features Git Flow (`feat/p2-hero-layout`, `feat/p2-hero-canvas`, `feat/p2-reassurance`, `feat/p2-expertises-cards`, `feat/p2-laboratoire`, `feat/p2-cas-client`, `feat/p2-products-showcase`, `feat/p2-manifesto`, `feat/p2-livre`, `feat/p2-insights`, `feat/p2-audit-ia-cta`).
- **Repère de qualité acquis en P1** : 51 tests verts · coverage 93.68 % · First Load JS 103 kB · headers de sécurité au middleware.
- **Feature `feat/p2-articles-fondateurs` (en cours)** : pipeline éditorial Insights complet — éditeur richText premium (H2-H4 + toolbar fixe + upload inline), champs `summary` (GEO) + `sources`, rendu Lexical `ArticleBody` (ancres SEO + liens assainis OWASP A03), accès collection durci (anonyme = versions publiées `_status` only, A01), **prévisualisation des brouillons** via draft mode Next gardé par auth (`/api/preview`) + versioning natif Payload (`versions.drafts`, plus de champ `status` custom — collision enum corrigée), seed idempotent `pnpm cms:seed:articles` (**7 articles** fondateurs sourcés, chiffres réels). **Migration prod générée et validée** : `migrations/20260524_135927_initial.ts` (baseline complète, appliquée en mode prod ; `pnpm db:migrate:create:tsx` pour régénérer). Repère : **620 tests verts · coverage 96.74 %**.
- **Feature `feat/p6-parametrage-total` (en cours)** : passage à **8 produits** (ajout SentinelBTP — surveillance structurelle par IA / SHM pour le BTP). Le **compteur de produits est dynamique et paramétrable** : dérivé du nombre de produits publiés + override admin via le global `SiteSettings`, avec tokens `{productsWord}`/`{Products}` interpolés côté serveur (`lib/format/product-count.ts`, `lib/cms/product-count-server.ts`). Plus de « sept/7 » figé. **Hubs Solutions/Expertises/Secteurs pilotables** depuis l'admin (3 globals `HubHeroSettings`). Repère : **1009 tests verts**. ⚠️ Migration Payload des nouveaux globals **à générer** contre la vraie DB openlab avant déploiement (host 5433 occupé par sygescom au moment du dev) — globals fail-soft en attendant.
- Mettre à jour cette ligne dès qu'on franchit une nouvelle phase ou une feature majeure.

### Workflow Git Flow (depuis P2)

- `main` = production. **JAMAIS de push direct, JAMAIS de merge local poussé.** Toute arrivée sur `main` passe **obligatoirement** par une PR `develop → main` mergée dans l'UI GitHub (règle utilisateur, 2026-05-18).
- `develop` = intégration, base de toutes les nouvelles features.
- `feat/<phase>-<slug>` = une feature = une branche = une PR vers `develop` (ex : `feat/p2-hero-layout`).
- `fix/<slug>` = correctif sur `develop`. `hotfix/<slug>` = correctif urgent : branché sur `main`, PR vers `main` + cherry-pick/PR vers `develop`.
- `chore/<slug>` = outillage, CI, dépendances.
- Hook client `.husky/pre-push` refuse tout push qui ciblerait `refs/heads/main`. À doubler par branch protection GitHub côté serveur.
- Détails dans [`README.md`](./README.md#workflow-git-flow).

**Une PR ne peut être mergée que si toutes les portes vertes (CI) sont au vert et qu'aucun test existant n'est cassé.**

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
docker build -t openlab-website:dev . # Image distroless (cf. docs/reference/infrastructure-deploy.md)

# Déploiement (cible < 10 min — cf. docs/reference/infrastructure-deploy.md)
bash deploy/scripts/deploy.sh production <image-tag>
bash deploy/scripts/rollback.sh
```

> **Astuce Windows** : si `%TEMP%` est sur un disque saturé, exporter `TMPDIR=/d/tmp TMP=D:/tmp TEMP=D:/tmp` avant `pnpm test`/`pnpm build` (Vitest/Next.js y écrivent des artefacts temporaires).

### Où chercher quoi

| Question                              | Où                                          |
| ------------------------------------- | ------------------------------------------- |
| Quelle stack, quelles versions ?      | §2 (ci-dessous)                             |
| Que doit contenir la homepage ?       | §3 (ci-dessous)                             |
| Règles de collaboration / ordre ?     | §4 (ci-dessous)                             |
| Ton de marque, formules à éviter ?    | §5 (ci-dessous)                             |
| Couleurs, polices, tokens, UX/UI ?    | `docs/reference/brand-identity.md`          |
| Routes / arborescence / pages prod / livre ? | `docs/reference/site-map-and-pages.md` |
| Modules admin Payload ?               | `docs/reference/admin-backoffice.md`        |
| Headers HTTP, rate limiting, RGPD, RBAC, 2FA ? | `docs/reference/security-owasp.md` |
| SEO, schema.org, llms.txt ?           | `docs/reference/seo-strategy.md`            |
| Dockerfile, K8s, deploy.sh, backups, monitoring ? | `docs/reference/infrastructure-deploy.md` |
| Checklist avant mise en ligne ?       | `docs/reference/launch-checklist.md`        |

### Règles non négociables (rappel)

1. **Ne rien refactoriser non demandé.** Proposer avant toute migration de stack.
2. **Pas de TODO / `any` / `console.log` / mocks** en code committé.
3. **Performance** : Lighthouse mobile ≥ 95, LCP < 1.8 s, bundle first-load < 150 kB gz (cf. §2.3).
4. **Sécurité OWASP** : checklist obligatoire à chaque PR sensible (cf. `docs/reference/security-owasp.md`).
5. **Polices interdites** : Inter, Roboto, Open Sans, Poppins, Montserrat (cf. `docs/reference/brand-identity.md`).
6. **Orange < 15 %** de la surface visible à tout instant (cf. `docs/reference/brand-identity.md`).
7. **Commits sémantiques** : `feat(home): …`, `fix(auth): …` — 1 branche par feature.

### Architecture cible (vue d'avion)

Mono-repo Next.js qui embarque **trois surfaces** dans la même base de code et la même image Docker :

1. **Site public** (`app/(public)/...`) — marketing, produits, livre, insights. SSR/ISR.
2. **Back-office Payload CMS v3** (`app/(payload)/admin`, collections dans `payload.config.ts`) — partage la **même PostgreSQL** que le site, génère son propre back-office React.
3. **API & Server Actions** (`app/api/*`, `actions/*`) — health, metrics, contact, audit-ia, chat assistant Claude, webhooks.

Tout est servi par **un seul `Deployment` K8s** (cf. `docs/reference/infrastructure-deploy.md`), derrière Traefik. Postgres / Redis / MinIO / Meilisearch sont des dépendances dans le même namespace `openlab`. Auth unifiée via Better-Auth + Keycloak SSO (partagé avec NexusRH déjà en prod).

---

## DOCUMENTATION DE RÉFÉRENCE

Les spécifications détaillées sont externalisées pour garder ce noyau léger. **Lire le fichier concerné avant de travailler sur le domaine correspondant** :

| Fichier                                      | Contenu                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `docs/reference/brand-identity.md`           | Identité visuelle (palette, polices, logo) + principes UX/UI            |
| `docs/reference/site-map-and-pages.md`       | Arborescence complète, template pages produits, espace livre            |
| `docs/reference/admin-backoffice.md`         | Back-office Payload : modules, design, génération assistée IA           |
| `docs/reference/security-owasp.md`           | OWASP Top 10, headers HTTP, rate limiting, RGPD, RBAC, 2FA, auth        |
| `docs/reference/seo-strategy.md`             | Mots-clés, pages piliers, schema.org, GEO/llms.txt, contenu, backlinks  |
| `docs/reference/infrastructure-deploy.md`    | Docker multi-stage, K3s Hetzner, manifests, CI/CD, monitoring, backups  |
| `docs/reference/launch-checklist.md`         | Checklist qualité complète avant mise en ligne                          |

Autres docs utiles : `docs/admin-cms.md`, `docs/admin-creer-un-article.md`, `docs/release-procedure.md`, `docs/security-overrides.md`, `docs/anti-scraping.md`, `docs/seo/` (briefs articles).

### Correspondance des anciens numéros de section (compat. commentaires code)

Le code (commentaires, `payload.config.ts`, scripts, manifests…) référence l'ancienne numérotation `§N` de la v2.0. La table ci-dessous redirige vers le nouvel emplacement. **Les sous-numéros sont conservés** : ancien `§14.5` → `infrastructure-deploy.md` §2.5, ancien `§10.3` → `security-owasp.md` §1.3, etc. (_Note : certains `§N` du code visent une liste externe, ex. « OWASP §10 A02 » = catégorie OWASP Top 10, pas ce document._)

| Ancien § (v2.0)           | Nouvel emplacement                                  |
| ------------------------- | --------------------------------------------------- |
| §1 Contexte stratégique   | §1 (ce fichier — inchangé)                           |
| §2 Stack technique        | §2 (ce fichier — inchangé)                           |
| §3 Identité visuelle      | `docs/reference/brand-identity.md` §1 (§3.x → §1.x)  |
| §4 Principes UX/UI        | `docs/reference/brand-identity.md` §2 (§4.x → §2.x)  |
| §5 Arborescence           | `docs/reference/site-map-and-pages.md` §1            |
| §6 Homepage               | §3 (ce fichier — renuméroté)                         |
| §7 Pages produits         | `docs/reference/site-map-and-pages.md` §2            |
| §8 Livre                  | `docs/reference/site-map-and-pages.md` §3            |
| §9 Back-office            | `docs/reference/admin-backoffice.md`                 |
| §10 Sécurité OWASP        | `docs/reference/security-owasp.md` §1 (§10.x → §1.x) |
| §11 Authentification      | `docs/reference/security-owasp.md` §2 (§11.x → §2.x) |
| §12 SEO                   | `docs/reference/seo-strategy.md` (§12.x → §x)        |
| §13 Docker                | `docs/reference/infrastructure-deploy.md` §1 (§13.x → §1.x) |
| §14 Déploiement K3s       | `docs/reference/infrastructure-deploy.md` §2 (§14.x → §2.x) |
| §15 Observabilité         | `docs/reference/infrastructure-deploy.md` §3 (§15.x → §3.x) |
| §16 Workflow / ordre      | §4 (ce fichier — renuméroté ; §16.1 → §4.1)          |
| §17 Checklist qualité     | `docs/reference/launch-checklist.md`                 |
| §18 Ton de marque         | §5 (ce fichier — renuméroté)                         |
| §19 Roadmap               | §6 (ce fichier — renuméroté)                          |
| §20 Critère final         | §7 (ce fichier — renuméroté)                          |

---

## 1. CONTEXTE STRATÉGIQUE

### 1.1 Société

- **Raison sociale** : OpenLab Consulting SARL
- **RCCM** : CI-ABJ-03-2022-B13-03239
- **Siège** : Abidjan, Cocody, Riviera Faya Lauriers 8, Côte d'Ivoire
- **CEO** : Debora Ahouma
- **Contacts** : +225 07 09 33 42 38 · +33 06 19 24 53 29 · waopron@openlabconsulting.com · infos@openlabconsulting.com
- **Domaine** : openlabconsulting.com

### 1.2 Positionnement

> **« Cabinet ivoirien d'IA appliquée, R&D produit et publication de référence pour l'Afrique francophone. »**

Trois piliers :

1. **Conseil & Intégration IA** — diagnostiquer, déployer, gouverner
2. **R&D OpenLab** — laboratoire qui produit 8 logiciels propriétaires (différenciateur majeur)
3. **Édition & Acculturation** — livre IA, formations, conférences, livres blancs

### 1.3 Écosystème produits propriétaires

| Produit                  | Domaine                                                              | Marché cible                        | Statut                           |
| ------------------------ | -------------------------------------------------------------------- | ----------------------------------- | -------------------------------- |
| **NexusRH CI**           | SIRH IA (paie, CNPS, ITS, FDFP, Mobile Money)                        | PME & grandes entreprises CI        | Production — déployé K3s Hetzner |
| **NexusERP**             | ERP nouvelle génération (SYSCOHADA, Java 21 + Angular 18)            | PME multi-secteurs FR/UEMOA         | Production                       |
| **SYGESCOM v2.0**        | Gestion réseaux stations hydrocarbures                               | Afrique de l'Ouest                  | Production                       |
| **AgroSense CI**         | IoT précision agriculture (cacao, anacarde, coton)                   | Coopératives & exploitants CI       | MVP avancé                       |
| **QualitOS**             | QMS multi-méthodes (PDCA, 5S, DMAIC, ISO)                            | Industrie, santé, services          | En développement                 |
| **OpenLab Fraud Shield** | Détection fraude documentaire par IA                                 | Banques, assurances, administration | Production                       |
| **OpenLab Smart City**   | IA sécurité urbaine (anticiper, modéliser, protéger)                 | Collectivités, ministères           | Pilote                           |
| **SentinelBTP**          | Surveillance structurelle par IA (SHM) — anticiper les effondrements | BTP, bureaux de contrôle, assureurs | Pilote                           |

### 1.4 Publication phare

**Livre** : _Intelligence Artificielle : du Machine Learning aux Agents Autonomes_

- **Édition** : OpenLab Consulting (Abidjan) — édition propre, pas de co-éditeur externe
- **Public** : étudiants ingénieurs, data scientists, dirigeants, professeurs
- **Couverture** : ML supervisé/non supervisé, séries temporelles, RAG, multi-agents, MLOps, sécurité IA, industrialisation Kubernetes
- **Capstone du livre** : AgroSense CI (étude de cas terrain ivoirienne)
- **Le site doit avoir un espace dédié au livre** (cf. `docs/reference/site-map-and-pages.md`)

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
Email transac    : Zoho ZeptoMail (API HTTP, port 443 — compatible NetworkPolicy)
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

## 3. STRUCTURE HOMEPAGE

11 sections :

1. **Hero 100vh** — _« L'IA, au service des réalités africaines. »_ + canvas WebGL léger
2. **Bandeau réassurance** — logos clients SIDO, HCI, Sertemef, DOCI
3. **« Ce que nous transformons »** — 4 expertises en cards
4. **Laboratoire OpenLab** (signature, fond noir, soin maximal)
5. **Cas client narré** (SYGESCOM avant/après recommandé)
6. **Showcase produits** — les 8 produits propriétaires en carrousel
7. **Manifeste** « Cette fois, l'Afrique n'a plus d'excuse »
8. **Encart livre IA** — promo couverture + extrait gratuit
9. **Insights** — 3 derniers articles
10. **Audit IA gratuit** (lead magnet)
11. **Footer premium**

> Spec détaillée des autres pages (expertises, laboratoire, produits, secteurs, livre) : `docs/reference/site-map-and-pages.md`.

---

## 4. WORKFLOW CLAUDE CODE & ORDRE D'IMPLÉMENTATION

### 4.1 Règles de collaboration

1. **Précision absolue** — ne rien refactoriser non demandé. Toute proposition de migration → validation explicite.
2. **Production-grade** — pas de TODO, console.log, `any`, mocks oubliés en prod.
3. **Tests sur chaque interactif** — Playwright sur flows critiques.
4. **Commits sémantiques** — `feat(home): add hero section`, `fix(auth): csrf rotation`.
5. **1 branche / feature** — `feat/home-hero`, `feat/admin-leads-pipeline`.
6. **Checklist OWASP à chaque PR** — intégrée au template GitHub (cf. `docs/reference/security-owasp.md`).

### 4.2 Ordre (10 semaines)

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

### 4.3 Prompts Claude Code utiles

```bash
# Session focalisée
claude "Lis CLAUDE.md et implémente la Phase 2 étape 7 (homepage) sans toucher au reste"

# Audit
claude "Audite la page Laboratoire vs CLAUDE.md §3 et liste les écarts sans modifier"

# Performance
claude "Optimise la home pour Lighthouse 95+ mobile, montre les changements avant d'appliquer"

# Sécurité
claude "Implémente le middleware de headers (docs/reference/security-owasp.md) avec nonce CSP dynamique"

# Déploiement
claude "Génère ConfigMap + SealedSecret pour production à partir de .env.production.example"
```

---

## 5. PHRASES DE MARQUE & TON

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

## 6. ROADMAP CONDENSÉE

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

## 7. CRITÈRE FINAL DE RÉUSSITE

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

_Document de référence (noyau) — version 2.1 · Juin 2026_
_v2.1 : externalisation des specs détaillées vers `docs/reference/` (design, sécurité, SEO, infra, admin, pages, checklist) pour alléger le contexte chargé à chaque session. Contenu inchangé, simplement réorganisé._
_À mettre à jour à chaque décision majeure de design, stack ou sécurité._
