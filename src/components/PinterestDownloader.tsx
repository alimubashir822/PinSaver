'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ExtractedMedia } from '@/lib/scraper';
import { 
  Download, 
  Clipboard, 
  Loader2, 
  Play, 
  Star, 
  FolderPlus, 
  Check, 
  ExternalLink,
  Info 
} from 'lucide-react';

export default function PinterestDownloader() {
  const { 
    addDownload, 
    toggleFavorite, 
    isFavorite, 
    collections, 
    linkDownloadToCollection,
    triggerVideoDownload 
  } = useApp();

  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [media, setMedia] = useState<ExtractedMedia | null>(null);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [successLinkMsg, setSuccessLinkMsg] = useState(false);
  const [clipboardUrl, setClipboardUrl] = useState('');

  // 1. Detect url parameter on mount (from browser extension)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      if (urlParam) {
        setInputUrl(urlParam);
        handleExtract(urlParam);
      }
    }
  }, []);

  // 2. Poll Clipboard for Pinterest URL (Passive UX)
  useEffect(() => {
    async function checkClipboard() {
      try {
        if (!navigator.clipboard) return;
        const text = await navigator.clipboard.readText();
        if (
          text && 
          (text.includes('pinterest.com') || text.includes('pin.it')) && 
          text !== inputUrl
        ) {
          setClipboardUrl(text.trim());
        }
      } catch (e) {
        // Fail silently if clipboard permission is denied
      }
    }
    
    // Check on focus
    window.addEventListener('focus', checkClipboard);
    checkClipboard();
    return () => window.removeEventListener('focus', checkClipboard);
  }, [inputUrl]);

  async function handleExtract(urlToExtract: string = inputUrl) {
    if (!urlToExtract.trim()) return;
    setLoading(true);
    setError('');
    setMedia(null);
    setSelectedCollection('');

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToExtract }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract video details.');
      }

      setMedia(data);

      // Save to download logs
      await addDownload(urlToExtract, data.title, data.thumbnail, data.videoUrl);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during extraction.');
    } finally {
      setLoading(false);
    }
  }

  // Handle adding to collection
  async function handleLinkCollection(collectionId: string) {
    if (!media || !collectionId) return;
    
    // Find the latest download record matching this pinterest URL to link it
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      const match = data.downloads?.find((d: any) => d.pinterestUrl === inputUrl);
      
      if (match) {
        await linkDownloadToCollection(match.id, collectionId === 'none' ? null : collectionId);
        setSelectedCollection(collectionId);
        setSuccessLinkMsg(true);
        setTimeout(() => setSuccessLinkMsg(false), 2000);
      }
    } catch (e) {
      console.error('Failed to link collection:', e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Introduction Card */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gradient tracking-tight">Pinterest Video Downloader</h1>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Paste any Pinterest video URL or short link below to extract direct download streams. No registration required.
        </p>
      </div>

      {/* Input Box Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Paste Pinterest link (e.g., https://www.pinterest.com/pin/1234567/)"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full pl-4 pr-12 py-3.5 rounded-xl text-sm glass-input font-medium"
            />
            {navigator.clipboard && (
              <button
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    setInputUrl(text);
                    setClipboardUrl('');
                  } catch (e) {
                    alert('Clipboard access denied. Please paste manually.');
                  }
                }}
                title="Paste from clipboard"
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Clipboard className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleExtract()}
            disabled={loading || !inputUrl.trim()}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md shadow-primary/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Download className="w-4.5 h-4.5" />
                Extract Video
              </>
            )}
          </button>
        </div>

        {/* Clipboard Suggestion Banner */}
        {clipboardUrl && (
          <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Info className="w-4 h-4 text-primary" />
              <span className="truncate max-w-sm md:max-w-md">
                Found Pinterest link in clipboard: <strong className="text-white">{clipboardUrl}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setInputUrl(clipboardUrl);
                handleExtract(clipboardUrl);
                setClipboardUrl('');
              }}
              className="text-xs bg-primary/20 hover:bg-primary text-white border border-primary/30 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Paste & Downloader
            </button>
          </div>
        )}
      </div>

      {/* Error Output */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-sm rounded-xl text-center leading-relaxed">
          {error}
        </div>
      )}

      {/* Details Display Panel */}
      {media && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 glass-panel p-5 sm:p-8 rounded-2xl animate-in zoom-in-95 duration-200 border-white/10 shadow-primary/5 shadow-xl">
          {/* Left Column: Player Preview */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-[9/16] max-h-[320px] sm:max-h-[440px] lg:max-h-[480px] w-full bg-black/60 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
              {media.mediaType === 'image' ? (
                <img
                  src={media.videoUrl}
                  alt={media.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={media.videoUrl}
                  poster={media.thumbnail}
                  controls
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Instant Download Button */}
            <button
              onClick={() => {
                if (media.videoUrl.endsWith('.m3u8')) {
                  alert('This format is an HLS playlist (.m3u8) used for adaptive streaming. To download the actual video file, please select an MP4 format from the Available Formats list.');
                  return;
                }
                triggerVideoDownload(media.videoUrl, media.title);
              }}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-primary/25"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              {media.mediaType === 'image' ? 'Download Original Image' : 'Download Video (MP4)'}
            </button>
          </div>

          {/* Right Column: Metadata & Format Links */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Star bookmark button */}
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-100 leading-snug line-clamp-3">{media.title}</h2>
                <button
                  onClick={() => toggleFavorite({
                    pinterestUrl: inputUrl,
                    title: media.title,
                    thumbnail: media.thumbnail,
                    videoUrl: media.videoUrl
                  })}
                  title={isFavorite(inputUrl) ? 'Remove from favorites' : 'Add to favorites'}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isFavorite(inputUrl)
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      : 'bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Star className={`w-5 h-5 ${isFavorite(inputUrl) ? 'fill-amber-500' : ''}`} />
                </button>
              </div>

              {media.description && (
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">{media.description}</p>
              )}
            </div>

            {/* Organize into Collections */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-primary" />
                Add to Collection
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCollection}
                  onChange={(e) => handleLinkCollection(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/5 text-gray-300 text-sm px-3 py-2 rounded-xl focus:outline-none cursor-pointer focus:border-primary/50"
                >
                  <option value="" disabled>-- Select a Collection --</option>
                  <option value="none" className="bg-[#0b090f]">None (Unlink)</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0b090f]">
                      {c.name}
                    </option>
                  ))}
                </select>
                {successLinkMsg && (
                  <span className="flex items-center gap-1 text-xs text-green-400 font-semibold px-2">
                    <Check className="w-3.5 h-3.5" />
                    Updated
                  </span>
                )}
              </div>
            </div>

            {/* Quality list downloads */}
            <div className="space-y-3.5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Available Formats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {media.resolutions.map((res) => (
                  <div 
                    key={res.quality}
                    className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="text-xs">
                      <p className="font-bold text-white uppercase">{res.quality}</p>
                      {res.width && res.height && (
                        <p className="text-gray-400 mt-0.5">{res.width}x{res.height}</p>
                      )}
                    </div>
                    <button
                      onClick={() => triggerVideoDownload(res.url, media.title)}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-primary/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Pin link */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-primary" />
                Format: {media.mediaType === 'image' ? 'Image (JPEG / PNG)' : 'MP4 (H.264 video compression)'}
              </span>
              <a
                href={inputUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-gray-400"
              >
                Open on Pinterest
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
