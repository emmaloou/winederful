# 🔍 AUDIT COMPLET DU PROJET - E-Commerce Vin POC

**Date**: 8 Octobre 2025
**Durée session**: Session 1 (7 oct) + Session 2 (8 oct)
**Statut**: POC en cours de développement

---

## 📍 I. ÉTAT DES LIEUX DE LA MISSION

### Objectif Initial (Directives)
Créer un POC e-commerce vin avec :
- ✅ Next.js + TypeScript (Frontend)
- ⚠️ Node.js + Express + TypeScript (Backend) → **Actuellement : API Routes Next.js**
- ✅ PostgreSQL (Base de données)
- ✅ Redis (Cache)
- ✅ MinIO (Stockage S3)
- ✅ Docker Compose (Orchestration)
- ❌ Tesseract OCR (Vérification ID)
- ❌ Onfido KYC (Vérification âge 18+)
- ❌ Stripe (Paiement)

### Progression Globale : **45%**

```
██████████░░░░░░░░░░ 45%

Phase 0-2 (Infrastructure): ████████████████████ 100% ✅
Phase 3 (Fonctionnalités):  ██░░░░░░░░░░░░░░░░░░  10% ❌
Phase 4 (Tests/Docs):       ████░░░░░░░░░░░░░░░░  20% ⚠️
```

---

## 📊 II. INVENTAIRE TECHNIQUE

### Services Docker (5/5) ✅
| Service | Image | Statut | Santé | Fonction |
|---------|-------|--------|-------|----------|
| **traefik** | traefik:v3.1 | ✅ Up 17h | OK | Reverse proxy |
| **web** | Custom Next.js | ✅ Up 17h | ⚠️ Unhealthy | Application |
| **postgres** | postgres:16-alpine | ✅ Up 18h | ✅ Healthy | Base de données |
| **redis** | redis:7-alpine | ✅ Up 17h | ✅ Healthy | Cache |
| **minio** | minio:2024-08 | ✅ Up 17h | ⚠️ Unhealthy | Stockage S3 |

**Problèmes** :
- `web` unhealthy : healthcheck timeout (Next.js lent au démarrage)
- `minio` unhealthy : bucket `product-images` pas créé auto

### Fichiers Code (10 fichiers TS/TSX - 231 lignes)
```
📁 web/src/
├── 📂 app/
│   ├── layout.tsx                    9 lignes  ⚠️ Minimal
│   ├── page.tsx                     27 lignes  ✅ OK
│   └── 📂 api/
│       ├── auth/[...nextauth]/route.ts   7 lignes  ✅ Minimal
│       ├── products/route.ts            66 lignes  ⚠️ Complexe
│       └── upload/route.ts              41 lignes  ✅ Bon
└── 📂 lib/
    ├── auth.ts                      32 lignes  ✅ Bon
    ├── prisma.ts                    13 lignes  ✅ Parfait
    ├── redis.ts                     21 lignes  ✅ Parfait
    └── s3.ts                        15 lignes  ✅ Parfait
```

### Base de Données
**Tables créées** : 2/2 ✅
- `Product` (21 colonnes) - Conforme directives ✅
- `ProductImage` (6 colonnes) - OK ✅

**Données** : 4 produits de test insérés ✅

**Problème** :
- Schéma `public` au lieu de `winederful` ⚠️
- Modèles NextAuth (`User`, `Account`, `Session`) non créés ❌

---

## 🎯 III. NOTATION DU CODE : **6.5/10**

### Détail par Critère

#### 1. **Architecture** : 5/10 ⚠️
**Points positifs** :
- ✅ Structure Next.js App Router (moderne)
- ✅ Séparation `/lib` pour utilitaires
- ✅ API Routes organisées

**Points négatifs** :
- ❌ Pas de backend Express séparé (directive non respectée)
- ❌ Pas de dossier `/components` (UI réutilisable)
- ❌ Pas de `/types` pour TypeScript interfaces
- ❌ Tout dans `/app`, manque de modularité

**Recommandation** : Créer `/components`, `/types`, `/services`

---

#### 2. **Qualité du Code** : 7/10 ✅
**Points positifs** :
- ✅ TypeScript strict activé
- ✅ Nommage clair (`prisma.ts`, `redis.ts`)
- ✅ Gestion d'erreurs présente
- ✅ Validation inputs (sanitize dans upload)
- ✅ Singletons bien implémentés

