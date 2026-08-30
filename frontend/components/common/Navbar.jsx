'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/common/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PlusCircle,
  Layers,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Megaphone,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, isAuthenticated, isOfficer, isCitizen, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#090E1A]/95 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm transition-transform group-hover:scale-105">
            <Megaphone className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-50">
                AWAZ
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 tracking-wider">
                CIVIC
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">
              Your voice. Your city.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 text-xs font-semibold">
          <Link
            href="/"
            className={cn(
              'px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5',
              isActive('/') && pathname === '/'
                ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/90 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
            )}
          >
            <Home className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            Home
          </Link>

          <Link
            href="/complaints"
            className={cn(
              'px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5',
              isActive('/complaints') && pathname !== '/complaints/new' && pathname !== '/complaints/mine'
                ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/90 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
            )}
          >
            <Layers className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            Explore Issues
          </Link>

          {isAuthenticated && isCitizen && (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  'px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5',
                  isActive('/dashboard')
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/90 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                )}
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                Dashboard
              </Link>
              <Link
                href="/complaints/mine"
                className={cn(
                  'px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5',
                  isActive('/complaints/mine')
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/90 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                )}
              >
                <FileText className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                My Reports
              </Link>
            </>
          )}

          {isAuthenticated && isOfficer && (
            <Link
              href="/officer/dashboard"
              className={cn(
                'px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5',
                isActive('/officer/dashboard')
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/90 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Operations Center
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-2.5">
          {/* Theme Switcher */}
          <ThemeToggle />

          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-9 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/complaints/new">
                <Button
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-semibold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Report an Issue
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              {isCitizen && (
                <Link href="/complaints/new">
                  <Button
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-semibold text-xs h-9 px-3.5 rounded-xl gap-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Report Issue
                  </Button>
                </Link>
              )}

              {isOfficer && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  Officer Active
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold px-3"
                  >
                    <User className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="max-w-[110px] truncate">{user?.name || 'Account'}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 text-xs"
                >
                  <DropdownMenuLabel className="font-normal py-2 px-3">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  {isCitizen && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="cursor-pointer text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/complaints/mine"
                          className="cursor-pointer text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <FileText className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          My Reports
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/profile"
                          className="cursor-pointer text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <User className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {isOfficer && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/officer/dashboard"
                          className="cursor-pointer text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ShieldCheck className="mr-2 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Operations Center
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/profile"
                          className="cursor-pointer text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <User className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          Officer Profile
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-600 dark:text-red-400 rounded-xl px-2.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Actions: Theme + Menu */}
        <div className="flex md:hidden items-center space-x-1.5">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090E1A] px-4 py-4 space-y-2 text-xs">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
          >
            <Home className="h-4 w-4 text-slate-500" />
            Home
          </Link>

          <Link
            href="/complaints"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
          >
            <Layers className="h-4 w-4 text-slate-500" />
            Explore Issues
          </Link>

          {isAuthenticated && isCitizen && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                Dashboard
              </Link>
              <Link
                href="/complaints/mine"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                My Reports
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
              >
                <User className="h-4 w-4 text-slate-500" />
                My Profile
              </Link>
              <Link
                href="/complaints/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm"
              >
                <PlusCircle className="h-4 w-4" />
                Report an Issue
              </Link>
            </>
          )}

          {isAuthenticated && isOfficer && (
            <>
              <Link
                href="/officer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                Operations Center
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
              >
                <User className="h-4 w-4 text-slate-500" />
                Officer Profile
              </Link>
            </>
          )}

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-2">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="px-3.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Signed in as <strong className="text-slate-900 dark:text-slate-100">{user?.email}</strong>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full rounded-xl text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 text-xs">
                    Register Citizen Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
