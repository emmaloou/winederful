# 📊 État du Projet E-Commerce Vin - POC

**Date de création**: 7 Octobre 2025  
**Dernière mise à jour**: 14 Octobre 2025  
**Version**: 0.2.0 (POC en développement)

---

## 🎯 Vue d'Ensemble

### Architecture Actuelle (Mise à jour 14 Oct)
```
┌─────────────────────────────────────────────────────────┐
│                  Traefik (Port 80)                      │
│               Reverse Proxy & Load Balancer            │
└────────┬─────────────────┬──────────────────────────────┘
         │                 │
    ┌────▼────┐      ┌─────▼──────┐
    │Frontend │      │   MinIO    │
    │Next.js  │      │  Console   │
    │ :3000   │      │   :9001    │
    └────┬────┘      └────────────┘
         │
    ┌────▼────┐
    │   API   │
    │ Express │  ✅ NOUVEAU
    │  :4000  │
    └────┬────┘
         │
    ┌────┴──────┬──────────┬──────────┐
    │           │          │          │
┌───▼───┐  ┌───▼────┐ ┌───▼────┐ ┌───▼────┐
│Postgres│ │ Redis  │ │ MinIO  │ │NextAuth│
│  :5432 │ │ :6379  │ │ :9000  │ │Session │
└────────┘ └────────┘ └────────┘ └────────┘
```

---

## ✅ Ce Qui Est Fait (Mise à jour 14 Octobre)

### 📈 Progression Globale : **65%** ↑ (+20% depuis le 7 octobre)

```
Phase 0-2 (Infrastructure)   : ████████████████████ 100% ✅
Phase 3a (Backend Express)   : ████████████████████ 100% ✅ NOUVEAU
Phase 3b (Frontend Panier)   : ████████████████████ 100% ✅ NOUVEAU
Phase 3c (Paiement Stripe)   : ░░░░░░░░░░░░░░░░░░░░   0% ❌
Phase 3d (KYC/OCR)           : ░░░░░░░░░░░░░░░░░░░░   0% ❌
```

---

## ✅ Réalisations depuis le 7 Octobre

### 🆕 1. Backend Express Séparé (100% - NOUVEAU)
**État précédent** : 0% - N'existait pas  
**État actuel** : ✅ Complètement implémenté

- ✅ Dossier `/backend` avec structure TypeScript
- ✅ Service Docker `api` configuré (port 4000)
- ✅ Conteneur **healthy** depuis 4 jours
- ✅ Routes API compilées :
  - `GET /health` (healthcheck)
  - `/api/produits` 
  - `/api/auth`
  - `GET /api/images` (servir images MinIO)
- ✅ Configuration S3/MinIO (`config/s3.ts`)
- ✅ Middlewares : CORS, Helmet, error handling
- ✅ Dépendances : Express, Prisma, Redis, JWT, bcrypt, AWS SDK

⚠️ **À finaliser** : Routes dans dossiers `controleurs/`, `services/`, `middlewares/` (actuellement en `temp_*.js`)

---

### 🆕 2. Gestion Panier Frontend (100% - NOUVEAU)
**État précédent** : 0%  
**État actuel** : ✅ Entièrement fonctionnel

- ✅ Context API `PanierContext.tsx` :
  - `ajouterAuPanier()`, `retirerDuPanier()`, `modifierQuantite()`, `viderPanier()`
  - Calcul automatique total et nombre d'articles
  - Validation stock (quantité max = stockQuantity)
- ✅ **Persistance localStorage** (survit au rechargement)
- ✅ **Page `/panier`** complète :
  - Liste articles avec images
  - Boutons +/- quantité
  - Récapitulatif total
  - Bouton "Procéder au paiement"
  - État vide avec CTA

---

### 🆕 3. Pages Frontend Supplémentaires (NOUVEAU)
**État précédent** : Page d'accueil uniquement  
**État actuel** : ✅ 4 pages fonctionnelles

1. **`/catalogue`** ✅
   - Liste complète produits
   - Filtres par couleur (rouge, blanc, rosé, pétillant)
   - Statistiques temps réel
   - Loading skeletons