**Points négatifs** :
- ⚠️ Magic numbers (`MAX_SIZE_BYTES = 5 * 1024 * 1024`)
- ⚠️ Pas de constantes centralisées
- ⚠️ Hardcoded strings (`'/placeholder.svg'`)
- ❌ Pas de JSDoc/commentaires

**Exemples** :

✅ **BON** (lib/prisma.ts):
```typescript
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error']
  });
```

⚠️ **À AMÉLIORER** (api/products/route.ts):
```typescript
// Manque constantes
const cached = await redis.get('products:all'); // hardcoded key

// Magic number
await redis.setex('products:all', CACHE_TTL.PRODUCTS, ...);
```

---

#### 3. **Sécurité** : 6/10 ⚠️
**Points positifs** :
- ✅ bcrypt pour passwords
- ✅ Validation objectKey (sanitize)
- ✅ MIME type whitelist
- ✅ File size limit

**Points négatifs** :
- ❌ `NEXTAUTH_SECRET` faible (`change-me-32chars-min`)
- ❌ Pas de rate limiting
- ❌ Pas de CORS configuré
- ❌ Pas de CSP headers
- ⚠️ Erreurs exposées au client (`console.error`)

**Critique** :
```typescript
// ❌ BAD - Expose stack trace
catch (error) {
  console.error('Error fetching products:', error);
  return NextResponse.json({ products: items, error: true });
}
```

---

#### 4. **Performance** : 7/10 ✅
**Points positifs** :
- ✅ Redis cache implémenté
- ✅ Prisma select limité aux champs nécessaires
- ✅ Standalone output Next.js (optimisé Docker)
- ✅ Multi-stage Dockerfile

**Points négatifs** :
- ⚠️ Pas de pagination API
- ⚠️ Pas de lazy loading images
- ❌ Cache invalidation manquante (POST/PATCH/DELETE products)

---

#### 5. **Maintenabilité** : 6/10 ⚠️
**Points positifs** :
- ✅ Code court (231 lignes total)
- ✅ Fichiers < 70 lignes chacun
- ✅ Pas de duplication

**Points négatifs** :
- ❌ Pas de tests (0%)
- ❌ Pas de README technique
- ❌ Pas de types réutilisables
- ❌ Pas de variables d'environnement documentées

---

#### 6. **Conformité Directives** : 4/10 ❌
**Respecté** :
- ✅ TypeScript
- ✅ PostgreSQL avec colonnes métier vin
- ✅ Redis
- ✅ MinIO
- ✅ Docker Compose

**Non respecté** :
- ❌ Backend Express séparé → Next.js API Routes
- ❌ Schéma PostgreSQL `winederful` → `public`
- ❌ Tesseract OCR
- ❌ Onfido KYC
- ❌ Stripe
- ❌ Système panier/commande

---

## 🚀 IV. FACILITÉ D'INTÉGRATION POUR L'ÉQUIPE : **7/10**

### ✅ Points Forts

#### 1. **Connexion Database** : 9/10 ✅
**Facile** - Modèle déjà en place

```typescript
// web/src/lib/prisma.ts - Déjà prêt
import { prisma } from '@/lib/prisma';

// Exemple : créer un produit
const product = await prisma.product.create({
  data: {
    reference: 'BOR-002',
    name: 'Château Lafite',
    priceEur: 500,
    stockQuantity: 10
  }
});
```

**Coéquipier doit** :
1. ✅ Copier `.env.example` → `.env`
2. ✅ Modifier `DATABASE_URL` si besoin
3. ✅ `docker-compose up -d postgres`
4. ✅ Utiliser `prisma` déjà importé

---

#### 2. **Connexion Redis** : 9/10 ✅
**Facile** - Client configuré

```typescript
// web/src/lib/redis.ts - Déjà prêt
import { redis, CACHE_TTL } from '@/lib/redis';

// Exemple : cache custom
await redis.setex('my-key', 300, JSON.stringify(data));
const cached = await redis.get('my-key');
```

**Coéquipier doit** :
1. ✅ Service déjà dans docker-compose
2. ✅ Variable `REDIS_URL` déjà configurée
3. ✅ Importer `redis` depuis `/lib`

---

#### 3. **Connexion MinIO (S3)** : 8/10 ✅
**Assez facile** - Client prêt, bucket à créer

