# Winederful – Next.js + NextAuth + Prisma + PostgreSQL + MinIO

## Dev quickstart

1. Copy env

```
cp .env.example .env
```

2. Start stack

```
docker compose up -d --build
```

3. Init DB (inside web container)

```
docker compose exec web npx prisma migrate dev --name init
```

4. Create MinIO bucket `product-images` via `http://minio.localhost` (minioadmin/minioadmin).

5. App at `http://app.localhost` | Traefik at `http://traefik.localhost` | MinIO console at `http://minio.localhost`.

Based on the course project goals and architecture similar to `winederful` repo.

References: `https://github.com/emmaloou/winederful`