2. **`/produits/[id]`** ✅
   - Page détail avec toutes infos produit
   - Bouton "Ajouter au panier"

3. **`/panier`** ✅ (voir ci-dessus)

---

### 🆕 4. Composants UI (NOUVEAU)
- ✅ `EnTete.tsx` : Header avec navigation + badge panier
- ✅ `PiedDePage.tsx` : Footer
- ✅ `CarteProduit.tsx` : Card produit
- ✅ `ListeProduits.tsx` : Grille responsive
- ✅ `SkeletonProduit.tsx` : Loading état
- ✅ `ModalConnexion.tsx` : Modal login (ébauche)

Qualité : TypeScript strict, Tailwind CSS, responsive

---

### 1. Infrastructure Docker (100% - Stable)

### 2. Configuration Environnement (100%)
- ✅ `.env` créé depuis `.env.example`
- ✅ Variables ajoutées :
  ```bash
  DATABASE_URL=postgresql://postgres:change-me-strong@postgres:5432/appdb?schema=public
  REDIS_URL=redis://redis:6379
  INTERNAL_API_URL=http://web:3000
  NEXTAUTH_SECRET=change-me-32chars-min
  MINIO_ENDPOINT=http://minio:9000
  ```

### 3. Base de Données (100%)
- ✅ **Schéma Prisma** conforme aux directives :
  ```prisma
  Product {
    id, reference, name, color, country, region,
    appellation, vintage, grapes, alcoholPercent,
    bottleSizeL, sweetness, tannin, acidity, rating,
    priceEur, producer, stockQuantity, description
  }
  ProductImage { id, productId, objectKey, contentType, size }
  User { id, email, password, name } // Pour NextAuth
  ```
- ✅ **Tables créées** manuellement via psql
- ✅ **Données de test** : 4 produits vin insérés
- ✅ **Connexion testée** : PostgreSQL opérationnel

### 4. Cache Redis (100%)
- ✅ **Service Redis** ajouté à docker-compose
- ✅ **Client Redis** (`lib/redis.ts`) avec :
  - Retry strategy (max 3 tentatives)
  - TTL configurés (5 min produits, 10 min détails)
  - Singleton pattern
- ✅ **Intégration API** : cache-first strategy

### 5. Backend API (80%)
- ✅ **Route `/api/products`** :
  - Cache Redis check
  - Fallback DB Prisma
  - Fallback mock data si erreur
  - Format JSON standardisé
- ✅ **Route `/api/upload`** : upload MinIO (à finaliser)
- ✅ **Route `/api/auth/[...nextauth]`** : authentification
- ⚠️ **Prisma Client** : pas synchronisé avec nouveau schéma

### 6. Frontend (80% ↑)
- ✅ **Page d'accueil** (`/`) : Affichage produits SSR
- ✅ **Page catalogue** (`/catalogue`) : Liste complète + filtres couleur
- ✅ **Page détail** (`/produits/[id]`) : Infos produit + bouton panier
- ✅ **Page panier** (`/panier`) : Gestion complète avec localStorage
- ✅ **Composants UI** : EnTete, PiedDePage, CarteProduit, etc.
- ❌ Page checkout (lien présent mais page manquante)
- ❌ Pages login/register

### 7. Authentification (50%)
- ✅ **NextAuth** configuré backend avec Credentials provider
- ✅ **Prisma Adapter** pour sessions DB
- ✅ **Hashing bcrypt** pour passwords
- ✅ **ModalConnexion** (ébauche créée dans composants)
- ❌ Pages login/register pas finalisées
- ❌ Pas de protection routes

### 8. Stockage Fichiers (40% ↑)
- ✅ **MinIO** service démarré
- ✅ **Client S3** configuré (`backend/config/s3.ts`)
- ✅ **Route API** `GET /api/images?path=xxx` (servir images depuis MinIO)
- ⚠️ **Bucket** `product-images` pas créé automatiquement
- ⚠️ **Service MinIO** : unhealthy (4 jours) - bucket manquant
- ✅ **Script init** créé (`scripts/init-minio.sh`) - à déployer
- ❌ Upload images produits non testé (10 images disponibles dans `/wine_pictures`)

