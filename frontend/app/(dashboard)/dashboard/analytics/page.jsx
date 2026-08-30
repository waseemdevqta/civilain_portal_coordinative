'use client';

import React, { useState, useEffect } from 'react';
import { complaintApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import HotspotHeatmap from '@/components/common/HotspotHeatmap';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  CheckCircle2,
  RefreshCw,
  Clock,
  Star,
  MapPin,
  Route,
  Trash2,
  Droplets,
  Zap,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        complaintApi.getStats().catch(() => ({ data: null })),
        complaintApi.getAll().catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setComplaints(listRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const total = stats?.total || complaints.length || 0;
  const pending = stats?.pending || 0;
  const inProgress = stats?.inProgress || 0;
  const resolved = stats?.resolved || 0;
  const critical = stats?.critical ?? stats?.criticalPriority ?? 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-[#F8F9FF] text-[#0B1C30] transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-3 py-0.5 text-xs font-bold text-[#1E40AF]">
                <Activity className="h-3.5 w-3.5 text-[#1E40AF]" />
                <span>MUNICIPAL DATA LEDGER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1C30]">
                Civic Analytics & Volume Insights
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Real-time complaint resolution velocity, category distributions, neighborhood density heatmaps, and community satisfaction trends.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              disabled={loading}
              className="gap-1.5 h-10 px-4 rounded-xl text-xs font-semibold border-slate-200 bg-white text-slate-800 hover:bg-[#F8F9FF] shrink-0 shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Metrics
            </Button>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgba(11,28,48,0.03)] space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total City Complaints
              </div>
              <div className="text-3xl font-extrabold text-[#0B1C30]">
                {loading ? <Skeleton className="h-9 w-16" /> : total}
              </div>
              <p className="text-xs text-[#1F6C3A] flex items-center gap-1 font-semibold">
                <TrendingUp className="h-3.5 w-3.5" /> Synchronized with live database
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgba(11,28,48,0.03)] space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Resolution Efficiency Rate
              </div>
              <div className="text-3xl font-extrabold text-[#0B1C30]">
                {loading ? <Skeleton className="h-9 w-16" /> : `${resolutionRate}%`}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {resolved} of {total} issues inspected & closed
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgba(11,28,48,0.03)] space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Average Citizen Rating
              </div>
              <div className="text-3xl font-extrabold text-[#0B1C30] flex items-center gap-2">
                {loading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <>
                    <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                    {stats && typeof (stats.averageRating ?? stats.averageFeedbackRating) === 'number'
                      ? `${(stats.averageRating ?? stats.averageFeedbackRating).toFixed(1)} / 5.0`
                      : 'N/A'}
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Citizen post-resolution verification
              </p>
            </div>
          </div>

          {/* Interactive Neighborhood Hotspots & Cluster Density Breakdown */}
          <HotspotHeatmap />

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-[0_4px_20px_rgba(11,28,48,0.03)] space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0B1C30]">Docket Status Breakdown</h3>
                <p className="text-xs text-slate-500">Current state of active vs completed civic complaints</p>
              </div>

              <div className="space-y-3.5">
                {/* Resolved */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#1F6C3A] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#1F6C3A]" /> Resolved
                    </span>
                    <span className="text-[#0B1C30] font-bold">{resolved} ({total > 0 ? Math.round((resolved / total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#1F6C3A] transition-all duration-500" style={{ width: `${total > 0 ? (resolved / total) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* In Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#1E40AF] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-600" /> In Progress (Field Deployed)
                    </span>
                    <span className="text-[#0B1C30] font-bold">{inProgress} ({total > 0 ? Math.round((inProgress / total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Pending */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-amber-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending Review
                    </span>
                    <span className="text-[#0B1C30] font-bold">{pending} ({total > 0 ? Math.round((pending / total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${total > 0 ? (pending / total) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-[0_4px_20px_rgba(11,28,48,0.03)] space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0B1C30]">Top Problem Divisions</h3>
                <p className="text-xs text-slate-500">Distribution across municipal service departments</p>
              </div>

              {stats?.topCategories && stats.topCategories.length > 0 ? (
                <div className="space-y-2.5">
                  {stats.topCategories.map((catItem) => (
                    <div
                      key={catItem.category}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FF] border border-slate-100 text-xs"
                    >
                      <CategoryBadge category={catItem.category} />
                      <span className="font-bold text-[#0B1C30]">{catItem.count} report(s)</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">No category breakdown data available.</div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
