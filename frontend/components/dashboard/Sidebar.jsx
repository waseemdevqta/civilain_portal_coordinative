'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ListFilter,
  ShieldCheck,
  Building2,
  LogOut,
  User,
  Sparkles,
  BarChart3,
  Bot,
} from 'lucide-react';

export function DashboardSidebar({ className, onItemClick }) {
  const pathname = usePathname();
  const { user, logout, isOfficer, isCitizen } = useAuth();

  const citizenNav = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Report Issue',
      href: '/complaints/new',
      icon: PlusCircle,
    },
    {
      name: 'My Complaints',
      href: '/complaints/mine',
      icon: FileText,
    },
    {
      name: 'Browse Feed',
      href: '/complaints',
      icon: ListFilter,
    },
  ];

  const officerNav = [
    {
      name: 'Operations Overview',
      href: '/officer/dashboard',
      icon: ShieldCheck,
    },
    {
      name: 'Public Issue Board',
      href: '/complaints',
      icon: ListFilter,
    },
  ];

  const navigationItems = isOfficer ? officerNav : citizenNav;

  return (
    <aside className={cn('flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100', className)}>
      {/* Brand Header */}
      <div className="flex h-16 items-center px-5 border-b border-slate-800">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-600 text-white shadow-sm">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">
                CivicFix
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 border border-slate-700">
                OFFICER
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Municipal Command</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {isOfficer ? 'Operations Console' : 'Citizen Menu'}
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white border-l-2 border-emerald-500 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-emerald-400' : 'text-slate-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Officer / User Profile Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 space-y-3">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OF'}
          </div>
          <div className="truncate min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Officer'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Officer'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-red-300 hover:bg-red-950/40 hover:text-red-200 border border-red-900/40 transition-colors"
        >
          <LogOut className="h-3 w-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
