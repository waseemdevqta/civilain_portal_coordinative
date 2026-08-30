'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
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
  Sparkles,
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-all shadow-[0_2px_12px_rgba(11,28,48,0.03)]">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F172A] text-white shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_4px_16px_rgba(15,23,42,0.25)]">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-[#0B1C30]">
                AWAZ
              </span>
              <span className="rounded-full bg-[#EFF4FF] px-2.5 py-0.5 text-[9px] font-extrabold text-[#1F6C3A] border border-[#A4F1B2] tracking-wider uppercase">
                Civic Excellence
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium leading-none">
              Your voice. Your city. Your change.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 text-xs font-semibold">
          <Link
            href="/"
            className={cn(
              'px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5',
              isActive('/') && pathname === '/'
                ? 'text-[#0B1C30] bg-[#EFF4FF] font-bold shadow-xs'
                : 'text-slate-600 hover:text-[#0B1C30] hover:bg-[#F8F9FF]'
            )}
          >
            <Home className="h-3.5 w-3.5 text-slate-500" />
            Home
          </Link>

          <Link
            href="/complaints"
            className={cn(
              'px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5',
              isActive('/complaints') && pathname !== '/complaints/new' && pathname !== '/complaints/mine'
                ? 'text-[#0B1C30] bg-[#EFF4FF] font-bold shadow-xs'
                : 'text-slate-600 hover:text-[#0B1C30] hover:bg-[#F8F9FF]'
            )}
          >
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            Explore Issues
          </Link>

          {isAuthenticated && isCitizen && (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  'px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5',
                  isActive('/dashboard')
                    ? 'text-[#0B1C30] bg-[#EFF4FF] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1C30] hover:bg-[#F8F9FF]'
                )}
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-slate-500" />
                Dashboard
              </Link>
              <Link
                href="/complaints/mine"
                className={cn(
                  'px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5',
                  isActive('/complaints/mine')
                    ? 'text-[#0B1C30] bg-[#EFF4FF] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1C30] hover:bg-[#F8F9FF]'
                )}
              >
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                My Reports
              </Link>
            </>
          )}

          {isAuthenticated && isOfficer && (
            <Link
              href="/officer/dashboard"
              className={cn(
                'px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5',
                isActive('/officer/dashboard')
                  ? 'text-[#0B1C30] bg-[#EFF4FF] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-[#0B1C30] hover:bg-[#F8F9FF]'
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#1F6C3A]" />
              Operations Center
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-2.5">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-9 rounded-xl font-semibold text-slate-700 hover:text-[#0B1C30] hover:bg-[#EFF4FF] transition-all"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/complaints/new">
                <Button
                  size="sm"
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-[0_2px_10px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 transition-all duration-200"
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
                    className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-[0_2px_10px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Report Issue
                  </Button>
                </Link>
              )}

              {isOfficer && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A4F1B2] bg-[#E8F9ED] px-3 py-1 text-[11px] font-bold text-[#1F6C3A] shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-[#1F6C3A] animate-pulse" />
                  Officer Active
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-9 rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-[#F8F9FF] text-xs font-semibold px-3 shadow-xs hover:border-slate-300 transition-all"
                  >
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    <span className="max-w-[120px] truncate">{user?.name || 'Account'}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border-slate-200 shadow-[0_12px_32px_rgba(11,28,48,0.08)] rounded-2xl p-1.5 text-xs animate-in fade-in-50 zoom-in-95 duration-100"
                >
                  <DropdownMenuLabel className="font-normal py-2 px-3">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs font-bold text-[#0B1C30]">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  {isCitizen && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="cursor-pointer text-slate-700 rounded-xl px-2.5 py-2 hover:bg-[#EFF4FF] hover:text-[#0B1C30]"
                        >
                          <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/complaints/mine"
                          className="cursor-pointer text-slate-700 rounded-xl px-2.5 py-2 hover:bg-[#EFF4FF] hover:text-[#0B1C30]"
                        >
                          <FileText className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          My Reports
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/profile"
                          className="cursor-pointer text-slate-700 rounded-xl px-2.5 py-2 hover:bg-[#EFF4FF] hover:text-[#0B1C30]"
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
                          className="cursor-pointer text-slate-700 rounded-xl px-2.5 py-2 hover:bg-[#EFF4FF] hover:text-[#0B1C30]"
                        >
                          <ShieldCheck className="mr-2 h-3.5 w-3.5 text-[#1F6C3A]" />
                          Operations Center
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/profile"
                          className="cursor-pointer text-slate-700 rounded-xl px-2.5 py-2 hover:bg-[#EFF4FF] hover:text-[#0B1C30]"
                        >
                          <User className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          Officer Profile
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-[#BA1A1A] rounded-xl px-2.5 py-2 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-[#EFF4FF] transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-2 text-xs animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 hover:bg-[#EFF4FF]"
          >
            <Home className="h-4 w-4 text-slate-500" />
            Home
          </Link>

          <Link
            href="/complaints"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 hover:bg-[#EFF4FF]"
          >
            <Layers className="h-4 w-4 text-slate-500" />
            Explore Issues
          </Link>

          {isAuthenticated && isCitizen && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 hover:bg-[#EFF4FF]"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                Dashboard
              </Link>
              <Link
                href="/complaints/mine"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 hover:bg-[#EFF4FF]"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                My Reports
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 hover:bg-[#EFF4FF]"
              >
                <User className="h-4 w-4 text-slate-500" />
                My Profile
              </Link>
              <Link
                href="/complaints/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold bg-[#0F172A] text-white shadow-sm"
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
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold bg-[#0F172A] text-white shadow-sm"
              >
                <ShieldCheck className="h-4 w-4 text-[#A4F1B2]" />
                Operations Center
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 hover:bg-[#EFF4FF]"
              >
                <User className="h-4 w-4 text-slate-500" />
                Officer Profile
              </Link>
            </>
          )}

          <div className="border-t border-slate-100 pt-3 mt-2">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="px-3.5 text-[11px] text-slate-500">
                  Signed in as <strong className="text-[#0B1C30]">{user?.email}</strong>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full rounded-xl text-[#BA1A1A] border-red-200 hover:bg-red-50 text-xs"
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
                  <Button size="sm" className="w-full rounded-xl bg-[#0F172A] text-white text-xs">
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
