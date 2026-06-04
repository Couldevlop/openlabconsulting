# Déploiement GitOps — ArgoCD (OpenLab Website)

Déploiement **pull-based** : ArgoCD tourne _dans_ le cluster K3s Hetzner,
surveille ce repo et applique le chart Helm `deploy/helm/openlab-website`.

**Ce que GitOps supprime** : la connexion SSH entrante depuis GitHub Actions
et les secrets `DEPLOY_SSH_HOST / USER / KEY`. GitHub ne fait plus que
**builder et pousser l'image** sur GHCR (`release.yml`, job `publish`). Le
job CD SSH a été retiré de `release.yml`.

**Ce que GitOps ne supprime pas** : le Secret applicatif
`openlab-website-secrets`, qui reste **dans le cluster** (§3). Il ne transite
jamais par GitHub.

Cible : CLAUDE.md §14.6.

---

## 0. Prérequis

- `kubectl` configuré sur le cluster (`export KUBECONFIG=/etc/rancher/k3s/k3s.yaml` côté serveur).
- Package GHCR `ghcr.io/couldevlop/website` **public** (sinon ArgoCD/Image Updater ne peut pas lister les tags ni puller sans `imagePullSecret`).
- Toutes les commandes ci-dessous s'exécutent **sur le serveur** (62.238.11.20).

---

## 1. Installer ArgoCD (si absent)

```bash
# Déjà installé ? (pour NexusRH par ex.)
kubectl get ns argocd && kubectl get pods -n argocd

# Sinon, installation (version épinglée — vérifier la dernière stable) :
kubectl create namespace argocd
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.13.2/manifests/install.yaml

# Attendre que le serveur soit prêt
kubectl rollout status deploy/argocd-server -n argocd --timeout=300s

# Mot de passe admin initial
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath='{.data.password}' | base64 -d; echo

# Accès UI (port-forward au travers du tunnel SSH, ou Ingress dédié)
kubectl port-forward svc/argocd-server -n argocd 8080:443
# → https://localhost:8080  (user: admin)
```

> Exposer l'UI ArgoCD sur Internet est optionnel et **déconseillé sans
> protection** (OWASP A05). Le `port-forward` au travers du SSH suffit pour
> piloter ; ArgoCD fonctionne sans UI exposée.

---

## 2. Installer ArgoCD Image Updater (MAJ auto du tag)

```bash
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/v0.15.2/manifests/install.yaml

kubectl rollout status deploy/argocd-image-updater -n argocd --timeout=180s
```

Le repository GHCR étant **public**, aucune config de registre/credential
n'est nécessaire : Image Updater liste les tags anonymement. La stratégie
(`semver`, tags `X.Y.Z`, write-back `argocd`) est portée par les
annotations de l'`Application` (cf. `application.yaml`).

---

## 3. Créer le namespace applicatif + le Secret (hors GitOps)

Le Secret reste dans le cluster. Renseigne les valeurs puis exécute le
template (ne **jamais** committer une version remplie) :

```bash
# Depuis une copie du repo sur le serveur :
export POSTGRES_PASSWORD='…' PAYLOAD_SECRET='…' BETTER_AUTH_SECRET='…' \
       METRICS_TOKEN='…' MINIO_ACCESS_KEY='…' MINIO_SECRET_KEY='…' \
       MEILISEARCH_MASTER_KEY='…' ANTHROPIC_API_KEY='…' \
       ZEPTOMAIL_TOKEN='…' TURNSTILE_SECRET_KEY='…'

bash deploy/argocd/secret.example.sh
```

Clés requises et host Postgres (`postgres.openlab.svc.cluster.local` —
le chart force `fullnameOverride: postgres`) documentés dans le script.

---

## 4. Déclarer l'Application

```bash
kubectl apply -f deploy/argocd/application.yaml

# Suivre la synchro
kubectl get application openlab-website -n argocd -w
# ou : argocd app get openlab-website
```

ArgoCD crée le namespace `openlab` (si absent), résout les dépendances Helm
(postgres/redis/minio/meilisearch), exécute le hook de migration Payload,
puis déploie l'app. `automated + selfHeal + prune` maintiennent l'état.

### Cycle de release désormais (CD continu sur `main`)

