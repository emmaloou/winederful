# Engineering Guidelines — WineShop (Docker Compose V1)

Objectif: permettre à l’équipe de lancer, développer et opérer le projet simplement (front/back séparés, API, DB, MinIO, Airflow, Monitoring). Kubernetes viendra plus tard.

## 1) Environnements et services

- Environnements: 1 (dev) via Docker Compose. Staging/Prod et K8s plus tard.
- Services (Compose):
  - Frontend Next.js (http://localhost:3000)
  - API Node/Express (http://api.localhost via Traefik)
  - Postgres (base applicative)
  - Redis (cache/sessions si besoin)
  - MinIO (stockage objets, images produits) (http://localhost:9000)
  - Traefik (reverse proxy)
  - Airflow (orchestration) — à ajouter
  - Prometheus + Grafana (monitoring) — à ajouter
  - Postgres Exporter / Airflow Exporter / Traefik metrics — à ajouter

## 2) Variables d’environnement (standard)

Fichier `.env` (exemple)
- API:
  - PORT=4000
  - NODE_ENV=production
  - JWT_SECRET=change-me
  - FRONTEND_URL=http://frontend:3000
  - DATABASE_URL=postgres://POSTGRES_USER:POSTGRES_PASSWORD@postgres:5432/POSTGRES_DB
  - REDIS_URL=redis://redis:6379
  - MINIO_ENDPOINT=http://minio:9000
  - MINIO_ROOT_USER=admin
  - MINIO_ROOT_PASSWORD=change-me-strong
  - MINIO_BUCKET=product-images
  - STRIPE_SECRET_KEY=sk_test_xxx
  - STRIPE_WEBHOOK_SECRET=whsec_xxx
  - SMTP_HOST=…
  - SMTP_USER=…
  - SMTP_PASS=…
  - FROM_EMAIL=no-reply@wineshop.local
- Frontend:
  - NEXT_PUBLIC_API_URL=http://api.localhost
  - API_INTERNAL_URL=http://api:4000
- BigQuery:
  - GOOGLE_APPLICATION_CREDENTIALS=/secrets/gcp.json
  - BQ_PROJECT=your-project
  - BQ_DATASET=wineshop

Note: stocker les secrets localement en `.env` (non commité). En prod, utiliser un secret manager.

## 3) Lancer et arrêter

- Lancer: `docker-compose up -d`
- Arrêter: `docker-compose down`
- Rebuild frontend: `docker-compose build frontend && docker-compose up -d`
- Logs d’un service: `docker-compose logs -f api`

Vérifications rapides:
- Front: http://localhost:3000
- API Health: `curl http://api.localhost/health`
- MinIO: `curl -I http://localhost:9000/product-images/.../main.png`

## 4) Contrat API (v1, extrait)

- GET `/api/produits?limit=...` → `{ donnees: Produit[] }`
- GET `/api/produits/:id` → `{ donnees: Produit }` (404 si non trouvé)
- POST `/api/auth/inscription` { email, password, name? } → JWT
- POST `/api/auth/connexion` { email, password } → JWT
- GET `/api/auth/profil` (Authorization: Bearer) → user
- POST `/api/commandes` { items: [{productId, qty}], ... } → crée commande (Idempotency-Key conseillé)
- POST `/api/paiements/stripe/webhook` → met `order.status=paid` et déclenche email
- Erreurs: `{ erreur: "message" }` (4xx/5xx)

CORS: API accessible depuis le front (domaines dev autorisés via Traefik).

## 5) Base de données (Postgres)

Tables minimales:
- `users(id UUID PK, email UNIQUE, password_hash, name, role ENUM('admin','client'), created_at)`
- `products(id UUID PK, reference UNIQUE, name, price_eur NUMERIC, color, region, producer, vintage, stock_quantity INT, rating INT, created_at)`
- `orders(id UUID PK, user_id FK, status ENUM('pending','paid','shipped'), total NUMERIC, created_at)`
- `order_items(id UUID PK, order_id FK, product_id FK, quantity INT, unit_price NUMERIC)`

Index recommandés: `users(email)`, `products(reference)`, `order_items(order_id)`, `order_items(product_id)`, `orders(user_id)`.

Migrations: outil unique (ex: Prisma Migrate / Knex / Flyway) — forward-only.

## 6) Images (MinIO)

- Bucket: `product-images`
- Nommage: `products/{productId}/main.png`
- Privé (recommandé): URLs signées côté API (expiration 5 min), ou proxy API pour servir.
- Pas de versioning: upload écrase l’ancienne image.
- Headers: `Cache-Control` configurés si images publiques.

## 7) Data Warehouse (BigQuery)

- Tables: `dw.orders`, `dw.order_items`, `dw.products`, `dw.users`
- Sync: batch toutes les minutes (Airflow), incrémental sur `updated_at`
- KPIs: CA/jour, top produits, panier moyen, commandes/heure

## 8) Airflow (orchestration)

DAGs cibles:
- `ingest_postgres_to_bq` (*/1 * * * *): ETL incrémental Postgres → BigQuery
- `email_after_payment`: envoi email après passage `paid` (via webhook Stripe ou capteur DB)
- `minio_assets_check` (optionnel): cohérence produits vs images

Politique:
- Retries: 3, exponential backoff
- Alerte e-mail sur échec (voir Runbooks)
- Connexions: Postgres, BigQuery (service account), SMTP, MinIO/S3

## 9) Monitoring (Prometheus + Grafana)

- Exporters: API (metrics), Postgres Exporter, Airflow Exporter, Traefik metrics, MinIO metrics
- Dashboards:
  - API: RPS, 4xx/5xx, latences p50/p95/p99
  - DB: connexions, slow queries, locks
  - Airflow: succeeded/failed tasks, durées
- Alertes e-mail:
  - 5xx > 2% sur 5 min
  - p95 latence > 500ms sur 5 min
  - Job Airflow failed
  - DB indisponible

## 10) Sécurité

- JWT: rotation possible, TTL raisonnable
- Least privilege DB / MinIO / GCP
- Logs JSON, masquage PII, jamais de secrets en logs
- HTTPS/TLS via Traefik en staging/prod

## 11) Frontend

- Public API URL: `NEXT_PUBLIC_API_URL=http://api.localhost`
- SSR interne: `API_INTERNAL_URL=http://api:4000`
- En cas d’erreur réseau: message “Réessayer” + log console
- Page Checkout: plus tard

## 12) Processus d’équipe

- Checklist “Démarrage” (voir Runbooks)
- Guidelines communes (ce fichier)
- Scripts utiles (Makefile recommandé): `make up/down/logs/seed`
- Code Review: PRs petites, lint + tests verts
