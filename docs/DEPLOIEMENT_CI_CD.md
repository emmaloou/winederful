# 🚀 Guide Déploiement CI/CD - Winederful

Ce guide explique comment fonctionne le déploiement automatisé via GitHub Actions et les containers Docker.

---

## 📋 Architecture CI/CD

```
┌─────────────────────────────────────────────────────────────┐
│                   Push vers GitHub                           │
│              (branches: front-end, back-end, main)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflows                        │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │  frontend-ci-cd.yml  │  │   backend-ci-cd.yml      │    │
│  └──────────────────────┘  └──────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌──────────────────┐           ┌──────────────────┐
│  Tests & Build   │           │  Tests & Build   │
│   - TypeScript   │           │   - TypeScript   │
│   - Unit Tests   │           │   - Unit Tests   │
│   - npm build    │           │   - npm build    │
└────────┬─────────┘           └────────┬─────────┘
         │                               │
         ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│  Docker Build    │           │  Docker Build    │
│  & Push to GHCR  │           │  & Push to GHCR  │
└────────┬─────────┘           └────────┬─────────┘
         │                               │
         └────────────┬──────────────────┘
                      ▼
     ┌──────────────────────────────────┐
     │  GitHub Container Registry       │
     │  ghcr.io/emmaloou/winederful/   │
     │    - frontend:latest             │
     │    - backend:latest              │
     └────────────┬─────────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
   ┌─────────┐      ┌──────────────┐
   │ Docker  │      │  Kubernetes  │
   │ Compose │      │     GKE      │
   └─────────┘      └──────────────┘
```

---

## ⚙️ Workflows GitHub Actions

### 1. Frontend CI/CD (`.github/workflows/frontend-ci-cd.yml`)

**Déclenché par** :
- Push sur branche `front-end` ou `main`
- Modifications dans `frontend/**`
- Pull requests vers ces branches

**Jobs** :
1. **Test** (Ubuntu Latest)
   - Checkout du code
   - Installation Node.js 20
   - Installation des dépendances (`npm ci`)
   - Vérification TypeScript (`tsc --noEmit`)
   - Exécution des tests unitaires
   - Build de l'application Next.js

2. **Build & Push** (si tests OK et push uniquement)
   - Setup Docker Buildx
   - Login vers GitHub Container Registry
   - Build de l'image Docker
   - Push vers `ghcr.io/emmaloou/winederful/frontend`
   - Tags automatiques :
     - `latest` (branche par défaut)
     - `front-end` (branche front-end)
     - `front-end-sha-abc123` (commit SHA)

3. **Notification**
   - Résumé du déploiement dans GitHub Actions Summary
   - Instructions pour déployer l'image

### 2. Backend CI/CD (`.github/workflows/backend-ci-cd.yml`)

**Déclenché par** :
- Push sur branche `back-end` ou `main`
- Modifications dans `backend/**`
- Pull requests vers ces branches

**Jobs** :
1. **Test** (Ubuntu Latest + Services)
   - **Services Docker** :
     - PostgreSQL 16 (base de test)
     - Redis 7 (cache de test)
   - Checkout du code
   - Installation Node.js 20
   - Installation des dépendances
   - Vérification TypeScript
   - Tests unitaires avec DB et Redis
   - Build de l'application Express

2. **Build & Push** (si tests OK et push uniquement)
   - Setup Docker Buildx
   - Login vers GHCR
   - Build de l'image Docker
   - Push vers `ghcr.io/emmaloou/winederful/backend`
   - Tags automatiques

3. **Notification**
   - Résumé du déploiement

---

## 🐳 Images Docker

### Registry : GitHub Container Registry (GHCR)

Les images sont publiques et accessibles ici :
- **Frontend** : `ghcr.io/emmaloou/winederful/frontend:latest`
- **Backend** : `ghcr.io/emmaloou/winederful/backend:latest`

### Pull des images

```bash
# Frontend
docker pull ghcr.io/emmaloou/winederful/frontend:latest

# Backend
docker pull ghcr.io/emmaloou/winederful/backend:latest

# Avec tag spécifique
docker pull ghcr.io/emmaloou/winederful/frontend:front-end-sha-abc123
```

---

## 🚀 Déploiement avec Docker Compose

### Option 1 : Build local (développement)

```bash
# Utiliser le docker-compose.yml standard
docker-compose up -d

# Rebuild si changements
docker-compose up -d --build
```

### Option 2 : Images pré-buildées (production)

```bash
# Utiliser docker-compose.prod.yml (images GHCR)
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les services
docker-compose -f docker-compose.prod.yml ps
```

**Avantages** :
- ✅ Pas de build local (gain de temps)
- ✅ Images testées via CI/CD
- ✅ Reproductibilité garantie
- ✅ Idéal pour production

### Option 3 : Mise à jour continue