1. PR `feat/*` → `develop` → PR `develop` → `main` (UI GitHub).
2. Le **push sur `main`** déclenche `release.yml` :
   1. **portes vertes** (`format` / `lint` / `typecheck` / `test`) — « une
      fois ok » ;
   2. **création auto d'un tag `vX.Y.Z`** (bump patch depuis le dernier
      tag, ou version explicite via `workflow_dispatch`) ;
   3. **build + push** `ghcr.io/couldevlop/website:X.Y.Z` (+ `sha-<court>`),
      scan Trivy bloquant, signature Cosign.
3. **Image Updater** (stratégie `semver`) détecte la plus haute version et
   patche `image.tag` → ArgoCD **sync automatiquement**. Aucune action
   manuelle. Rollback = re-pointer sur un tag `X.Y.Z` antérieur.

> Délai de détection Image Updater : ~2 min (intervalle de polling par
> défaut). Forcer : `kubectl -n argocd rollout restart deploy/argocd-image-updater`.

---

## 5. Évolutions optionnelles (plus tard)

- **GitOps « pur » (write-back git)** : faire écrire le nouveau tag par
  Image Updater _dans Git_ (commit sur `main`) au lieu de l'override ArgoCD.
  Nécessite un credential d'écriture repo monté dans le cluster (deploy key
  ou PAT) → secret in-cluster, jamais côté GitHub Actions. Remplacer
  l'annotation `write-back-method: argocd` par `git` + config du credential.
- **Secrets en GitOps (SealedSecrets / External Secrets)** : installer le
  controller, sceller `openlab-website-secrets`, committer le `SealedSecret`.
  Supprime la dernière étape manuelle `kubectl` du §3.
- **App-of-apps** : si d'autres composants OpenLab passent en GitOps,
  regrouper sous une Application parente.

---

## 6. Dépannage

| Symptôme                              | Piste                                                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `ComparisonError` / repo inaccessible | repoURL/targetRevision ; repo privé → `argocd repo add`                                                        |
| App `OutOfSync` figée                 | `kubectl describe application openlab-website -n argocd` ; events de sync                                      |
| Image non mise à jour                 | logs `deploy/argocd-image-updater -n argocd` ; package GHCR public ? tag conforme `^[0-9]+\.[0-9]+\.[0-9]+$` ? |
| Pods `CreateContainerConfigError`     | Secret `openlab-website-secrets` absent/incomplet (§3)                                                         |
| Hook migration en échec               | logs du Job `…-migrate` dans le ns `openlab`                                                                   |

## ⚠️ Dépannage — ArgoCD bloqué sur K8s 1.35 (diff `terminatingReplicas`)

**Symptôme** : `kubectl get application openlab-website -n argocd` → `Synced/Healthy`
mais `op=Error` :

```
ComparisonError: ... error building typed value from live resource:
.status.terminatingReplicas: field not declared in schema
```

→ ArgoCD v2.13.2 ne connaît pas ce champ (Deployments K8s ≥ 1.33) → **tout sync
échoue**, l'Image Updater écrit le bon tag mais rien ne se déploie, et le
`selfHeal` est inerte. C'est ce qui a figé l'image sur `1.0.10` (page `/admin`
blanche, vieux importMap) alors que `v1.0.17` était dispo.

**Interim (déployer quand même)** — le selfHeal étant cassé, un set image manuel tient :

```bash
bash deploy/scripts/roll-image.sh 1.0.18    # après chaque release vX.Y.Z
```

**Fix durable — UPGRADE ArgoCD** (le cluster héberge aussi NexusRH → fenêtre de
maintenance) vers une version dont les libs k8s connaissent `terminatingReplicas`
(≥ v2.14 / dernier patch 2.13) :

```bash
# exemple (adapter à la méthode d'install : manifests ou helm)
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.14.x/manifests/install.yaml
kubectl -n argocd rollout status statefulset/argocd-application-controller
```

ServerSideDiff est déjà activé (annotation Application + `controller.diff.server.side=true`)
mais ne suffit pas sur 2.13.2 — l'upgrade est nécessaire.

## Migrations Payload (manuel, tant que `migrate.enabled=false`)

L'image runner distroless ne peut pas exécuter le migrate-job. Appliquer les
migrations via tunnel depuis un poste avec le repo :

```bash
ssh -N -L 35432:<postgres-clusterIP>:5432 root@<noeud> &   # tunnel Postgres
DATABASE_URL=postgresql://openlab:<pwd>@localhost:35432/openlab \
PAYLOAD_SECRET=<secret> NODE_ENV=production \
  node ./node_modules/tsx/dist/cli.mjs scripts/payload-migrate.ts
```
