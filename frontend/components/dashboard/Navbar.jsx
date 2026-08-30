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
  const { user, logout, isAdmin } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-card/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          <Badge variant="success" className="gap-1.5 py-1 px-2.5 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>REST API Active</span>
          </Badge>
        </div>
      </div>

      {/* Right: User Avatar & Dropdown */}
      <div className="flex items-center space-x-4">
        <DropdownMenu
          trigger={
            <button className="flex items-center space-x-3 rounded-xl p-1.5 hover:bg-muted/50 transition-colors focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar name={user?.name || 'User'} size="default" />
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-foreground leading-none">{user?.name || 'User'}</p>
                <p className="text-[11px] text-muted-foreground mt-1 capitalize font-medium">{user?.role || 'member'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </button>
          }
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{user?.name}</span>
              <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
            <User className="mr-2 h-4 w-4 text-primary" />
            Profile & Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
            <Settings className="mr-2 h-4 w-4 text-indigo-400" />
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
