# ☸️ Kubernetes Manifests - WineShop

Ce dossier contient tous les manifests Kubernetes pour déployer WineShop sur GKE ou tout autre cluster Kubernetes.

## 📁 Structure

```
k8s/
├── base/                     # Configuration de base
│   ├── namespace.yaml        # Namespace wineshop
│   └── configmap.yaml        # Variables d'environnement
│
├── secrets/                  # Secrets (mots de passe)
│   └── secrets.yaml          # Mots de passe encodés en base64
│
├── storage/                  # Volumes persistants
│   ├── postgres-pvc.yaml     # 5 Go pour PostgreSQL
│   └── minio-pvc.yaml        # 3 Go pour MinIO
│
├── services/                 # Deployments et Services
│   ├── postgres-deployment.yaml   # PostgreSQL + Service
│   ├── redis-deployment.yaml      # Redis + Service
│   ├── minio-deployment.yaml      # MinIO + Service
│   ├── api-deployment.yaml        # API Backend + Service
│   └── frontend-deployment.yaml   # Frontend Next.js + LoadBalancer
│
├── ingress/                  # Routing HTTP
│   └── ingress.yaml          # Ingress Controller
│
├── deploy.sh                 # Script de déploiement automatique
├── GUIDE_DEPLOIEMENT_GKE.md  # Guide complet GKE
└── README.md                 # Ce fichier
```

## 🚀 Déploiement rapide

### Option 1 : Script automatique

```bash
./deploy.sh
```

### Option 2 : Commande unique

```bash
kubectl apply -f base/ -f secrets/ -f storage/ -f services/ -f ingress/
```

## 📊 Architecture déployée

```
┌─────────────────────────────────────────────────┐
│               LoadBalancer (IP publique)        │
└────────────────────┬────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   Frontend (x2)      │
         │   Next.js            │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────┐
         │   API Backend (x2)   │
         │   Express.js         │
         └─┬─────┬────┬─────────┘
           │     │    │
    ┌──────▼─┐ ┌▼───┐ ┌▼──────┐
    │Postgres│ │Redis│ │ MinIO │
    │  (PVC) │ │     │ │ (PVC) │
    └────────┘ └─────┘ └───────┘
```

## 🔧 Configuration

### Avant de déployer :

1. **Remplacer `PROJECT_ID`** dans :
   - `services/api-deployment.yaml`
   - `services/frontend-deployment.yaml`

2. **Mettre à jour le domaine** dans :
   - `ingress/ingress.yaml`
   - `services/frontend-deployment.yaml` (NEXTAUTH_URL)

3. **Modifier les secrets** (production) dans :
   - `secrets/secrets.yaml`

### Générer des secrets sécurisés :

```bash
# Générer un secret aléatoire
openssl rand -base64 32

# Encoder en base64 pour Kubernetes
echo -n "mon-secret" | base64
```

## 💰 Ressources allouées

| Service    | Replicas | CPU Request | CPU Limit | RAM Request | RAM Limit |
|------------|----------|-------------|-----------|-------------|-----------|
| Frontend   | 2        | 250m        | 500m      | 256 Mi      | 512 Mi    |
| API        | 2        | 250m        | 500m      | 256 Mi      | 512 Mi    |
| PostgreSQL | 1        | 250m        | 500m      | 256 Mi      | 512 Mi    |
| Redis      | 1        | 100m        | 200m      | 128 Mi      | 256 Mi    |
| MinIO      | 1        | 200m        | 400m      | 256 Mi      | 512 Mi    |

**Total : ~1.3 vCPU et ~2.5 Go RAM**

Coût estimé sur GKE : **20-30$ / mois**

## 📝 Commandes utiles

### Monitoring

```bash
# État des pods
kubectl get pods -n wineshop

# Logs d'un service
kubectl logs -n wineshop -l app=api --tail=100 -f

# Utilisation des ressources
kubectl top pods -n wineshop
kubectl top nodes

# Détails d'un pod
kubectl describe pod POD_NAME -n wineshop
```

### Scaling

```bash
# Scaler le frontend
kubectl scale deployment frontend -n wineshop --replicas=3

# Autoscaling basé sur CPU
kubectl autoscale deployment api -n wineshop \
  --min=2 --max=5 --cpu-percent=70
```

### Debugging

```bash
# Shell dans un pod
kubectl exec -it -n wineshop POD_NAME -- /bin/sh

# Tester la connexion entre services
kubectl exec -it -n wineshop FRONTEND_POD -- curl http://api-service:4000/health

# Port-forward pour accès local
kubectl port-forward -n wineshop service/frontend-service 8080:80
```

### Mises à jour

```bash
# Mettre à jour une image
kubectl set image deployment/api -n wineshop \
  api=gcr.io/PROJECT_ID/wineshop-api:v2

# Redémarrer un deployment
kubectl rollout restart deployment/api -n wineshop

# Historique des rollouts
kubectl rollout history deployment/api -n wineshop

# Rollback
kubectl rollout undo deployment/api -n wineshop
```

## 🧹 Nettoyage

```bash
# Supprimer tous les ressources
kubectl delete namespace wineshop

# Ou supprimer individuellement
kubectl delete -f base/ -f secrets/ -f storage/ -f services/ -f ingress/
```

## 🔒 Sécurité

### ⚠️ IMPORTANT pour la production :

1. **Changer tous les secrets** dans `secrets/secrets.yaml`
2. **Activer HTTPS** avec Let's Encrypt ou Cloud DNS
3. **Limiter les accès** avec NetworkPolicies
4. **Activer RBAC** pour contrôler les permissions
5. **Scanner les images** pour les vulnérabilités

### Exemple de génération de secrets sécurisés :

```bash
# PostgreSQL password
openssl rand -base64 32 | base64

# MinIO credentials
openssl rand -base64 16 | base64

# NextAuth secret
openssl rand -hex 32 | base64
```

## 📚 Documentation

- [Guide complet de déploiement GKE](./GUIDE_DEPLOIEMENT_GKE.md)
- [Documentation Kubernetes](https://kubernetes.io/docs/)
- [GKE Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices)

## 🐛 Problèmes connus

### Pods en "Pending"
```bash
kubectl describe pod POD_NAME -n wineshop
# Vérifier : ressources insuffisantes, PVC non montés
```

### Connexion DB échoue
```bash
kubectl logs -n wineshop -l app=api
# Vérifier : DATABASE_URL, postgres-service démarré
```

### LoadBalancer sans IP
```bash
kubectl get service frontend-service -n wineshop --watch
# Attendre 2-5 minutes que GCP attribue l'IP
```

---

**🎉 WineShop prêt pour Kubernetes !**
