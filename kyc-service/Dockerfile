FROM node:20-alpine

# ✅ Install tesseract core + language data (ENG + FRA)
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    tesseract-ocr-data-fra

WORKDIR /app
COPY package*.json ./
# Use ci if you have a lockfile; otherwise install
# RUN npm ci --omit=dev
RUN npm install --omit=dev

COPY . .
EXPOSE 4100

HEALTHCHECK --interval=10s --timeout=5s --retries=10 --start-period=20s \
  CMD wget -qO- http://127.0.0.1:4100/health || exit 1

CMD ["npm", "start"]