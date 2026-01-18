'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Dumbbell,
  BarChart3,
  Trophy,
  Gamepad2,
  Brain,
  Target,
  Zap,
  Puzzle,
  RefreshCw,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { DOMAIN_COLORS, type CognitiveDomain } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/training', label: "Today's Training", icon: Dumbbell },
  { href: '/multiplayer', label: 'Multiplayer', icon: Users },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
];

const domainNav: { href: string; label: string; icon: React.ElementType; domain: CognitiveDomain }[] = [
  { href: '/games/category/memory', label: 'Memory', icon: Brain, domain: 'memory' },
  { href: '/games/category/attention', label: 'Attention', icon: Target, domain: 'attention' },
  { href: '/games/category/speed', label: 'Speed', icon: Zap, domain: 'speed' },
  { href: '/games/category/problem-solving', label: 'Problem Solving', icon: Puzzle, domain: 'problem_solving' },
  { href: '/games/category/flexibility', label: 'Flexibility', icon: RefreshCw, domain: 'flexibility' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const NavLink = ({
    href,
    label,
    icon: Icon,
    color,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
    color?: string;
  }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');

    return (
      <Link
        href={href}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
          isActive
            ? 'bg-electric-500/10 text-electric-400'
            : 'text-gray-400 hover:text-white hover:bg-navy-700'
        )}
      >
        <Icon
          className="w-5 h-5 flex-shrink-0"
          style={{ color: isActive && color ? color : undefined }}
        />
        <span>{label}</span>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-electric-500"
          />
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Main Navigation */}
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          Main
        </p>
        <nav className="space-y-1">
          {mainNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </div>

      {/* Games by Domain */}
      <div className="p-4 border-t border-navy-700">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          Games
        </p>
        <nav className="space-y-1">
          {domainNav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              color={DOMAIN_COLORS[item.domain]}
            />
          ))}
        </nav>
      </div>

      {/* All Games Link */}
      <div className="px-4 mt-auto pb-4">
        <Link
          href="/games"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-navy-700 transition-all border border-dashed border-navy-600 hover:border-electric-500"
        >
          <Gamepad2 className="w-5 h-5" />
          <span>All Games</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-16 bottom-0 w-64 bg-navy-800 border-r border-navy-700 z-50 lg:hidden overflow-y-auto"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:left-0 lg:top-16 lg:bottom-0 bg-navy-800 border-r border-navy-700 overflow-y-auto">
        {sidebarContent}
      </aside>
    </>
  );
}
