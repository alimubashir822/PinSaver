import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET: Fetch all user's downloads
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ downloads: [] });
    }

    const downloads = await prisma.download.findMany({
      where: { userId: user.userId },
      orderBy: { downloadedAt: 'desc' },
      include: { collection: true },
    });

    return NextResponse.json({ downloads });
  } catch (error: any) {
    console.error('Fetch history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch download history.' },
      { status: 500 }
    );
  }
}

// POST: Add a new download or sync guest downloads
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      // If guest, we just return success as the frontend will store it locally
      return NextResponse.json({ success: true, guest: true });
    }

    const body = await request.json();
    
    // Check if it's a sync request
    if (body.sync && Array.isArray(body.downloads)) {
      const recordsToCreate = body.downloads.map((dl: any) => ({
        userId: user.userId,
        pinterestUrl: dl.pinterestUrl,
        title: dl.title,
        thumbnail: dl.thumbnail,
        videoUrl: dl.videoUrl,
        downloadedAt: dl.downloadedAt ? new Date(dl.downloadedAt) : new Date(),
      }));

      if (recordsToCreate.length > 0) {
        await prisma.download.createMany({
          data: recordsToCreate,
        });
      }

      return NextResponse.json({ success: true, count: recordsToCreate.length });
    }

    // Otherwise, single download creation
    const { pinterestUrl, title, thumbnail, videoUrl, collectionId } = body;

    if (!pinterestUrl || !title || !videoUrl) {
      return NextResponse.json(
        { error: 'pinterestUrl, title, and videoUrl are required.' },
        { status: 400 }
      );
    }

    const download = await prisma.download.create({
      data: {
        userId: user.userId,
        pinterestUrl,
        title,
        thumbnail: thumbnail || '',
        videoUrl,
        collectionId: collectionId || null,
      },
    });

    return NextResponse.json({ success: true, download });
  } catch (error: any) {
    console.error('Save history error:', error);
    return NextResponse.json(
      { error: 'Failed to save download record.' },
      { status: 500 }
    );
  }
}