---

## ❌ Ce Qui Manque (Par Rapport aux Directives)

### 🔴 Critiques (Bloquent le POC complet)

#### 1. Paiement Stripe (0%)
**Pourquoi** : Fonctionnalité e-commerce essentielle

**Ce qui manque** :
- [ ] Compte Stripe (clé API test)
- [ ] Installation `npm install stripe`
- [ ] Route `/api/checkout` (créer Payment Intent)
- [ ] Route `/api/webhooks/stripe` (confirmer paiement)
- [ ] Frontend : bouton "Payer" + formulaire Stripe Elements
- [ ] Gestion statut commande (pending → paid → shipped)

**Comment faire** :
```bash
# 1. Créer compte Stripe test
https://dashboard.stripe.com/register

# 2. Récupérer clés API (test mode)
# Ajouter au .env :
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# 3. Installer dépendance
cd web && npm install stripe @stripe/stripe-js

# 4. Créer route API
# web/src/app/api/checkout/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { items } = await req.json();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateTotal(items),
    currency: 'eur',
  });
  return Response.json({ clientSecret: paymentIntent.client_secret });
}

# 5. Frontend : intégrer Stripe Elements
# Voir doc: https://stripe.com/docs/payments/accept-a-payment
```

**Durée estimée** : 2-3h

---

#### 2. KYC Onfido (0%)
**Pourquoi** : Vérification âge 18+ (légal pour vente alcool)

**Ce qui manque** :
- [ ] Compte Onfido sandbox
- [ ] Installation `npm install onfido-sdk-node`
- [ ] Route `/api/kyc/create-applicant`
- [ ] Route `/api/kyc/check-status`
- [ ] Frontend : bouton "Vérifier mon âge"
- [ ] Stockage statut KYC dans User table

**Comment faire** :
```bash
# 1. Créer compte Onfido
https://onfido.com/signup/

# 2. Récupérer API token (sandbox)
# Ajouter au .env :
ONFIDO_API_TOKEN=api_sandbox.xxx

# 3. Installer SDK
cd web && npm install onfido-sdk-node

# 4. Créer routes API
# web/src/app/api/kyc/create-applicant/route.ts
import { Onfido } from 'onfido-sdk-node';
const onfido = new Onfido({ apiToken: process.env.ONFIDO_API_TOKEN });

export async function POST(req) {
  const { email, userId } = await req.json();
  const applicant = await onfido.applicant.create({
    email,
    firstName: 'User',
    lastName: userId,
  });
  // Créer check ID
  const check = await onfido.check.create({
    applicantId: applicant.id,
    reportNames: ['document', 'facial_similarity_photo'],
  });
  return Response.json({ applicantId: applicant.id, checkId: check.id });
}

# 5. Webhook pour résultats
# web/src/app/api/kyc/webhook/route.ts
```

**Durée estimée** : 3-4h

---

#### 3. OCR Tesseract (0%)
**Pourquoi** : Lecture pièce d'identité (backup KYC)

**Ce qui manque** :
- [ ] Installation `npm install tesseract.js`
- [ ] Route `/api/ocr/extract-id`
- [ ] Parsing date de naissance
- [ ] Validation âge >= 18 ans

**Comment faire** :
```bash
# 1. Installer Tesseract.js
cd web && npm install tesseract.js

# 2. Créer route API
# web/src/app/api/ocr/extract-id/route.ts
import { createWorker } from 'tesseract.js';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('id_photo');

  const worker = await createWorker('fra');
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();

  // Parser date de naissance (regex)
  const birthDate = extractBirthDate(text);
  const age = calculateAge(birthDate);

  return Response.json({ age, valid: age >= 18 });
}
```

**Durée estimée** : 1-2h

---

#### 4. Gestion Panier ✅ **FAIT** (voir section "Réalisations")
~~Panier complet implémenté avec Context API + localStorage~~

---

### 🟠 Majeurs (Améliorent le POC)