```bash
# Script de déploiement automatique
#!/bin/bash
cd /path/to/projetfinal

# Pull dernières images
docker-compose -f docker-compose.prod.yml pull

# Restart services
docker-compose -f docker-compose.prod.yml up -d

# Vérifier healthchecks
docker-compose -f docker-compose.prod.yml ps
```

Ajouter à un cron job pour déploiement automatique :
```bash
# Crontab : tous les jours à 3h du matin
0 3 * * * /path/to/deploy.sh >> /var/log/winederful-deploy.log 2>&1
```

---

## ☸️ Déploiement Kubernetes (GKE)

### 1. Mise à jour des manifests

Les manifests Kubernetes (`k8s/`) utilisent maintenant les images GHCR :

```yaml
# k8s/services/frontend-deployment.yaml
spec:
  containers:
  - name: frontend
    image: ghcr.io/emmaloou/winederful/frontend:latest
```

```yaml
# k8s/services/api-deployment.yaml
spec:
  containers:
  - name: api
    image: ghcr.io/emmaloou/winederful/backend:latest
```

### 2. Déploiement initial sur GKE

```bash
# Se connecter au cluster GKE
gcloud container clusters get-credentials wineshop-cluster --region europe-west1

# Créer le namespace
kubectl apply -f k8s/base/namespace.yaml

# Créer les secrets
kubectl apply -f k8s/secrets/secrets.yaml

# Créer les ConfigMaps
kubectl apply -f k8s/base/configmap.yaml

# Déployer les services (base de données, cache)
kubectl apply -f k8s/storage/
kubectl apply -f k8s/services/postgres-deployment.yaml
kubectl apply -f k8s/services/redis-deployment.yaml
kubectl apply -f k8s/services/minio-deployment.yaml

# Déployer l'API et le frontend
kubectl apply -f k8s/services/api-deployment.yaml
kubectl apply -f k8s/services/frontend-deployment.yaml

# Configurer l'ingress
kubectl apply -f k8s/ingress/ingress.yaml

# Vérifier les déploiements
kubectl get pods -n wineshop
kubectl get services -n wineshop
```

### 3. Mise à jour des images (Rolling Update)

Après un push GitHub et build réussi :

```bash
# Option 1 : Forcer le pull de l'image latest
kubectl rollout restart deployment/frontend -n wineshop
kubectl rollout restart deployment/api -n wineshop

# Option 2 : Spécifier un tag précis
kubectl set image deployment/frontend frontend=ghcr.io/emmaloou/winederful/frontend:front-end-sha-abc123 -n wineshop
kubectl set image deployment/api api=ghcr.io/emmaloou/winederful/backend:back-end-sha-def456 -n wineshop

# Suivre le rollout
kubectl rollout status deployment/frontend -n wineshop
kubectl rollout status deployment/api -n wineshop

# En cas d'erreur : rollback
kubectl rollout undo deployment/frontend -n wineshop
```

### 4. Healthchecks Kubernetes

Les deployments utilisent les nouveaux endpoints de healthcheck :

**Frontend** (`/api/health`) :
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
```

**Backend** (`/health`) :
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 10
  periodSeconds: 5
```

---

## 🔐 Gestion des Secrets

### GitHub Secrets (Actions)

Aucun secret requis pour le CI/CD de base (images publiques).

**Si besoin de secrets** (API keys, etc.) :
1. GitHub → Settings → Secrets and variables → Actions
2. Ajouter les secrets :
   - `NEXT_PUBLIC_API_URL` (pour builds frontend)
   - Autres secrets applicatifs

### Kubernetes Secrets

```bash
# Créer les secrets manuellement
kubectl create secret generic wineshop-secrets \
  --from-literal=nextauth-secret="votre-secret-32-chars" \
  --from-literal=jwt-secret="votre-jwt-secret" \
  --from-literal=minio-root-user="minioadmin" \
  --from-literal=minio-root-password="votre-password" \
  --from-literal=postgres-password="votre-db-password" \
  -n wineshop

# Ou via fichier k8s/secrets/secrets.yaml (base64 encoded)
kubectl apply -f k8s/secrets/secrets.yaml
```

---

## 🔄 Workflow Complet : De Git à Production

### Développement Local

```bash
# 1. Faire des modifications
vim frontend/src/composants/produit/CarteProduit.tsx

# 2. Tester en local
docker-compose up -d frontend
# Vérifier sur http://localhost:3000

# 3. Commit et push
git add .
git commit -m "feat: Update CarteProduit design"
git push origin front-end
```

### CI/CD Automatique (GitHub Actions)

```
[Push détecté] → GitHub Actions démarre
  ↓
[Job: Test]
  - npm ci
  - tsc --noEmit ✓
  - npm test ✓
  - npm run build ✓
  ↓
[Job: Build & Push]
  - Docker build ✓
  - Push vers GHCR ✓
  - Tag: ghcr.io/emmaloou/winederful/frontend:latest
  ↓
[Image disponible dans GHCR]
```

