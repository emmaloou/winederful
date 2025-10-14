import { NextRequest, NextResponse } from 'next/server';

const MINIO_URL = process.env.MINIO_URL || 'http://minio:9000';
const BUCKET = 'product-images';

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const path = params.path ? params.path.join('/') : '';
    const imageUrl = `${MINIO_URL}/${BUCKET}/${path}`;

    // Fetch image from MinIO
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new NextResponse('Image non trouvée', { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Erreur chargement image:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
