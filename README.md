# OpenLab Consulting — Site web

Refonte 2026 du site [www.openlabconsulting.com](https://www.openlabconsulting.com).

**Source unique de vérité** : [`CLAUDE.md`](./CLAUDE.md) — spec stratégique, stack, sécurité, déploiement.
**Phase courante** : **P0 — Fondations & infrastructure de test**.

## Démarrage rapide

```bash
pnpm install
docker compose up -d           # Postgres + Redis + MinIO + Meilisearch
pnpm dev                       # http://localhost:3000
```

## Portes vertes (à passer avant tout PR)

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

E2E (à activer dès P2) :

```bash
pnpm exec playwright install --with-deps
pnpm test:e2e
```

## Stack

Next.js 15 · React 19 · TypeScript strict · Tailwind v4 · Vitest · Playwright · Docker distroless · K3s Hetzner.

Détails complets dans `CLAUDE.md` §2.

## Licence

Propriétaire — OpenLab Consulting SARL.
