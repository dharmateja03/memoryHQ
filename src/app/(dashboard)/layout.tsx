'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useProgressStore } from '@/lib/stores/progressStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const { stats } = useProgressStore();
  const [streak, setStreak] = useState(0);

  // Get streak from local store or fetch from API
  useEffect(() => {
    if (session?.user) {
      // Try to fetch from API for logged-in users
      fetch('/api/user/stats')
        .then(res => res.json())
        .then(data => {
          if (data.currentStreak) {
            setStreak(data.currentStreak);
          }
        })
        .catch(() => {
          // Fallback to local store
          setStreak(stats.currentStreak);
        });
    } else {
      setStreak(stats.currentStreak);
    }
  }, [session, stats.currentStreak]);

  const user = session?.user ? {
    name: session.user.name || undefined,
    email: session.user.email || '',
    avatar_url: session.user.image || undefined,
  } : null;

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar
        user={user}
        streak={streak}
        isMenuOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="pt-16 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
