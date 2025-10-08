# 📋 Récapitulatif Projet Winederful - Pour l'Équipe

**Date**: 8 Octobre 2025
**Repo GitHub**: https://github.com/emmaloou/winederful

---

## 🎯 Ce qui est sur GitHub

### Structure des branches

Le projet est organisé en **3 branches** :

#### 1. `main` - Projet complet
📦 **Contenu** :
- Dossier `backend/` (API Express)
- Dossier `frontend/` (Next.js)
- `docker-compose.yml` (orchestration complète)
- Documentation (README.md, directives.md, etc.)

🔗 **Lien** : https://github.com/emmaloou/winederful/tree/main

---

#### 2. `back-end` - Backend uniquement
📦 **Contenu** :
- `backend/` seulement
  - API Express + TypeScript
  - Routes : `/api/auth`, `/api/produits`
  - Prisma ORM (PostgreSQL)
  - Middlewares (auth JWT, validation, erreurs)
  - Scripts d'import vins
- `docker-compose.yml` et fichiers config

🔗 **Lien** : https://github.com/emmaloou/winederful/tree/back-end

---

#### 3. `front-end` - Frontend uniquement
📦 **Contenu** :
- `frontend/` seulement
  - Next.js 14 (App Router)
  - Pages : accueil, catalogue, détails produit
  - Composants : CarteProduit, EnTete, ModalConnexion
  - Context Auth (JWT)
  - Styles Tailwind CSS
- `docker-compose.yml` et fichiers config

🔗 **Lien** : https://github.com/emmaloou/winederful/tree/front-end

---

## 🏗️ Architecture Actuelle

```
┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │
│   Next.js    │     │   Express    │
│   :3000      │     │   :4000      │
└──────┬───────┘     └──────┬───────┘
       │                    │
       └────────┬───────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────┐  ┌──────┐  ┌────▼──┐
│Postgres│  │Redis │  │ MinIO │
│ :5432  │  │:6379 │  │ :9000 │
└────────┘  └──────┘  └───────┘
```

---

## ✅ Ce qui est déjà fait

### Backend
- ✅ API Express + TypeScript
- ✅ Authentification JWT (inscription/connexion)
- ✅ Routes produits avec filtres
- ✅ Cache Redis (TTL 5 min)
- ✅ PostgreSQL + Prisma ORM
- ✅ Validation Zod
- ✅ Gestion erreurs centralisée
- ✅ Middleware CORS

### Frontend
- ✅ Pages : Accueil, Catalogue
- ✅ Authentification avec modal
- ✅ Affichage produits en grille
- ✅ Filtres par couleur (Rouge, Blanc, Rosé, Effervescent)
- ✅ Design responsive Tailwind
- ✅ Navigation dynamique
- ✅ Context Auth (JWT persisté)

### Infrastructure Docker
- ✅ 6 conteneurs configurés
- ✅ PostgreSQL 16
- ✅ Redis 7
- ✅ MinIO (S3-compatible)
- ✅ Traefik (reverse proxy)
- ✅ Healthchecks sur tous les services

---

## 🚧 Suite des Guidelines - À Faire

### Backend

#### 1. Redis Cache - Finalisation
**Responsable** : Backend Dev

**Tâches** :
- [ ] Tester le cache Redis sur toutes les routes produits
- [ ] Ajouter stratégie de cache pour les filtres
- [ ] Implémenter invalidation cache (lors de création/modification produit)
- [ ] Ajouter métriques Redis (hits/misses)

**Fichiers** :
- `backend/src/config/cache.ts`
- `backend/src/controleurs/produits.ts`

---

#### 2. Stripe API - Paiements
**Responsable** : Backend Dev

**Tâches** :
- [ ] Créer compte Stripe (mode test)
- [ ] Installer `npm install stripe` dans backend
- [ ] Créer route `/api/paiement/create-intent`
- [ ] Créer route `/api/paiement/webhook` (confirmer paiement)
- [ ] Ajouter modèle Prisma `Order` et `Payment`
- [ ] Gérer statuts commande (pending → paid → shipped)

**Variables d'environnement** :
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Fichiers à créer** :
- `backend/src/chemins/paiement.ts`
- `backend/src/controleurs/paiement.ts`

**Documentation** : https://stripe.com/docs/payments/accept-a-payment

---

#### 3. PostgreSQL - Import Catalogue Vins
**Responsable** : Database Dev

**Tâches** :
- [ ] Script d'import CSV 500+ vins
- [ ] Parser colonnes : name, priceEur, color, year, region, producer, etc.
- [ ] Nettoyer données (prix string → number, couleurs normalisées)
- [ ] Bulk insert via `prisma.product.createMany()`
- [ ] Vérifier filtres frontend avec vraies données

