Merci pour les précisions. Voici une feuille de route simplifiée et adaptée à un POC, prenant en compte ta structure de base de données (modèle PostgreSQL, schéma ‎`winederful`, colonnes clients et produits détaillées).# Feuille de route simplifiée – POC e-commerce vin

## 1. Architecture générale
- **Front end** : React + TypeScript
- **Back end** : Node.js + Express + TypeScript
- **OCR** : Tesseract (open source)
- **KYC** : Onfido (API)
- **Base de données** : PostgreSQL (schéma `winederful`)
- **Paiement** : Stripe (API)
- **Cache** : Redis (pour les produits)
- **Stockage fichiers** : MinIO (images produits/pièces d’identité)
- **Orchestration** : Docker Compose (un service par container)
- **Versionnement** : GitHub

## 2. Modélisation base de données (PostgreSQL)

### 2.1 Schéma `winederful`

- **Table clients**
  ```sql
  CREATE TABLE winederful.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

 • Table productsCREATE TABLE winederful.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  color TEXT,
  country TEXT,
  region TEXT,
  appellation TEXT,
  vintage INT,
  grapes TEXT,
  alcohol_percent NUMERIC(4,2),
  bottle_size_l NUMERIC(4,2),
  sweetness TEXT,
  tannin TEXT,
  acidity TEXT,
  rating NUMERIC(3,2),
  price_eur NUMERIC(10,2),
  producer TEXT,
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

3. Front End (React + TypeScript)
 • Authentification (formulaire email + mot de passe)
 • Catalogue produits (affichage des colonnes principales)
 • Page détail produit
 • Panier et paiement (Stripe)
 • Upload pièce d’identité pour KYC
 • Appels API vers le back

4. Back End (Node.js + Express + TypeScript)
 • Authentification (register/login)
 • Endpoints produits (GET all, GET by id, POST, PUT, DELETE si besoin)
 • Endpoint panier/commande (simplifié)
 • Intégration Stripe (paiement)
 • Upload pièce d’identité (stockage MinIO)
 • Endpoint KYC (Onfido)
 • OCR (Tesseract) pour vérification pièce d’identité
 • Connexion PostgreSQL (tables ci-dessus)
 • Intégration Redis pour cache produits

5. Conteneurisation (Docker Compose)
 • Un container pour chaque service : front, back, PostgreSQL, Redis, MinIO
 • Dockerfile pour front et back
 • Fichier docker-compose.yml pour orchestration

6. CI/CD et versionnement
 • Dépôt GitHub
 • Workflow simple : push, pull request, tests unitaires si possible

7. Points de vigilance POC
 • Authentification sécurisée (hash mot de passe)
 • RGPD : données minimales, suppression possible
 • Limiter le périmètre fonctionnel au strict nécessaire pour démontrer le POC

À adapter selon ton avancement et les besoins du POC.