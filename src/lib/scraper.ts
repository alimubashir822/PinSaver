import * as cheerio from 'cheerio';

export interface ExtractedMedia {
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  resolutions: { quality: string; url: string; width?: number; height?: number }[];
  mediaType?: 'video' | 'image';
}

// Recursively find all values for a specific key in a JSON tree
function findAllKeys(obj: any, keyName: string, results: any[] = []): any[] {
  if (!obj || typeof obj !== 'object') return results;
  
  if (obj[keyName] !== undefined) {
    results.push(obj[keyName]);
  }
  
  for (const key of Object.keys(obj)) {
    findAllKeys(obj[key], keyName, results);
  }
  
  return results;
}

// Recursively find all pinimg video URLs in a JSON tree
function findAllVideoUrls(obj: any, results: Set<string> = new Set()): Set<string> {
  if (!obj) return results;
  
  if (typeof obj === 'string') {
    if (obj.includes('pinimg.com') && (obj.includes('.mp4') || obj.includes('.m3u8') || obj.includes('/videos/'))) {
      results.add(obj);
    }
  } else if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      findAllVideoUrls(obj[key], results);
    }
  }
  
  return results;
}

export async function resolveUrl(url: string): Promise<string> {
  if (url.includes('pin.it') || url.includes('pinterest.com/co/')) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });
    return response.url;
  }
  return url;
}

