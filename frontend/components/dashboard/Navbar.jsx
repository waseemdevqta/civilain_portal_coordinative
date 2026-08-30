'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sheet } from '@/components/ui/sheet';
import { DashboardSidebar } from './Sidebar';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Menu, User, Settings, LogOut, Activity, ChevronDown } from 'lucide-react';

export function DashboardNavbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile hamburger & status */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-[#0B1C30] hover:bg-[#F8F9FF]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          <Badge variant="success" className="gap-1.5 py-1 px-3 text-[11px] bg-[#E8F9ED] text-[#1F6C3A] border border-[#A4F1B2]">
            <span className="h-2 w-2 rounded-full bg-[#1F6C3A] animate-pulse" />
            <span>Civic API Synchronized</span>
          </Badge>
        </div>
      </div>

      {/* Right: User Avatar & Dropdown */}
      <div className="flex items-center space-x-4">
        <DropdownMenu
          trigger={
            <button className="flex items-center space-x-3 rounded-2xl p-1.5 hover:bg-[#F8F9FF] transition-colors focus:outline-none cursor-pointer">
              <Avatar name={user?.name || 'User'} size="default" />
              <div className="hidden text-left md:block">
                <p className="text-sm font-bold text-[#0B1C30] leading-none">{user?.name || 'User'}</p>
                <p className="text-[11px] text-slate-500 mt-1 capitalize font-medium">{user?.role || 'Citizen'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
            </button>
          }
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#0B1C30]">{user?.name}</span>
              <span className="text-xs text-slate-500 font-normal">{user?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
            <User className="mr-2 h-4 w-4 text-[#0F172A]" />
            Profile & Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
            <Settings className="mr-2 h-4 w-4 text-slate-500" />
            System Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} destructive>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenu>
      </div>

      {/* Mobile Slide-out Drawer */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <div className="h-full flex flex-col -m-6">
          <DashboardSidebar onItemClick={() => setMobileDrawerOpen(false)} />
        </div>
      </Sheet>
    </header>
  );
}
