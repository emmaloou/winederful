# 👥 Guide de Travail en Équipe - Winederful

Guide simple pour travailler à plusieurs sur le projet avec Git + Docker.

---

## 🎯 Architecture du Projet

```
┌─────────────────────────────────────────────┐
│           Docker Compose (1 PC)             │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐   │
│  │Frontend │  │ Backend │  │PostgreSQL│   │
│  │ :3000   │→ │  :4000  │→ │  :5432   │   │
│  └─────────┘  └─────────┘  └──────────┘   │
│       ↓            ↓              ↓         │
│  ┌────────────────────────────────────┐   │
│  │        Réseau Docker (appnet)      │   │
│  └────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓
         Accessible depuis :
    - localhost:3000 (sur le PC)
    - 192.168.X.X:3000 (réseau local)
```

---

## 🚀 Démarrage Rapide

### 1️⃣ Cloner le projet (première fois)

```bash
# Chaque personne clone le repo
git clone https://github.com/emmaloou/winederful.git
cd winederful

# Voir les branches disponibles
git branch -a
```

### 2️⃣ Lancer Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier que tout tourne
docker-compose ps

# Voir les logs si problème
docker-compose logs -f frontend
docker-compose logs -f api
```

### 3️⃣ Accéder au site

**Sur le PC qui fait tourner Docker** :
- Frontend : http://localhost:3000
- Backend API : http://localhost:4000
- Traefik : http://traefik.localhost

**Depuis un autre PC du réseau** :
- Trouver l'IP du PC : `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
- Exemple IP : `192.168.1.50`
- Accéder à : http://192.168.1.50:3000

---

## 🌳 Stratégie Git pour l'Équipe

### Branches principales

```
main          → Code stable, démos
  ├─ front-end → Développement frontend (Next.js)
  └─ back-end  → Développement backend (Express)
```

### Qui travaille sur quoi ?

| Personne | Branche | Dossier |
|----------|---------|---------|
| Dev Frontend | `front-end` | `frontend/` |
| Dev Backend | `back-end` | `backend/` |
| DevOps | `main` | `docker-compose.yml`, `k8s/` |

---

## 💻 Workflow Quotidien

### Développeur Frontend (Next.js)

```bash
# 1. Se mettre sur la branche front-end
git checkout front-end

# 2. Récupérer les dernières modifs
git pull origin front-end

# 3. Faire tes modifications
cd frontend/src
# ... coder ...

# 4. Tester en local
docker-compose up -d frontend
# Ouvrir http://localhost:3000

# 5. Commit et push
git add frontend/
git commit -m "feat: Add new feature"
git push origin front-end
```

### Développeur Backend (Express)

```bash
# 1. Se mettre sur la branche back-end
git checkout back-end

# 2. Récupérer les dernières modifs
git pull origin back-end

# 3. Faire tes modifications
cd backend/src
# ... coder ...

# 4. Tester en local
docker-compose up -d api
# Tester l'API : curl http://localhost:4000/api/produits

# 5. Commit et push
git add backend/
git commit -m "feat: Add new endpoint"
git push origin back-end
```

---

## 🔄 Synchronisation de l'Équipe

### Récupérer le travail des autres

```bash
# Dev Frontend veut récupérer le backend à jour
git checkout front-end
git pull origin front-end
git merge origin/back-end  # Récupérer les modifs backend si besoin

# Rebuilder les containers avec les nouveaux changements
docker-compose up -d --build
```

### Merger sur main (pour une démo)

```bash
# Quand front-end et back-end sont prêts
git checkout main
git pull origin main

# Merger les branches
git merge front-end
git merge back-end

# Push sur main
git push origin main
```

---

## 🐳 Commandes Docker Utiles

### Gestion des services

```bash
# Démarrer tout
docker-compose up -d

# Démarrer un service spécifique
docker-compose up -d frontend

# Arrêter tout
docker-compose down

# Rebuilder après changements de code
docker-compose up -d --build frontend

# Voir les logs
docker-compose logs -f
docker-compose logs -f frontend
docker-compose logs -f api

# Vérifier l'état des services
docker-compose ps

# Redémarrer un service
docker-compose restart frontend
```

### Accéder à un container

```bash
# Shell dans le container frontend
docker-compose exec frontend sh

# Shell dans le container backend
docker-compose exec api sh

# Shell dans PostgreSQL
docker-compose exec postgres psql -U wineadmin -d wineshop
```

### Nettoyage

```bash
# Supprimer les containers
docker-compose down

# Supprimer containers + volumes (⚠️ efface la DB)
docker-compose down -v

# Nettoyer Docker complètement
docker system prune -a
```

---