export async function extractPinterestVideo(targetUrl: string): Promise<ExtractedMedia> {
  const resolvedUrl = await resolveUrl(targetUrl);
  
  const response = await fetch(resolvedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Pinterest page (Status ${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  let title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Pinterest Video';
  let description = $('meta[property="og:description"]').attr('content') || '';
  let thumbnail = $('meta[property="og:image"]').attr('content') || '';
  
  let videoUrl = '';
  let mediaType: 'video' | 'image' = 'video';
  const resolutionsMap = new Map<string, { quality: string; url: string; width?: number; height?: number }>();
  
  // Accumulate parsed JSON datasets from different script tag formats
  const jsonObjects: any[] = [];

  // 1. Check standard JSON script configurations
  const selectors = ['#__PWA_DATA__', '#__PWS_INITIAL_PROPS__', 'script[type="application/json"]'];
  for (const selector of selectors) {
    $(selector).each((_, element) => {
      try {
        const text = $(element).html();
        if (text) jsonObjects.push(JSON.parse(text));
      } catch (e) {}
    });
  }

  // 2. Parse JS relay registers (e.g. window.__PWS_RELAY_REGISTER_COMPLETED_REQUEST__)
  $('script').each((_, element) => {
    try {
      const text = $(element).html();
      if (text && text.includes('__PWS_RELAY_REGISTER_COMPLETED_REQUEST__')) {
        const firstComma = text.indexOf(',');
        const lastParen = text.lastIndexOf(');');
        if (firstComma > -1 && lastParen > -1) {
          const jsonStr = text.substring(firstComma + 1, lastParen).trim();
          jsonObjects.push(JSON.parse(jsonStr));
        }
      }
    } catch (e) {}
  });

  // Track image candidates if we determine it's an image Pin
  let fallbackImageUrl = '';
  const imageResolutionsMap = new Map<string, { quality: string; url: string; width?: number; height?: number }>();

  // Process all gathered JSON states
  for (const data of jsonObjects) {
    // A. Parse video resolutions
    const videoLists = findAllKeys(data, 'video_list');
    for (const vList of videoLists) {
      if (typeof vList === 'object' && vList !== null) {
        for (const key of Object.keys(vList)) {
          const item = vList[key];
          if (item && item.url) {
            const match = key.match(/V_(\d+P)/i);
            const quality = match ? match[1].toLowerCase() : key.replace('V_', '').toLowerCase();
            
            resolutionsMap.set(quality, {
              quality,
              url: item.url,
              width: item.width,
              height: item.height
            });
            
            if (!videoUrl || quality.includes('720') || quality.includes('1080')) {
              videoUrl = item.url;
            }
          }
        }
      }
    }

    // B. Refine Title, Description, and Thumbnail
    const pins = findAllKeys(data, 'pins');
    for (const pinContainer of pins) {
      if (typeof pinContainer === 'object' && pinContainer !== null) {
        const pinKeys = Object.keys(pinContainer);
        if (pinKeys.length > 0) {
          const pin = pinContainer[pinKeys[0]];
          if (pin) {
            if (pin.title && title === 'Pinterest Video') title = pin.title;
            if (pin.description && !description) description = pin.description;
            if (pin.images && pin.images.originals && pin.images.originals.url && !thumbnail) {
              thumbnail = pin.images.originals.url;
            }
          }
        }
      }
    }
    
    // Check v3GetPinQueryv2 top-level data representation for details
    const getPinQueries = findAllKeys(data, 'v3GetPinQueryv2');
    for (const q of getPinQueries) {
      if (q && q.data) {
        const pinData = q.data;
        if (pinData.title && title === 'Pinterest Video') title = pinData.title;
        if (pinData.description && !description) description = pinData.description;
        if (pinData.images_orig && pinData.images_orig.url && !thumbnail) {
          thumbnail = pinData.images_orig.url;
        }
      }
    }

    // C. Search direct pinimg video URL keywords
    const allUrls = findAllVideoUrls(data);
    allUrls.forEach(url => {
      if (url.endsWith('.mp4')) {
        let quality = 'default';
        if (url.includes('_720w')) quality = '720p';
        else if (url.includes('_1080w')) quality = '1080p';
        else if (url.includes('_480w')) quality = '480p';
        else if (url.includes('_360w')) quality = '360p';
        
        resolutionsMap.set(quality, { quality, url });
        
        // Prioritize direct MP4 links over HLS stream files
        if (!videoUrl || videoUrl.endsWith('.m3u8') || (quality.includes('720') && !videoUrl.includes('1080'))) {
          videoUrl = url;
        }
      } else if (url.endsWith('.m3u8') && !resolutionsMap.has('hls')) {
        resolutionsMap.set('hls', { quality: 'hls', url });
        if (!videoUrl) videoUrl = url;
      }
    });

    // D. Extract image variants in case this is an image Pin
    const imageKeys = ['images_orig', 'images_736x', 'images_564x', 'images_474x'];
    for (const key of imageKeys) {
      const imgs = findAllKeys(data, key);
      for (const img of imgs) {
        if (img && img.url) {
          const cleanKey = key.replace('images_', '');
          if (!imageResolutionsMap.has(cleanKey)) {
            imageResolutionsMap.set(cleanKey, {
              quality: cleanKey === 'orig' ? 'original' : cleanKey,
              url: img.url,
              width: img.width,
              height: img.height
            });
            if (cleanKey === 'orig') {
              fallbackImageUrl = img.url;
            }
          }
        }
      }
    }
  }

  // Open Graph meta tags fallback for videos
  if (!videoUrl) {
    const ogVideo = $('meta[property="og:video"]').attr('content') || 
                    $('meta[property="og:video:secure_url"]').attr('content') ||
                    $('meta[name="twitter:player"]').attr('content');
                    
    if (ogVideo) {
      videoUrl = ogVideo;
      resolutionsMap.set('default', { quality: 'default', url: ogVideo });
    }
  }

  // HTML raw string match fallback for videos
  if (!videoUrl) {
    const mp4Regex = /https:\/\/v1\.pinimg\.com\/videos\/mc\/[a-zA-Z0-9_\/.-]+\.mp4/g;
    const m3u8Regex = /https:\/\/v1\.pinimg\.com\/videos\/mc\/hls\/[a-zA-Z0-9_\/.-]+\.m3u8/g;
    
    const mp4Matches = html.match(mp4Regex);
    const m3u8Matches = html.match(m3u8Regex);

    if (mp4Matches && mp4Matches.length > 0) {
      videoUrl = mp4Matches[0];
      resolutionsMap.set('default', { quality: 'default', url: mp4Matches[0] });
    } else if (m3u8Matches && m3u8Matches.length > 0) {
      videoUrl = m3u8Matches[0];
      resolutionsMap.set('hls', { quality: 'hls', url: m3u8Matches[0] });
    }
  }

  // E. Fallback: If no video is found, treat as an image Pin!
  if (!videoUrl) {
    if (fallbackImageUrl || thumbnail) {
      videoUrl = fallbackImageUrl || thumbnail;
      mediaType = 'image';
      
      // If we don't have detailed image resolutions, create a default one
      if (imageResolutionsMap.size === 0) {
        resolutionsMap.set('original', { quality: 'original', url: videoUrl });
      } else {
        imageResolutionsMap.forEach((val, key) => {
          resolutionsMap.set(key, val);
        });
      }
    }
  }

  if (!videoUrl) {
    throw new Error('Could not find any video or image media on this Pinterest page.');
  }

  title = title.trim();
  description = description.trim();

  return {
    title,
    description,
    thumbnail,
    videoUrl,
    mediaType,
    resolutions: Array.from(resolutionsMap.values())
  };
}