#### 5. Backend Express Séparé (0%)
**Pourquoi** : Directives demandent Node.js + Express séparé du frontend

**Impact** : Écart architectural avec directives

**Ce qui manque** :
- [ ] Nouveau dossier `/api` (Node.js + Express + TypeScript)
- [ ] Routes REST séparées
- [ ] Docker service `api` dans docker-compose
- [ ] Communication frontend → backend via `INTERNAL_API_URL`

**Comment faire** :
```bash
# 1. Créer structure backend
mkdir -p api/src
cd api
npm init -y
npm install express typescript @types/express prisma bcryptjs ioredis

# 2. Configurer TypeScript
npx tsc --init

# 3. Créer serveur Express
# api/src/index.ts
import express from 'express';
import { router as productsRouter } from './routes/products';

const app = express();
app.use('/api/products', productsRouter);
app.listen(4000);

# 4. Dockerfile séparé
# api/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]

# 5. Ajouter au docker-compose.yml
services:
  api:
    build: ./api
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}

# 6. Frontend appelle API backend
# web/src/app/page.tsx
const res = await fetch('http://api:4000/api/products');
```

**Durée estimée** : 4-6h (refonte architecture)

**Recommandation** : ⚠️ **Garder Next.js API Routes pour POC**, documenter l'écart

---

#### 6. Schéma PostgreSQL `winederful` (0%)
**Pourquoi** : Directives demandent un schéma dédié

**Actuellement** : Tables dans schéma `public` par défaut

**Comment faire** :
```sql
-- 1. Créer schéma
CREATE SCHEMA IF NOT EXISTS winederful;

-- 2. Modifier Prisma schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["winederful"]
}

model Product {
  @@schema("winederful")
  // ...
}

-- 3. Mettre à jour DATABASE_URL
DATABASE_URL=postgresql://postgres:change-me-strong@postgres:5432/appdb?schema=winederful
```

**Durée estimée** : 30 min

---

#### 7. Création Automatique Bucket MinIO (0%)
**Actuellement** : Bucket pas créé, upload échoue

**Comment faire** :
```bash
# 1. Script d'init MinIO
# scripts/init-minio.sh
#!/bin/sh
mc alias set myminio http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
mc mb myminio/$MINIO_BUCKET || true
mc anonymous set download myminio/$MINIO_BUCKET

# 2. Service init dans docker-compose
services:
  minio-init:
    image: minio/mc
    depends_on:
      - minio
    entrypoint: /scripts/init-minio.sh
    volumes:
      - ./scripts:/scripts
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
      - MINIO_BUCKET=${MINIO_BUCKET}
```

**Durée estimée** : 30 min

---

### 🟡 Nice-to-Have (Optionnels pour POC)

#### 8. Kafka (0%)
**Pourquoi** : Messaging asynchrone (emails, notifications)

**Usage** :
- Events : `order.created`, `payment.confirmed`, `shipment.sent`
- Consumers : email service, analytics, inventory update

**Comment faire** :
```bash
# 1. Ajouter Kafka + Zookeeper au docker-compose
services:
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
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

# 2. Installer client
npm install kafkajs

# 3. Producer (API backend)
# api/src/lib/kafka.ts
import { Kafka } from 'kafkajs';
const kafka = new Kafka({ brokers: ['kafka:9092'] });
const producer = kafka.producer();

export async function sendOrderEvent(order) {
  await producer.send({
    topic: 'orders',
    messages: [{ value: JSON.stringify(order) }],
  });
}

# 4. Consumer (service séparé)
# services/email/consumer.ts
const consumer = kafka.consumer({ groupId: 'email-group' });
await consumer.subscribe({ topic: 'orders' });
await consumer.run({
  eachMessage: async ({ message }) => {
    const order = JSON.parse(message.value);
    await sendConfirmationEmail(order);
  },
});
```

**Durée estimée** : 4-6h

---

#### 9. Tests (0%)
- [ ] Tests unitaires (Jest)
- [ ] Tests intégration API
- [ ] Tests E2E (Playwright)

---

