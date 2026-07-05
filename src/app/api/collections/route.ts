import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET: Fetch all user collections with nested downloads
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ collections: [] });
    }

    const collections = await prisma.collection.findMany({
      where: { userId: user.userId },
      include: {
        downloads: {
          orderBy: { downloadedAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ collections });
  } catch (error: any) {
    console.error('Fetch collections error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections.' },
      { status: 500 }
    );
  }
}

// POST: Create a new collection
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to create collections.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Collection name is required.' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();

    // Check if duplicate name exists for this user
    const existing = await prisma.collection.findFirst({
      where: {
        userId: user.userId,
        name: cleanName,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A collection with this name already exists.' },
        { status: 409 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        name: cleanName,
        userId: user.userId,
      },
    });

    return NextResponse.json({ success: true, collection });
  } catch (error: any) {
    console.error('Create collection error:', error);
    return NextResponse.json(
      { error: 'Failed to create collection.' },
      { status: 500 }
    );
  }
}

// PUT: Add or remove a download to/from a collection
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to update collection links.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { downloadId, collectionId } = body;

    if (!downloadId) {
      return NextResponse.json(
        { error: 'downloadId is required.' },
        { status: 400 }
      );
    }

    // Verify download belongs to user
    const download = await prisma.download.findFirst({
      where: {
        id: downloadId,
        userId: user.userId,
      },
    });

    if (!download) {
      return NextResponse.json(
        { error: 'Download record not found or access denied.' },
        { status: 404 }
      );
    }

    // Verify collection belongs to user if collectionId is provided
    if (collectionId) {
      const collection = await prisma.collection.findFirst({
        where: {
          id: collectionId,
          userId: user.userId,
        },
      });

      if (!collection) {
        return NextResponse.json(
          { error: 'Collection not found or access denied.' },
          { status: 404 }
        );
      }
    }

    // Update download
    const updated = await prisma.download.update({
      where: { id: downloadId },
      data: {
        collectionId: collectionId || null,
      },
    });

    return NextResponse.json({ success: true, download: updated });
  } catch (error: any) {
    console.error('Update collection links error:', error);
    return NextResponse.json(
      { error: 'Failed to link download to collection.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a collection
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to delete collections.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id query parameter is required.' },
        { status: 400 }
      );
    }

    // Prisma relation onDelete: SetNull ensures nested downloads are NOT deleted,
    // they just have their collectionId set to null.
    await prisma.collection.deleteMany({
      where: {
        id,
        userId: user.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete collection error:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection.' },
      { status: 500 }
    );
  }
}
