# Politique de sécurité — overrides pnpm & scans Trivy

Deux sections : (1) overrides `pnpm` pour patcher des CVE transitives, (2) politique du job Trivy en CI.

## 1. Overrides pnpm — packages forcés

Ce document recense **toutes les entrées de `pnpm.overrides` dans `package.json`**, avec leur justification CVE et leur condition de retrait. Tout ajout/retrait doit passer en revue ici.

| Package   | Version forcée | CVE / GHSA                                                               | Risque                                                                                     | Raison du override                                                                                                                                      | Condition de retrait                                                                                                                                           |
| --------- | -------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `postcss` | `^8.5.10`      | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | Moderate (GHSA) / High (NVD via Trivy) — XSS via `</style>` non échappé dans CSS Stringify | `next@15.5.18` embarque `postcss@8.4.31`. PostCSS n'est utilisé qu'au build mais ressort dans la couche `[node-pkg]` du standalone output → Trivy fail. | Quand Next.js publie une version qui bump `postcss` à `>= 8.5.10` (suivre [next changelog](https://github.com/vercel/next.js/releases) et `pnpm why postcss`). |

## Procédure pour ajouter un override

1. **Identifier** : `pnpm audit --prod` ou retour Trivy CI.
2. **Vérifier** que le fix amont n'existe pas (sinon bumper la dep directe est préférable).
3. **Tester** localement : `pnpm install` → `pnpm typecheck` → `pnpm test` → `pnpm build`. Aucune régression tolérée.
4. **Ajouter une ligne dans le tableau ci-dessus** avec la condition explicite de retrait — sinon l'override devient une dette invisible.
5. **Commit** sur une branche `fix/<slug>` puis PR vers `develop`.

## Procédure pour retirer un override

1. Vérifier que la version amont est sortie : `pnpm outdated`.
2. Retirer l'entrée de `pnpm.overrides` ET la ligne du tableau ci-dessus.
3. `pnpm install` → vérifier `pnpm why <package>` → la version résolue est la nouvelle officielle.
4. `pnpm audit --prod` → 0 finding sur ce package.
5. PR vers `develop`.

---

## 2. Politique Trivy en CI

### Configuration actuelle (`.github/workflows/ci.yml`)

Deux passes sur l'image `openlab-website:ci` :

1. **Scan SARIF (informatif)** — `severity: CRITICAL,HIGH`, `exit-code: 0`. Sortie envoyée à GitHub Code Scanning pour audit.
2. **Scan bloquant (table format)** — mêmes seuils, `exit-code: 1`. La table CVE apparaît explicitement dans les logs CI.

`pull: true` sur la `docker/build-push-action` pour invalider le cache des base images à chaque run.

### Findings courants (à jour 2026-05-18)

Toutes les CVE proviennent de la **couche Debian 12.13** du distroless `gcr.io/distroless/nodejs22-debian12:nonroot`, **aucune n'est dans le code applicatif**.

| Library             | Version installée | Fix Debian       | CVE                                                          | Sévérité                                     |
| ------------------- | ----------------- | ---------------- | ------------------------------------------------------------ | -------------------------------------------- |
| `libc6` (glibc)     | 2.36-9+deb12u13   | 2.36-9+deb12u14  | [CVE-2026-0861](https://avd.aquasec.com/nvd/cve-2026-0861)   | HIGH (heap corruption via memalign overflow) |
| `libssl3` (OpenSSL) | 3.0.18-1~deb12u2  | 3.0.19-1~deb12u2 | [CVE-2026-31789](https://avd.aquasec.com/nvd/cve-2026-31789) | **CRITICAL** (heap overflow X.509 32-bit)    |
| `libssl3`           | idem              | idem             | [CVE-2026-28387](https://avd.aquasec.com/nvd/cve-2026-28387) | HIGH (RCE via use-after-free DANE TLSA)      |
| `libssl3`           | idem              | idem             | [CVE-2026-28388](https://avd.aquasec.com/nvd/cve-2026-28388) | HIGH (DoS NULL deref delta)                  |
| `libssl3`           | idem              | idem             | [CVE-2026-28389](https://avd.aquasec.com/nvd/cve-2026-28389) | HIGH (DoS CMS processing)                    |
| `libssl3`           | idem              | idem             | [CVE-2026-28390](https://avd.aquasec.com/nvd/cve-2026-28390) | HIGH (DoS NULL deref CMS)                    |

### Plan de remédiation — paliers

**Palier 1 — Force pull base image** _(courant)_

- `pull: true` sur `docker/build-push-action`. Si distroless `:nonroot` a déjà été reconstruit avec Debian `u14` + OpenSSL `3.0.19-1~deb12u2`, la prochaine run absorbe le fix sans changement de code.

**Palier 2 — Pin digest** _(si palier 1 inefficace)_

- Identifier le dernier digest distroless via `docker buildx imagetools inspect gcr.io/distroless/nodejs22-debian12:nonroot`.
- Pinner dans `Dockerfile` : `FROM gcr.io/distroless/nodejs22-debian12@sha256:<digest>`.
- Mettre à jour périodiquement via Renovate Bot ou Dependabot.

**Palier 3 — Switch base image (déviation CLAUDE.md §13.1, nécessite validation utilisateur)**

- `cgr.dev/chainguard/node:latest` — Chainguard Node, rebuild quotidien, zero-CVE en pratique.
- Avantages : ergonomie sécurité, distroless-equivalent, signatures Cosign.
- Inconvénients : déviation de la spec § 13.1, dépendance à Chainguard (free pour public repos).

### Si une CVE n'a pas (encore) de fix amont

Trivy est lancé avec `ignore-unfixed: true` : les CVE sans fix disponible **ne bloquent pas**. Elles sont quand même visibles en Code Scanning. C'est la seule sortie tolérée : on n'ajoute pas de `.trivyignore` pour bypasser une CVE avec fix existant.