**Fichier** :
- `backend/scripts/importerVins.ts` (déjà existant, à compléter)

**Commande** :
```bash
docker exec projetfinal-api-1 npx tsx /app/scripts/importerVins.ts /app/merge_catalog_wine.csv
```

---

#### 4. MinIO - Stockage Images
**Responsable** : Backend Dev

**Tâches** :
- [ ] Créer bucket `product-images` automatiquement
- [ ] Route `/api/upload` avec multer
- [ ] SDK AWS S3 vers MinIO
- [ ] Politique bucket public (lecture seule)
- [ ] Lier images aux produits (table `ProductImage`)

**Fichiers** :
- `backend/src/chemins/upload.ts`
- `backend/src/controleurs/upload.ts`
- Script init MinIO : `scripts/init-minio.sh`

---

### Monitoring & DevOps

#### 5. Prometheus + Grafana
**Responsable** : DevOps

**Tâches** :
- [ ] Ajouter Prometheus au `docker-compose.yml`
- [ ] Exposer métriques backend (route `/metrics`)
- [ ] Installer `prom-client` dans Express
- [ ] Configurer Grafana
- [ ] Créer dashboards :
  - Latence API (p50, p95, p99)
  - Erreurs HTTP (4xx, 5xx)
  - Throughput (req/s)
  - Cache Redis (hit rate)
  - PostgreSQL (connexions, queries)

**Services à ajouter** :
```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

**Documentation** : https://prometheus.io/docs/guides/node-exporter/

---

### Frontend (UI)

#### 6. Pages à ajouter
**Responsable** : Rayane (Frontend)

**Tâches** :
- [ ] **Page détail produit** (`/produits/[id]`)
  - Afficher toutes les infos produit
  - Galerie images
  - Bouton "Ajouter au panier"
  - Recommandations (produits similaires)

- [ ] **Page panier** (`/panier`)
  - Liste articles
  - Quantité ajustable
  - Calcul total + TVA
  - Bouton "Procéder au paiement"

- [ ] **Page checkout** (`/checkout`)
  - Formulaire adresse livraison
  - Récapitulatif commande
  - Intégration Stripe Elements
  - Confirmation paiement

- [ ] **Page profil** (`/profil`)
  - Infos utilisateur
  - Historique commandes
  - Adresses enregistrées

**Fichiers à créer** :
- `frontend/src/app/produits/[id]/page.tsx`
- `frontend/src/app/panier/page.tsx`
- `frontend/src/app/checkout/page.tsx`
- `frontend/src/app/profil/page.tsx`
- `frontend/src/composants/produit/DetailProduit.tsx`
- `frontend/src/composants/panier/ItemPanier.tsx`
- `frontend/src/contexts/PanierContext.tsx`

---

#### 7. Déploiement Netlify
**Responsable** : Rayane (Frontend)

**Tâches** :
- [ ] Créer compte Netlify
- [ ] Connecter repo GitHub (branche `front-end`)
- [ ] Configurer build :
  ```bash
  Build command: npm run build
  Publish directory: .next
  ```
- [ ] Ajouter variables d'environnement :
  ```
  NEXT_PUBLIC_API_URL=https://api.winederful.com
  NEXTAUTH_SECRET=xxxxx
  NEXTAUTH_URL=https://winederful.netlify.app
  ```
- [ ] Tester déploiement
- [ ] Configurer domaine personnalisé (optionnel)

**⚠️ Important** : Next.js sur Netlify nécessite `@netlify/plugin-nextjs`

**Documentation** : https://docs.netlify.com/frameworks/next-js/overview/

---

#### 8. Environnement Docker pour le Frontend
**Responsable** : Rayane

**Tâches** :
- [ ] Vérifier que `frontend/Dockerfile` est optimisé
- [ ] Tester build local :
  ```bash
  docker build -t winederful-frontend ./frontend
  docker run -p 3000:3000 winederful-frontend
  ```
- [ ] Documenter dans README

**Fichier** :
- `frontend/Dockerfile` (déjà existant)

---

#### 9. Connecter Frontend → Backend Production
**Responsable** : Frontend + DevOps

**Tâches** :
- [ ] Héberger backend (options) :
  - **Option A** : Railway (recommandé)
  - **Option B** : Render
  - **Option C** : AWS EC2 + Docker
- [ ] Configurer CORS pour domaine Netlify
- [ ] Mettre à jour `NEXT_PUBLIC_API_URL` dans Netlify
- [ ] Tester connexion frontend → backend en prod

**Fichier à modifier** :
- `backend/src/index.ts` (CORS origins)

---

#### 10. Connecter à la Base de Données Production
**Responsable** : Frontend + Database Dev

**Tâches** :
- [ ] Héberger PostgreSQL (options) :
  - **Option A** : Supabase (gratuit, PostgreSQL managé)
  - **Option B** : Railway
  - **Option C** : ElephantSQL
- [ ] Récupérer `DATABASE_URL` de production
- [ ] Migrer schéma Prisma vers DB prod :
  ```bash
  DATABASE_URL="postgresql://..." npx prisma migrate deploy
  ```
- [ ] Importer données CSV dans DB prod
- [ ] Mettre à jour variable d'environnement backend
- [ ] Tester connexion frontend → backend → DB

**Variables à configurer** :
```bash
DATABASE_URL=postgresql://user:password@host:5432/winederful
```

---

### Optionnel

#### 11. Kafka - Event Streaming
**Responsable** : DevOps

**Tâches** :
- [ ] Ajouter Kafka + Zookeeper au `docker-compose.yml`
- [ ] Créer topics : `order.created`, `payment.confirmed`, `user.registered`
- [ ] Producer dans backend (envoyer événements)
- [ ] Consumer pour notifications email
- [ ] Consumer pour analytics

**Services** :
```yaml
zookeeper:
  image: confluentinc/cp-zookeeper:7.5.0
  environment:
    ZOOKEEPER_CLIENT_PORT: 2181

