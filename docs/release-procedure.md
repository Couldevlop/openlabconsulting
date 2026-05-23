# Procédure de release — publier une image GHCR

Document opérationnel pour publier une nouvelle version de l'image Docker
du site sur **GitHub Container Registry (GHCR)**. Préalable indispensable
à tout `deploy/scripts/deploy.sh` qui suppose une image disponible.

> **Workflow CI/CD** : `.github/workflows/release.yml` se déclenche
> automatiquement sur push d'un tag `v*` (semver) ou via dispatch
> manuel. Build → push GHCR → Trivy scan bloquant HIGH/CRITICAL →
> signature Cosign keyless (OIDC GitHub → Sigstore).

---

## 1. Quand publier une release ?

| Cas                                             | Tag           | Push image                                        |
| ----------------------------------------------- | ------------- | ------------------------------------------------- |
| Première mise en production                     | `v1.0.0`      | ✅                                                |
| Correctif urgent prod (hotfix)                  | `v1.0.1`      | ✅                                                |
| Nouvelle feature majeure mergée dans main       | `v1.1.0`      | ✅                                                |
| Pré-release pour test sur staging               | `v1.1.0-rc.1` | ✅ (dispatch manuel)                              |
| Itération develop sans intention de déploiement | _aucun_       | ❌ (la CI `ci.yml` build/scan en local sans push) |

**Règle** : tag uniquement sur `main` (après merge `develop → main`).
Tag sur `develop` interdit (la branche n'est pas stable par définition).

---

## 2. Pré-requis avant le tag

- [ ] La PR `develop → main` est mergée
- [ ] `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:coverage` au vert local
- [ ] `pnpm build` réussit
- [ ] La CI `ci.yml` est verte sur le dernier commit `main`
- [ ] Aucune CVE HIGH/CRITICAL non patchable connue (sinon documenter dans `docs/security-overrides.md`)
- [ ] Le CHANGELOG (si présent) est à jour
- [ ] Les SealedSecrets prod sont en place (cf. `docs/migration-lws-hetzner.md` §5)

---

## 3. Créer et pousser le tag

### 3.1 Identifier la version

Convention **Semantic Versioning** :

```
v<MAJOR>.<MINOR>.<PATCH>[-<prerelease>]
```

- **MAJOR** : breaking change (schéma DB incompatible, route renommée, etc.)
- **MINOR** : nouvelle feature rétrocompatible (ex : nouvelle page produit, nouveau module admin)
- **PATCH** : correctif rétrocompatible (bug fix, CVE patch)

Lister les tags existants :

```bash
git fetch --tags
git tag --list 'v*' --sort=-v:refname | head -10
```

### 3.2 Tagger et pousser

**Depuis `main` mis à jour** :

```bash
git checkout main
git pull --ff-only

# Tag annoté (recommandé — porte un message, signé git si configuré)
git tag -a v1.0.0 -m "Release v1.0.0 — première mise en production refonte 2026"

# Pousser le tag sur origin (déclenche le workflow release.yml)
git push origin v1.0.0
```

> **Tag annoté vs léger** : toujours utiliser `-a` (annoté). Les tags
> légers ne portent ni auteur ni message, et certains outils GHCR /
> ArgoCD ne les détectent pas correctement.

### 3.3 Suivre le workflow

```bash
# Si gh CLI installé
gh run watch

# Sinon : ouvrir dans le navigateur
echo "https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo Couldevlop/openlabconsulting)/actions"
```

Le workflow `release.yml` (~10-12 min) exécute :

1. **Build** image Docker multi-stage Chainguard distroless (cache GHA)
2. **Push** vers `ghcr.io/<owner>/website` avec tags :
   - `v1.0.0` (semver exact)
   - `1.0` (alias minor glissant)
   - `1` (alias major glissant)
   - `sha-<short>` (traçabilité commit)
3. **Trivy** scan SARIF (upload Code Scanning) + scan bloquant HIGH/CRITICAL avec fix
4. **Cosign** signature keyless (OIDC GitHub → Rekor public log)

### 3.4 Vérifier l'image publiée

```bash
# Lister les tags GHCR
gh api "/users/<owner>/packages/container/website/versions" --jq '.[].metadata.container.tags[]' | head -10

# OU via Docker
docker pull ghcr.io/<owner>/website:v1.0.0
docker image inspect ghcr.io/<owner>/website:v1.0.0 --format '{{.Id}}'
```

### 3.5 Vérifier la signature Cosign (optionnel mais recommandé)

```bash
# Installer cosign : https://docs.sigstore.dev/cosign/installation/

cosign verify ghcr.io/<owner>/website:v1.0.0 \
  --certificate-identity-regexp='https://github.com/<owner>/openlabconsulting/.github/workflows/release.yml@.*' \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com
```

Doit afficher `Verification for ghcr.io/<owner>/website:v1.0.0 -- The following checks were performed`. Sinon → la signature est invalide ou absente, ne **pas** déployer.

---

## 4. Déployer

Une fois l'image publiée et vérifiée :

```bash
bash deploy/scripts/deploy.sh staging v1.0.0       # smoke en staging d'abord
bash deploy/scripts/deploy.sh production v1.0.0    # puis prod
```

Cf. [`migration-lws-hetzner.md`](./migration-lws-hetzner.md) §3 (staging) et §6 (production) pour le déroulé complet d'un cutover.

---

## 5. Rollback rapide

Si la release pose problème :

```bash
# Option A : revenir au tag précédent
bash deploy/scripts/deploy.sh production v0.9.4

# Option B : helm rollback (révision précédente, plus rapide)
bash deploy/scripts/rollback.sh production
# ou : helm rollback openlab -n openlab
```

Cf. `migration-lws-hetzner.md` §13 (scénarios rollback détaillés).

---

## 6. Annexes

### Owner GHCR

Le namespace GHCR est calculé automatiquement par
`.github/workflows/release.yml` via `github.repository_owner`.

- Aujourd'hui : `couldevlop` (User account)
- Si une organisation `openlab-consulting` est créée plus tard :
  1. Transférer le repo dans l'org
  2. Le workflow s'adaptera automatiquement (`github.repository_owner` = `openlab-consulting`)
  3. Mettre à jour manuellement :
     - `deploy/helm/openlab-website/values.yaml` (clé `image.repository`)
     - `deploy/k8s/base/deployment.yaml` (champ `image`)
     - `deploy/scripts/deploy.sh` (variable `IMAGE_REPO_OWNER` par défaut)

### Publier sans créer de tag (dispatch manuel)

Pour publier une image de test sans tag git (rare — preferer une vraie
pré-release `vX.Y.Z-rc.N`) :

1. GitHub → Actions → **release** → **Run workflow**
2. Choisir la branche (`develop` typiquement)
3. Optionnellement renseigner un tag custom dans `inputs.tag`

L'image est publiée avec le tag custom + le tag `sha-<short>` du commit.
**Ne pas utiliser cela pour de la production.**

### Pourquoi le workflow ci.yml ne push pas

`ci.yml` est le pipeline de qualité (lint/test/build/scan) qui tourne
sur **chaque PR et chaque push develop**. Il build l'image pour Trivy
mais ne la push pas (pas de tag stable à attribuer, et publier sur
chaque commit polluerait GHCR).

`release.yml` est le pipeline de publication, déclenché **explicitement**
sur tag — c'est un acte intentionnel, pas un effet de bord du dev.
