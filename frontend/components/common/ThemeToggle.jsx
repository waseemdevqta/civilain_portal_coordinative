'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function ThemeToggle({ className = '' }) {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 w-9 px-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${className}`}
          aria-label="Toggle theme"
        >
          {mounted && resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-blue-300" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl p-1.5 text-xs"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
            theme === 'light'
              ? 'bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Light</span>
          </div>
          {theme === 'light' && <Check className="h-3.5 w-3.5 text-slate-900 dark:text-slate-100" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
            theme === 'dark'
              ? 'bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Moon className="h-3.5 w-3.5 text-blue-400" />
            <span>Dark</span>
          </div>
          {theme === 'dark' && <Check className="h-3.5 w-3.5 text-slate-900 dark:text-slate-100" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
            theme === 'system'
              ? 'bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Laptop className="h-3.5 w-3.5 text-slate-400" />
            <span>System</span>
          </div>
          {theme === 'system' && <Check className="h-3.5 w-3.5 text-slate-900 dark:text-slate-100" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
