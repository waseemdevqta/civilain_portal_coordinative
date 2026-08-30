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
  Building2,
  PlusCircle,
  ListFilter,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, isAuthenticated, isOfficer, isCitizen, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-900 text-white shadow-sm transition-colors group-hover:bg-slate-800">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                CivicFix
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                PORTAL
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium leading-none">
              Citizen Complaint Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
          <Link
            href="/complaints"
            className={cn(
              'px-3 py-1.5 rounded transition-colors flex items-center gap-1.5',
              isActive('/complaints')
                ? 'text-slate-900 bg-slate-100 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <ListFilter className="h-4 w-4 text-slate-500" />
            Browse Issues
          </Link>

          {isAuthenticated && isCitizen && (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  'px-3 py-1.5 rounded transition-colors flex items-center gap-1.5',
                  isActive('/dashboard')
                    ? 'text-slate-900 bg-slate-100 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                Dashboard
              </Link>
              <Link
                href="/complaints/mine"
                className={cn(
                  'px-3 py-1.5 rounded transition-colors flex items-center gap-1.5',
                  isActive('/complaints/mine')
                    ? 'text-slate-900 bg-slate-100 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <FileText className="h-4 w-4 text-slate-500" />
                My Complaints
              </Link>
            </>
          )}

          {isAuthenticated && isOfficer && (
            <Link
              href="/officer/dashboard"
              className={cn(
                'px-3 py-1.5 rounded transition-colors flex items-center gap-1.5',
                isActive('/officer/dashboard')
                  ? 'text-slate-900 bg-slate-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Operations Center
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/complaints/new">
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  Report an Issue
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {isCitizen && (
                <Link href="/complaints/new">
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5">
                    <PlusCircle className="h-4 w-4" />
                    Report Issue
                  </Button>
                </Link>
              )}

              {isOfficer && (
                <span className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-900" />
                  Officer Active
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-slate-300">
                    <User className="h-4 w-4 text-slate-700" />
                    <span className="max-w-[120px] truncate font-medium text-slate-900">
                      {user?.name || 'Account'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="right" className="w-56 bg-white border-slate-200 shadow-md">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isCitizen && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4 text-slate-600" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/complaints/mine" className="cursor-pointer">
                          <FileText className="mr-2 h-4 w-4 text-slate-600" />
                          My Complaints
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {isOfficer && (
                    <DropdownMenuItem asChild>
                      <Link href="/officer/dashboard" className="cursor-pointer">
                        <ShieldCheck className="mr-2 h-4 w-4 text-emerald-700" />
                        Operations Center
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} destructive className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3">
          <Link
            href="/complaints"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            <ListFilter className="h-4 w-4 text-slate-500" />
            Browse Issues
          </Link>

          {isAuthenticated && isCitizen && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                Citizen Dashboard
              </Link>
              <Link
                href="/complaints/mine"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                My Complaints
              </Link>
              <Link
                href="/complaints/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold bg-slate-900 text-white"
              >
                <PlusCircle className="h-4 w-4" />
                Report an Issue
              </Link>
            </>
          )}

          {isAuthenticated && isOfficer && (
            <Link
              href="/officer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold bg-slate-900 text-white"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Operations Center
            </Link>
          )}

          <div className="border-t border-slate-200 pt-3">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="px-3 text-xs text-slate-500">
                  Signed in as <strong className="text-slate-900">{user?.email}</strong>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-red-700 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-slate-900 text-white">
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
