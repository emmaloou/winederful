import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, BUCKET } from '@/src/lib/s3';
import { auth } from '@/src/lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { objectKey, contentType } = await req.json();
  if (!objectKey) return NextResponse.json({ error: 'objectKey required' }, { status: 400 });

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
    ContentType: contentType ?? 'application/octet-stream'
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });
  return NextResponse.json({ url });
}


