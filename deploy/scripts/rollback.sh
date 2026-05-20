#!/usr/bin/env bash
# Rollback Helm vers la révision précédente — CLAUDE.md §14.5.
#
# Usage :
#   bash deploy/scripts/rollback.sh [env] [revision]
#
# Sans revision : rollback vers la révision N-1 (helm rollback 0).
# Sinon : helm rollback <revision>.
set -euo pipefail

ENVIRONMENT="${1:-production}"
REVISION="${2:-0}" # 0 = précédente

case "$ENVIRONMENT" in
  production)
    NAMESPACE="openlab"
    RELEASE="openlab"
    ;;
  staging)
    NAMESPACE="openlab-staging"
    RELEASE="openlab"
    ;;
  *)
    echo "❌ env inconnu : '$ENVIRONMENT'"
    exit 1
    ;;
esac

echo "⏪ Rollback Helm release '$RELEASE' dans $NAMESPACE"
helm history "$RELEASE" -n "$NAMESPACE" --max 10

helm rollback "$RELEASE" "$REVISION" \
  --namespace "$NAMESPACE" \
  --wait \
  --timeout 5m

echo "✅ Rollback terminé."
helm status "$RELEASE" -n "$NAMESPACE" | head -20
