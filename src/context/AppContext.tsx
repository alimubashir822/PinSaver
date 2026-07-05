'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Download {
  id: string;
  pinterestUrl: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  downloadedAt: string;
  collectionId?: string | null;
}

export interface Favorite {
  id: string;
  pinterestUrl: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  createdAt?: string;
}

export interface Collection {
  id: string;
  name: string;
  downloads?: Download[];
  createdAt?: string;
}

export interface QueueItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  status: 'idle' | 'extracting' | 'downloading' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

type TabType = 'downloader' | 'batch' | 'history' | 'favorites' | 'collections' | 'extension';

interface AppContextType {
  user: User | null;
  loadingUser: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  downloads: Download[];
  favorites: Favorite[];
  collections: Collection[];
  queue: QueueItem[];
  addDownload: (pinterestUrl: string, title: string, thumbnail: string, videoUrl: string) => Promise<void>;
  toggleFavorite: (media: { pinterestUrl: string; title: string; thumbnail: string; videoUrl: string }) => Promise<void>;
  isFavorite: (url: string) => boolean;
  createCollection: (name: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  linkDownloadToCollection: (downloadId: string, collectionId: string | null) => Promise<void>;
  addToQueue: (urls: string[]) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  processQueue: () => Promise<void>;
  isProcessingQueue: boolean;
  loginUser: (user: User) => void;
  logoutUser: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  triggerVideoDownload: (url: string, title: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('downloader');
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Initial Auth Check on Mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Mount auth check failed:', err);
      } finally {
        setLoadingUser(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Fetch User Data or Load LocalStorage
  useEffect(() => {
    if (loadingUser) return;
    
    if (user) {
      // Sync guest data if any exists in localStorage
      syncGuestDataOnLogin();
      fetchUserData();
    } else {
      // Load guest data from LocalStorage
      const localDls = localStorage.getItem('pinsaver-downloads');
      const localFavs = localStorage.getItem('pinsaver-favorites');
      const localColls = localStorage.getItem('pinsaver-collections');
      
      setDownloads(localDls ? JSON.parse(localDls) : []);
      setFavorites(localFavs ? JSON.parse(localFavs) : []);
      
      // Default guest collections
      if (localColls) {
        setCollections(JSON.parse(localColls));
      } else {
        const defaultColls = [
          { id: 'c1', name: 'Recipes', downloads: [] },
          { id: 'c2', name: 'DIY', downloads: [] },
          { id: 'c3', name: 'Travel', downloads: [] },
          { id: 'c4', name: 'Fashion', downloads: [] },
        ];
        setCollections(defaultColls);
        localStorage.setItem('pinsaver-collections', JSON.stringify(defaultColls));
      }
    }
  }, [user, loadingUser]);

  // Fetch logged in data
  async function fetchUserData() {
    try {
      const [historyRes, favoritesRes, collectionsRes] = await Promise.all([
        fetch('/api/history'),
        fetch('/api/favorites'),
        fetch('/api/collections'),
      ]);

      const historyData = await historyRes.json();
      const favoritesData = await favoritesRes.json();
      const collectionsData = await collectionsRes.json();

      setDownloads(historyData.downloads || []);
      setFavorites(favoritesData.favorites || []);
      setCollections(collectionsData.collections || []);
    } catch (err) {
      console.error('Failed to fetch user database records:', err);
    }
  }

  // Sync Guest Data to Database on Login
  async function syncGuestDataOnLogin() {
    const localDls = localStorage.getItem('pinsaver-downloads');
    const localFavs = localStorage.getItem('pinsaver-favorites');
    
    if (localDls) {
      try {
        const parsedDls = JSON.parse(localDls);
        if (parsedDls.length > 0) {
          await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sync: true, downloads: parsedDls }),
          });
        }
        localStorage.removeItem('pinsaver-downloads');
      } catch (err) {
        console.error('History sync failed:', err);
      }
    }