#### 10. CI/CD (0%)
- [ ] GitHub Actions workflow
- [ ] Build automatique
- [ ] Tests automatiques
- [ ] Deploy staging

---

## 🐛 Bugs Connus (Mise à jour 14 Oct)

### 🔴 1. MinIO Unhealthy (4 jours - EN COURS DE CORRECTION)
**Symptôme** : 
```bash
docker-compose ps
# minio: Up 4 days (unhealthy)
```

**Cause** : Bucket `product-images` non créé automatiquement

**Impact** : Upload images impossible, healthcheck échoue

**Solution implémentée** :
- ✅ Script `scripts/init-minio.sh` créé
- ✅ Service `minio-init` ajouté dans docker-compose.yml
- ⏳ À déployer : `docker-compose up -d`

**Fix manuel temporaire** :
```bash
docker-compose exec minio mc alias set local http://localhost:9000 admin change-me-strong
docker-compose exec minio mc mb local/product-images
docker-compose exec minio mc anonymous set download local/product-images
```

### 🟠 2. Backend Routes Non Structurées
**Symptôme** : Routes dans fichiers `temp_*.js` compilés

**Cause** : Dossiers `controleurs/`, `services/`, `middlewares/` créés mais vides

**Impact** : Code non production-ready, difficulté maintenance

**À faire** : Migrer routes vers structure TypeScript propre

### 3. Variables Shell dans .env
**Symptôme** : `$POSTGRES_USER` non expandé

**Cause** : Docker Compose n'expand pas variables dans `.env`

**Fix** : Remplacer par valeurs hardcodées
```bash
# Avant
DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@...

# Après
DATABASE_URL=postgresql://postgres:change-me-strong@...
```

---

## 📋 Checklist POC Complet (Mise à jour 14 Oct)

### ✅ Phase 0-2 : Infrastructure (100% - FAIT)
- ✅ Docker Compose (5 services)
- ✅ PostgreSQL + Prisma
- ✅ Redis Cache
- ✅ MinIO S3
- ✅ Traefik Reverse Proxy

### ✅ Phase 3a : Backend + Frontend Base (100% - FAIT)
- ✅ Backend Express séparé
- ✅ Routes API `/produits`, `/auth`, `/images`
- ✅ Frontend Next.js avec 4 pages
- ✅ Gestion panier (Context + localStorage)
- ✅ Composants UI réutilisables
- ✅ Script init MinIO (bucket auto)

### ❌ Phase 3b : Fonctionnalités E-Commerce (À FAIRE PAR L'ÉQUIPE)
**Durée estimée** : 10-12h

| Tâche | Durée | Priorité | Assigné à |
|-------|-------|----------|-----------|
| Paiement Stripe | 3-4h | 🔴 Critique | - |
| Page Checkout | 2h | 🔴 Critique | - |
| Auth UI (login/register) | 2h | 🟠 Important | - |
| Routes Backend propres | 3h | 🟠 Important | - |
| KYC Onfido | 4-5h | 🟡 Optionnel | - |
| OCR Tesseract | 1-2h | 🟡 Optionnel | - |

### ❌ Phase 4 : Tests & Documentation (À FAIRE)
**Durée estimée** : 2-3h

- [ ] Tests E2E (Playwright)
- [ ] Documentation API complète
- [ ] Guide déploiement production
- [ ] README amélioré

---

## 🚀 Quick Start (Pour Reprendre le Projet)

### 1. Démarrer les services
```bash
cd /Users/rayanekryslak-medioub/Desktop/AlbertSchool1/Automation\ \&\ Deployment/projetfinal

# Démarrer
docker-compose up -d

# Vérifier statut
docker-compose ps

# Logs en temps réel
docker-compose logs -f web
```

### 2. Rebuild après changement code
```bash
docker-compose down
docker-compose build web
docker-compose up -d
```

### 3. Accéder aux services
- **Frontend** : http://localhost:3000
- **API Products** : http://localhost:3000/api/products
- **Traefik Dashboard** : http://traefik.localhost
- **MinIO Console** : http://minio.localhost (admin / change-me-strong)