```typescript
// web/src/lib/s3.ts - Déjà prêt
import { s3, BUCKET } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

// Exemple : upload fichier
const command = new PutObjectCommand({
  Bucket: BUCKET,
  Key: 'products/wine-001.jpg',
  Body: fileBuffer,
  ContentType: 'image/jpeg'
});
await s3.send(command);
```

**Coéquipier doit** :
1. ⚠️ Créer bucket manuellement via console MinIO
2. ✅ Ou ajouter script init (voir ci-dessous)

---

### ⚠️ Points Moyens

#### 4. **Connexion Stripe** : 5/10 ⚠️
**Moyen** - Rien en place, mais simple à ajouter

**Coéquipier doit** :
```bash
# 1. Installer dépendance
npm install stripe

# 2. Ajouter au .env
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# 3. Créer route API
# web/src/app/api/checkout/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { amount } = await req.json();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'eur',
  });
  return Response.json({ clientSecret: paymentIntent.client_secret });
}
```

**Difficulté** : Créer fichier from scratch (pas de template)

---

#### 5. **Prometheus** : 4/10 ⚠️
**Moyen-Difficile** - Aucune métrique exposée

**Coéquipier doit** :
```bash
# 1. Ajouter au docker-compose.yml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

# 2. Installer metrics lib dans Next.js
npm install prom-client

# 3. Créer endpoint metrics
# web/src/app/api/metrics/route.ts
import { register } from 'prom-client';
export async function GET() {
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': register.contentType }
  });
}

# 4. Configurer prometheus.yml
scrape_configs:
  - job_name: 'nextjs'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/api/metrics'
```

**Difficulté** : Setup from scratch + comprendre métriques

---

#### 6. **Grafana** : 6/10 ⚠️
**Moyen** - Dépend de Prometheus

**Coéquipier doit** :
```yaml
# docker-compose.yml
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  grafana_data:
```

**Puis** :
1. Accéder à `http://localhost:3001`
2. Ajouter datasource Prometheus (`http://prometheus:9090`)
3. Importer dashboard Next.js (ID communautaire)

**Difficulté** : Config datasource + création dashboards

---

### ❌ Points Faibles

#### 7. **Kafka** : 2/10 ❌
**Difficile** - Rien en place

**Coéquipier doit** :
1. Ajouter Zookeeper + Kafka au docker-compose (complexe)
2. Installer `kafkajs`
3. Créer producer/consumer
4. Gérer topics
5. Gérer retry/dead-letter queues

**Estimé** : 4-6h pour setup complet

---

## 🐛 V. PROBLÈMES BLOQUANTS POUR L'ÉQUIPE

### 🔴 Critiques (Bloquent immédiatement)

#### 1. **Prisma Client Désynchronisé**
**Symptôme** : API retourne mock data au lieu de DB

**Impact** : Coéquipiers ne peuvent pas tester leurs queries Prisma

**Fix immédiat** :
```bash
docker-compose down
docker-compose build web
docker-compose up -d
```

---

#### 2. **Pas de Documentation d'Onboarding**
**Problème** : Nouveau dev ne sait pas :
- Comment démarrer le projet
- Où sont les variables d'env
- Comment créer un endpoint API

**Fix** : Créer `CONTRIBUTING.md` avec :
```markdown
## Quick Start
1. cp .env.example .env
2. docker-compose up -d
3. Accéder à http://localhost:3000

## Ajouter une route API
1. Créer web/src/app/api/[nom]/route.ts
2. Exporter GET/POST/etc.
3. Importer prisma/redis depuis /lib

## Variables d'environnement
DATABASE_URL=... (voir .env.example)
```

---

#### 3. **Pas de Types Partagés**
**Problème** : Chaque dev redéfinit `Product`, `User`

**Exemple actuel** :
```typescript
// ❌ Dans page.tsx
const { products } = await fetchProducts();
products.map((p: any) => ...) // any = danger
```

**Fix** : Créer `web/src/types/index.ts` :
```typescript
export type Product = {
  id: string;
  reference: string;
  name: string;
  priceEur: number;
  // ...
};

export type ApiResponse<T> = {
  data: T;
  error?: string;
  cached?: boolean;
};
```

---

### 🟠 Majeurs (Ralentissent l'équipe)

#### 4. **Pas de Validation Centralisée**
**Problème** : Chaque route réinvente validation

