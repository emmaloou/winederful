# 🍷 WineShop (winederful) — POC e‑commerce de vins

Ce dépôt est un POC e‑commerce de vins en architecture microservices, avec séparation claire du frontend et du backend, orchestré par Docker/Traefik.

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, React Context (Auth)
- Backend: Express.js, Prisma ORM, PostgreSQL 16, Redis (cache), Auth JWT
- Infra: Docker Compose (6 conteneurs), Traefik (reverse proxy), MinIO (stockage S3 compatible)

Référence publique (README détaillé et structure proche): https://github.com/emmaloou/winederful

## 🚀 Démarrage rapide (Docker)

1) Prérequis: Docker Desktop + Git

2) Variables d'environnement
- Copier `.env.example` en `.env` puis remplir les valeurs (DB, JWT, MinIO, SMTP, Stripe, etc.)

3) Lancer le stack
```bash
docker-compose up -d
```
Attendre ~30 secondes que tout démarre.

## 🔗 Accès aux services (local)
- Frontend: http://localhost:3000 (ou via Traefik http://app.localhost)
- API: http://localhost:4000 (ou via Traefik http://api.localhost)
- Traefik: http://traefik.localhost
- MinIO Console: http://minio.localhost

Côté frontend, les appels navigateur utilisent `NEXT_PUBLIC_API_URL=http://api.localhost`; côté SSR, le frontend peut utiliser `API_INTERNAL_URL=http://api:4000`.

## 🧭 Structure des dossiers
```
projetfinal/
├── backend/                 # API Express (Prisma, routes, middlewares, config)
│   ├── src/
│   ├── prisma/
│   └── Dockerfile
├── frontend/                # Application Next.js (App Router, composants, contexts)
│   └── Dockerfile
├── k8s/                     # Squelette/manifestes Kubernetes (plus tard)
├── docs/                    # Documentation d'équipe et qualité
├── docker-compose.yml       # Orchestration Docker (6 services)
├── architecture.ini         # Description de l'architecture
└── README.md                # Ce fichier
```

## 🧪 API (exemples)
- GET `/api/produits?limit=...` → liste produits
- GET `/api/produits/:id` → détail produit
- POST `/api/auth/inscription` / `/api/auth/connexion` → JWT
- GET `/api/auth/profil` (Bearer) → profil utilisateur

Erreurs JSON homogènes: `{ erreur: "message" }`.

## 🔐 Sécurité (rappels)
- Changer impérativement: `POSTGRES_PASSWORD`, `JWT_SECRET`, `MINIO_ROOT_PASSWORD` avant toute exposition.
- Secrets en `.env` (non commité). En prod: secret manager.

## 📚 Documents d'équipe
- `docs/GUIDELINES.md` — standards, env, schémas, monitoring
- `docs/RUNBOOKS.md` — procédures d'exploitation et dépannage

## 🧩 Développement (extraits utiles)
```bash
# Logs
docker-compose logs -f api

# Rebuild frontend
docker-compose build frontend && docker-compose up -d frontend

# Stopper
docker-compose down
```

---

Ce POC s'inspire d'une organisation publique similaire et garde une séparation claire front/back avec exposition par Traefik. Voir aussi: https://github.com/emmaloou/winederful
