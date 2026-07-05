'use client';

import React, { useState } from 'react';
import { useApp, Download, Collection } from '@/context/AppContext';
import { 
  FolderHeart, 
  FolderPlus, 
  Trash2, 
  ArrowLeft, 
  Film, 
  Download as DownloadIcon, 
  FolderOpen,
  FolderClosed,
  X 
} from 'lucide-react';

export default function CollectionsView() {
  const { 
    collections, 
    downloads, 
    createCollection, 
    deleteCollection, 
    linkDownloadToCollection,
    triggerVideoDownload 
  } = useApp();

  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  // Group downloads linked to selected collection
  // Note: if user is guest, we filter the local downloads state by checking download.collectionId
  const collectionDownloads = selectedCollection 
    ? downloads.filter(d => d.collectionId === selectedCollection.id)
    : [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    await createCollection(newCollectionName.trim());
    setNewCollectionName('');
  }

  // Back button from collection details view
  if (selectedCollectionId && selectedCollection) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => setSelectedCollectionId(null)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collections
        </button>

        {/* Collection details header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-gray-100">{selectedCollection.name}</h2>
              <p className="text-xs text-gray-400">Contains {collectionDownloads.length} videos</p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (confirm(`Are you sure you want to delete the "${selectedCollection.name}" collection? Your videos will not be deleted, they will just be unlinked.`)) {
                await deleteCollection(selectedCollection.id);
                setSelectedCollectionId(null);
              }
            }}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/25 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Collection
          </button>
        </div>

        {/* Items in collection list */}
        {collectionDownloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collectionDownloads.map((dl) => (
              <div 
                key={dl.id}
                className="glass-panel p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 sm:gap-4 border-white/5"
              >
                {/* Thumbnail */}
                <div className="w-11 h-16 sm:w-12 sm:h-20 bg-black/40 rounded-lg overflow-hidden border border-white/5 flex-shrink-0 relative">
                  {dl.thumbnail ? (
                    <img 
                      src={dl.thumbnail} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Film className="w-4 h-4 text-gray-600 absolute inset-0 m-auto" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-200 truncate pr-2">
                    {dl.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">
                    {dl.pinterestUrl}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => linkDownloadToCollection(dl.id, null)}
                    title="Remove from Collection"
                    className="p-2.5 bg-white/5 text-gray-400 hover:text-red-400 border border-white/5 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => triggerVideoDownload(dl.videoUrl, dl.title)}
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
          /* Empty collection state */
          <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border-dashed border-white/5">
            <div className="w-12 h-12 rounded-full bg-white/5 text-gray-500 flex items-center justify-center mx-auto">
              <FolderClosed className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-300">This collection is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Go to the Downloader or My Downloads tab, and associate videos with this collection to organize them.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gradient tracking-tight">My Collections</h1>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Create collections to organize your recipes, DIY projects, travel clips, and fashion downloads.
        </p>
      </div>

      {/* Create collection form */}
      <form onSubmit={handleCreate} className="glass-panel p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Enter collection name (e.g. Travel Inspiration, DIY Crafts)"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm glass-input font-medium w-full"
        />
        <button
          type="submit"
          disabled={!newCollectionName.trim()}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md shadow-primary/25 w-full sm:w-auto"
        >
          <FolderPlus className="w-4 h-4" />
          Create
        </button>
      </form>

      {/* Grid of collections */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {collections.map((c) => {
            // Count items inside this collection
            const itemsCount = downloads.filter(d => d.collectionId === c.id).length;
            
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCollectionId(c.id)}
                className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between aspect-video cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <FolderClosed className="w-10 h-10 text-primary" />
                  <span className="text-[10px] font-bold bg-white/5 border border-white/5 text-gray-400 px-2.5 py-0.5 rounded-full">
                    {itemsCount} {itemsCount === 1 ? 'Video' : 'Videos'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-200 group-hover:text-white truncate">{c.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Click folder to open</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty grid state */
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border-dashed border-white/5">
          <div className="w-12 h-12 rounded-full bg-white/5 text-gray-500 flex items-center justify-center mx-auto">
            <FolderHeart className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-300">No collections created</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              Create your first custom collection folder using the input bar above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
