'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getApiBaseUrl } from '@/lib/api';
import {
  FilePlus,
  Layers,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Route,
  Trash2,
  Droplets,
  Zap,
  Sparkles,
  ExternalLink,
  Lock,
  Megaphone,
  Wrench,
  MapPin,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { AwazLogo } from '@/components/common/AwazLogo';

export function Footer() {
  const { isAuthenticated, isOfficer, isCitizen } = useAuth();

  return (
    <footer className="border-t border-slate-200/90 bg-white text-slate-700 transition-colors shadow-xs">
      {/* MAIN FOOTER COLUMNS */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* BRAND COLUMN (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="group">
              <AwazLogo
                size="md"
                showText={true}
                badgeText="CIVIC PORTAL"
                subtitle="Your voice. Your city. Your change."
              />
            </Link>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              AWAZ is a transparent public complaint platform connecting citizens directly with municipal authorities. Report neighborhood infrastructure issues, rally community priorities, and verify resolution quality.
            </p>

            {/* Operational Status Pill */}
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A4F1B2] bg-[#E8F9ED] px-3 py-1 text-[11px] font-semibold text-[#1F6C3A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1F6C3A] animate-pulse" />
                Municipal Dispatch Systems Active
              </span>
            </div>
          </div>

          {/* COLUMN 1: CITIZEN SERVICES */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider">
              Citizen Services
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/complaints/new"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <FilePlus className="h-3.5 w-3.5 text-slate-400" />
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link
                  href="/complaints"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  Explore Community Issues
                </Link>
              </li>
              {isAuthenticated && isCitizen ? (
                <>
                  <li>
                    <Link
                      href="/dashboard"
                      className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                      Citizen Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/complaints/mine"
                      className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      My Reported Tickets
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/signup"
                      className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                    >
                      Register Citizen Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                    >
                      Sign In to Portal
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* COLUMN 2: ISSUE CATEGORIES */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider">
              Issue Divisions
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/complaints?category=road"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <Route className="h-3.5 w-3.5 text-blue-600" />
                  Roads & Transport
                </Link>
              </li>
              <li>
                <Link
                  href="/complaints?category=garbage"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-emerald-600" />
                  Garbage & Sanitation
                </Link>
              </li>
              <li>
                <Link
                  href="/complaints?category=water"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <Droplets className="h-3.5 w-3.5 text-sky-600" />
                  Water Supply & Mains
                </Link>
              </li>
              <li>
                <Link
                  href="/complaints?category=electricity"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                  Electricity & Lighting
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: MUNICIPAL COMMAND */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider">
              Municipal Operations
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/officer/dashboard"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  Operations Command
                </Link>
              </li>
              <li>
                <Link
                  href="/officer/dashboard"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Gemini AI Operations
                </Link>
              </li>
              <li>
                <Link
                  href="/staff/dashboard"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <Wrench className="h-3.5 w-3.5 text-blue-600" />
                  Field Tasks Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/complaints"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Civic Issues Feed
                </Link>
              </li>
              <li>
                <a
                  href={`${getApiBaseUrl()}/health`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-[#0B1C30] flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  System Health
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM LEGAL STRIP */}
      <div className="border-t border-slate-100 bg-[#F8F9FF] py-4">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} AWAZ Civic Platform. Your voice. Your city. Your change.</span>
          </div>

          <div className="text-slate-500 font-mono text-[10px]">
            Municipal Digital Infrastructure • Official Citizen Service
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
