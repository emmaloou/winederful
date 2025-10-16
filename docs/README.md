# 🍷 WineShop – Data-Driven Wine E-Commerce Platform  

An ETL-powered microservice architecture enabling an intelligent wine marketplace with:  
- ✅ Automated **KYC (Know Your Customer)** age verification via OCR  
- 📦 **Real-time inventory** tracking  
- 📊 **Live data analytics** and dashboards powered by Grafana  

---

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker Desktop installed  
- Git  

### Installation in 3 commands

```bash
# 1. Clone the repository
git clone https://github.com/emmaloou/winederful.git
cd winederful

# 2. Create the .env file
cp .env.example .env

# 3. Launch the entire stack
docker compose up -d
```

**That’s it!** 🎉  
Wait about 30 seconds for all services to initialize.

---

### Access the Services

| Service | URL | Description |
|----------|-----|-------------|
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Next.js user interface |
| **Backend API** | [http://localhost:4000](http://localhost:4000) | Express + Prisma API |
| **KYC Service** | [http://localhost:4100/kyc](http://localhost:4100/kyc) | OCR-based ID & age verification |
| **Grafana** | [http://localhost:3002](http://localhost:3002) | Analytics dashboards |
| **MinIO Console** | [http://minio.localhost](http://minio.localhost) | S3-compatible storage |
| **Traefik Dashboard** | [http://traefik.localhost](http://traefik.localhost) | Reverse proxy UI |
| **CSV Server** | [http://localhost:8000](http://localhost:8000) | Serves CSV data for Grafana |

---

### Through Traefik (recommended)
- Frontend → [http://app.localhost](http://app.localhost)  
- API → [http://api.localhost/api/produits](http://api.localhost/api/produits)  
- Grafana → [http://grafana.localhost](http://grafana.localhost)  
- MinIO → [http://minio.localhost](http://minio.localhost)

---

## 📦 Architecture

### Technical Stack

**Frontend**
- Next.js 14 (App Router)  
- TypeScript  
- Tailwind CSS  
- React Context for JWT authentication  

**Backend**
- Express.js  
- Prisma ORM  
- PostgreSQL 16  
- Redis (cache)  
- Kafka (async event streaming)  
- Airflow (workflow orchestration)  
- Stripe (payments)  

**Infrastructure**
- Docker Compose (multi-container setup)  
- Traefik (reverse proxy)  
- MinIO (S3-compatible storage)  
- Grafana + CSV Server (observability)  
- PostgreSQL (ACID transactions)  
- Redis (sessions & rate limiting)  

---

### Docker Containers

```
winederful-frontend-1    → Next.js 14 (port 3000)
winederful-api-1         → Express API (port 4000)
winederful-postgres-1    → PostgreSQL 16
winederful-redis-1       → Redis 7
winederful-minio-1       → MinIO storage
winederful-kyc-1         → OCR / KYC service (port 4100)
winederful-grafana-1     → Grafana dashboards (port 3002)
winederful-csvserver-1   → Data server for Grafana (port 8000)
winederful-traefik-1     → Reverse proxy
```

---

## 🔐 KYC Microservice (Know Your Customer)

### Purpose  
Ensure all users are of legal drinking age before completing purchases.  

### How it works  
- Users upload a **photo of their ID** during registration.  
- The **KYC container (Python)** runs **Tesseract OCR** to extract the birth date.  
- If the age ≥ 18 years → the SQL field `is_verified` is set to `true`.  
- The verification result appears in the user profile on the frontend.  

### Stack  
- Python 3.12  
- Flask / FastAPI  
- Tesseract OCR  
- MinIO (temporary file storage)  

### Launch
```bash
docker compose up -d kyc
```
➡️ Access: [http://localhost:4100/kyc](http://localhost:4100/kyc)

---

## 📊 Grafana Observability

### Purpose  
Visualize business data (sales, stock, customers) in real time.  

### How it works  
- Grafana connects to the **CSV Server**, a lightweight Python container serving static files.  
- The datasets (`orders.csv`, `stocks.csv`, `wines_generated.csv`) are accessible via:  
  ```
  http://csvserver:8000/
  ```
- These are loaded with the **Infinity Plugin** and rendered into dynamic dashboards.

### Installed Plugins  
- `marcusolsson-csv-datasource`  
- `yesoreyeram-infinity-datasource`

### Launch Grafana
```bash
docker compose up -d grafana csvserver
```

### Access
- URL → [http://localhost:3002](http://localhost:3002)  
- Login → `admin`  
- Password → `admin`

---

## 📈 Dashboards

| Dashboard | Description | JSON File | Preview |
|------------|--------------|------------|----------|
| **Revenue by Date** | Aggregates total daily revenue (from `orders.csv`) | `/observability/grafana/dashboards/revenue_by_date.json` | ![Revenue by Date](docs/images/revenue_by_date.png) |
| **Top Wines by Revenue** | Ranks best-selling wines by total revenue | `/observability/grafana/dashboards/top_wines.json` | ![Top Wines by Revenue](docs/images/top_wines.png) |
| **Stock Levels** *(coming soon)* | Displays current inventory per wine | – | – |

---

## 🧩 Project Structure

```
winederful/
├── backend/                     # Express API
├── frontend/                    # Next.js frontend
├── kyc-service/                 # OCR & age verification
├── observability/
│   └── grafana/
│       ├── dashboards/          # Exported dashboard JSONs
│       └── provisioning/        # Auto-import config
├── csv/                         # CSV data for Grafana
├── docker-compose.yml           # Full stack orchestration
└── docs/images/                 # Screenshots for README
```

---

## 🧠 Useful Commands

```bash
# View logs
docker compose logs -f grafana
docker compose logs -f kyc

# Restart a specific service
docker compose restart grafana

# Rebuild after changes
docker compose build grafana
docker compose up -d grafana

# Stop everything
docker compose down
```

---

## 📚 Key Features

### ✅ Completed
- Full JWT authentication (frontend + backend)
- Interactive product catalog (filters by color)
- PostgreSQL + Prisma ORM
- Redis cache for products
- **KYC OCR Service** (age verification)
- **Grafana monitoring with CSV data**
- Traefik reverse proxy setup
- Environment variable configuration

### 🚧 In Progress
- Kafka – Order & event streaming
- Stripe – Secure payments with 3D Secure
- Prometheus – API metrics & Grafana alerting
- Stock dashboard automation
- OCR for wine label recognition (AI vision)

---

## 🧮 Versioning Grafana Dashboards in Git

To keep dashboards reproducible and version-controlled:

### 1️⃣ Export your dashboard
- In Grafana → **Share → Export → View JSON**
- Click **Download JSON**

### 2️⃣ Save it in your repo
Place it in:
```
observability/grafana/dashboards/
```

Example:
```
observability/grafana/dashboards/top_wines.json
```

### 3️⃣ Commit the changes
```bash
git add observability/grafana/dashboards/top_wines.json
git commit -m "Add Top Wines by Revenue dashboard"
git push origin feat/nolwenn-kyc-grafana
```

Your dashboard is now versioned and can be auto-imported when Grafana starts 🎯

---

## 👥 Team

| Member | Role | Status |
|---------|------|--------|
| **Nolwenn Montillot** 
| **Rayane Kryslak** 
| **Emma Lou Villaret** 
| **Matthieu Dollfus** 
| **Mory Meite** 

---

## 🧾 License  
MIT © 2025 — *Albert School – MSc Data for Business Project*

---

## 🧮 Versioning Grafana Dashboards in Git

To keep dashboards reproducible and version-controlled:

### 1️⃣ Export your dashboard
- In Grafana → **Share → Export → View JSON**
- Click **Download JSON**

### 2️⃣ Save it in your repo
Place it in:
```
observability/grafana/dashboards/
```

Example:
```
observability/grafana/dashboards/top_wines.json
```

### 3️⃣ Commit the changes
```bash
git add observability/grafana/dashboards/top_wines.json
git commit -m "Add Top Wines by Revenue dashboard"
git push origin feat/nolwenn-kyc-grafana
```