### 4. Base de données
```bash
# Accéder à PostgreSQL
docker-compose exec postgres psql -U postgres -d appdb

# Lister tables
\dt

# Query produits
SELECT * FROM "Product";
```

### 5. Redis
```bash
# Accéder à Redis CLI
docker-compose exec redis redis-cli

# Vérifier cache
GET products:all

# Flush cache
FLUSHALL
```

---

## 📊 Estimation Travail Restant (Pour l'Équipe)

### Travail Critique (POC Fonctionnel)
**Durée** : 7-8h

| Tâche | Détails | Durée | Membre |
|-------|---------|-------|--------|
| **Paiement Stripe** | Setup compte + API routes + Frontend | 3-4h | ? |
| **Page Checkout** | Formulaire + Stripe Elements | 2h | ? |
| **Routes Backend** | Migrer `temp_*.js` vers structure propre | 2-3h | ? |

### Travail Important (POC Complet)
**Durée** : 4-5h

| Tâche | Détails | Durée | Membre |
|-------|---------|-------|--------|
| **Auth UI** | Pages login/register + protection routes | 2h | ? |
| **Upload Images** | Implémenter upload produits dans MinIO | 1h | ? |
| **Tests Flux** | Tester e-commerce bout en bout | 1h | ? |

### Travail Optionnel (Production)
**Durée** : 6-8h

- KYC Onfido (4-5h)
- OCR Tesseract (1-2h)
- Tests E2E (2h)
- CI/CD (3h)

**TOTAL CRITIQUE** : **7-8h** (2 personnes = 1 journée)  
**TOTAL COMPLET** : **11-13h** (2-3 personnes = 2 jours)

---

## 🎯 Plan d'Action pour l'Équipe

### 🔴 PRIORITÉ 1 : POC Fonctionnel (1 journée)
**Objectif** : Avoir un e-commerce qui fonctionne de bout en bout

**Personne 1** - Paiement (4h)
1. Créer compte Stripe test
2. Installer dépendances (`stripe`, `@stripe/stripe-js`)
3. Créer route backend `POST /api/checkout`
4. Créer route webhook `POST /api/webhooks/stripe`
5. Modèles Prisma `Order` + `OrderItem`

**Personne 2** - Frontend Checkout (3h)
1. Créer page `frontend/src/app/checkout/page.tsx`
2. Intégrer Stripe Elements (formulaire carte)
3. Flow paiement complet
4. Page confirmation commande

**Documentation Stripe** : https://stripe.com/docs/payments/accept-a-payment

---

### 🟠 PRIORITÉ 2 : Code Qualité (1/2 journée)
**Objectif** : Rendre le code maintenable

**Personne 1** - Backend (3h)
1. Créer `backend/src/controleurs/produits.ts`
2. Créer `backend/src/services/produitsService.ts`
3. Migrer logique depuis `temp_*.js`
4. Créer `backend/src/middlewares/auth.ts`

**Personne 2** - Tests (2h)
1. Tester flux complet : catalogue → panier → checkout
2. Vérifier images produits
3. Documenter bugs trouvés

---

### 🟡 OPTIONNEL : Fonctionnalités Avancées
**Si temps restant ou pour version 2.0**

- KYC Onfido (vérification âge 18+)
- OCR Tesseract (lecture ID)
- Tests E2E automatisés
- CI/CD pipeline
- Monitoring

---

## 📞 Contact & Ressources

### Documentation
- **Next.js** : https://nextjs.org/docs
- **Prisma** : https://www.prisma.io/docs
- **Stripe** : https://stripe.com/docs/payments/accept-a-payment
- **Onfido** : https://documentation.onfido.com/
- **MinIO** : https://min.io/docs/minio/linux/index.html
- **Redis** : https://redis.io/docs/

### Troubleshooting
- **Logs** : `docker-compose logs -f <service>`
- **Shell** : `docker-compose exec <service> sh`
- **Restart** : `docker-compose restart <service>`

---

**Version** : 1.0
**Dernière mise à jour** : 7 Octobre 2025
**Mainteneur** : POC Team
