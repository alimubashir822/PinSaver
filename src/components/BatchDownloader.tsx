'use client';

import React, { useState } from 'react';
import { useApp, QueueItem } from '@/context/AppContext';
import { 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Layers 
} from 'lucide-react';

function isPinterestUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return (
      host.endsWith('pinterest.com') ||
      host.endsWith('pin.it') ||
      host.includes('pinterest.co') ||
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

export default function BatchDownloader() {
  const { 
    queue, 
    addToQueue, 
    removeFromQueue, 
    clearQueue, 
    processQueue, 
    isProcessingQueue 
  } = useApp();

  const [textareaInput, setTextareaInput] = useState('');
  const [inputError, setInputError] = useState('');

  const completedCount = queue.filter(item => item.status === 'completed').length;
  const failedCount = queue.filter(item => item.status === 'failed').length;
  const activeCount = queue.filter(item => item.status === 'extracting' || item.status === 'downloading').length;
  const pendingCount = queue.filter(item => item.status === 'idle').length;

  const progressPercent = queue.length > 0 ? Math.round((completedCount / queue.length) * 100) : 0;

  function handleAddToQueue() {
    setInputError('');
    if (!textareaInput.trim()) return;

    // Split lines, filter blank lines
    const lines = textareaInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const validUrls: string[] = [];
    const invalidLines: string[] = [];

    lines.forEach(line => {
      if (isPinterestUrl(line)) {
        // Prevent duplicate URLs in queue
        if (!queue.some(item => item.url === line)) {
          validUrls.push(line);
        }
      } else {
        invalidLines.push(line);
      }
    });

    if (validUrls.length > 0) {
      addToQueue(validUrls);
      setTextareaInput('');
    }

    if (invalidLines.length > 0) {
      setInputError(`Skipped ${invalidLines.length} lines that were not valid Pinterest links.`);
    }
  }

  // Get status icon and color
  function getStatusMarkup(status: QueueItem['status']) {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
          color: 'text-green-400',
          bg: 'bg-green-500/10 border-green-500/20',
          text: 'Completed',
        };
      case 'failed':
        return {
          icon: <XCircle className="w-4 h-4 text-red-400" />,
          color: 'text-red-400',
          bg: 'bg-red-500/10 border-red-500/20',
          text: 'Failed',
        };
      case 'extracting':
        return {
          icon: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/20',
          text: 'Extracting',
        };
      case 'downloading':
        return {
          icon: <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />,
          color: 'text-violet-400',
          bg: 'bg-violet-500/10 border-violet-500/20',
          text: 'Downloading',
        };
      default:
        return {
          icon: <RefreshCcw className="w-4 h-4 text-gray-400" />,
          color: 'text-gray-400',
          bg: 'bg-white/5 border-white/5',
          text: 'Pending',
        };
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gradient tracking-tight">Batch Video Downloader</h1>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Queue multiple Pinterest URLs, and download them sequentially. Paste one link per line.
        </p>
      </div>

      {/* Input panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Paste Pinterest Links (One link per line)
          </label>
          <textarea
            rows={5}
            placeholder="https://www.pinterest.com/pin/11111&#10;https://www.pinterest.com/pin/22222&#10;https://pin.it/xxxxx"
            value={textareaInput}
            onChange={(e) => setTextareaInput(e.target.value)}
            disabled={isProcessingQueue}
            className="w-full p-4 rounded-xl text-sm glass-input font-mono leading-relaxed resize-none disabled:opacity-50"
          />
        </div>

        {inputError && (
          <p className="text-xs text-red-400 font-semibold">{inputError}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Supports both standard URLs and redirected pin.it short links.
          </span>
          <button
            onClick={handleAddToQueue}
            disabled={isProcessingQueue || !textareaInput.trim()}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            Add to Queue
          </button>
        </div>
      </div>

      {/* Queue Progress Summary */}
      {queue.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Status counts */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-wider">
              <span className="text-gray-400">Total: {queue.length}</span>
              <span className="text-blue-400">Pending: {pendingCount}</span>
              <span className="text-violet-400">Active: {activeCount}</span>
              <span className="text-green-400">Success: {completedCount}</span>
              <span className="text-red-400">Failed: {failedCount}</span>
            </div>

            {/* Main Action Controllers */}
            <div className="flex items-center gap-3">
              <button
                onClick={clearQueue}
                disabled={isProcessingQueue}
                className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                Clear Queue
              </button>
              <button
                onClick={processQueue}
                disabled={isProcessingQueue || queue.length === 0 || (completedCount + failedCount === queue.length)}
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-primary/25"
              >
                {isProcessingQueue ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Process Queue
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Aggregate Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Overall Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Queue List Table */}
      {queue.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            Queue list
          </h3>
          
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
            {queue.map((item) => {
              const statusInfo = getStatusMarkup(item.status);
              return (
                <div 
                  key={item.id}
                  className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/5"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Thumbnail or placeholder */}
                    <div className="w-10 h-16 sm:w-12 sm:h-20 bg-black/40 rounded-lg overflow-hidden border border-white/5 flex-shrink-0 flex items-center justify-center">
                      {item.thumbnail ? (
                        <img 
                          src={item.thumbnail} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] sm:text-[10px] text-gray-600 font-bold uppercase">PIN</span>
                      )}
                    </div>

                    {/* Metadata & Progress */}
                    <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5">
                      <p className="text-xs sm:text-sm font-bold text-gray-200 truncate pr-2">
                        {item.title}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate font-mono">
                        {item.url}
                      </p>
                      {item.error && (
                        <p className="text-[10px] sm:text-xs text-red-400 font-semibold">{item.error}</p>
                      )}
                      
                      {/* Queue item progress line */}
                      {(item.status === 'extracting' || item.status === 'downloading') && (
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden max-w-xs sm:max-w-md">
                          <div 
                            className="h-full bg-primary transition-all duration-300 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Badge */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t border-white/5 sm:border-t-0 flex-shrink-0">
                    <span className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.text}
                    </span>
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      disabled={isProcessingQueue && (item.status === 'extracting' || item.status === 'downloading')}
                      title="Remove from queue"
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty Queue placeholder */
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border-dashed border-white/5">
          <div className="w-12 h-12 rounded-full bg-white/5 text-gray-500 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-300">Your queue is empty</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              Add Pinterest links above to prepare a batch queue. Items are processed sequentially.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
