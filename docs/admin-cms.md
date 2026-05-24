# Admin CMS — Payload v3

Documentation opérationnelle pour démarrer, seeder, migrer et opérer l'admin Payload.

## Stack

- **Payload v3.84** côté serveur Next.js (route group `(payload)` dans `app/`)
- **PostgreSQL 17** via `@payloadcms/db-postgres`
- **MinIO** (S3-compatible) via `@payloadcms/storage-s3` pour les uploads
- **Lexical** comme rich-text editor
- **sharp** pour les variantes d'image AVIF/WebP automatiques

## Démarrage rapide en local

```bash
# 1. Lancer les dépendances (Postgres + Redis + MinIO + Meilisearch)
docker compose up -d

# 2. Renseigner .env.local (copier depuis .env.example) :
#    DATABASE_URL=postgresql://openlab:devpass@localhost:5432/openlab
#    PAYLOAD_SECRET=<openssl rand -hex 32>
#    MINIO_ENDPOINT=localhost:9000
#    MINIO_ACCESS_KEY=minioadmin
#    MINIO_SECRET_KEY=minioadmin
#    MINIO_BUCKET=openlab-media

# 3. Appliquer les migrations Postgres
pnpm db:migrate

# 4. Seeder le super-admin initial
export SEED_ADMIN_EMAIL=debora@openlabconsulting.com
export SEED_ADMIN_PASSWORD='un-mot-de-passe-tres-fort-12+'
export SEED_ADMIN_NAME='Debora Ahouma'
pnpm cms:seed

# 5. Démarrer Next + Payload
pnpm dev

# 6. Ouvrir l'admin
open http://localhost:3000/admin
# Première action : activer la 2FA TOTP sur ton compte.
```

## Scripts disponibles

| Commande                      | Effet                                                      |
| ----------------------------- | ---------------------------------------------------------- |
| `pnpm db:migrate`             | Applique les migrations Payload (création tables Postgres) |
| `pnpm db:migrate:create`      | Génère une migration depuis les diffs de schéma            |
| `pnpm db:migrate:status`      | Affiche l'état des migrations                              |
| `pnpm cms:seed`               | Crée un super-admin (idempotent — voir env vars ci-dessus) |
| `pnpm cms:seed:articles`      | Seed/upsert les articles fondateurs Insights (idempotent)  |
| `pnpm cms:generate-types`     | Régénère `payload-types.ts` (typage TS des collections)    |
| `pnpm cms:generate-importmap` | Régénère `app/(payload)/admin/importMap.js`                |

## Articles (Insights) — seed, prévisualisation, prod

- **Source de vérité** : collection Payload `articles`. Les articles seedés
  restent **entièrement éditables / supprimables dans `/admin`**.
- **Seed** : `scripts/articles-content.ts` (Markdown sourcé) → converti en
  Lexical par `scripts/seed-articles.ts`. Idempotent (upsert par `slug`).

  ```bash
  docker compose up -d postgres
  pnpm db:migrate
  pnpm cms:seed:articles
  ```

- **Prévisualisation des brouillons** : le bouton « Aperçu » de l'admin ouvre
  `/api/preview?slug=…&collection=articles`, qui n'active le draft mode Next
  **que pour un utilisateur Payload authentifié** (OWASP A01). Sortie via
  `/api/preview/exit`. États gérés nativement par le versioning Payload
  (`versions.drafts` → `_status` brouillon / publié + historique de versions).
- **⚠️ Mise en prod** : les champs `summary` et `sources` ajoutés à la
  collection nécessitent une **migration Payload committée** — en production
  le `push` automatique du schéma est désactivé, c'est le `migrate-job` du
  pipeline qui applique les migrations. Générer avec la DB up :

  ```bash
  docker compose up -d postgres
  pnpm db:migrate:create   # snapshot du schéma + nouvelles colonnes
  # committer le fichier généré dans migrations/
  ```

## Architecture des routes

```
app/(payload)/                           # route group, pas de segment URL
├── layout.tsx                           # layout nu (sans Navbar/Footer site)
├── admin/
│   ├── importMap.js                     # imports custom (généré)
│   └── [[...segments]]/
│       ├── page.tsx                     # RootPage Payload
│       └── not-found.tsx                # NotFoundPage Payload
└── api/
    ├── [...slug]/route.ts               # REST + auth + uploads
    ├── graphql/route.ts                 # GraphQL endpoint
    └── graphql-playground/route.ts      # IDE GraphQL (dev only)
```

Le middleware (`middleware.ts`) **exclut** `/admin` et `/api/*` du matcher → Payload sert ses propres headers de sécurité, sans collision avec ceux du site public.

## Collections en place

