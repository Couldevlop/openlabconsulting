# Helm chart — openlab-website

CLAUDE.md §14. Déploiement K3s Hetzner via Helm 3.13+.

## Démarrage rapide

```bash
# 1. Sceller les secrets (1 fois par cluster)
kubectl -n openlab create secret generic openlab-website-secrets \
  --from-literal=DATABASE_URL=postgresql://openlab:$(openssl rand -hex 32)@postgres/openlab \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -hex 32) \
  --from-literal=PAYLOAD_SECRET=$(openssl rand -hex 32) \
  --from-literal=BETTER_AUTH_SECRET=$(openssl rand -hex 32) \
  --from-literal=ANTHROPIC_API_KEY=sk-ant-... \
  --from-literal=RESEND_API_KEY=re_... \
  --from-literal=MINIO_ACCESS_KEY=$(openssl rand -hex 16) \
  --from-literal=MINIO_SECRET_KEY=$(openssl rand -hex 32) \
  --from-literal=MEILISEARCH_MASTER_KEY=$(openssl rand -hex 32) \
  --from-literal=TURNSTILE_SECRET_KEY=... \
  --from-literal=METRICS_TOKEN=$(openssl rand -hex 32) \
  --dry-run=client -o yaml \
  | kubeseal --controller-namespace=sealed-secrets-system \
             --controller-name=sealed-secrets \
             --format=yaml \
  > deploy/k8s/base/secret.sealedsecret.yaml

git add deploy/k8s/base/secret.sealedsecret.yaml && git commit
kubectl apply -f deploy/k8s/base/secret.sealedsecret.yaml

# 2. Déploiement complet (Postgres + Redis + MinIO + Meilisearch + Next.js)
bash deploy/scripts/deploy.sh production v1.4.2

# 3. Rollback rapide si besoin
bash deploy/scripts/rollback.sh production
```

## Structure

```
deploy/helm/openlab-website/
├── Chart.yaml                   # Métadonnées + 3 dépendances Bitnami
├── values.yaml                  # Défauts (= production minimaliste)
├── values-staging.yaml          # Override staging (1 réplica, host différent)
├── values-production.yaml       # Override production (2 réplicas, apex)
└── templates/
    ├── _helpers.tpl             # name/fullname/labels Helm
    ├── configmap.yaml           # NEXT_PUBLIC_* + Redis/Mini/Meili URLs
    ├── serviceaccount.yaml      # SA dédié, no token mount
    ├── deployment.yaml          # 2 réplicas + sécurité OWASP
    ├── service.yaml             # ClusterIP 3000
    ├── ingress.yaml             # Traefik + cert-manager
    ├── hpa.yaml                 # HPA min 2 / max 5 sur CPU+mem
    ├── pdb.yaml                 # minAvailable 1
    ├── networkpolicy.yaml       # Egress restreint (DNS, intra, HTTPS)
    ├── migrate-job.yaml         # Hook pré-install/upgrade Payload migrate
    └── meilisearch.yaml         # StatefulSet (pas de chart Bitnami)
```

Sub-charts (Bitnami) : `postgresql`, `redis`, `minio` — installés via
`helm dependency build`.

## Vérifications avant déploiement

```bash
# Lint
helm lint deploy/helm/openlab-website -f deploy/helm/openlab-website/values-production.yaml

# Diff vs cluster (helm diff plugin)
helm diff upgrade openlab deploy/helm/openlab-website \
  -n openlab \
  -f deploy/helm/openlab-website/values-production.yaml \
  --set image.tag=v1.4.2

# Rendu local des manifests
helm template openlab deploy/helm/openlab-website \
  -f deploy/helm/openlab-website/values-production.yaml \
  --set image.tag=v1.4.2 \
  > /tmp/rendered.yaml
```

## CI / GitOps

Le script `deploy/scripts/deploy.sh` est appelé par
`.github/workflows/deploy.yml` après build + push GHCR + Trivy scan.
Cible budget §14.5 : **< 10 minutes** du `git push` au smoke test
HTTPS réussi.

Pour passer en GitOps (ArgoCD) :

```yaml
# repo openlab-website-deploy (séparé)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: openlab-website
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Couldevlop/openlabconsulting
    path: deploy/helm/openlab-website
    targetRevision: main
    helm:
      valueFiles:
        - values-production.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: openlab
  syncPolicy:
    automated:
      prune: false # Pas de prune sur les StatefulSets data
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```
