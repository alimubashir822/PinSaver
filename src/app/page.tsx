'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import PinterestDownloader from '@/components/PinterestDownloader';
import BatchDownloader from '@/components/BatchDownloader';
import HistoryList from '@/components/HistoryList';
import FavoritesList from '@/components/FavoritesList';
import CollectionsView from '@/components/CollectionsView';
import ExtensionGuide from '@/components/ExtensionGuide';

export default function DashboardHome() {
  const { activeTab, loadingUser } = useApp();

  // Loading skeleton screen on app start
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-gray-400">Loading PinSaver Dashboard...</p>
      </div>
    );
  }

  // Render view depending on navigation state
  function renderActiveView() {
    switch (activeTab) {
      case 'downloader':
        return <PinterestDownloader />;
      case 'batch':
        return <BatchDownloader />;
      case 'history':
        return <HistoryList />;
      case 'favorites':
        return <FavoritesList />;
      case 'collections':
        return <CollectionsView />;
      case 'extension':
        return <ExtensionGuide />;
      default:
        return <PinterestDownloader />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10 bg-transparent">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="h-full max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}
