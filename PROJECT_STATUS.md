# 📊 État du Projet E-Commerce Vin - POC

**Date**: 7 Octobre 2025
**Version**: 0.1.0 (POC)

---

## 🎯 Vue d'Ensemble

### Architecture Actuelle
```
┌─────────────────────────────────────────────────────────┐
│                      Traefik (Port 80)                  │
│                   Reverse Proxy & LB                    │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼─────┐
│  Web   │      │  MinIO   │
│Next.js │      │ Console  │
│  :3000 │      │  :9001   │
└───┬────┘      └──────────┘
    │
    ├─────┬──────┬──────────┐
    │     │      │          │
┌───▼──┐ ┌▼────┐ ┌▼──────┐ ┌▼─────┐
│Postgre│ │Redis│ │ MinIO │ │NextAuth│
│  :5432│ │:6379│ │ :9000 │ │Session │
└───────┘ └─────┘ └───────┘ └────────┘
```

---

## ✅ Ce Qui Est Fait (Phase 0 + Phase 2)

### 1. Infrastructure Docker (100%)
- ✅ **docker-compose.yml** configuré avec 5 services
  - Traefik (reverse proxy)
  - Web (Next.js 14)
  - PostgreSQL 16
  - Redis 7
  - MinIO (S3-compatible storage)
- ✅ **Réseaux** : `appnet` pour communication inter-services
- ✅ **Volumes persistants** : `pgdata`, `redis_data`, `minio_data`
- ✅ **Healthchecks** sur tous les services
- ✅ **Build multi-stage** optimisé (Dockerfile)

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

### 6. Frontend (50%)
- ✅ **Page d'accueil** (`page.tsx`) :
  - Affichage grille produits
  - Fetch depuis `/api/products`
  - Rendu SSR (Server-Side Rendering)
- ❌ Pas de page détail produit
- ❌ Pas de panier
- ❌ Pas de checkout
- ❌ Pas de formulaire login/register

### 7. Authentification (50%)
- ✅ **NextAuth** configuré avec Credentials provider
- ✅ **Prisma Adapter** pour sessions DB
- ✅ **Hashing bcrypt** pour passwords
- ❌ Pas d'UI login/register
- ❌ Pas de protection routes

### 8. Stockage Fichiers (30%)
- ✅ **MinIO** service démarré
- ✅ **Client S3** configuré (`lib/s3.ts`)
- ⚠️ **Bucket** `product-images` pas créé automatiquement
- ❌ Upload images produits non testé

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

#### 4. Gestion Panier (0%)
**Pourquoi** : UX e-commerce standard

**Ce qui manque** :
- [ ] Modèle Prisma `Cart` et `CartItem`
- [ ] Routes API CRUD `/api/cart`
- [ ] State management frontend (Context ou Zustand)
- [ ] UI panier (badge + page dédiée)
- [ ] Calcul total + TVA

**Comment faire** :
```bash
# 1. Ajouter modèles Prisma
# web/prisma/schema.prisma
model Cart {
  id        String     @id @default(uuid())
  userId    String?
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String  @id @default(uuid())
  cart      Cart    @relation(fields: [cartId], references: [id])
  cartId    String
  product   Product @relation(fields: [productId], references: [id])
  productId String
  quantity  Int     @default(1)
}

# 2. Créer routes API
# GET /api/cart - Récupérer panier
# POST /api/cart/add - Ajouter produit
# PATCH /api/cart/update - Mettre à jour quantité
# DELETE /api/cart/remove - Supprimer item

# 3. Frontend : Context Provider
# web/src/contexts/CartContext.tsx
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  // Fonctions add/remove/update
};

# 4. UI Composant
# web/src/components/CartBadge.tsx
# web/src/app/cart/page.tsx
```

**Durée estimée** : 2-3h

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

## 🐛 Bugs Connus

### 1. Prisma Client Désynchronisé
**Symptôme** : API retourne mock data au lieu de DB

**Cause** : Schéma Prisma modifié après build Docker

**Fix** :
```bash
docker-compose down
docker-compose build web
docker-compose up -d
```

### 2. MinIO Unhealthy
**Symptôme** : Healthcheck échoue

**Cause** : Bucket pas créé, endpoint `/minio/health/ready` vérifie buckets

**Fix** : Voir point 7 ci-dessus

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

## 📋 Checklist POC Complet

### Phase 3 : Fonctionnalités Manquantes (4-6h)
- [ ] **Redis cache** : ✅ Fait
- [ ] **Stripe** : ❌ 1h
- [ ] **Panier** : ❌ 2h
- [ ] **Upload MinIO** : ❌ 30 min
- [ ] **OCR Tesseract** : ❌ 1h
- [ ] **KYC Onfido** : ❌ 3h

### Phase 4 : Tests & Documentation (1h)
- [ ] Fix bug Prisma client
- [ ] Test flux complet (browse → add to cart → checkout → paiement)
- [ ] README avec instructions démarrage
- [ ] Documentation API (Postman collection)
- [ ] Diagramme architecture (draw.io)

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

## 📊 Estimation Totale pour POC Complet

| Phase | Tâches | Durée | Priorité |
|-------|--------|-------|----------|
| ✅ Phase 0-2 | Infrastructure + Redis | 1h | 🔴 Fait |
| Phase 3a | Stripe + Panier | 3h | 🔴 Critique |
| Phase 3b | Upload MinIO + OCR | 1.5h | 🟠 Important |
| Phase 3c | KYC Onfido | 3h | 🟠 Important |
| Phase 4 | Tests + Docs | 1h | 🟡 Finitions |
| **Total restant** | | **8.5h** | |

### Avec Backend Express séparé
| Phase | Tâches | Durée | Priorité |
|-------|--------|-------|----------|
| Phase 5 | Refonte backend Express | 6h | 🟠 Optionnel |
| **Total avec refonte** | | **14.5h** | |

---

## 🎯 Recommandations Finales

### Pour POC Rapide (2 jours)
1. ✅ **Garder architecture actuelle** (Next.js monolithe)
2. 🔴 **Priorité 1** : Stripe + Panier (e-commerce de base)
3. 🟠 **Priorité 2** : Upload MinIO (images produits)
4. 🟡 **Priorité 3** : KYC/OCR (si temps restant)

### Pour Production
1. 🔴 Migrer vers backend Express séparé
2. 🔴 Ajouter Kafka (événements asynchrones)
3. 🔴 Tests E2E complets
4. 🔴 CI/CD (GitHub Actions)
5. 🔴 Monitoring (Prometheus + Grafana)
6. 🔴 Secrets management (Vault)

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
