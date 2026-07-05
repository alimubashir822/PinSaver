'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Download as DownloadIcon, Star, Film, ExternalLink } from 'lucide-react';

export default function FavoritesList() {
  const { favorites, toggleFavorite, triggerVideoDownload } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gradient tracking-tight">Starred Favorites</h1>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          View your starred videos. Bookmark your frequently used Pins for quick download access.
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => (
            <div 
              key={fav.id}
              className="glass-panel p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 sm:gap-4 border-white/5"
            >
              {/* Thumbnail preview */}
              <div className="w-11 h-16 sm:w-14 sm:h-24 bg-black/40 rounded-lg overflow-hidden border border-white/5 flex-shrink-0 relative">
                {fav.thumbnail ? (
                  <img 
                    src={fav.thumbnail} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Film className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 absolute inset-0 m-auto" />
                )}
              </div>

              {/* Metadata */}
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-sm font-bold text-gray-200 truncate pr-2">
                  {fav.title}
                </h4>
                <a
                  href={fav.pinterestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-gray-500 hover:text-primary transition-colors flex items-center gap-0.5 font-medium truncate"
                >
                  Pinterest source
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(fav)}
                  title="Remove from Starred"
                  className="p-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
                >
                  <Star className="w-4 h-4 fill-amber-500" />
                </button>
                <button
                  onClick={() => triggerVideoDownload(fav.videoUrl, fav.title)}
                  title="Download Video File"
                  className="bg-primary/10 hover:bg-primary text-primary hover:text-white p-2.5 border border-primary/25 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
                >
                  <DownloadIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border-dashed border-white/5">
          <div className="w-12 h-12 rounded-full bg-white/5 text-gray-500 flex items-center justify-center mx-auto">
            <Star className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-300">No favorites starred</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              Star your extracted videos in the Downloader panel to save them in this list for quick downloads later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
