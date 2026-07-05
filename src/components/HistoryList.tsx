'use client';

import React from 'react';
import { useApp, Download } from '@/context/AppContext';
import { Download as DownloadIcon, FolderHeart, Calendar, Film, ExternalLink } from 'lucide-react';

function groupDownloads(downloads: Download[]) {
  const groups: { [key: string]: Download[] } = {
    "Today's Downloads": [],
    "Yesterday": [],
    "Last Week": [],
    "Older": [],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  downloads.forEach((dl) => {
    const dlDate = new Date(dl.downloadedAt);
    dlDate.setHours(0, 0, 0, 0);

    if (dlDate.getTime() === today.getTime()) {
      groups["Today's Downloads"].push(dl);
    } else if (dlDate.getTime() === yesterday.getTime()) {
      groups["Yesterday"].push(dl);
    } else if (dlDate.getTime() >= lastWeek.getTime()) {
      groups["Last Week"].push(dl);
    } else {
      groups["Older"].push(dl);
    }
  });

  return Object.keys(groups).reduce((acc, key) => {
    if (groups[key].length > 0) acc[key] = groups[key];
    return acc;
  }, {} as { [key: string]: Download[] });
}

export default function HistoryList() {
  const { downloads, collections, linkDownloadToCollection, triggerVideoDownload } = useApp();

  const grouped = groupDownloads(downloads);
  const groupKeys = Object.keys(grouped);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gradient tracking-tight">Download History</h1>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Manage your past downloads and organize them into collections. Click Get Link to re-download.
        </p>
      </div>

      {downloads.length > 0 ? (
        <div className="space-y-8">
          {groupKeys.map((groupName) => (
            <div key={groupName} className="space-y-4">
              {/* Group Header */}
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {groupName}
              </h3>

              {/* Downloads list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grouped[groupName].map((dl) => (
                  <div 
                    key={dl.id}
                    className="glass-panel p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 sm:gap-4 border-white/5"
                  >
                    {/* Thumbnail preview */}
                    <div className="w-11 h-16 sm:w-14 sm:h-24 bg-black/40 rounded-lg overflow-hidden border border-white/5 flex-shrink-0 relative group">
                      {dl.thumbnail ? (
                        <img 
                          src={dl.thumbnail} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 absolute inset-0 m-auto" />
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-gray-200 truncate pr-2">
                          {dl.title}
                        </h4>
                        <a
                          href={dl.pinterestUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-gray-500 hover:text-primary transition-colors flex items-center gap-0.5 font-medium truncate"
                        >
                          Pinterest source
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      {/* Collections Linker dropdown */}
                      <div className="flex items-center gap-1.5">
                        <FolderHeart className="w-3.5 h-3.5 text-primary/70" />
                        <select
                          value={dl.collectionId || ''}
                          onChange={(e) => linkDownloadToCollection(dl.id, e.target.value || null)}
                          className="bg-white/5 border border-white/5 text-[11px] text-gray-300 rounded px-1.5 py-1 focus:outline-none cursor-pointer hover:bg-white/10"
                        >
                          <option value="" className="bg-[#0b090f]">Add to Collection...</option>
                          {collections.map((c) => (
                            <option key={c.id} value={c.id} className="bg-[#0b090f]">
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Download Trigger */}
                    <button
                      onClick={() => triggerVideoDownload(dl.videoUrl, dl.title)}
                      title="Download Video File"
                      className="bg-primary/10 hover:bg-primary text-primary hover:text-white p-2.5 border border-primary/25 rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/5 hover:scale-105"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border-dashed border-white/5">
          <div className="w-12 h-12 rounded-full bg-white/5 text-gray-500 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-300">No downloads found</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              When you download videos, your download history logs will appear here categorized by date.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