    if (localFavs) {
      try {
        const parsedFavs = JSON.parse(localFavs);
        for (const fav of parsedFavs) {
          await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fav),
          });
        }
        localStorage.removeItem('pinsaver-favorites');
      } catch (err) {
        console.error('Favorites sync failed:', err);
      }
    }
  }

  const refreshUserData = async () => {
    if (user) await fetchUserData();
  };

  // Add standard download
  const addDownload = async (pinterestUrl: string, title: string, thumbnail: string, videoUrl: string) => {
    if (user) {
      try {
        const res = await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pinterestUrl, title, thumbnail, videoUrl }),
        });
        if (res.ok) {
          fetchUserData();
        }
      } catch (e) {
        console.error('Error adding download to DB:', e);
      }
    } else {
      const newDl: Download = {
        id: Math.random().toString(36).substring(7),
        pinterestUrl,
        title,
        thumbnail,
        videoUrl,
        downloadedAt: new Date().toISOString(),
      };
      const updated = [newDl, ...downloads];
      setDownloads(updated);
      localStorage.setItem('pinsaver-downloads', JSON.stringify(updated));
    }
  };

  // Toggle favorite
  const toggleFavorite = async (media: { pinterestUrl: string; title: string; thumbnail: string; videoUrl: string }) => {
    if (user) {
      const existing = favorites.find(fav => fav.pinterestUrl === media.pinterestUrl);
      try {
        if (existing) {
          await fetch(`/api/favorites?id=${existing.id}`, { method: 'DELETE' });
        } else {
          await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(media),
          });
        }
        fetchUserData();
      } catch (e) {
        console.error('Error toggling favorite in DB:', e);
      }
    } else {
      const existingIndex = favorites.findIndex(fav => fav.pinterestUrl === media.pinterestUrl);
      let updated: Favorite[];
      if (existingIndex > -1) {
        updated = favorites.filter(fav => fav.pinterestUrl !== media.pinterestUrl);
      } else {
        const newFav: Favorite = {
          id: Math.random().toString(36).substring(7),
          ...media,
        };
        updated = [newFav, ...favorites];
      }
      setFavorites(updated);
      localStorage.setItem('pinsaver-favorites', JSON.stringify(updated));
    }
  };

  const isFavorite = (url: string): boolean => {
    return favorites.some(fav => fav.pinterestUrl === url);
  };

  // Create custom collection
  const createCollection = async (name: string) => {
    if (user) {
      try {
        const res = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          fetchUserData();
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to create collection.');
        }
      } catch (e) {
        console.error('Error creating collection:', e);
      }
    } else {
      const newColl: Collection = {
        id: Math.random().toString(36).substring(7),
        name,
        downloads: [],
      };
      // Check duplicate for guest
      if (collections.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert('A collection with this name already exists.');
        return;
      }
      const updated = [...collections, newColl];
      setCollections(updated);
      localStorage.setItem('pinsaver-collections', JSON.stringify(updated));
    }
  };

  // Delete collection
  const deleteCollection = async (id: string) => {
    if (user) {
      try {
        const res = await fetch(`/api/collections?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchUserData();
        }
      } catch (e) {
        console.error('Error deleting collection:', e);
      }
    } else {
      const updated = collections.filter(c => c.id !== id);
      setCollections(updated);
      localStorage.setItem('pinsaver-collections', JSON.stringify(updated));
    }
  };

  // Link download record to collection
  const linkDownloadToCollection = async (downloadId: string, collectionId: string | null) => {
    if (user) {
      try {
        const res = await fetch('/api/collections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ downloadId, collectionId }),
        });
        if (res.ok) {
          fetchUserData();
        }
      } catch (e) {
        console.error('Error linking to collection:', e);
      }
    } else {
      // Find download and update its collectionId locally
      const updatedDls = downloads.map(dl => 
        dl.id === downloadId ? { ...dl, collectionId } : dl
      );
      setDownloads(updatedDls);
      localStorage.setItem('pinsaver-downloads', JSON.stringify(updatedDls));

      // Update nested collection objects representation too
      const updatedColls = collections.map(c => {
        // Remove from old collections
        const newDls = (c.downloads || []).filter(d => d.id !== downloadId);
        // Add to new if matches
        if (c.id === collectionId) {
          const dlItem = downloads.find(d => d.id === downloadId);
          if (dlItem) newDls.push({ ...dlItem, collectionId });
        }
        return { ...c, downloads: newDls };
      });
      setCollections(updatedColls);
      localStorage.setItem('pinsaver-collections', JSON.stringify(updatedColls));
    }
  };

  // 3. Batch Downloader Queue Logic
  const addToQueue = (urls: string[]) => {
    const newItems: QueueItem[] = urls.map(url => ({
      id: Math.random().toString(36).substring(7),
      url,
      title: 'Pending Extraction...',
      thumbnail: '',
      status: 'idle',
      progress: 0,
    }));
    setQueue(prev => [...prev, ...newItems]);
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  // Helper to trigger direct downloads via the proxy route
  const triggerVideoDownload = (url: string, title: string) => {
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${title.replace(/\s+/g, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const processQueue = async () => {
    if (isProcessingQueue || queue.length === 0) return;
    setIsProcessingQueue(true);

    // Filter out items that are already completed
    const itemsToProcess = queue.filter(item => item.status === 'idle' || item.status === 'failed');

    for (const item of itemsToProcess) {
      // 1. Mark as Extracting
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'extracting', progress: 10 } : q));

      try {
        // Call extract API
        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: item.url }),
        });

        if (!extractRes.ok) {
          const errData = await extractRes.json();
          throw new Error(errData.error || 'Failed to extract video details.');
        }

        const data = await extractRes.json();
        
        // 2. Mark as Downloading
        setQueue(prev => prev.map(q => q.id === item.id ? {
          ...q,
          title: data.title,
          thumbnail: data.thumbnail,
          status: 'downloading',
          progress: 50,
        } : q));

        // 3. Save to History
        await addDownload(item.url, data.title, data.thumbnail, data.videoUrl);

        // 4. Trigger download client side automatically for convenience
        triggerVideoDownload(data.videoUrl, data.title);

        // 5. Mark as Completed
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'completed', progress: 100 } : q));
      } catch (err: any) {
        console.error(`Batch item error for ${item.url}:`, err);
        setQueue(prev => prev.map(q => q.id === item.id ? {
          ...q,
          status: 'failed',
          progress: 100,
          error: err.message || 'Error occurred.',
        } : q));
      }
    }

    setIsProcessingQueue(false);
  };

  // Auth Context setters
  const loginUser = (userData: User) => {
    setUser(userData);
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setDownloads([]);
      setFavorites([]);
      setCollections([]);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
        activeTab,
        setActiveTab,
        downloads,
        favorites,
        collections,
        queue,
        addDownload,
        toggleFavorite,
        isFavorite,
        createCollection,
        deleteCollection,
        linkDownloadToCollection,
        addToQueue,
        removeFromQueue,
        clearQueue,
        processQueue,
        isProcessingQueue,
        loginUser,
        logoutUser,
        refreshUserData,
        triggerVideoDownload,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
