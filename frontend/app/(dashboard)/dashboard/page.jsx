'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { complaintApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FilePlus,
  FileText,
  ListFilter,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
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
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Citizen Workspace
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Track your filed civic issues, review municipal progress, and upvote neighborhood priorities.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/complaints/new">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 shadow-sm">
              <FilePlus className="h-4 w-4" />
              Report Civic Issue
            </Button>
          </Link>
          <Link href="/complaints">
            <Button size="sm" variant="outline" className="gap-1.5 border-slate-300 bg-white text-slate-800">
              <ListFilter className="h-4 w-4 text-slate-600" />
              Browse Issues
            </Button>
          </Link>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* COMPACT CLEAN STAT BLOCKS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Filed
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {loading ? <Skeleton className="h-7 w-10" /> : total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Personal submissions</div>
        </div>

        {/* Pending */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Pending Review
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">
            {loading ? <Skeleton className="h-7 w-10" /> : pending}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1">Awaiting crew dispatch</div>
        </div>

        {/* In Progress */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
            In Progress
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {loading ? <Skeleton className="h-7 w-10" /> : inProgress}
          </div>
          <div className="text-[11px] text-blue-700/80 mt-1">Field action active</div>
        </div>

        {/* Resolved */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Resolved
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">
            {loading ? <Skeleton className="h-7 w-10" /> : resolved}
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1">Completed & verified</div>
        </div>
      </div>

      {/* RECENT COMPLAINTS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Recent Complaint Submissions</h2>
            <p className="text-xs text-slate-500">Track current lifecycle progress and official responses</p>
          </div>
          {complaints.length > 0 && (
            <Link href="/complaints/mine">
              <Button variant="ghost" size="sm" className="text-xs text-slate-700 hover:text-slate-900 gap-1 h-8">
                View All ({complaints.length})
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-600 mb-3">
              <FilePlus className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No complaints reported yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Notice an infrastructure problem in your area? Submit a formal ticket to notify municipal teams.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/complaints/new">
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 text-xs">
                  <FilePlus className="h-3.5 w-3.5" />
                  Report Your First Issue
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {complaints.slice(0, 4).map((complaint) => (
              <div
                key={complaint._id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-500 font-medium">
                        #CF-{complaint._id.slice(-4).toUpperCase()}
                      </span>
                      <CategoryBadge category={complaint.category} />
                      <StatusBadge status={complaint.status} />
                      <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} />
                    </div>

                    <Link
                      href={`/complaints/${complaint._id}`}
                      className="text-sm font-bold text-slate-900 hover:text-slate-700 block truncate"
                    >
                      {complaint.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {complaint.area}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <ThumbsUp className="h-3.5 w-3.5 text-slate-500" />
                        {complaint.upvotes || 0} upvotes
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 self-start sm:self-center">
                    <Link href={`/complaints/${complaint._id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs border-slate-300 gap-1 text-slate-800">
                        View Details
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {complaint.officerRemark && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs bg-slate-50 p-2.5 rounded text-slate-700 flex items-start gap-2">
                    <span className="font-semibold text-slate-900 shrink-0">Officer Remark:</span>
                    <span className="text-slate-600">{complaint.officerRemark}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
