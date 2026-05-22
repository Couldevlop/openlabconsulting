# OpenLab Consulting — Site web

Refonte 2026 du site [www.openlabconsulting.com](https://www.openlabconsulting.com).

**Source unique de vérité** : [`CLAUDE.md`](./CLAUDE.md) — spec stratégique, stack, sécurité, déploiement.

## Démarrage rapide

```bash
pnpm install
docker compose up -d           # Postgres + Redis + MinIO + Meilisearch
pnpm dev                       # http://localhost:3000
```

## Portes vertes (à passer avant tout PR)

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test                      # Vitest (unit + intégration)
pnpm test:coverage             # seuils 80 % lignes / 75 % branches
pnpm build
```

E2E (à partir de P2) :

```bash
pnpm exec playwright install --with-deps
pnpm test:e2e
```

## Workflow Git Flow

```
main      ┄┄┄┄┄┄┄┄┄┄┄┄●┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄●┄┄┄┄┄┄┄┄  ← releases
                       ╲                ╱
develop   ┄┄┄┄●┄┄┄●┄┄┄┄●┄┄●┄┄●┄┄●┄┄●┄┄●┄  ← intégration
              ╲   ╱       ╲   ╱   ╲   ╱
feat/*       ┄●━━●        ●━━●    ●━━●     ← chaque feature
```

| Branche               | Rôle                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `main`                | Production. Aucun commit direct. Reçoit uniquement les merges depuis `develop` (releases) ou `hotfix/*`. |
| `develop`             | Intégration. Toujours dans un état "vert". Reçoit les merges depuis `feat/*`, `fix/*`, `chore/*`.        |
| `feat/<phase>-<slug>` | Une feature = une branche = une PR. Ex : `feat/p2-hero`, `feat/p2-laboratoire`.                          |
| `fix/<slug>`          | Correction de bug, branchée depuis `develop` (ou `main` pour un hotfix).                                 |
| `chore/<slug>`        | Outillage, CI, dépendances, refacto sans changement fonctionnel.                                         |
| `hotfix/<slug>`       | Correctif urgent en prod : branché depuis `main`, mergé dans `main` ET `develop`.                        |

**Règles**

1. **`main` n'est JAMAIS poussée directement.** Toute arrivée sur `main` se fait **uniquement** via une PR `develop → main` mergée dans l'UI GitHub. Pas de `git checkout main && git merge develop && git push` en local — c'est une violation de protocole.
2. **1 feature = 1 branche = 1 PR vers `develop`**. Pas de commit direct sur `develop` ou `main`.
3. La PR ne peut être mergée que si toutes les portes vertes (CI) sont au vert et qu'aucun test existant n'est cassé.
4. Commits en **Conventional Commits** : `feat(p2-hero): add headline`, `fix(navbar): close menu on route change`, `chore(deps): bump next 15.5.18 → 15.5.20`.
5. Nommage des branches en kebab-case, préfixées par leur type.
6. Squash-merge recommandé pour garder un historique linéaire et lisible sur `develop` / `main`.

**Garde-fous mis en place**

- **Hook Git client-side** (`.husky/pre-push`) : refuse tout `git push` qui ciblerait `refs/heads/main`. Première ligne de défense.
- **Branch protection GitHub** _(à activer côté serveur)_ : sur `main`, exiger PR + reviews + status checks verts, interdire force-push et bypass. Settings → Branches → Add rule pour `main`. C'est l'enforcement non contournable.

## Accéder à l’administration Payload

L’admin Payload est servi sur `/admin` du même domaine que le site
public (CLAUDE.md §9). Aucun déploiement séparé. Charte OpenLab
appliquée (refonte P2 phase 4), dashboard custom (phase 3).

### Première mise en route (dev local)

```bash
# 1. Démarrer les dépendances
docker compose up -d postgres redis minio meilisearch

# 2. Configurer les variables d'env du seed dans .env (NE PAS COMMIT)
#    cf. .env.example lignes SEED_ADMIN_*
#    Le password doit faire 12+ caractères, zxcvbn ≥ 3 (CLAUDE.md §11.2).
cp .env.example .env
$EDITOR .env   # remplir SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME

# 3. Migrations + seed initial (idempotent)
pnpm db:migrate
pnpm cms:generate-importmap   # rebuild l'importMap admin
pnpm cms:seed                 # crée le super-admin via SEED_ADMIN_*

# 4. Lancer le site
pnpm dev

# 5. Ouvrir http://localhost:3000/admin et se connecter avec
#    l'email + password définis dans .env. 2FA TOTP est proposé
#    à la première connexion (CLAUDE.md §11.2 — obligatoire).
```

### Où sont mes credentials ?

- **Dev local** : dans `.env` (gitignored). Les variables
  `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` ont été utilisées par
  `pnpm cms:seed` la première fois. Le password est désormais hashé
  en base — si tu l’as oublié, supprime l’utilisateur via
  `psql` (`DELETE FROM users WHERE email='...'`) et relance `pnpm cms:seed`
  avec un nouveau password.
- **Préprod / production** : les credentials sont stockés en
  SealedSecrets dans le cluster K3s (CLAUDE.md §14.8). Pour les
  réinitialiser, voir `deploy/scripts/rollback-admin.sh` (à venir P11)
  ou `kubectl exec` dans le pod pour lancer un re-seed.

### Rôles disponibles (RBAC §11.3)

| Rôle           | Permissions principales                                      |
| -------------- | ------------------------------------------------------------ |
| `SUPER_ADMIN`  | Tout + gestion users + paramètres système                    |
| `ADMIN`        | Tout sauf gestion users                                      |
| `EDITOR_CHIEF` | CRUD contenu (articles, produits, livre) + voit leads        |
| `EDITOR`       | CRUD articles, médias, FAQs                                  |
| `AUTHOR`       | CRUD ses propres articles uniquement (soumission validation) |
| `VIEWER`       | Lecture seule (dashboard, KPIs)                              |

Toujours créer un compte `SUPER_ADMIN` en premier (via `pnpm cms:seed`),
puis créer les autres comptes depuis le back-office en attribuant
le rôle approprié.

### Sécurité — règles non négociables

1. **JAMAIS de credentials dans le repo Git** (README, code source,
   migrations, commentaires). Public ou privé. Les passwords doivent
   vivre dans `.env` (gitignored) en dev et SealedSecrets en prod.
2. **2FA TOTP obligatoire** pour tout compte `ADMIN` et au-dessus
   (CLAUDE.md §11.2).
3. **Rotation 6 mois** des passwords admin. Politique enforced via
   le hook `beforeChange` sur la collection `users`.
4. **Audit log** : toute action sensible apparaît dans
   `/admin/collections/auditLog` (et dans la card « Activité récente »
   du dashboard).

## Stack

Next.js 15 · React 19 · TypeScript strict · Tailwind v4 · Vitest · Playwright · Docker distroless · K3s Hetzner.

Détails complets dans `CLAUDE.md` §2.

## Licence

Propriétaire — OpenLab Consulting SARL.
