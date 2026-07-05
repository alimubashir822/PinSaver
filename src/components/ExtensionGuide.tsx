'use client';

import React from 'react';
import { Globe, Info, Check, ArrowUpRight, FolderOpen } from 'lucide-react';

export default function ExtensionGuide() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gradient tracking-tight">Chrome Extension Integration</h1>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Install the PinSaver companion extension to grab Pinterest video links with a single click.
        </p>
      </div>

      {/* Main card */}
      <div className="glass-panel p-8 rounded-2xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <Globe className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-gray-100">Setup Guide</h2>
            <p className="text-xs text-gray-400">Install locally as an unpacked developer extension</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-200">Open Chrome Extensions</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Open a new tab in your Google Chrome browser and navigate to:
              </p>
              <code className="inline-block bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg text-xs text-primary font-mono mt-1 select-all">
                chrome://extensions/
              </code>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-200">Toggle Developer Mode</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                In the top-right corner of the Extensions page, switch the toggle switch labeled <strong>Developer mode</strong> to the <strong>ON</strong> position.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-200">Load Unpacked Extension</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Click the <strong>Load unpacked</strong> button that appeared in the top-left corner of the page.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              4
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-200 flex items-center gap-1.5">
                Select the Extension Folder
                <FolderOpen className="w-4 h-4 text-primary" />
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Browse to your project workspace directory and select the <strong>extension</strong> sub-folder located here:
              </p>
              <code className="inline-block bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 font-mono mt-1 select-all">
                C:\Users\Mubashir Ali\Desktop\PinSaver\extension
              </code>
            </div>
          </div>
        </div>

        {/* Feature summary */}
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
            <Check className="w-4 h-4" />
            How to use it
          </h4>
          <ul className="list-disc list-inside text-xs text-gray-400 space-y-1 leading-relaxed">
            <li>Open a Pin page on Pinterest that contains a video.</li>
            <li>Click the PinSaver extension icon in your Chrome toolbar.</li>
            <li>Click the <strong>Send to PinSaver</strong> button in the popup card.</li>
            <li>The web app will open in a new tab and automatically resolve the video!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
