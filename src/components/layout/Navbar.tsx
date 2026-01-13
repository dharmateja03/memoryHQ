'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Menu, X, User, Settings, LogOut, Flame } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui';

interface NavbarProps {
  user?: {
    name?: string;
    email: string;
    avatar_url?: string;
  } | null;
  streak?: number;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function Navbar({ user, streak = 0, onMenuToggle, isMenuOpen }: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/80 backdrop-blur-lg border-b border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-navy-700 text-gray-400"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <motion.div
                className="p-2 bg-electric-500/10 rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="w-6 h-6 text-electric-500" />
              </motion.div>
              <span className="text-xl font-bold text-white hidden sm:block">
                MindForge
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Streak */}
            {user && streak > 0 && (
              <motion.div
                className="flex items-center gap-1.5 px-3 py-1.5 bg-warning-500/10 rounded-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Flame className="w-4 h-4 text-warning-500" />
                <span className="text-sm font-medium text-warning-400">{streak}</span>
              </motion.div>
            )}

            {/* User menu or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-navy-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-500 to-memory flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">
                        {(user.name || user.email)[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-56 bg-navy-800 border border-navy-600 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-navy-600">
                      <p className="text-sm font-medium text-white truncate">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-navy-700"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-navy-700"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="border-navy-600 my-1" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-error-400 hover:bg-navy-700 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