**Durée** : 3-5 minutes par workflow

### Déploiement en Production

**Option A : Docker Compose (serveur unique)**
```bash
# Sur le serveur de production
ssh user@production-server
cd /opt/winederful
docker-compose -f docker-compose.prod.yml pull frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

**Option B : Kubernetes (cluster multi-serveurs)**
```bash
# Depuis votre machine
kubectl rollout restart deployment/frontend -n wineshop
kubectl rollout status deployment/frontend -n wineshop
# Vérifier : kubectl get pods -n wineshop
```

---

## 📊 Monitoring du CI/CD

### GitHub Actions

**Voir les workflows** :
1. GitHub → Onglet "Actions"
2. Sélectionner un workflow
3. Voir les logs en temps réel

**Badges de status** :
Ajouter au README.md :
```markdown
![Frontend CI/CD](https://github.com/emmaloou/winederful/actions/workflows/frontend-ci-cd.yml/badge.svg)
![Backend CI/CD](https://github.com/emmaloou/winederful/actions/workflows/backend-ci-cd.yml/badge.svg)
```

### Docker Compose

```bash
# Vérifier les services
docker-compose ps

# Logs en temps réel
docker-compose logs -f frontend api

# Healthchecks
docker inspect projetfinal-frontend-1 | grep -A5 Health
```

### Kubernetes

```bash
# Status des pods
kubectl get pods -n wineshop -w

# Logs
kubectl logs -f deployment/frontend -n wineshop
kubectl logs -f deployment/api -n wineshop

# Événements
kubectl get events -n wineshop --sort-by='.lastTimestamp'

# Healthchecks
kubectl describe pod <pod-name> -n wineshop
```

---

## 🐛 Troubleshooting

### Erreur : "Build failed" dans GitHub Actions

**Causes courantes** :
1. Tests unitaires échouent
2. Erreur TypeScript
3. Dépendances manquantes

**Solution** :
```bash
# Reproduire en local
cd frontend
npm ci
npm test
npm run build

# Corriger l'erreur et re-push
git add .
git commit -m "fix: Resolve build error"
git push
```

### Erreur : "Image pull failed" dans Kubernetes

**Cause** : Image GHCR non accessible ou tag incorrect

**Solution** :
```bash
# Vérifier que l'image existe
docker pull ghcr.io/emmaloou/winederful/frontend:latest

# Si l'image est privée, créer un secret Kubernetes
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=emmaloou \
  --docker-password=$GITHUB_TOKEN \
  -n wineshop

# Ajouter à deployment.yaml
spec:
  imagePullSecrets:
  - name: ghcr-secret
```

### Erreur : Healthcheck timeout

**Cause** : Application démarre lentement ou endpoint invalide

**Solution** :
```bash
# Augmenter initialDelaySeconds dans deployment.yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 60  # au lieu de 30
  periodSeconds: 10
  timeoutSeconds: 10

# Vérifier l'endpoint manuellement
kubectl port-forward deployment/frontend 3000:3000 -n wineshop
curl http://localhost:3000/api/health
```

---

## 🎯 Checklist Déploiement

### GitHub Actions
- [x] Workflows créés (`.github/workflows/`)
- [x] Tests passent en local
- [x] Push vers GitHub déclenche le workflow
- [x] Images buildées et pushées vers GHCR
- [x] Notifications de succès/erreur

### Docker Compose
- [x] `docker-compose.prod.yml` créé
- [x] Images GHCR configurées
- [x] Healthchecks fonctionnels
- [x] Variables d'environnement définies

### Kubernetes
- [x] Manifests mis à jour (images GHCR)
- [x] Healthchecks configurés (`/api/health`)
- [x] Secrets créés
- [x] Rolling updates testés

---

## 📚 Ressources

- **GitHub Actions** : https://docs.github.com/en/actions
- **GHCR** : https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- **Docker Compose** : https://docs.docker.com/compose/
- **Kubernetes** : https://kubernetes.io/docs/home/
- **GKE** : https://cloud.google.com/kubernetes-engine/docs

---

## 🚀 Prochaines Étapes

1. **Configurer un CD automatique vers Kubernetes** :
   - Utiliser ArgoCD ou Flux
   - Sync automatique avec Git

2. **Ajouter des tests E2E** :
   - Playwright ou Cypress
   - Tests dans le pipeline CI

3. **Monitoring avancé** :
   - Prometheus + Grafana
   - Alertes sur Slack/Discord

4. **Blue/Green Deployment** :
   - 2 environnements (blue/green)
   - Switch sans downtime

---

**Dernière mise à jour** : 10 Octobre 2025

Bon déploiement ! 🎉
