# -------- Deps stage: install API deps once --------
    FROM node:20-alpine AS deps
    WORKDIR /app
    
    # Copy ONLY the API's package files (because build context is repo root)
    COPY backend/package*.json ./
    
    # Install deps using the lockfile (recommended)
    # If you don't have a package-lock.json in backend/, either add it or replace with `npm install`
    RUN npm ci
    
    # -------- Build stage: compile the API --------
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Reuse deps
    COPY --from=deps /app/node_modules ./node_modules
    COPY --from=deps /app/package*.json ./
    
    # Copy API source code only
    COPY backend/ ./
    
    # (Optional) Prisma client generation if the API uses Prisma client at runtime
    # You said your schema is under frontend/prisma -> place it under /app/prisma for generation
    COPY frontend/prisma ./prisma/
    # If you don't need Prisma in the API, you may remove the next line
    RUN npx --yes prisma generate --schema=./prisma/schema.prisma || echo "skip prisma generate"
    
    # Build your API (adjust if your build script differs or if it's plain JS)
    # If your API is TypeScript, this should output to /app/dist
    RUN npm run build
    
    # -------- Runtime stage: slim prod image --------
    FROM node:20-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    
    # A non-root user is good practice
    RUN addgroup -g 1001 -S app && adduser -S app -u 1001
    
    # Bring only what's needed at runtime
    COPY --from=deps /app/node_modules ./node_modules
    COPY --from=deps /app/package*.json ./
    COPY --from=builder /app/dist ./dist
    
    USER app
    EXPOSE 4000
    CMD ["node", "dist/index.js"]    