**Fix** : Créer `web/src/lib/validation.ts` :
```typescript
import { z } from 'zod';

export const productSchema = z.object({
  reference: z.string().min(1).max(50),
  name: z.string().min(1),
  priceEur: z.number().positive(),
});

// Usage
export async function POST(req: Request) {
  const body = await req.json();
  const validated = productSchema.parse(body); // throws si invalide
}
```

---

#### 5. **Pas de Gestion d'Erreurs Centralisée**
**Problème** : Erreurs loggées différemment partout

**Fix** : Créer `web/src/lib/errors.ts` :
```typescript
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.statusCode });
  }
  console.error('Unexpected error:', error);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
```

---

#### 6. **Services Unhealthy**
**Problème** : `web` et `minio` marqués unhealthy

**Fix** :
```yaml
# docker-compose.yml
services:
  web:
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 30s  # ← Augmenter de 10s à 30s
      timeout: 10s   # ← Augmenter de 3s à 10s
      retries: 3
      start_period: 60s  # ← Ajouter grace period

  minio:
    # Ajouter init container (voir section MinIO)
```

---

## 🎯 VI. PLAN DE CLEAN CODE (Priorités)

### Phase 1 : Fixes Immédiats (1h)
```bash
1. ✅ Rebuild web (fix Prisma client)
2. ✅ Créer CONTRIBUTING.md
3. ✅ Créer web/src/types/index.ts
4. ✅ Ajouter route /api/health
5. ✅ Fix healthchecks Docker
```

### Phase 2 : Structure (2h)
```bash
6. Créer web/src/components/
7. Créer web/src/services/
8. Créer web/src/lib/validation.ts
9. Créer web/src/lib/errors.ts
10. Créer web/src/lib/constants.ts
```

### Phase 3 : Documentation (1h)
```bash
11. README.md avec architecture
12. API.md avec endpoints
13. .env.example commenté
14. JSDoc sur fonctions publiques
```

### Phase 4 : Qualité (2h)
```bash
15. ESLint + Prettier config
16. Pre-commit hooks (Husky)
17. Tests unitaires lib/
18. GitHub Actions CI
```

---

## 📈 VII. ROADMAP POUR 100%

### Sprint 1 (Aujourd'hui - 2h)
- ✅ Audit code
- 🔲 Fix Prisma client
- 🔲 Créer types partagés
- 🔲 CONTRIBUTING.md

### Sprint 2 (Demain - 4h)
- 🔲 Stripe integration
- 🔲 Panier (Cart API)
- 🔲 Upload MinIO (bucket init)
- 🔲 Tests API

### Sprint 3 (J+2 - 4h)
- 🔲 Prometheus metrics
- 🔲 Grafana dashboards
- 🔲 KYC Onfido
- 🔲 OCR Tesseract

### Sprint 4 (J+3 - 2h)
- 🔲 Kafka setup
- 🔲 Documentation finale
- 🔲 Video demo

---

## 🏆 VIII. SYNTHÈSE NOTATION FINALE

| Critère | Note | Commentaire |
|---------|------|-------------|
| **Architecture** | 5/10 | Monolithe Next.js au lieu de backend séparé |
| **Qualité Code** | 7/10 | Propre mais manque types/tests |
| **Sécurité** | 6/10 | Bases OK, manque hardening |
| **Performance** | 7/10 | Redis bien, manque pagination |
| **Maintenabilité** | 6/10 | Court mais peu documenté |
| **Conformité** | 4/10 | Plusieurs directives non respectées |
| **Intégration Équipe** | 7/10 | DB/Redis facile, Kafka difficile |

## **MOYENNE GLOBALE : 6.5/10** ⚠️

---

## ✅ Points Forts à Conserver
1. ✅ Infrastructure Docker propre
2. ✅ Singletons bien implémentés
3. ✅ TypeScript strict
4. ✅ Code court et lisible
5. ✅ Redis cache pattern correct

## ❌ Points Faibles à Corriger
1. ❌ Pas de backend Express
2. ❌ Zéro tests
3. ❌ Types `any` dans frontend
4. ❌ Documentation manquante
5. ❌ 50% fonctionnalités absentes

---

## 🎯 VERDICT

**Le projet est fonctionnel pour une démo basique**, mais nécessite :
- **2h de fixes critiques** (types, docs, rebuild)
- **8h de développement** (Stripe, panier, KYC)
- **4h de polish** (tests, monitoring)

**Estimation pour POC complet : 14h** (2 jours)

---

**Prochaine étape recommandée** : Commencer Phase 1 (Fixes Immédiats) pendant que services Docker tournent.