kafka:
  image: confluentinc/cp-kafka:7.5.0
  depends_on:
    - zookeeper
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
```

---

## 🔐 Variables d'Environnement à Configurer

### Backend (Production)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/winederful

# Redis
REDIS_URL=redis://host:6379

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# JWT
JWT_SECRET=super-secret-32-chars-min

# MinIO
MINIO_ENDPOINT=https://s3.winederful.com
MINIO_ACCESS_KEY=xxxxx
MINIO_SECRET_KEY=xxxxx
MINIO_BUCKET=product-images
```

### Frontend (Netlify)
```bash
# API Backend
NEXT_PUBLIC_API_URL=https://api.winederful.com

# Auth
NEXTAUTH_SECRET=xxxxx
NEXTAUTH_URL=https://winederful.netlify.app

# Stripe (public key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

---

## 📞 Ressources Utiles

### Documentation APIs
- **Stripe** : https://stripe.com/docs/api
- **Redis** : https://redis.io/docs/
- **Prisma** : https://www.prisma.io/docs
- **MinIO** : https://min.io/docs/minio/linux/developers/javascript/API.html
- **Kafka** : https://kafka.apache.org/documentation/

### Hébergement
- **Netlify** : https://docs.netlify.com/
- **Railway** : https://docs.railway.app/
- **Render** : https://render.com/docs
- **Supabase** : https://supabase.com/docs

### Monitoring
- **Prometheus** : https://prometheus.io/docs/
- **Grafana** : https://grafana.com/docs/

---

## 🚀 Quick Start (Rappel)

### Cloner et démarrer le projet
```bash
# 1. Cloner
git clone https://github.com/emmaloou/winederful.git
cd winederful

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Démarrer
docker-compose up -d

# 4. Vérifier
docker-compose ps
```

### Accès aux services (local)
- Frontend : http://localhost:3000
- Backend API : http://localhost:4000
- Traefik : http://traefik.localhost
- MinIO : http://minio.localhost

---

## 📋 Checklist Avant Démo Finale

### Backend
- [ ] Toutes les routes testées (Postman/Insomnia)
- [ ] Cache Redis fonctionnel
- [ ] Import CSV 500+ vins réussi
- [ ] Paiements Stripe testés (mode test)
- [ ] Upload images MinIO opérationnel
- [ ] Logs structurés
- [ ] Gestion erreurs robuste
- [ ] CORS configuré pour domaine frontend

### Frontend
- [ ] Toutes les pages développées
- [ ] Formulaires validés
- [ ] Auth JWT fonctionnelle
- [ ] Panier opérationnel
- [ ] Checkout Stripe intégré
- [ ] Design responsive (mobile + desktop)
- [ ] SEO basique (meta tags)

### Infrastructure
- [ ] Docker Compose testé
- [ ] Healthchecks OK sur tous les services
- [ ] Variables d'environnement documentées
- [ ] Frontend déployé sur Netlify
- [ ] Backend déployé (Railway/Render)
- [ ] Database en production
- [ ] Monitoring Grafana opérationnel (optionnel)

### Documentation
- [ ] README.md à jour
- [ ] API documentée
- [ ] Guide déploiement
- [ ] Architecture diagram

---

**Dernière mise à jour** : 8 Octobre 2025
**Mainteneur** : Rayane + Équipe
