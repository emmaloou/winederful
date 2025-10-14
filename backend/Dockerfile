FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Compiler TypeScript
RUN npm run build

# === Stage de production ===
FROM node:20-alpine AS runner

WORKDIR /app

# Installer wget pour healthcheck
RUN apk add --no-cache wget

# Copier package.json et prisma
COPY package*.json ./
COPY prisma ./prisma/

# Installer seulement les dépendances de production
RUN npm ci --only=production

# Générer le client Prisma
RUN npx prisma generate

# Copier le code compilé
COPY --from=builder /app/dist ./dist

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S expressjs && adduser -S expressjs -u 1001
USER expressjs

EXPOSE 4000

CMD ["node", "dist/index.js"]
