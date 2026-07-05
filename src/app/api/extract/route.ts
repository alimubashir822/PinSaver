import { NextResponse } from 'next/server';
import { extractPinterestVideo, resolveUrl } from '@/lib/scraper';

function isPinterestUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return (
      host.endsWith('pinterest.com') ||
      host.endsWith('pin.it') ||
      host.includes('pinterest.co') || // Matches pinterest.co.uk, pinterest.com.mx, etc.
      host.includes('pinterest.ca') ||
      host.includes('pinterest.fr') ||
      host.includes('pinterest.de') ||
      host.includes('pinterest.it') ||
      host.includes('pinterest.es')
    );
  } catch (e) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required.' },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();
    if (!isPinterestUrl(trimmedUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL. Please provide a valid Pinterest Pin or short link (pin.it).' },
        { status: 400 }
      );
    }

    // Attempt to scrape
    const media = await extractPinterestVideo(trimmedUrl);
    
    return NextResponse.json(media);
  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract video. Make sure the Pin contains a video and is publicly accessible.' },
      { status: 500 }
    );
  }
}
