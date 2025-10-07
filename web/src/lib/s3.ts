import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY as string,
    secretAccessKey: process.env.MINIO_SECRET_KEY as string
  },
  forcePathStyle: true
});

export const BUCKET = process.env.MINIO_BUCKET as string;


