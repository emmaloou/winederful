#!/bin/bash

# Script de déploiement Kubernetes pour WineShop
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement de WineShop sur Kubernetes..."

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Créer le namespace
echo -e "${YELLOW}📦 Création du namespace...${NC}"
kubectl apply -f base/namespace.yaml

# 2. Appliquer les ConfigMaps et Secrets
echo -e "${YELLOW}🔐 Configuration des variables d'environnement et secrets...${NC}"
kubectl apply -f base/configmap.yaml
kubectl apply -f secrets/secrets.yaml

# 3. Créer les PersistentVolumeClaims
echo -e "${YELLOW}💾 Création des volumes de stockage...${NC}"
kubectl apply -f storage/postgres-pvc.yaml
kubectl apply -f storage/minio-pvc.yaml

# 4. Déployer les services (base de données et cache)
echo -e "${YELLOW}🗄️  Déploiement PostgreSQL...${NC}"
kubectl apply -f services/postgres-deployment.yaml

echo -e "${YELLOW}⚡ Déploiement Redis...${NC}"
kubectl apply -f services/redis-deployment.yaml

echo -e "${YELLOW}📦 Déploiement MinIO...${NC}"
kubectl apply -f services/minio-deployment.yaml

# Attendre que les services soient prêts
echo -e "${YELLOW}⏳ Attente du démarrage des services (30s)...${NC}"
sleep 30

# 5. Déployer l'API backend
echo -e "${YELLOW}🔧 Déploiement de l'API backend...${NC}"
kubectl apply -f services/api-deployment.yaml

# Attendre que l'API soit prête
echo -e "${YELLOW}⏳ Attente du démarrage de l'API (20s)...${NC}"
sleep 20

# 6. Déployer le frontend
echo -e "${YELLOW}🌐 Déploiement du frontend...${NC}"
kubectl apply -f services/frontend-deployment.yaml

# 7. Configurer l'Ingress (optionnel)
echo -e "${YELLOW}🌍 Configuration de l'Ingress...${NC}"
kubectl apply -f ingress/ingress.yaml

# Afficher l'état du déploiement
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""
echo -e "${YELLOW}📊 État des pods :${NC}"
kubectl get pods -n wineshop

echo ""
echo -e "${YELLOW}🌐 Services exposés :${NC}"
kubectl get services -n wineshop

echo ""
echo -e "${YELLOW}🔗 Pour accéder au frontend :${NC}"
echo "Récupérer l'IP publique du LoadBalancer :"
echo "kubectl get service frontend-service -n wineshop"
echo ""
echo "Ou utilisez port-forward pour tester localement :"
echo "kubectl port-forward -n wineshop service/frontend-service 8080:80"
echo "Puis ouvrez http://localhost:8080"

echo ""
echo -e "${GREEN}🎉 WineShop est déployé sur Kubernetes !${NC}"
