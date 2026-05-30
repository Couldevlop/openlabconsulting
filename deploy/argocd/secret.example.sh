#!/usr/bin/env bash
# Création du Secret applicatif `openlab-website-secrets` (namespace openlab).
#
# ⚠️ Ce secret reste DANS le cluster — il ne transite jamais par GitHub ni
# par ce repo. Ce fichier est un TEMPLATE : il ne contient AUCUNE valeur
# réelle. Renseigne les variables d'environnement (idéalement via un
# gestionnaire de secrets local) puis exécute-le sur le serveur, KUBECONFIG
# pointant sur le cluster K3s Hetzner.
#
# Référence des clés : memory project_deploiement_hetzner + CLAUDE.md §14.8.
# Pour une approche 100% GitOps, voir README.md §5 (SealedSecrets).
set -euo pipefail

NAMESPACE="${NAMESPACE:-openlab}"

# ── À remplir (NE PAS committer une version remplie) ──────────────────
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:?définir POSTGRES_PASSWORD}"
# Host = service du subchart Bitnami postgres (alias `postgres`, release `openlab`).
DATABASE_URL="${DATABASE_URL:-postgresql://openlab:${POSTGRES_PASSWORD}@openlab-postgres.openlab.svc.cluster.local:5432/openlab}"
PAYLOAD_SECRET="${PAYLOAD_SECRET:?définir PAYLOAD_SECRET}"
BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:?définir BETTER_AUTH_SECRET}"
METRICS_TOKEN="${METRICS_TOKEN:?définir METRICS_TOKEN}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:?définir MINIO_ACCESS_KEY}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:?définir MINIO_SECRET_KEY}"
MEILISEARCH_MASTER_KEY="${MEILISEARCH_MASTER_KEY:?définir MEILISEARCH_MASTER_KEY}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:?définir ANTHROPIC_API_KEY}"
ZEPTOMAIL_TOKEN="${ZEPTOMAIL_TOKEN:?définir ZEPTOMAIL_TOKEN}"
TURNSTILE_SECRET_KEY="${TURNSTILE_SECRET_KEY:?définir TURNSTILE_SECRET_KEY}"

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# `kubectl create secret … --dry-run | apply` = idempotent (crée ou met à jour).
kubectl create secret generic openlab-website-secrets \
  --namespace "$NAMESPACE" \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=PAYLOAD_SECRET="$PAYLOAD_SECRET" \
  --from-literal=BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  --from-literal=METRICS_TOKEN="$METRICS_TOKEN" \
  --from-literal=MINIO_ACCESS_KEY="$MINIO_ACCESS_KEY" \
  --from-literal=MINIO_SECRET_KEY="$MINIO_SECRET_KEY" \
  --from-literal=MEILISEARCH_MASTER_KEY="$MEILISEARCH_MASTER_KEY" \
  --from-literal=ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  --from-literal=ZEPTOMAIL_TOKEN="$ZEPTOMAIL_TOKEN" \
  --from-literal=TURNSTILE_SECRET_KEY="$TURNSTILE_SECRET_KEY" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Secret openlab-website-secrets appliqué dans le namespace $NAMESPACE"
