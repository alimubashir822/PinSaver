'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Download, 
  Layers, 
  History, 
  Star, 
  FolderHeart, 
  Globe, 
  User, 
  ChevronRight,
  X
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    downloads, 
    favorites, 
    collections, 
    queue, 
    user,
    isSidebarOpen,
    setIsSidebarOpen
  } = useApp();

  const navItems = [
    {
      id: 'downloader',
      label: 'Single Downloader',
      icon: Download,
      count: null,
    },
    {
      id: 'batch',
      label: 'Batch Downloader',
      icon: Layers,
      count: queue.length > 0 ? queue.length : null,
    },
    {
      id: 'history',
      label: 'My Downloads',
      icon: History,
      count: downloads.length > 0 ? downloads.length : null,
    },
    {
      id: 'favorites',
      label: 'Starred Favorites',
      icon: Star,
      count: favorites.length > 0 ? favorites.length : null,
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: FolderHeart,
      count: collections.length > 0 ? collections.length : null,
    },
    {
      id: 'extension',
      label: 'Chrome Extension',
      icon: Globe,
      count: null,
    },
  ] as const;

  return (
    <>
      {/* Backdrop backdrop overlay (mobile only) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Aside Panel */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-[#0b090f] p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:h-[calc(100vh-69px)] lg:flex lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Mobile Menu Header with close button */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 lg:hidden mb-4">
            <span className="font-bold text-gradient text-sm">Navigation</span>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-md shadow-primary/5'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile Sync Indicator */}
        <div className="glass-panel p-4 rounded-xl text-xs space-y-2 border border-white/5 mt-auto">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-gray-300">
              {user ? 'Account Synced' : 'Guest Session'}
            </span>
          </div>
          <p className="text-gray-500 leading-relaxed">
            {user
              ? 'Your download logs, collections, and starred items are synced with the database.'
              : 'Register or sign in to persist your history and collections across multiple sessions.'}
          </p>
        </div>
      </aside>
    </>
  );
}
