# Runbooks — Opérations courantes et incidents

Objectif: donner des pas-à-pas simples pour lancer le projet et réagir aux incidents fréquents.

## A) Démarrer le projet (dev)

1. Installer Docker Desktop.
2. Copier `.env.example` → `.env` et remplir les valeurs (DB, JWT, MinIO, etc.).
3. Lancer: `docker-compose up -d`
4. Vérifier:
   - Front: http://localhost:3000 (page d’accueil)
   - API: `curl http://api.localhost/health` (ok)
   - MinIO (images): tester une image `curl -I http://localhost:9000/product-images/.../main.png`
5. Si changements front: `docker-compose build frontend && docker-compose up -d`

## B) API renvoie 500 sur /api/produits/:id

Symptômes: la liste marche mais le détail 500.
- Causes probables:
  - La DB n’est pas encore branchée et l’API ne sait pas lire depuis CSV pour le détail.
  - L’ID ne correspond à aucun produit (404 attendu, pas 500).
- Actions:
  1. `docker-compose logs -f api` → lire l’erreur exacte.
  2. Si DB non prête: activer le fallback CSV côté API (endpoint doit lire en mémoire).
  3. Vérifier que l’ID demandé existe (front génère un bon lien).
  4. Si erreur de mapping, corriger la route détail pour gérer “non trouvé” (404).

## C) API 5xx en général (montée d’erreurs)

- Vérifier santé API: `curl http://api.localhost/health`
- Logs: `docker-compose logs -f api`
- DB up? `docker-compose logs -f postgres` (ou exporter Postgres)
- Si surcharge ou bug:
  - Redémarrer API: `docker-compose restart api`
  - Si migration manquante: exécuter migrations (outil choisi), puis relancer

## D) DB Postgres indisponible

- Logs: `docker-compose logs -f postgres`
- Santé: container “healthy” ?
- Connexion depuis API: `DATABASE_URL` ok ?
- Actions:
  - Redémarrer: `docker-compose restart postgres api`
  - Vérifier vols/space, droits, mots de passe
  - En prod: restaurer depuis backup (PITR ou dump), selon RPO/RTO

## E) Images MinIO ne s’affichent pas

- Tester direct: `curl -I http://localhost:9000/product-images/products/{id}/main.png` (200 attendu)
- Si privé via URLs signées:
  - Vérifier que le backend génère une URL signée valide (expiration non dépassée)
  - Vérifier CORS si le front charge direct depuis MinIO
- Vérifier que l’objet existe dans le bucket et le chemin est correct
- Si erreur politique: vérifier policy bucket (lecture) ou passer via proxy API

## F) Traefik / Routage cassé

- Dashboard: `traefik.localhost`
- Règles (labels) correctes pour `api.localhost` et `app.localhost` ?
- Ports exposés (3000, 4000, 9000) OK ?
- Logs: `docker-compose logs -f traefik`
- Redémarrer: `docker-compose restart traefik`

## G) Airflow: un “job” échoue

Définition: job = tâche Airflow (task) dans un DAG.
- Vérifier l’UI Airflow (webserver) → task logs
- Causes:
  - Crédentials BigQuery manquants
  - Connexion Postgres refusée
  - Quota BQ ou schéma incompatible
- Actions:
  1. Relancer la task (si fail transitoire)
  2. Vérifier connexions (Airflow Connections)
  3. Vérifier variables (dataset, project)
  4. Si récurrent → corriger code ETL, ajouter retries/backoff
- Alerte email: activer `email_on_failure` sur la task ou au DAG

## H) Stripe webhook (paiement) ne fonctionne pas

- Logs API: `docker-compose logs -f api` (route `/api/paiements/stripe/webhook`)
- Secret webhook ok ? (`STRIPE_WEBHOOK_SECRET`)
- Évènement reçu ? (en dev: utiliser Stripe CLI ou ngrok)
- Action: une fois `paid`, l’API met `orders.status=paid` puis envoie l’email (ou déclenche un DAG Airflow)

## I) Grafana: pas de métriques

- Prometheus up ? Scrape des cibles ok ?
- Exporters activés (API, Postgres, Airflow, Traefik, MinIO) ?
- Datasource Grafana vers Prometheus OK ?
- Actions:
  - Démarrer Prometheus/Grafana via Compose
  - Importer dashboards
  - Vérifier labels/targets et ports d’export

## J) Checklists rapides

- Avant une démo (5 min):
  - Front OK, API OK, 8 produits visibles
  - Stripe clés test configurées, webhook accessible (Stripe CLI)
  - MinIO images accessibles
  - Airflow: DAG de sync activé (si besoin)
  - Grafana: dashboard charge
- Après modification d’ENV:
  - `docker-compose down`
  - `docker-compose up -d`
  - Regarder `healthcheck` des services (frontend, api, postgres)

## K) Contacts / responsabilités

- Backend/API: …
- Frontend: …
- Data/ETL: …
- Infra/Monitoring: …

Mettez à jour cette section avec les référents d’équipe.
