# Infrastructure — Docker, K3s Hetzner, observabilité

> Référence extraite de `CLAUDE.md` (ex-§13, §14, §15). Conteneurisation multi-stage, déploiement K3s < 10 min, manifests, CI/CD, monitoring, sauvegardes. Voir aussi `docs/release-procedure.md`, `docs/migration-lws-hetzner.md`, `docs/security-overrides.md`.

## 1. Conteneurisation Docker

### 1.1 Stratégie multi-stage

Image finale **Chainguard Node** (`cgr.dev/chainguard/node:latest`), < 200 Mo, surface d'attaque minimale, no shell, **rebuilds quotidiens zéro-CVE**.

> **Déviation de spec assumée (2026-05-18)** : la spec initiale prévoyait `gcr.io/distroless/nodejs22-debian12:nonroot`. On a observé un retard récurrent de plusieurs jours entre la disclosure d'une CVE Debian (libc/openssl) et sa propagation dans `:nonroot`, ce qui bloquait la CI Trivy malgré un fix amont disponible. Chainguard rebuild quotidiennement → l'image arrive clean au scan dans les heures qui suivent la publication d'un fix. Voir `docs/security-overrides.md` (palier 3). Réversible : si Chainguard pose problème, on revient à Distroless avec digest pin + Renovate.

**`Dockerfile`** :

```dockerfile
# syntax=docker/dockerfile:1.7-labs

# Stage 1: deps
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm config set store-dir /root/.local/share/pnpm/store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# Stage 2: builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN corepack enable && pnpm build

# Stage 3: runner (distroless)
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static
COPY --from=builder --chown=nonroot:nonroot /app/public ./public

USER nonroot
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1))"]

CMD ["server.js"]
```

### 1.2 next.config.ts (extrait clé)

```typescript
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@payloadcms/db-postgres', 'sharp'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

### 1.3 docker-compose.yml (développement local)

```yaml
version: '3.9'
name: openlab-website

services:
  app:
    build: { context: ., target: builder }
    command: pnpm dev
    ports: ['3000:3000']
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      DATABASE_URL: postgresql://openlab:devpass@postgres:5432/openlab
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio:9000
    depends_on: [postgres, redis, minio]

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: openlab
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: openlab
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports: ['5432:5432']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports: ['9000:9000', '9001:9001']

  meilisearch:
    image: getmeili/meilisearch:v1.10
    environment:
      MEILI_MASTER_KEY: devmasterkey
    volumes:
      - meili_data:/meili_data
    ports: ['7700:7700']

volumes:
  postgres_data:
  minio_data:
  meili_data:
```

### 1.4 Build & registry

- **GHCR** (gratuit, intégré GitHub)
- **Tags** : `latest`, `sha-<short>`, `v<semver>`
- **Multi-arch** : `linux/amd64` (suffit pour K3s Hetzner)
- **Scan sécurité** : Trivy en CI, blocage si CVE HIGH/CRITICAL
- **Signature** : Cosign keyless via OIDC GitHub

## 2. Déploiement K3s Hetzner < 10 min

### 2.1 Infrastructure existante

- **Cluster K3s** sur Hetzner (cf. NexusRH déjà déployé)
- **Ingress** : Traefik (natif K3s)
- **TLS** : cert-manager + Let's Encrypt
- **Monitoring** : Prometheus + Grafana + Loki déjà déployés
- **Storage** : Longhorn ou local-path
- **DNS** : openlabconsulting.com → IP load balancer Hetzner

### 2.2 Structure deploy/

```
deploy/
├── k8s/
│   ├── base/
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.sealedsecret.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── hpa.yaml
│   │   ├── networkpolicy.yaml
│   │   ├── pdb.yaml
│   │   └── migrate-job.yaml
│   ├── postgres/
│   │   ├── statefulset.yaml
│   │   ├── service.yaml
│   │   └── backup-cronjob.yaml
│   ├── redis/
│   ├── minio/
│   ├── meilisearch/
│   └── overlays/
│       ├── staging/
│       └── production/
└── scripts/
    ├── deploy.sh
    ├── rollback.sh
    └── seed-cms.sh
