'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import AuthModal from './AuthModal';
import { LogIn, LogOut, User as UserIcon, Shield, Menu } from 'lucide-react';

export default function Navbar() {
  const { user, logoutUser, isSidebarOpen, setIsSidebarOpen } = useApp();
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Left Section: Mobile Menu Trigger & Logo */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg text-gray-400 hover:text-white cursor-pointer lg:hidden mr-1"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/30 animate-pulse">
              P
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-gradient tracking-tight">PinSaver</span>
              <span className="text-[8px] sm:text-[9px] text-primary font-bold ml-1 tracking-widest uppercase">PRO</span>
            </div>
          </div>
        </div>

        {/* Right Section: User Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors border border-white/5 cursor-pointer"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-[10px] sm:text-xs border border-primary/25">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate font-medium text-gray-200">
                  {user.name}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  <div
                    onClick={() => setDropdownOpen(false)}
                    className="fixed inset-0 z-10"
                  />
                  <div className="absolute right-0 mt-2 w-48 glass-panel py-1 rounded-lg shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-gray-200">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logoutUser();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/25"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Sign In
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
