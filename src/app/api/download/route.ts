import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'pinterest-video';

  if (!videoUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  // Validate that the URL points to the authorized Pinterest CDN
  try {
    const parsed = new URL(videoUrl);
    if (!parsed.hostname.endsWith('pinimg.com')) {
      return new NextResponse('Forbidden: Only pinimg.com URLs are allowed.', { status: 403 });
    }
  } catch (e) {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  try {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      return new NextResponse(`Failed to fetch media from CDN (Status ${response.status})`, { status: 502 });
    }

    const contentType = response.headers.get('Content-Type') || 'video/mp4';
    const isImage = contentType.startsWith('image/');
    const ext = isImage ? (contentType.includes('png') ? '.png' : '.jpg') : '.mp4';

    // Clean up filename to prevent header injection or broken filenames
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_').trim() || 'pinterest_media';
    const filename = `${cleanTitle}${ext}`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Download proxy error:', error);
    return new NextResponse('Internal server error during video stream proxying.', { status: 500 });
  }
}
