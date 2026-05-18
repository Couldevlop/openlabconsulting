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

## Stack

Next.js 15 · React 19 · TypeScript strict · Tailwind v4 · Vitest · Playwright · Docker distroless · K3s Hetzner.

Détails complets dans `CLAUDE.md` §2.

## Licence

Propriétaire — OpenLab Consulting SARL.
