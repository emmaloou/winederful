#!/bin/sh
set -e

echo "🔧 Initialisation MinIO..."

# Attendre que MinIO soit prêt
until mc alias set myminio http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD; do
  echo "⏳ En attente de MinIO..."
  sleep 2
done

echo "✅ MinIO accessible"

# Créer le bucket product-images
if mc mb myminio/product-images 2>/dev/null; then
  echo "✅ Bucket 'product-images' créé"
else
  echo "ℹ️  Bucket 'product-images' existe déjà"
fi

# Définir la politique d'accès public en lecture
mc anonymous set download myminio/product-images

echo "✅ Politique d'accès configurée (lecture publique)"
echo "✅ Initialisation MinIO terminée"

