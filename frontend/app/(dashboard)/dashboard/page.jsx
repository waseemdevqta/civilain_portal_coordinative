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
      <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
          {/* PERSONAL HERO SUMMARY SECTION */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,23,42,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>CITIZEN DASHBOARD</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  Good day, {user?.name || 'Citizen'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Here&apos;s what is happening with your neighborhood reports and municipal dispatches.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link href="/complaints/new">
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 gap-2 font-bold text-xs sm:text-sm h-11 px-5 rounded-xl shadow-[0_2px_10px_rgba(15,23,42,0.1)]">
                    <FilePlus className="h-4 w-4" />
                    Report an Issue
                  </Button>
                </Link>
                <Link href="/complaints">
                  <Button size="lg" variant="outline" className="gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182235] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm h-11 px-4 rounded-xl">
                    <Layers className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Explore Issues
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200/90 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/40 p-4 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* METRIC BLOCKS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Reports
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1.5">
                {loading ? <Skeleton className="h-8 w-12" /> : total}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Personal submissions</div>
            </div>

            {/* Pending */}
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
              <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Active / Pending
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 dark:text-amber-200 mt-1.5">
                {loading ? <Skeleton className="h-8 w-12" /> : pending}
              </div>
              <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1">Awaiting dispatch</div>
            </div>

            {/* In Progress */}
            <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
              <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                In Progress
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 dark:text-blue-200 mt-1.5">
                {loading ? <Skeleton className="h-8 w-12" /> : inProgress}
              </div>
              <div className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-1">Field crew on site</div>
            </div>

            {/* Resolved */}
            <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Resolved
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1.5">
                {loading ? <Skeleton className="h-8 w-12" /> : resolved}
              </div>
              <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">Completed & sealed</div>
            </div>
          </div>

          {/* RECENT ACTIVITY LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Your Recent Activity</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Track current lifecycle progress and official responses</p>
              </div>
              {complaints.length > 0 && (
                <Link href="/complaints/mine">
                  <Button variant="ghost" size="sm" className="text-xs rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white gap-1 h-9 font-semibold">
                    View All ({complaints.length})
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-2.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <EmptyState
                icon={FilePlus}
                title="Your civic record is clear."
                description="You haven't reported an issue yet. Notice a problem in your neighborhood? File a formal report to alert municipal teams."
                actionText="Report an Issue"
                onAction={() => {
                  window.location.href = '/complaints/new';
                }}
              />
            ) : (
              <div className="space-y-3">
                {complaints.slice(0, 4).map((complaint) => (
                  <div
                    key={complaint._id}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            #CF-{complaint._id.slice(-6).toUpperCase()}
                          </span>
                          <CategoryBadge category={complaint.category} />
                          <StatusBadge status={complaint.status} />
                          <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} />
                        </div>

                        <Link
                          href={`/complaints/${complaint._id}`}
                          className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300 block truncate"
                        >
                          {complaint.title}
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {complaint.area}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                            <ThumbsUp className="h-3.5 w-3.5 text-slate-500" />
                            {complaint.upvotes || 0} supporters
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 self-start sm:self-center">
                        <Link href={`/complaints/${complaint._id}`}>
                          <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs border-slate-200 dark:border-slate-800 gap-1 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold px-3.5">
                            View Ticket
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {complaint.officerRemark && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs bg-[#F7F8FC] dark:bg-[#182235] p-3 rounded-xl text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">Official Remark:</span>
                        <span className="text-slate-600 dark:text-slate-400">{complaint.officerRemark}</span>
                      </div>
                    )}
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
