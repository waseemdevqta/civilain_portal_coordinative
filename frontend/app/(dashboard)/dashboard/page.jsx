'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { complaintApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FilePlus,
  FileText,
  Layers,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintApi.getMine();
      setComplaints(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your complaints');
    } finally {
      setLoading(false);
    }
  };

  // Calculate counts
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'pending').length;
  const inProgress = complaints.filter((c) => c.status === 'in-progress').length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-[#F8F9FF] text-[#0B1C30] transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
          {/* PERSONAL HERO SUMMARY SECTION */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(11,28,48,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>CITIZEN DASHBOARD</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1C30]">
                  Good day, {user?.name || 'Citizen'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Here&apos;s what is happening with your neighborhood reports and municipal dispatches.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link href="/complaints/new">
                  <Button size="lg" variant="default" className="gap-2 font-bold text-xs sm:text-sm h-11 px-5 rounded-xl">
                    <FilePlus className="h-4 w-4" />
                    Report an Issue
                  </Button>
                </Link>
                <Link href="/complaints">
                  <Button size="lg" variant="outline" className="gap-2 border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/50 hover:text-emerald-900 hover:border-emerald-200 font-semibold text-xs sm:text-sm h-11 px-4 rounded-xl shadow-xs">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    Explore Issues
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-[#BA1A1A]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* METRIC BLOCKS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Reports
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1C30] mt-1.5">
                {loading ? <Skeleton className="h-8 w-12" /> : total}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Personal submissions</div>
            </div>

            {/* Pending */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs transition-all hover:shadow-md">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Active / Pending
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1.5">
                {loading ? <Skeleton className="h-8 w-12" /> : pending}
              </div>
              <div className="text-[11px] text-amber-700/80 mt-1">Awaiting dispatch</div>
            </div>

            {/* In Progress */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-xs transition-all hover:shadow-md">
              <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                In Progress
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1.5">
                {loading ? <Skeleton className="h-8 w-12" /> : inProgress}
              </div>
              <div className="text-[11px] text-blue-700/80 mt-1">Field crew on site</div>
            </div>

            {/* Resolved */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs transition-all hover:shadow-md">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Resolved
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-1.5">
                {loading ? <Skeleton className="h-8 w-12" /> : resolved}
              </div>
              <div className="text-[11px] text-emerald-700/80 mt-1">Completed & verified</div>
            </div>
          </div>

          {/* RECENT ACTIVITY LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0B1C30]">Your Recent Activity</h2>
                <p className="text-xs text-slate-500">Track current lifecycle progress and official responses</p>
              </div>
              {complaints.length > 0 && (
                <Link href="/complaints/mine">
                  <Button variant="ghost" size="sm" className="text-xs rounded-xl text-slate-700 hover:text-emerald-900 gap-1 h-9 font-semibold hover:bg-emerald-50/60">
                    View All ({complaints.length})
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                  </Button>
                </Link>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <EmptyState
                icon={FilePlus}
                title="No municipal complaints filed yet."
                description="Report road damage, uncleared trash, water leakages, or electrical hazards to get them resolved by municipal authorities."
                actionText="Report Your First Issue"
                onAction={() => {
                  window.location.href = '/complaints/new';
                }}
              />
            ) : (
              <div className="space-y-3.5">
                {complaints.slice(0, 5).map((complaint) => (
                  <div
                    key={complaint._id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          #CF-{complaint._id.slice(-6).toUpperCase()}
                        </span>
                        <CategoryBadge category={complaint.category} />
                        <StatusBadge status={complaint.status} />
                        <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} />
                      </div>

                      <Link
                        href={`/complaints/${complaint._id}`}
                        className="text-sm sm:text-base font-bold text-[#0B1C30] hover:text-emerald-700 block truncate"
                      >
                        {complaint.title}
                      </Link>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {complaint.area}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                          {complaint.upvotes || 0}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Link href={`/complaints/${complaint._id}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-9 rounded-xl text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/60 px-3 font-semibold">
                          View Status &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
