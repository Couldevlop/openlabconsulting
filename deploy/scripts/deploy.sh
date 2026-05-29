#!/usr/bin/env bash
# Déploiement OpenLab Website via Helm — CLAUDE.md §14.5.
# Budget cible : < 10 minutes.
#
# Usage :
#   bash deploy/scripts/deploy.sh <env> <image_tag>
#
# Exemples :
#   bash deploy/scripts/deploy.sh production v1.4.2
#   bash deploy/scripts/deploy.sh staging sha-abc1234
#
# Prérequis (vérifiés en début) :
#   - kubectl + helm v3.13+ installés
#   - kubeconfig pointant sur le cluster K3s Hetzner
#   - SealedSecrets controller installé (sealed-secrets-system)
#   - cert-manager + traefik installés
#   - Image disponible : ghcr.io/<owner>/website:<tag>
#
# Owner GHCR : `couldevlop` (User account GitHub) tant qu'il n'existe
# pas d'organisation `openlab-consulting`. Le workflow release.yml
# utilise `github.repository_owner` (auto-adapté). Override possible
# via la variable d'env IMAGE_REPO_OWNER avant l'appel du script.
set -euo pipefail

ENVIRONMENT="${1:-production}"
IMAGE_TAG="${2:-latest}"
IMAGE_REPO_OWNER="${IMAGE_REPO_OWNER:-couldevlop}"
IMAGE_REPO="ghcr.io/${IMAGE_REPO_OWNER}/website"
CHART_DIR="$(cd "$(dirname "$0")/.." && pwd)/helm/openlab-website"

# Mapping env → namespace / release / values.
case "$ENVIRONMENT" in
  production)
    NAMESPACE="openlab"
    RELEASE="openlab"
    VALUES_FILE="${CHART_DIR}/values-production.yaml"
    HOST="openlabconsulting.com"
    ;;
  staging)
    NAMESPACE="openlab-staging"
    RELEASE="openlab"
    VALUES_FILE="${CHART_DIR}/values-staging.yaml"
    HOST="staging.openlabconsulting.com"
    ;;
  *)
    echo "❌ Environnement inconnu : '$ENVIRONMENT' (attendu: production|staging)"
    exit 1
    ;;
esac

START_TIME=$SECONDS
echo "🚀 Déploiement OpenLab Website (Helm)"
echo "   env       = $ENVIRONMENT"
echo "   namespace = $NAMESPACE"
echo "   release   = $RELEASE"
echo "   image     = ${IMAGE_REPO}:${IMAGE_TAG}"
echo "   values    = $VALUES_FILE"
echo "   chart     = $CHART_DIR"
echo ""

# ────────────────────────────────────────────────────────────
# 1. Pre-checks (< 20 s)
# ────────────────────────────────────────────────────────────
echo "▶ 1/7 Pre-checks"
kubectl config current-context
command -v helm >/dev/null || { echo "❌ helm v3.13+ requis"; exit 1; }
helm version --short

kubectl get namespace "$NAMESPACE" >/dev/null 2>&1 || \
  kubectl create namespace "$NAMESPACE"

# ────────────────────────────────────────────────────────────
# 2. Dépendances Helm (Bitnami postgres/redis/minio) (< 30 s)
# ────────────────────────────────────────────────────────────
echo "▶ 2/7 helm dependency build"
helm repo add bitnami https://charts.bitnami.com/bitnami --force-update >/dev/null 2>&1 || true
helm dependency build "$CHART_DIR"

# ────────────────────────────────────────────────────────────
# 3. Vérifie que le SealedSecret est déjà appliqué (< 5 s)
# ────────────────────────────────────────────────────────────
echo "▶ 3/7 Vérification SealedSecret"
if ! kubectl get secret openlab-website-secrets -n "$NAMESPACE" >/dev/null 2>&1; then
  echo "⚠️  Secret openlab-website-secrets manquant dans $NAMESPACE"
  echo "    Appliquer d'abord deploy/k8s/base/secret.sealedsecret.yaml (scellé via kubeseal)."
  echo "    Voir le commentaire en tête du fichier pour la procédure."
  exit 1
fi

# ────────────────────────────────────────────────────────────
# 4. Lint Helm chart (< 5 s)
# ────────────────────────────────────────────────────────────
echo "▶ 4/7 helm lint"
helm lint "$CHART_DIR" -f "$VALUES_FILE"

# ────────────────────────────────────────────────────────────
# 5. Helm upgrade --install (< 4 min, rolling sans interruption)
# ────────────────────────────────────────────────────────────
echo "▶ 5/7 helm upgrade --install"
helm upgrade --install "$RELEASE" "$CHART_DIR" \
  --namespace "$NAMESPACE" \
  --create-namespace \
  --values "$VALUES_FILE" \
  --set "image.tag=${IMAGE_TAG}" \
  --wait \
  --timeout 8m \
  --atomic

# ────────────────────────────────────────────────────────────
# 6. Smoke test HTTPS (< 1 min)
# ────────────────────────────────────────────────────────────
# SKIP_SMOKE=1 : saute le test (utile en CD avant le cutover DNS, ou
# quand le host public ne pointe pas encore sur le cluster). La santé
# des pods est déjà garantie par `helm --wait --atomic` + readiness.
if [[ "${SKIP_SMOKE:-0}" == "1" ]]; then
  echo "▶ 6/7 Smoke test — SAUTÉ (SKIP_SMOKE=1)"
else
  echo "▶ 6/7 Smoke test"
  SMOKE_OK=0
  for i in $(seq 1 24); do
    if curl -fsS --max-time 5 "https://${HOST}/api/health" >/dev/null 2>&1; then
      SMOKE_OK=1
      break
    fi
    sleep 5
  done

  if [[ "$SMOKE_OK" -ne 1 ]]; then
    echo "❌ Smoke test failed après 2 min"
    echo "   Pods :"
    kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=openlab-website
    echo "   Logs (dernier pod) :"
    kubectl logs -n "$NAMESPACE" -l app.kubernetes.io/name=openlab-website --tail=50
    echo ""
    echo "   Rollback recommandé : bash deploy/scripts/rollback.sh $ENVIRONMENT"
    exit 1
  fi
fi

# ────────────────────────────────────────────────────────────
# 7. Rapport final
# ────────────────────────────────────────────────────────────
ELAPSED=$((SECONDS - START_TIME))
echo "▶ 7/7 Rapport"
echo "✅ Déploiement OK en ${ELAPSED}s (budget 600s)"
helm status "$RELEASE" -n "$NAMESPACE" --show-resources | head -40

if [[ "$ELAPSED" -gt 600 ]]; then
  echo "⚠️  Dépassement budget §14.5 (${ELAPSED}s > 600s) — investiguer"
  exit 2
fi
