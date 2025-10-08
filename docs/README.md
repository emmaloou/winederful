# 🍷 WineShop - E-commerce de vins

POC d'une plateforme e-commerce de vins d'exception avec architecture microservices.

## 🚀 Démarrage Rapide (Docker)

### Prérequis
- Docker Desktop installé
- Git

### Installation en 3 commandes

```bash
# 1. Cloner le projet
git clone https://github.com/emmaloou/winederful.git
cd winederful

# 2. Créer le fichier .env
cp .env.example .env

# 3. Lancer tout le stack
docker-compose up -d
```

**C'est tout !** 🎉 Attendre 30 secondes que tout démarre.

### Accès aux services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Interface utilisateur Next.js |
| **Backend API** | [http://localhost:4000](http://localhost:4000) | API Express + Prisma |
| **Traefik** | [http://traefik.localhost](http://traefik.localhost) | Reverse proxy dashboard |
| **MinIO Console** | [http://minio.localhost](http://minio.localhost) | Stockage S3 |

### Via Traefik (recommandé)
- Frontend: [http://app.localhost](http://app.localhost)
- API: [http://api.localhost/api/produits](http://api.localhost/api/produits)

---

## 📦 Architecture

### Stack Technique

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Context (Auth)

**Backend**
- Express.js
- Prisma ORM
- PostgreSQL 16
- Redis (cache)
- JWT authentication

**Infrastructure**
- Docker Compose (6 conteneurs)
- Traefik (reverse proxy)
- MinIO (S3-compatible storage)

### Conteneurs Docker

```
projetfinal-frontend-1    → Next.js 14 (port 3000)
projetfinal-api-1         → Express API (port 4000)
projetfinal-postgres-1    → PostgreSQL 16
projetfinal-redis-1       → Redis 7 (cache)
projetfinal-minio-1       → MinIO (stockage images)
projetfinal-traefik-1     → Reverse proxy
```

---

## 🛠️ Développement

### Structure du projet

```
winederful/
├── backend/                 # API Express
│   ├── src/
│   │   ├── controleurs/    # Logique métier
│   │   ├── chemins/        # Routes
│   │   ├── middlewares/    # Auth, validation, erreurs
│   │   ├── config/         # DB, Redis
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Schéma DB
│   └── Dockerfile
│
├── frontend/               # Next.js App
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── composants/    # Components React
│   │   └── contexts/      # Auth Context
│   └── Dockerfile
│
├── docker-compose.yml     # Orchestration
└── .env                   # Variables d'environnement
```

### Commandes utiles

```bash
# Voir les logs
docker-compose logs -f frontend
docker-compose logs -f api

# Redémarrer un service
docker-compose restart frontend

# Reconstruire après changement code
docker-compose build frontend
docker-compose up -d frontend

# Stopper tout
docker-compose down

# Stopper + supprimer volumes (⚠️ perte données)
docker-compose down -v
```

### Accéder à la base de données

```bash
# Shell PostgreSQL
docker exec -it projetfinal-postgres-1 psql -U postgres -d appdb

# Voir les produits
SELECT * FROM "Product";

# Voir les utilisateurs
SELECT * FROM "User";
```

### Importer le catalogue de vins (CSV)

```bash
# 1. Copier le CSV dans le conteneur
docker cp merge_catalog_wine.csv projetfinal-api-1:/app/

# 2. Exécuter le script d'import
docker exec projetfinal-api-1 npx tsx /app/scripts/importerVins.ts /app/merge_catalog_wine.csv
```

---

## 🧪 Tester l'API

### Inscription
```bash
curl -X POST http://localhost:4000/api/auth/inscription \
  -H "Content-Type: application/json" \
  -d '{"email":"test@wine.fr","password":"motdepasse123","name":"Test User"}'
```

### Connexion
```bash
curl -X POST http://localhost:4000/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{"email":"test@wine.fr","password":"motdepasse123"}'
```

### Récupérer les produits
```bash
curl http://localhost:4000/api/produits
```

### Route protégée (profil)
```bash
TOKEN="votre_token_jwt_ici"
curl http://localhost:4000/api/auth/profil \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔐 Sécurité

**En production, CHANGER OBLIGATOIREMENT:**
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `MINIO_ROOT_PASSWORD`

---

## 📚 Fonctionnalités

### ✅ TERMINÉ - Frontend/UI (Rayane)

**Interface utilisateur complète :**
- [x] Page d'accueil avec hero section et aperçu produits
- [x] Page `/catalogue` avec affichage grille produits
- [x] Filtres par couleur fonctionnels (Rouge, Blanc, Rosé, Effervescent)
- [x] Compteurs dynamiques par catégorie
- [x] Modal authentification (connexion/inscription)
- [x] Toggle visibilité mot de passe (icône œil)
- [x] Header dynamique avec avatar utilisateur connecté
- [x] Menu dropdown profil/déconnexion
- [x] Design responsive Tailwind CSS
- [x] Navigation fluide entre pages

**Authentification JWT :**
- [x] Context React global (AuthProvider)
- [x] Inscription utilisateur
- [x] Connexion avec JWT
- [x] Persistance token (localStorage)
- [x] Route protégée profil
- [x] Déconnexion
- [x] Validation formulaires (min 8 caractères password)

**API Backend :**
- [x] Routes `/api/auth` (inscription, connexion, profil)
- [x] Routes `/api/produits` (liste, filtres)
- [x] Middleware authentification JWT
- [x] Gestion erreurs centralisée
- [x] Validation Zod
- [x] Cache Redis (TTL 5 min sur produits)
- [x] CORS configuré pour frontend

**Infrastructure Docker :**
- [x] Docker Compose 6 conteneurs opérationnels
- [x] PostgreSQL 16 + Prisma ORM
- [x] Redis 7 (cache)
- [x] MinIO (S3-compatible storage)
- [x] Traefik (reverse proxy)
- [x] Healthchecks sur tous les services
- [x] Variables d'environnement `.env.example`

---

### 🚧 À FAIRE - Pour les collègues

#### **Collègue Database (URGENT - Priorité 1)**
- [ ] **Importer le CSV de 500+ vins** dans PostgreSQL
  - Créer script `scripts/importerVins.ts` avec Prisma
  - Parser colonnes : name, priceEur, color, year, region, etc.
  - Nettoyer les données (prix en string → number, couleurs normalisées)
  - Bulk insert via `prisma.product.createMany()`
  - Vérifier que les filtres frontend fonctionnent avec vraies données

#### **Collègue DevOps (Important - Priorité 2)**
- [ ] **Kafka** - Event streaming pour commandes et notifications
  - Ajouter `kafka` et `zookeeper` dans `docker-compose.yml`
  - Topics : `order.created`, `order.paid`, `user.registered`
  - Producteurs dans l'API backend
  - Consommateurs pour notifications/analytics

- [ ] **Stripe** - Paiements sécurisés
  - Route `/api/paiement/create-payment-intent`
  - Webhooks Stripe pour événements paiement
  - Intégration frontend avec Stripe Elements
  - Gestion 3D Secure

- [ ] **Prometheus + Grafana** - Monitoring
  - Métriques API (latence, erreurs, throughput)
  - Dashboards Grafana pour supervision
  - Alertes sur erreurs critiques
  - Monitoring Redis, PostgreSQL, Kafka

#### **Collègue Upload Images (Nice-to-have - Priorité 3)**
- [ ] **MinIO S3** - Upload images produits
  - Route `/api/upload` avec multer
  - SDK AWS S3 vers MinIO
  - Bucket `product-images` avec politiques publiques
  - Affichage images dans `CarteProduit.tsx`

- [ ] **Tesseract OCR** (Optionnel)
  - Scan automatique étiquettes bouteilles
  - Extraction nom/année/région depuis photo
  - Microservice dédié `ocr-service`

- [ ] **Onfido KYC** (Optionnel)
  - Vérification âge pour vente alcool
  - Upload pièce d'identité
  - Validation automatique avant achat

---

## 👥 Répartition Équipe

| Personne | Responsabilité | Statut | Fichiers clés |
|----------|----------------|--------|---------------|
| **Rayane (Frontend)** | Interface + Auth + Docker setup | ✅ **TERMINÉ** | `frontend/`, `docker-compose.yml`, `README.md` |
| **Collègue DB** | Import CSV 500+ vins | ⏳ **À FAIRE** | `backend/scripts/importerVins.ts`, `prisma/schema.prisma` |
| **Collègue DevOps** | Kafka + Stripe + Monitoring | ⏳ **À FAIRE** | `docker-compose.yml`, `backend/src/chemins/paiement.ts` |
| **Collègue Upload** | Images MinIO + OCR | ⏳ **À FAIRE** | `backend/src/chemins/upload.ts` |

---

## 📝 License

MIT
