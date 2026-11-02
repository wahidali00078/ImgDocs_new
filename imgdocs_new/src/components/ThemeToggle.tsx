/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved as ThemeMode;
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (mode: ThemeMode) => {
      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.remove('dark');
      } else {
        // system preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // If system theme is selected, listen for system preference changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', handleSystemChange);
      return () => {
        mediaQuery.removeEventListener('change', handleSystemChange);
      };
    }
  }, [theme]);

  return (
    <div 
      className="flex items-center gap-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 p-0.5 shadow-xs"
      id="theme-toggle-segmented"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-white text-amber-500 shadow-xs dark:bg-slate-800 dark:text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
        }`}
        title="Light Theme"
        aria-label="Switch to Light Theme"
        id="theme-btn-light"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400 font-bold'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
        }`}
        title="Dark Theme"
        aria-label="Switch to Dark Theme"
        id="theme-btn-dark"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800 dark:text-blue-400 font-bold'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
        }`}
        title="System Default Theme"
        aria-label="Switch to System Default Theme"
        id="theme-btn-system"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
