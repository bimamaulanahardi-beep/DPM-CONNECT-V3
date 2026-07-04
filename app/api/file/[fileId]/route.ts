import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId;
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('name') || 'file';

    // Look up the file in FileStorage table
    const fileRecord = await prisma.fileStorage.findUnique({
      where: {
        fileId: fileId,
      }
    });

    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Parse data URI
    const dataUri = fileRecord.dataUri as string;
    const [header, base64Data] = dataUri.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('File serve error:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