```

### 2.3 deployment.yaml essentiel

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: openlab-website
  namespace: openlab
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: openlab-website
  template:
    metadata:
      labels:
        app: openlab-website
    spec:
      serviceAccountName: openlab-website
      securityContext:
        runAsNonRoot: true
        runAsUser: 65532
        fsGroup: 65532
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: app
          image: ghcr.io/openlab-consulting/website:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
              name: http
          envFrom:
            - configMapRef:
                name: openlab-website-config
            - secretRef:
                name: openlab-website-secrets
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          livenessProbe:
            httpGet:
              path: /api/health
              port: http
            initialDelaySeconds: 15
            periodSeconds: 30
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /api/health
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ['ALL']
          volumeMounts:
            - name: tmp
              mountPath: /tmp
            - name: nextjs-cache
              mountPath: /app/.next/cache
      volumes:
        - name: tmp
          emptyDir: {}
        - name: nextjs-cache
          emptyDir: {}
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: openlab-website
```

### 2.4 ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: openlab-website
  namespace: openlab
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    traefik.ingress.kubernetes.io/router.middlewares: openlab-security-headers@kubernetescrd
spec:
  ingressClassName: traefik
  tls:
    - hosts: [openlabconsulting.com, www.openlabconsulting.com]
      secretName: openlab-tls
  rules:
    - host: openlabconsulting.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: openlab-website
                port:
                  number: 3000
    - host: www.openlabconsulting.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: openlab-website
                port:
                  number: 3000
```

### 2.5 Script de déploiement < 10 min

`deploy/scripts/deploy.sh` :

```bash
#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT=${1:-production}
IMAGE_TAG=${2:-latest}
NAMESPACE=openlab

echo "🚀 Déploiement OpenLab Website — env=$ENVIRONMENT, tag=$IMAGE_TAG"
START_TIME=$SECONDS

# 1. Pre-checks (< 30 s)
kubectl config use-context openlab-hetzner
kubectl get namespace $NAMESPACE >/dev/null 2>&1 || kubectl create namespace $NAMESPACE

# 2. Secrets SealedSecrets (< 10 s)
kubectl apply -f deploy/k8s/base/secret.sealedsecret.yaml

# 3. ConfigMaps (< 10 s)
kubectl apply -f deploy/k8s/base/configmap.yaml

# 4. Dépendances (postgres, redis, minio, meilisearch) — idempotent (< 2 min)
kubectl apply -f deploy/k8s/postgres/
kubectl apply -f deploy/k8s/redis/
kubectl apply -f deploy/k8s/minio/
kubectl apply -f deploy/k8s/meilisearch/

# 5. Wait postgres (< 1 min)
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=120s

# 6. Migrations DB (< 1 min)
kubectl apply -f deploy/k8s/base/migrate-job.yaml
kubectl wait --for=condition=complete job/migrate -n $NAMESPACE --timeout=180s

# 7. Update image (< 10 s)
kubectl set image deployment/openlab-website \
  app=ghcr.io/openlab-consulting/website:$IMAGE_TAG \
  -n $NAMESPACE

# 8. Rollout (< 4 min, rolling sans interruption)
kubectl rollout status deployment/openlab-website -n $NAMESPACE --timeout=300s