| Collection    | Slug          | Versions        | Auth | Notes                                                                                                       |
| ------------- | ------------- | --------------- | ---- | ----------------------------------------------------------------------------------------------------------- |
| Utilisateurs  | `users`       | non             | oui  | 6 rôles (CLAUDE.md §11.3), session 8 h, lockout 30 min après 10 échecs                                      |
| Articles      | `articles`    | drafts (10 max) | —    | 7 catégories alignées homepage Insights §6.9                                                                |
| Cas clients   | `caseStudies` | drafts (10 max) | —    | Carrousel homepage §6.5. Image MinIO + fallback mockup SVG. Trie par `order` croissant, filtre `published`. |
| Livres blancs | `whitepapers` | drafts (5 max)  | —    | Compteur downloads readOnly, gatingRequired par défaut                                                      |
| Médias        | `media`       | non             | —    | 3 variantes auto (thumbnail/card/cover), MinIO S3                                                           |

### Workflow Cas clients

Le carrousel `<CasesCarousel>` de la homepage (§6.5) est piloté par la collection `caseStudies`.

1. **Si la collection est vide** ou inaccessible (DB down) → fallback automatique sur 4 cas hard-codés (`lib/case-studies.ts`).
2. **Pour ajouter / modifier un cas** :
   - Se connecter à `/admin` (rôle `editor` ou supérieur).
   - Aller dans **Cas clients → Nouveau**.
   - Remplir `headline`, `punchline`, `body`, `sector`, `client`, choisir le `productSlug` (lie automatiquement à `/solutions/<slug>`).
   - Renseigner exactement **3 résultats chiffrés** (CLAUDE.md §4.10 — aucun chiffre rond non sourcé).
   - **Image** (optionnelle) : capture produit / mockup / photo. Si absente, le slide retombe sur le mockup SVG associé au produit.
   - `order` : petit = en premier (10, 20, 30, 40…).
   - Passer `status` à **Publié** quand le cas est prêt.
3. Le carrousel récupère les 8 premiers `published` à chaque rendu (revalidate côté Next selon ISR du parent).

## Sécurité (à durcir en P7 + P10)

- [x] Auth Payload native avec hashing bcrypt
- [x] Session 8 h absolu (`tokenExpiration: 28800`)
- [x] Account lockout après 10 échecs en 30 min
- [ ] **À ajouter en P7** : 2FA TOTP obligatoire pour `super-admin` + `admin` (plugin `@payloadcms/plugin-cloud-storage` + bibliothèque TOTP)
- [ ] **À ajouter en P7** : politique mot de passe 12+ chars + zxcvbn ≥ 3 (hook `beforeChange` users)
- [ ] **À ajouter en P10** : rate-limit Redis sur `/admin/login` (5 req/15 min/IP)
- [ ] **À ajouter en P10** : audit log immuable de toutes les actions admin (collection `audit-log` + hook après chaque mutation)

## Variables d'environnement requises

Voir `.env.example` :

| Variable                    | Obligatoire    | Défaut dev                                            | Usage                            |
| --------------------------- | -------------- | ----------------------------------------------------- | -------------------------------- |
| `DATABASE_URL`              | oui            | `postgresql://openlab:devpass@localhost:5432/openlab` | Connexion PG                     |
| `PAYLOAD_SECRET`            | oui            | `dev-secret-replace-in-prod`                          | Signature JWT, secret encryption |
| `PAYLOAD_PUBLIC_SERVER_URL` | non            | `http://localhost:3000`                               | URL publique du serveur          |
| `MINIO_ENDPOINT`            | non\*          | non défini = file system local                        | Active le storage S3 si défini   |
| `MINIO_ACCESS_KEY`          | si MinIO actif | `minioadmin`                                          | Auth S3                          |
| `MINIO_SECRET_KEY`          | si MinIO actif | `minioadmin`                                          | Auth S3                          |
| `MINIO_BUCKET`              | si MinIO actif | `openlab-media`                                       | Nom du bucket cible              |

\* Sans `MINIO_ENDPOINT`, Payload fallback sur stockage file system local (`media/`). Utile en dev rapide sans Docker MinIO.

## Production K3s Hetzner

En production, les secrets sont injectés via `SealedSecret` (Bitnami) :

```yaml
# deploy/k8s/base/secret.sealedsecret.yaml (extrait)
data:
  DATABASE_URL: <chiffré>
  PAYLOAD_SECRET: <chiffré>
  MINIO_ACCESS_KEY: <chiffré>
  MINIO_SECRET_KEY: <chiffré>
```

Voir CLAUDE.md §14.8 pour la matrice complète.

## Génération de types

Après modification d'une collection, régénérer les types TypeScript :

```bash
pnpm cms:generate-types
# -> Met à jour payload-types.ts
```

Les Server Components peuvent ensuite typer la donnée :

```ts
import type { Article } from '@/payload-types';

const articles: Article[] = await payload.find({ collection: 'articles' });
```

## Branchement de l'admin sur le site public

Les Server Components côté site public consomment Payload via la local API (pas de fetch HTTP) :

```ts
// app/insights/page.tsx (à venir)
import { getPayload } from 'payload';
import config from '@payload-config';

export default async function InsightsPage() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'articles',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 3,
  });
  return <Insights articles={docs} />;
}
```

Pour l'instant les sections du site (Insights homepage, Livre, AuditIaCta) utilisent des placeholders. La bascule sur Payload se fait collection par collection, dans des features `feat/p6-payload-bind-<section>`.
