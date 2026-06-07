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

**Palier 1 — Force pull base image** _(testé, insuffisant)_

- `pull: true` sur `docker/build-push-action`. Insuffisant : `:nonroot` n'a pas (encore) absorbé `glibc u14` ni `openssl 3.0.19-1~deb12u2` dans son rebuild rolling.

**Palier 2 — Pin digest distroless** _(non retenu)_

- Demanderait un suivi manuel + tooling Renovate pour mettre à jour. Reporte le problème dans le temps sans le résoudre vraiment.

**Palier 3 — Switch base image vers Chainguard Node** _(ACTIF, décidé 2026-05-18)_

- `cgr.dev/chainguard/node:latest` — Chainguard Node, rebuild **quotidien**, zero-CVE en pratique.
- Déviation §13.1 du CLAUDE.md assumée et documentée.
- Stages builder/deps restent sur `node:22-alpine` car ils sont jetés (pas dans Trivy image scan).
- Réversible : si Chainguard pose problème (changement de licence, instabilité), retour à Distroless avec digest pin + Renovate.

### Si une CVE n'a pas (encore) de fix amont

Trivy est lancé avec `ignore-unfixed: true` : les CVE sans fix disponible **ne bloquent pas**. Elles sont quand même visibles en Code Scanning. C'est la seule sortie tolérée : on n'ajoute pas de `.trivyignore` pour bypasser une CVE avec fix existant.

## 3. WAF ModSecurity — moteur désactivé sur /admin (openlabconsulting.com)

**Quoi (2026-06-07)** : dans le ConfigMap `ingress-nginx-controller`
(ns `ingress-nginx`, ressource cluster partagée, hors chart applicatif),
le `modsecurity-snippet` contient une règle scopée :

```
SecRule REQUEST_HEADERS:Host "@rx ^(www\.)?openlabconsulting\.com$" "id:10100,phase:1,pass,nolog,chain"
SecRule REQUEST_URI "@beginsWith /admin" "ctl:ruleEngine=Off"
```

**Pourquoi** : le back-office Payload v3 fonctionne par server functions
React — chaque interaction de formulaire (ajout d'une ligne de tableau,
auto-save…) est un POST vers `/admin/*` dont le contenu (état de
formulaire JSON, HTML riche, extraits de code des articles) dépasse le
seuil d'anomalie OWASP CRS (règle 949110, score ≥ 5) → 403 systématique,
admin inutilisable (constaté le 2026-06-07 : « Add Point clé » en spinner
infini sur /admin/collections/articles/create).

**Compensations** : `/admin` reste protégé par l'applicatif — auth
Payload, 2FA TOTP obligatoire (`ENFORCE_ADMIN_2FA`), lockout 10 échecs /
30 min, politique mot de passe 12+, audit log. Le WAF reste actif sur
tout le reste (site public, `/api`, hôtes NexusRH).

**Limites connues** : un POST authentifié de l'admin qui passe par
`/api/*` (REST Payload) reste derrière le WAF — si un faux positif
apparaît à l'enregistrement d'un contenu, ajouter une exclusion CRS
ciblée (pas un `ruleEngine=Off` global sur /api).

**Réversibilité** : retirer les 2 lignes du snippet du ConfigMap
(`kubectl edit configmap ingress-nginx-controller -n ingress-nginx`) —
nginx recharge automatiquement.
