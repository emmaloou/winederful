# 🐳 Guide Setup Docker - Winederful

Ce guide vous permet de configurer l'environnement Docker du projet sur votre machine.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Docker Desktop** : [Télécharger ici](https://www.docker.com/products/docker-desktop)
- **Git** : [Télécharger ici](https://git-scm.com/downloads)

Vérifiez que Docker fonctionne :
```bash
docker --version
docker-compose --version
```

---

## 🚀 Installation - Étape par Étape

### 1. Cloner le projet

```bash
# Cloner le repository
git clone https://github.com/emmaloou/winederful.git

# Entrer dans le dossier
cd winederful
```

### 2. Configurer les variables d'environnement

```bash
# Copier le fichier template
cp .env.example .env
```

**Éditer le fichier `.env`** (optionnel pour dev local) :

Les valeurs par défaut fonctionnent pour le développement local. Vous pouvez les modifier si nécessaire :

```bash
# Ouvrir avec votre éditeur
nano .env
# ou
code .env
```

**Variables importantes** :
```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-me-strong
POSTGRES_DB=appdb

# JWT Secret (pour l'authentification)
JWT_SECRET=your-super-secret-jwt-key-change-me-32-chars-min

# MinIO (stockage fichiers)
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=change-me-strong
```

⚠️ **Important** : Ne jamais commit le fichier `.env` sur Git (il est dans `.gitignore`)

---

### 3. Démarrer l'environnement Docker

```bash
# Démarrer tous les services en arrière-plan
docker-compose up -d
```

Cette commande va :
- Télécharger les images Docker nécessaires
- Créer les conteneurs pour : Frontend, Backend, PostgreSQL, Redis, MinIO, Traefik
- Démarrer tous les services

**Temps estimé** : 2-5 minutes (selon votre connexion internet)

---

### 4. Vérifier que tout fonctionne

```bash
# Voir le statut de tous les services
docker-compose ps
```

Vous devriez voir quelque chose comme :
```
NAME                       STATUS              PORTS
projetfinal-frontend-1     Up (healthy)        0.0.0.0:3000->3000/tcp
projetfinal-api-1          Up (healthy)        0.0.0.0:4000->4000/tcp
projetfinal-postgres-1     Up (healthy)        5432/tcp
projetfinal-redis-1        Up (healthy)        6379/tcp
projetfinal-minio-1        Up (healthy)        0.0.0.0:9000-9001->9000-9001/tcp
projetfinal-traefik-1      Up                  0.0.0.0:80->80/tcp
```

Tous les services doivent être **"Up"** et **"healthy"**.

---

### 5. Accéder aux services

Une fois démarré, vous pouvez accéder à :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interface utilisateur Next.js |
| **Backend API** | http://localhost:4000 | API Express |
| **Traefik Dashboard** | http://traefik.localhost | Dashboard reverse proxy |
| **MinIO Console** | http://minio.localhost | Interface MinIO (admin / change-me-strong) |

---

## 🔧 Commandes Utiles

### Voir les logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f frontend
docker-compose logs -f api
docker-compose logs -f postgres
```

### Arrêter les services

```bash
# Arrêter tous les conteneurs
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down
```

### Redémarrer un service

```bash
# Redémarrer le frontend
docker-compose restart frontend

# Redémarrer le backend
docker-compose restart api
```

### Reconstruire après modification du code

```bash
# Reconstruire le frontend
docker-compose build frontend
docker-compose up -d frontend

# Reconstruire le backend
docker-compose build api
docker-compose up -d api

# Tout reconstruire
docker-compose down
docker-compose build
docker-compose up -d
```

### Accéder à un conteneur (terminal)

```bash
# Accéder au backend
docker-compose exec api sh

# Accéder au frontend
docker-compose exec frontend sh

# Accéder à PostgreSQL
docker-compose exec postgres psql -U postgres -d appdb
```

---

## 🗄️ Gestion de la Base de Données

### Accéder à PostgreSQL

```bash
# Ouvrir le shell PostgreSQL
docker-compose exec postgres psql -U postgres -d appdb
```

### Commandes SQL utiles

```sql
-- Lister les tables
\dt

-- Voir les produits
SELECT * FROM "Product";

-- Voir les utilisateurs
SELECT * FROM "User";

-- Quitter
\q
```

### Importer le catalogue de vins (CSV)

```bash
# 1. Copier le CSV dans le conteneur backend
docker cp merge_catalog_wine.csv projetfinal-api-1:/app/

# 2. Exécuter le script d'import
docker exec projetfinal-api-1 npx tsx /app/scripts/importerVins.ts /app/merge_catalog_wine.csv
```

---

## 🔴 Cache Redis

### Accéder à Redis

```bash
# Ouvrir Redis CLI
docker-compose exec redis redis-cli
```

### Commandes Redis utiles

```bash
# Voir les clés en cache
KEYS *

# Voir le cache produits
GET products:all

# Supprimer tout le cache
FLUSHALL

# Quitter
exit
```

---

## 📦 MinIO (Stockage Fichiers)

### Accéder à MinIO Console

1. Ouvrir http://minio.localhost
2. Login : `admin` / Password : `change-me-strong`

### Créer un bucket (si nécessaire)

Dans la console MinIO :
1. Cliquer sur "Buckets"
2. Créer un bucket nommé `product-images`
3. Configurer la politique en "public" (lecture seule)

---

## 🐛 Troubleshooting

### Les conteneurs ne démarrent pas

```bash
# Voir les logs d'erreur
docker-compose logs

# Vérifier Docker Desktop est bien lancé
docker info
```

### Port déjà utilisé (ex: 3000, 4000)

Si un port est déjà utilisé par une autre application :

**Option 1** : Arrêter l'application qui utilise le port

**Option 2** : Modifier le port dans `docker-compose.yml` :
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Change 3000 → 3001
```

### Erreur "healthcheck failed"

```bash
# Redémarrer le service
docker-compose restart <service-name>

# Si ça persiste, reconstruire
docker-compose down
docker-compose up -d --force-recreate
```

### Base de données vide après redémarrage

Les données sont persistées dans des volumes Docker. Si vous avez fait `docker-compose down -v`, vous avez supprimé les volumes.

**Éviter** : Ne pas utiliser le flag `-v` sauf si vous voulez tout réinitialiser.

```bash
# Arrêter SANS supprimer les volumes
docker-compose down

# Réinitialiser TOUT (⚠️ perte de données)
docker-compose down -v
```

---

## 🔄 Workflow de Développement

### Développer sur le Frontend

```bash
# 1. Modifier le code dans frontend/src/

# 2. Reconstruire le conteneur
docker-compose build frontend
docker-compose up -d frontend

# 3. Voir les logs pour debugger
docker-compose logs -f frontend
```

### Développer sur le Backend

```bash
# 1. Modifier le code dans backend/src/

# 2. Reconstruire le conteneur
docker-compose build api
docker-compose up -d api

# 3. Voir les logs
docker-compose logs -f api
```

### Modifier le schéma de base de données (Prisma)

```bash
# 1. Modifier backend/prisma/schema.prisma

# 2. Générer la migration
docker-compose exec api npx prisma migrate dev --name nom_migration

# 3. Générer le client Prisma
docker-compose exec api npx prisma generate
```

---

## 📊 Vérifier que tout fonctionne

### Test rapide du backend

```bash
# Tester la route produits
curl http://localhost:4000/api/produits

# Tester l'inscription
curl -X POST http://localhost:4000/api/auth/inscription \
  -H "Content-Type: application/json" \
  -d '{"email":"test@winederful.fr","password":"password123","name":"Test User"}'
```

### Test rapide du frontend

Ouvrir http://localhost:3000 dans le navigateur et vérifier que la page d'accueil s'affiche.

---

## 🆘 Besoin d'Aide ?

### Logs détaillés

```bash
# Voir TOUS les logs depuis le début
docker-compose logs --tail=1000
```

### Nettoyer complètement Docker (reset)

⚠️ **Attention** : Supprime TOUT (conteneurs, volumes, images)

```bash
# Arrêter le projet
docker-compose down -v

# Nettoyer Docker
docker system prune -a --volumes

# Redémarrer
docker-compose up -d
```

### Ressources

- **Docker Docs** : https://docs.docker.com/
- **Docker Compose Docs** : https://docs.docker.com/compose/
- **Prisma Docs** : https://www.prisma.io/docs

---

## 📝 Checklist Setup

Avant de commencer à développer, vérifier que :

- [ ] Docker Desktop est installé et lancé
- [ ] `git clone` du repo réussi
- [ ] Fichier `.env` créé depuis `.env.example`
- [ ] `docker-compose up -d` exécuté
- [ ] Tous les services sont "Up (healthy)"
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Backend accessible sur http://localhost:4000
- [ ] Base de données PostgreSQL fonctionne
- [ ] Redis fonctionne
- [ ] MinIO fonctionne

---

**Dernière mise à jour** : 8 Octobre 2025

Bon développement ! 🚀
