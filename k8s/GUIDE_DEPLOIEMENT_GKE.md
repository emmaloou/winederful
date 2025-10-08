# 🚀 Guide de Déploiement sur Google Kubernetes Engine (GKE)

Ce guide vous accompagne étape par étape pour déployer WineShop sur GKE avec les crédits étudiants gratuits.

## 📋 Prérequis

- Compte Google Cloud Platform avec crédits étudiants activés (300$ + 50-100$ étudiants)
- `gcloud` CLI installé ([Installation](https://cloud.google.com/sdk/docs/install))
- `kubectl` installé ([Installation](https://kubernetes.io/docs/tasks/tools/))
- Docker installé pour builder les images

## 💰 Budget estimé

**Coût mensuel estimé : 20-30$ / mois**
- Cluster GKE Autopilot : ~15-20$ / mois
- Stockage (8 Go total) : ~1-2$ / mois
- LoadBalancer : ~5-8$ / mois
- Trafic réseau : ~1$ / mois

**Avec 350-400$ de crédits gratuits = 12+ mois d'utilisation** ✅

---

## 🔧 Étape 1 : Configuration GCP

### 1.1 Créer un projet GCP

```bash
# Se connecter à GCP
gcloud auth login

# Créer un nouveau projet
gcloud projects create wineshop-PROJECT_ID --name="WineShop"

# Définir le projet actif
gcloud config set project wineshop-PROJECT_ID

# Activer les APIs nécessaires
gcloud services enable container.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 1.2 Vérifier vos crédits gratuits

```bash
# Vérifier votre compte de facturation
gcloud billing accounts list

# Lier le projet au compte de facturation
gcloud billing projects link wineshop-PROJECT_ID \
  --billing-account=BILLING_ACCOUNT_ID
```

---

## ☸️ Étape 2 : Créer le cluster GKE

### 2.1 Créer un cluster GKE Autopilot (recommandé pour free tier)

```bash
# Créer un cluster GKE Autopilot dans us-central1 (free tier region)
gcloud container clusters create-auto wineshop-cluster \
  --region=us-central1 \
  --project=wineshop-PROJECT_ID

# Configurer kubectl pour utiliser ce cluster
gcloud container clusters get-credentials wineshop-cluster \
  --region=us-central1 \
  --project=wineshop-PROJECT_ID
```

**Alternative : Cluster Standard (plus de contrôle, mais coûte un peu plus)**

```bash
# Créer un cluster Standard avec 2 nodes e2-medium
gcloud container clusters create wineshop-cluster \
  --zone=us-central1-a \
  --num-nodes=2 \
  --machine-type=e2-medium \
  --disk-size=20 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=3 \
  --project=wineshop-PROJECT_ID
```

### 2.2 Vérifier que le cluster est prêt

```bash
# Vérifier l'état du cluster
kubectl cluster-info

# Lister les nodes
kubectl get nodes
```

---

## 🐳 Étape 3 : Builder et pousser les images Docker

### 3.1 Configurer Docker pour GCR (Google Container Registry)

```bash
# Authentifier Docker avec GCR
gcloud auth configure-docker

# Remplacer PROJECT_ID dans les commandes suivantes
export PROJECT_ID=wineshop-PROJECT_ID
```

### 3.2 Builder et pousser l'image du backend

```bash
cd backend

# Builder l'image
docker build -t gcr.io/$PROJECT_ID/wineshop-api:latest .

# Pousser vers GCR
docker push gcr.io/$PROJECT_ID/wineshop-api:latest
```

### 3.3 Builder et pousser l'image du frontend

```bash
cd ../frontend

# Builder l'image
docker build -t gcr.io/$PROJECT_ID/wineshop-frontend:latest .

# Pousser vers GCR
docker push gcr.io/$PROJECT_ID/wineshop-frontend:latest
```

### 3.4 Mettre à jour les manifests Kubernetes

Éditez les fichiers suivants pour remplacer `PROJECT_ID` :

- `k8s/services/api-deployment.yaml` (ligne 18)
- `k8s/services/frontend-deployment.yaml` (ligne 18)

```yaml
# Remplacer cette ligne :
image: gcr.io/PROJECT_ID/wineshop-api:latest

# Par :
image: gcr.io/wineshop-PROJECT_ID/wineshop-api:latest
```

---

## 🚀 Étape 4 : Déployer sur Kubernetes

### 4.1 Déploiement automatique avec le script

```bash
cd k8s
./deploy.sh
```

### 4.2 Déploiement manuel (étape par étape)

Si vous préférez déployer manuellement :

```bash
# 1. Namespace
kubectl apply -f base/namespace.yaml

# 2. ConfigMaps et Secrets
kubectl apply -f base/configmap.yaml
kubectl apply -f secrets/secrets.yaml

# 3. Stockage
kubectl apply -f storage/postgres-pvc.yaml
kubectl apply -f storage/minio-pvc.yaml

# 4. Services (PostgreSQL, Redis, MinIO)
kubectl apply -f services/postgres-deployment.yaml
kubectl apply -f services/redis-deployment.yaml
kubectl apply -f services/minio-deployment.yaml

# Attendre 30 secondes que les services démarrent
sleep 30

# 5. API Backend
kubectl apply -f services/api-deployment.yaml

# Attendre 20 secondes
sleep 20

# 6. Frontend
kubectl apply -f services/frontend-deployment.yaml

# 7. Ingress (optionnel)
kubectl apply -f ingress/ingress.yaml
```

---

## 🔍 Étape 5 : Vérifier le déploiement

### 5.1 Vérifier les pods

```bash
# Lister tous les pods
kubectl get pods -n wineshop

# Voir les logs d'un pod
kubectl logs -n wineshop POD_NAME

# Voir les détails d'un pod
kubectl describe pod -n wineshop POD_NAME
```

### 5.2 Vérifier les services

```bash
# Lister les services
kubectl get services -n wineshop

# Attendre que le LoadBalancer obtienne une IP externe
kubectl get service frontend-service -n wineshop --watch
```

---

## 🌐 Étape 6 : Accéder à l'application

### Option A : Via le LoadBalancer (IP publique)

```bash
# Récupérer l'IP publique du frontend
kubectl get service frontend-service -n wineshop

# Exemple de sortie :
# NAME               TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)
# frontend-service   LoadBalancer   10.0.0.1       34.123.45.67     80:30000/TCP

# Ouvrir dans le navigateur : http://EXTERNAL-IP
```

### Option B : Via port-forward (test local)

```bash
# Forward le port du frontend vers localhost
kubectl port-forward -n wineshop service/frontend-service 8080:80

# Ouvrir dans le navigateur : http://localhost:8080
```

---

## 📊 Étape 7 : Monitoring et gestion

### 7.1 Surveiller les ressources

```bash
# Voir l'utilisation CPU/RAM des pods
kubectl top pods -n wineshop

# Voir l'utilisation des nodes
kubectl top nodes
```

### 7.2 Scaler les replicas

```bash
# Augmenter le nombre de replicas du frontend
kubectl scale deployment frontend -n wineshop --replicas=3

# Augmenter les replicas de l'API
kubectl scale deployment api -n wineshop --replicas=3
```

### 7.3 Mise à jour des images

```bash
# Après avoir pusher une nouvelle image
kubectl set image deployment/api -n wineshop \
  api=gcr.io/$PROJECT_ID/wineshop-api:v2

kubectl set image deployment/frontend -n wineshop \
  frontend=gcr.io/$PROJECT_ID/wineshop-frontend:v2
```

---

## 💸 Étape 8 : Surveiller les coûts

### 8.1 Dashboard de facturation

1. Aller sur [GCP Console](https://console.cloud.google.com)
2. Ouvrir **Billing → Reports**
3. Filtrer par projet : `wineshop-PROJECT_ID`
4. Configurer des alertes de budget

### 8.2 Créer une alerte de budget

```bash
# Via la console ou gcloud
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="WineShop Budget" \
  --budget-amount=50 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=80 \
  --threshold-rule=percent=100
```

---

## 🧹 Étape 9 : Nettoyer les ressources

### 9.1 Supprimer les ressources Kubernetes

```bash
# Supprimer tous les ressources du namespace
kubectl delete namespace wineshop
```

### 9.2 Supprimer le cluster GKE

```bash
# Supprimer le cluster (ATTENTION : irréversible !)
gcloud container clusters delete wineshop-cluster \
  --region=us-central1 \
  --project=wineshop-PROJECT_ID
```

### 9.3 Supprimer les images Docker

```bash
# Lister les images
gcloud container images list --project=wineshop-PROJECT_ID

# Supprimer une image
gcloud container images delete gcr.io/$PROJECT_ID/wineshop-api:latest
gcloud container images delete gcr.io/$PROJECT_ID/wineshop-frontend:latest
```

---

## 🐛 Dépannage

### Problème : Pods en état "Pending"

```bash
# Vérifier les événements
kubectl describe pod POD_NAME -n wineshop

# Causes fréquentes :
# - Pas assez de ressources (augmenter les nodes)
# - PVC en attente (vérifier le stockage)
```

### Problème : API ne se connecte pas à la base de données

```bash
# Vérifier les logs de l'API
kubectl logs -n wineshop -l app=api

# Vérifier que PostgreSQL est démarré
kubectl get pods -n wineshop -l app=postgres

# Tester la connexion depuis l'API pod
kubectl exec -it -n wineshop POD_NAME -- /bin/sh
# Puis : nc -zv postgres-service 5432
```

### Problème : Frontend retourne 502 Bad Gateway

```bash
# Vérifier que l'API est accessible
kubectl exec -it -n wineshop FRONTEND_POD -- curl http://api-service:4000/health

# Vérifier les logs du frontend
kubectl logs -n wineshop -l app=frontend
```

---

## 📚 Ressources utiles

- [Documentation GKE](https://cloud.google.com/kubernetes-engine/docs)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [GCP Free Tier](https://cloud.google.com/free)
- [GKE Pricing Calculator](https://cloud.google.com/products/calculator)

---

## 🎓 Pour le rendu scolaire

Incluez dans votre rapport :

1. **Screenshots** :
   - Console GKE avec le cluster
   - `kubectl get pods -n wineshop`
   - `kubectl get services -n wineshop`
   - Application accessible via IP publique

2. **Architecture** :
   - Schéma des pods, services, et ingress
   - Diagramme de flux de données

3. **Optimisations** :
   - Limites de ressources configurées
   - Réplication des services critiques
   - Utilisation du cache Redis

4. **Coûts** :
   - Estimation mensuelle
   - Dashboard de facturation

---

**🎉 Félicitations ! Votre application WineShop tourne sur Kubernetes avec GKE !**
