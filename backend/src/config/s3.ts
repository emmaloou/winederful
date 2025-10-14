import { S3Client } from '@aws-sdk/client-s3';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://minio:9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ROOT_USER || 'admin';
const MINIO_SECRET_KEY = process.env.MINIO_ROOT_PASSWORD || 'change-me-strong';
const BUCKET_NAME = 'product-images';

export const s3Client = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // Nécessaire pour MinIO
});

export const BUCKET = BUCKET_NAME;