# 9. Smoke test (< 30 s)
INGRESS_IP=$(kubectl get ingress openlab-website -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -fsS --max-time 10 -H "Host: openlabconsulting.com" "https://$INGRESS_IP/api/health" \
  || (echo "❌ Health check failed" && exit 1)

ELAPSED=$((SECONDS - START_TIME))
echo "✅ Déploiement terminé en ${ELAPSED}s"
```

**Budget temps réel attendu : 7-8 minutes** ✅

### 2.6 GitOps avec ArgoCD (phase suivante)

Une fois stabilisé :

- Repo séparé `openlab-website-deploy` avec manifests Kustomize
- ArgoCD watche le repo, sync auto
- PR = déploiement · git revert = rollback

### 2.7 CI/CD GitHub Actions

`.github/workflows/deploy.yml` :

```yaml
name: Build & Deploy
on:
  push:
    branches: [main]
    tags: ['v*']

permissions:
  contents: read
  packages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/openlab-consulting/website
          tags: |
            type=sha,prefix=sha-
            type=ref,event=branch
            type=semver,pattern={{version}}
      - uses: docker/build-push-action@v6
        id: build
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/openlab-consulting/website:${{ steps.meta.outputs.version }}
          format: sarif
          output: trivy-results.sarif
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
      - uses: sigstore/cosign-installer@v3
      - run: cosign sign --yes ghcr.io/openlab-consulting/website@${{ steps.build.outputs.digest }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: azure/setup-kubectl@v4
      - name: Set kubeconfig
        run: echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
      - run: bash deploy/scripts/deploy.sh production ${{ needs.build.outputs.image_tag }}
        env:
          KUBECONFIG: ./kubeconfig
```

### 2.8 Variables & secrets

**ConfigMap** (non sensible) :

```yaml
NODE_ENV: production
NEXT_PUBLIC_SITE_URL: https://openlabconsulting.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN: openlabconsulting.com
PAYLOAD_PUBLIC_SERVER_URL: https://openlabconsulting.com
REDIS_URL: redis://redis.openlab.svc.cluster.local:6379
MINIO_ENDPOINT: minio.openlab.svc.cluster.local:9000
MEILISEARCH_URL: http://meilisearch.openlab.svc.cluster.local:7700
```

**SealedSecret** (chiffré, commité dans Git) :

```yaml
DATABASE_URL
PAYLOAD_SECRET
ANTHROPIC_API_KEY
BETTER_AUTH_SECRET
RESEND_API_KEY
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
MEILISEARCH_MASTER_KEY
```

## 3. Observabilité, sauvegardes, DR

### 3.1 Monitoring

Stack en place pour NexusRH — réutiliser :

- **Prometheus** scrape `/api/metrics`
- **Grafana** dashboard custom OpenLab Website
- **Loki** + **Promtail** pour logs structurés JSON
- **Alertmanager** : alertes Slack/email

### 3.2 Endpoints

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkMinio(),
  ]);
  const status = checks.every((c) => c.status === 'fulfilled') ? 200 : 503;
  return Response.json({ checks }, { status });
}

// app/api/metrics/route.ts — Prometheus
```

### 3.3 Alertes critiques

| Métrique          | Seuil           | Action             |
| ----------------- | --------------- | ------------------ |
| Disponibilité     | < 99.5% / 5 min | Slack + email CEO  |
| Latence P95       | > 2 s / 5 min   | Slack              |
| Erreurs 5xx       | > 1% / 5 min    | Slack + email tech |
| Pods crashlooping | ≥ 1             | Slack immédiat     |
| Disque PV         | > 80%           | Slack              |
| Certif SSL        | < 14 jours      | Email tech         |
| Backups échoués   | 1 fail          | Email + Slack      |

### 3.4 Sauvegardes

- **PostgreSQL** : pgBackRest/wal-g dans CronJob K3s
  - Full quotidien 03:00 Europe/Paris
  - Incrémental horaire
  - WAL streaming continu (PITR)
- **MinIO** : réplication async vers bucket secondaire (cross-region Hetzner)
- **SealedSecrets** : sauvegarde clé privée controller dans coffre-fort externe

### 3.5 Test restauration

CronJob hebdomadaire :

1. Spawn namespace `dr-test`
2. Restaure dernier backup
3. Smoke tests
4. Cleanup
5. Rapport email
