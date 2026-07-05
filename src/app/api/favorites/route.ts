import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET: Fetch user favorites
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ favorites });
  } catch (error: any) {
    console.error('Fetch favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites.' },
      { status: 500 }
    );
  }
}

// POST: Add a new favorite
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to save favorites.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pinterestUrl, title, thumbnail, videoUrl } = body;

    if (!pinterestUrl || !title || !videoUrl) {
      return NextResponse.json(
        { error: 'pinterestUrl, title, and videoUrl are required.' },
        { status: 400 }
      );
    }

    // Check if it already exists as favorite
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: user.userId,
        pinterestUrl,
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, favorite: existing });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.userId,
        pinterestUrl,
        title,
        thumbnail: thumbnail || '',
        videoUrl,
      },
    });

    return NextResponse.json({ success: true, favorite });
  } catch (error: any) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to remove favorites.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const url = searchParams.get('url');

    if (!id && !url) {
      return NextResponse.json(
        { error: 'Either id or url search parameter is required.' },
        { status: 400 }
      );
    }

    if (id) {
      await prisma.favorite.deleteMany({
        where: {
          id,
          userId: user.userId,
        },
      });
    } else if (url) {
      await prisma.favorite.deleteMany({
        where: {
          pinterestUrl: url,
          userId: user.userId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite.' },
      { status: 500 }
    );
  }
}
