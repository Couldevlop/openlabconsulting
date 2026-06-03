#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Déploiement MANUEL d'une image openlab-website.
#
# Interim tant qu'ArgoCD ne peut pas synchroniser : ArgoCD v2.13.2 plante au
# calcul de diff sur K8s 1.35 (`.status.terminatingReplicas: field not declared
# in schema`) → toutes les syncs échouent (op=Error) et l'Image Updater n'a
# aucun effet, même s'il écrit le bon tag. Son selfHeal étant inerte (diff
# cassé), un `kubectl set image` manuel TIENT (ArgoCD ne le réverte pas).
#
# Fix durable = upgrade ArgoCD (cf. deploy/argocd/README.md). En attendant,
# après chaque release (nouveau tag `vX.Y.Z` publié sur GHCR par release.yml) :
#
#   bash deploy/scripts/roll-image.sh 1.0.18
#
# (à exécuter depuis un poste ayant accès au cluster, ou via SSH sur le nœud).
# ---------------------------------------------------------------------------
set -euo pipefail

TAG="${1:?Usage: roll-image.sh <tag>  (ex: 1.0.18, sans le préfixe v)}"
NAMESPACE="${2:-openlab}"
IMAGE="ghcr.io/couldevlop/website:${TAG}"

echo "🚀 Déploiement manuel openlab-website → ${IMAGE} (ns=${NAMESPACE})"
kubectl set image "deployment/openlab-website" "app=${IMAGE}" -n "${NAMESPACE}"
kubectl rollout status "deployment/openlab-website" -n "${NAMESPACE}" --timeout=180s

echo "✅ Rollout terminé. Vérification santé :"
echo "   curl -fsS https://openlabconsulting.com/api/health"
