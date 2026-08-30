'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { complaintApi } from '@/lib/api';
import {
  FilePlus,
  Layers,
  CheckCircle2,
  Route,
  Trash2,
  Droplets,
  Zap,
  ShieldCheck,
  LayoutDashboard,
  ThumbsUp,
  Flame,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Heart,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, isOfficer, isCitizen } = useAuth();
  const [pulseData, setPulseData] = useState({
    total: 14,
    pending: 7,
    inProgress: 4,
    resolved: 3,
    critical: 5,
  });

  const [topComplaints, setTopComplaints] = useState([
    {
      _id: '1',
      category: 'road',
      area: 'University Road',
      title: 'Road damage & potholes near Campus Gate 3',
      upvotes: 42,
      status: 'in-progress',
    },
    {
      _id: '2',
      category: 'water',
      area: 'Satellite Town',
      title: 'Main pipeline leak causing low pressure in Block B',
      upvotes: 28,
      status: 'pending',
    },
    {
      _id: '3',
      category: 'garbage',
      area: 'Jinnah Road',
      title: 'Overflowing public dumpsters outside central market',
      upvotes: 19,
      status: 'in-progress',
    },
  ]);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const allRes = await complaintApi.getAll({ sort: 'upvotes' });
        if (Array.isArray(allRes.data) && allRes.data.length > 0) {
          const list = allRes.data;
          const total = list.length;
          const pending = list.filter((c) => c.status === 'pending').length;
          const inProgress = list.filter((c) => c.status === 'in-progress').length;
          const resolved = list.filter((c) => c.status === 'resolved').length;
          const critical = list.filter((c) => c.priority === 'critical').length;
          setPulseData({ total, pending, inProgress, resolved, critical });

          // Take top 3 for live pulse card preview
          setTopComplaints(list.slice(0, 3));
        }
      } catch {
        // Fallback to default community pulse
      }
    };
    fetchLiveStats();
  }, []);

  const getCategoryIcon = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'road':
        return {
          icon: Route,
          container: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
          label: 'Roads',
        };
      case 'garbage':
        return {
          icon: Trash2,
          container: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          label: 'Garbage',
        };
      case 'water':
        return {
          icon: Droplets,
          container: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
          label: 'Water',
        };
      case 'electricity':
        return {
          icon: Zap,
          container: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
          label: 'Power',
        };
      default:
        return {
          icon: Route,
          container: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          label: 'Civic',
        };
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION — WARM, INVITING & BALANCED */}
        <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-[#F7F8FC] to-white dark:from-[#090E1A] dark:via-[#0D1424] dark:to-[#090E1A]">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* LEFT COLUMN: HERO HEADLINE & CTAS */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Small Eyebrow */}
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-[#111827] px-3.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>COMMUNITY • ACTION • TRANSPARENCY</span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.12]">
                  Make your city{' '}
                  <span className="text-slate-900 dark:text-slate-50 underline decoration-emerald-500 decoration-4 underline-offset-8">
                    heard.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  AWAZ gives citizens a simple way to report problems, rally community support, and follow issues through to resolution.
                </p>

                {/* CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {isAuthenticated ? (
                    isOfficer ? (
                      <>
                        <Link href="/officer/dashboard">
                          <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 gap-2 px-6 h-12 text-sm font-semibold rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.1)]">
                            <ShieldCheck className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                            Operations Command
                          </Button>
                        </Link>
                        <Link href="/complaints">
                          <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 px-6 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl">
                            <Layers className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            Explore Issues
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/complaints/new">
                          <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 gap-2 px-6 h-12 text-sm font-semibold rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.1)]">
                            <FilePlus className="h-4 w-4" />
                            Report an Issue
                          </Button>
                        </Link>
                        <Link href="/dashboard">
                          <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 px-6 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl">
                            <LayoutDashboard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            My Dashboard
                          </Button>
                        </Link>
                      </>
                    )
                  ) : (
                    <>
                      <Link href="/complaints/new">
                        <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 gap-2 px-6 h-12 text-sm font-semibold rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.1)]">
                          <FilePlus className="h-4 w-4" />
                          Report an Issue
                        </Button>
                      </Link>
                      <Link href="/complaints">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 px-6 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl">
                          <Layers className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          Explore Issues
                        </Button>
                      </Link>
                    </>
                  )}
                </div>

                {/* Reassurance pills */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Public tracking ID
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Democratic priority scores
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Verified resolution remarks
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE CIVIC ACTIVITY PANEL (COMMUNITY PULSE) */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                        COMMUNITY PULSE
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {pulseData.total} total cases
                    </span>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#182235] p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Active</div>
                      <div className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                        {pulseData.pending + pulseData.inProgress}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-red-200/80 dark:border-red-900/40 bg-red-50/70 dark:bg-red-950/30 p-3">
                      <div className="text-[10px] font-bold uppercase text-red-700 dark:text-red-300 flex items-center justify-center gap-1">
                        <Flame className="h-3 w-3" />
                        Critical
                      </div>
                      <div className="text-xl font-extrabold text-red-900 dark:text-red-200 mt-0.5">
                        {pulseData.critical}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
                      <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Resolved</div>
                      <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-0.5">
                        {pulseData.resolved}
                      </div>
                    </div>
                  </div>

                  {/* Live Complaint Items */}
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      High-Priority Neighborhood Issues
                    </div>
                    {topComplaints.map((item) => {
                      const { icon: CatIcon, container } = getCategoryIcon(item.category);
                      return (
                        <Link
                          key={item._id}
                          href={`/complaints/${item._id}`}
                          className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-[#F7F8FC]/60 dark:bg-[#182235]/60 hover:bg-slate-100/80 dark:hover:bg-[#182235] transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${container}`}>
                              <CatIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-slate-700 dark:group-hover:text-slate-300">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>{item.area}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pl-3 shrink-0">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                              <ThumbsUp className="h-3 w-3 text-slate-500" />
                              {item.upvotes || 0}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Explore Link */}
                  <Link
                    href="/complaints"
                    className="block text-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white pt-1 transition-colors"
                  >
                    View all {pulseData.total} community complaints &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW AWAZ WORKS — 3 SOFT NUMBERED CARDS */}
        <section className="py-16 sm:py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-[#F7F8FC] dark:bg-[#0D1424]">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                RESOLUTION PROCESS
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                How AWAZ Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                A simple, democratic framework transforming citizen reports into municipal action.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 01 */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-3.5 transition-all hover:-translate-y-1">
                <div className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full w-fit">
                  01 — REPORT
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Tell Us What Happened
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Submit your report with location and category. Built-in duplicate detection alerts you if neighbors already filed the issue, letting you rally support instantly.
                </p>
              </div>

              {/* Step 02 */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-3.5 transition-all hover:-translate-y-1">
                <div className="text-xs font-mono font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full w-fit">
                  02 — RALLY
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Community Upvotes
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Neighbors upvote high-impact problems. The priority algorithm dynamically escalates issues from Medium to High and Critical as community urgency grows.
                </p>
              </div>

              {/* Step 03 */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-3.5 transition-all hover:-translate-y-1">
                <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full w-fit">
                  03 — RESOLVE
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Inspect & Verify
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Municipal officers dispatch field crews and record official remarks. Once marked resolved, reporting citizens evaluate the work with a 1–5 star rating.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ISSUE DIVISIONS WITH SOFT ICON CONTAINERS */}
        <section className="py-16 sm:py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#090E1A]">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                MUNICIPAL DIVISIONS
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                What Can You Report?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Issues are categorized to reach specialized city maintenance units without bureaucratic delays.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Link
                href="/complaints?category=road"
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#111827] p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-1 block group shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
              >
                <div className="h-10 w-10 rounded-2xl bg-blue-100/90 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                  <Route className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Roads & Transport</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Potholes, broken asphalt, damaged footpaths, open manholes, and malfunctioning signals.
                </p>
              </Link>

              <Link
                href="/complaints?category=garbage"
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#111827] p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-1 block group shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
              >
                <div className="h-10 w-10 rounded-2xl bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Garbage & Sanitation</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Uncollected waste heaps, overflowing dumpsters, clogged sewers, and illegal dumping.
                </p>
              </Link>

              <Link
                href="/complaints?category=water"
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#111827] p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-1 block group shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
              >
                <div className="h-10 w-10 rounded-2xl bg-sky-100/90 text-sky-700 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                  <Droplets className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Water Supply</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Burst pipeline mains, contaminated tap water, low pressure, and standing street wastewater.
                </p>
              </Link>

              <Link
                href="/complaints?category=electricity"
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#111827] p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-1 block group shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
              >
                <div className="h-10 w-10 rounded-2xl bg-amber-100/90 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Electricity & Power</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Exposed transformer cables, broken street lighting, dangling power lines, and blackouts.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-20 bg-gradient-to-b from-[#F7F8FC] to-white dark:from-[#0D1424] dark:to-[#090E1A]">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-900 dark:text-slate-100" />
              Public Accountability by Design
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Have something your city needs to hear?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Join your neighbors in creating cleaner, safer, and better-maintained communities with AWAZ.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/complaints/new">
                <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 px-8 h-12 text-sm font-bold rounded-xl shadow-[0_4px_16px_rgba(15,23,42,0.12)]">
                  Report an Issue Now
                </Button>
              </Link>
              <Link href="/complaints">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl">
                  Browse Community Issues
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
