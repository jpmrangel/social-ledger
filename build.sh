#!/usr/bin/env bash
# build.sh - Build, push para Docker Hub e carrega imagens no Minikube
set -e

DOCKERHUB_USER="${1:-jpmrangel}"
VERSION="${2:-latest}"

API_IMAGE="${DOCKERHUB_USER}/social-ledger-api:${VERSION}"
FRONTEND_IMAGE="${DOCKERHUB_USER}/social-ledger-frontend:${VERSION}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================"
echo " Social Ledger - Build & Deploy Setup"
echo " Docker Hub user : ${DOCKERHUB_USER}"
echo " Tag             : ${VERSION}"
echo "========================================"

# ─── 1. Build das imagens ────────────────────────────────────────────────────
echo ""
echo "[1/4] Buildando imagem da API..."
docker build -t "${API_IMAGE}" "${SCRIPT_DIR}/api"

echo ""
echo "[2/4] Buildando imagem do Frontend..."
docker build -t "${FRONTEND_IMAGE}" "${SCRIPT_DIR}/frontend"

# ─── 2. Push para Docker Hub ─────────────────────────────────────────────────
echo ""
echo "[3/4] Enviando imagens para Docker Hub..."
docker push "${API_IMAGE}"
docker push "${FRONTEND_IMAGE}"

# ─── 3. Carregar imagens no Minikube ─────────────────────────────────────────
echo ""
echo "[4/4] Carregando imagens no Minikube..."
minikube image load "${API_IMAGE}"
minikube image load "${FRONTEND_IMAGE}"

echo ""
echo "========================================"
echo " Build concluído com sucesso!"
echo ""
echo " Próximos passos:"
echo "  1. Certifique-se que o addon Ingress está ativo:"
echo "     minikube addons enable ingress"
echo ""
echo "  2. Instale (ou atualize) o Helm chart:"
echo "     helm upgrade --install social-ledger ./helm/social-ledger"
echo ""
echo "  3. Obtenha o IP do Minikube e adicione ao /etc/hosts:"
echo "     echo \"\$(minikube ip) k8s.local\" | sudo tee -a /etc/hosts"
echo ""
echo "  4. Acesse a aplicação em: http://k8s.local"
echo "========================================"
