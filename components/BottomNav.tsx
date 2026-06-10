// ============================================================
// 底部导航栏组件
// ============================================================

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, RotateCcw, Library, BarChart3, TreePine } from 'lucide-react';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/learn', label: '学习', icon: BookOpen },
  { href: '/review', label: '复习', icon: RotateCcw },
  { href: '/dictionary', label: '词库', icon: Library },
  { href: '/roots', label: '词根', icon: TreePine },
  { href: '/stats', label: '统计', icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors
                ${isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