## 🌐 Accès Réseau Local

### Configurer l'accès depuis d'autres PC

1. **Trouver l'IP du PC qui fait tourner Docker** :

```bash
# Windows
ipconfig
# Chercher "IPv4 Address" → ex: 192.168.1.50

# Mac/Linux
ifconfig
# Chercher "inet" → ex: 192.168.1.50
```

2. **Autoriser le port 3000 dans le firewall** :

**Windows** :
```powershell
# Ouvrir PowerShell en admin
New-NetFirewallRule -DisplayName "Winederful Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Mac** :
```bash
# System Preferences → Security & Privacy → Firewall → Firewall Options
# Autoriser Node.js
```

**Linux** :
```bash
sudo ufw allow 3000/tcp
```

3. **Tester depuis un autre PC** :

```
http://192.168.1.50:3000
```

---

## ⚠️ Problèmes Courants

### "Port 3000 already in use"

```bash
# Trouver le processus qui utilise le port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Tuer le processus ou changer le port
docker-compose down
docker-compose up -d
```

### "Cannot connect to Docker daemon"

```bash
# Vérifier que Docker Desktop tourne
docker ps

# Si erreur, relancer Docker Desktop
```

### "Healthcheck timeout" sur frontend

```bash
# Attendre 1-2 minutes que le build Next.js termine
docker-compose logs -f frontend

# Si toujours unhealthy après 2 min
docker-compose restart frontend
```

### Changements de code non pris en compte

```bash
# Rebuilder le container
docker-compose up -d --build frontend

# Ou forcer un rebuild complet
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### "Cannot find module" après git pull

```bash
# Réinstaller les dépendances
docker-compose exec frontend npm install
# ou
docker-compose up -d --build frontend
```

---

## 📦 Variables d'Environnement

### Fichier `.env` (à la racine du projet)

```bash
# Base de données
DATABASE_URL=postgresql://wineadmin:secret@postgres:5432/wineshop
POSTGRES_USER=wineadmin
POSTGRES_PASSWORD=secret
POSTGRES_DB=wineshop

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=votre-secret-jwt-32-caracteres-minimum

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
```

⚠️ **Ne jamais commit le fichier `.env`** (déjà dans `.gitignore`)

Chaque personne doit créer son propre `.env` en local.

---

## 🎓 Workflow pour une Démo

### Préparation (la veille)

```bash
# 1. Merger tout sur main
git checkout main
git pull origin main
git merge front-end
git merge back-end
git push origin main

# 2. Tester que tout fonctionne
docker-compose down
docker-compose up -d --build
# Vérifier : http://localhost:3000

# 3. Vérifier les healthchecks
docker-compose ps
# Tout doit être "healthy"
```

### Jour de la démo

```bash
# 1. Pull la dernière version main
git checkout main
git pull origin main

# 2. Lancer Docker
docker-compose up -d

# 3. Attendre 2 minutes que tout démarre
docker-compose ps

# 4. Vérifier que ça marche
curl http://localhost:3000
curl http://localhost:4000/api/produits

# 5. Trouver l'IP pour accès réseau
ipconfig  # ou ifconfig

# 6. Partager l'URL aux autres
http://192.168.X.X:3000
```

---

## 📊 Résumé : Qui fait quoi ?

| Action | Commande |
|--------|----------|
| Cloner le projet | `git clone https://github.com/emmaloou/winederful.git` |
| Récupérer les modifs | `git pull origin <branche>` |
| Créer une branche | `git checkout -b feature/ma-feature` |
| Commit | `git add . && git commit -m "message"` |
| Push | `git push origin <branche>` |
| Lancer Docker | `docker-compose up -d` |
| Voir les logs | `docker-compose logs -f` |
| Rebuilder | `docker-compose up -d --build` |
| Arrêter Docker | `docker-compose down` |

---

## 🚀 Prochaines Étapes du Projet

### Ce qui est fait ✅
- [x] Architecture Docker Compose complète
- [x] Frontend Next.js avec design moderne
- [x] Backend Express avec API REST
- [x] Base de données PostgreSQL
- [x] Redis pour le cache
- [x] Healthchecks fonctionnels
- [x] Tests unitaires frontend
- [x] TypeScript strict

### Ce qui reste à faire 🔨
- [ ] Importer le catalogue de 500+ vins
- [ ] Système d'authentification complet
- [ ] Page panier et checkout
- [ ] Intégration Stripe (paiements)
- [ ] Tests backend
- [ ] Documentation API (Swagger)
- [ ] Monitoring (Prometheus/Grafana)

---

**Dernière mise à jour** : 10 Octobre 2025

Bon courage pour le projet ! 💪
