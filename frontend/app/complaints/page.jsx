'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { complaintApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import {
  Search,
  Filter,
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  FilePlus,
  ArrowRight,
  AlertCircle,
  X,
  Check,
  Layers,
  Route,
  Trash2,
  Droplets,
  Zap,
  FileText,
} from 'lucide-react';

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Roads', value: 'road' },
  { label: 'Garbage', value: 'garbage' },
  { label: 'Water', value: 'water' },
  { label: 'Power', value: 'electricity' },
  { label: 'Other', value: 'other' },
];

const STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Resolved', value: 'resolved' },
];

export default function ComplaintsFeedPage() {
  const { user, isAuthenticated, isCitizen } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [area, setArea] = useState('');
  const [sort, setSort] = useState('recent');

  const [upvotingIds, setUpvotingIds] = useState(new Set());

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (status) params.status = status;
      if (area.trim()) params.area = area.trim();
      if (sort) params.sort = sort;

      const res = await complaintApi.getAll(params);
      setComplaints(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load complaints feed');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, area, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaints();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchComplaints]);

  const handleUpvote = async (complaintId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in as a citizen to support complaints.');
      return;
    }

    if (!isCitizen) {
      toast.error('Only citizens can support community complaints.');
      return;
    }

    setUpvotingIds((prev) => new Set(prev).add(complaintId));

    try {
      const res = await complaintApi.upvote(complaintId);
      const updated = res.data;

      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? updated : c))
      );
      toast.success('Support registered! Issue priority updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to support complaint');
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(complaintId);
        return next;
      });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setArea('');
    setSort('recent');
  };

  const hasActiveFilters = search || category || status || area || sort !== 'recent';

  const getCategoryIconDetails = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'road':
        return { icon: Route, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' };
      case 'garbage':
        return { icon: Trash2, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' };
      case 'water':
        return { icon: Droplets, color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' };
      case 'electricity':
        return { icon: Zap, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' };
      default:
        return { icon: FileText, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>COMMUNITY LEDGER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Community Issues
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              See what your city is talking about. Upvote reported problems to indicate civic urgency.
            </p>
          </div>

          {isAuthenticated && isCitizen && (
            <Link href="/complaints/new">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 gap-2 font-bold text-xs sm:text-sm h-11 px-5 rounded-xl shadow-[0_2px_10px_rgba(15,23,42,0.1)] shrink-0">
                <FilePlus className="h-4 w-4" />
                Report an Issue
              </Button>
            </Link>
          )}
        </div>

        {/* SEARCH & FILTERS TOOLBAR */}
        <div className="space-y-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Bar */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search community issues, keywords, locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 text-xs sm:text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Area Filter */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Filter by neighborhood area..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="pl-10 h-10 text-xs sm:text-sm"
              />
              {area && (
                <button
                  onClick={() => setArea('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Category:</span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    category === cat.value
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Status & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182235] px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-400"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182235] px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-400"
                >
                  <option value="recent">Recent</option>
                  <option value="upvotes">Most Supported</option>
                </select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 text-xs text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 gap-1 px-2.5 rounded-xl"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200/90 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/40 p-4 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>We couldn&apos;t load community issues. {error}</span>
          </div>
        )}

        {/* COMPLAINTS LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-900 dark:text-slate-100">{complaints.length}</strong> community reports
            </span>
            {hasActiveFilters && <span className="font-semibold text-slate-700 dark:text-slate-300">Filtered view active</span>}
          </div>

          {loading ? (
            <div className="space-y-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="No community reports found"
              description="Try adjusting your search terms or clearing category and neighborhood filters."
              actionText="Reset Filters"
              onAction={clearFilters}
            />
          ) : (
            <div className="space-y-3.5">
              {complaints.map((complaint) => {
                const userIdStr = user?.id || user?._id;
                const hasUserUpvoted =
                  userIdStr &&
                  complaint.upvotedBy &&
                  complaint.upvotedBy.some(
                    (uid) => (typeof uid === 'object' ? uid._id || uid : uid).toString() === userIdStr.toString()
                  );
                const isUpvoting = upvotingIds.has(complaint._id);
                const { icon: CatIcon, color: iconContainerClass } = getCategoryIconDetails(complaint.category);

                return (
                  <div
                    key={complaint._id}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)] hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left icon + Details */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${iconContainerClass}`}>
                          <CatIcon className="h-5 w-5" />
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              #CF-{complaint._id.slice(-6).toUpperCase()}
                            </span>
                            <CategoryBadge category={complaint.category} />
                            <StatusBadge status={complaint.status} />
                            <PriorityBadge
                              priority={complaint.priority}
                              score={complaint.priorityScore}
                              showScore={true}
                            />
                          </div>

                          <Link
                            href={`/complaints/${complaint._id}`}
                            className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300 block leading-snug"
                          >
                            {complaint.title}
                          </Link>

                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {complaint.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                            <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {complaint.area}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              {complaint.createdBy?.name || 'Citizen'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        <Button
                          variant={hasUserUpvoted ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => handleUpvote(complaint._id)}
                          disabled={isUpvoting || hasUserUpvoted}
                          className={`gap-1.5 h-9 rounded-xl text-xs font-bold px-3.5 transition-all ${
                            hasUserUpvoted
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182235] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {hasUserUpvoted ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Supported ({complaint.upvotes || 0})</span>
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                              <span>Support ({complaint.upvotes || 0})</span>
                            </>
                          )}
                        </Button>

                        <Link href={`/complaints/${complaint._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white gap-1 font-semibold px-3"
                          >
                            View Record
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Officer Remark */}
                    {complaint.officerRemark && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs bg-[#F7F8FC] dark:bg-[#182235] p-3 rounded-xl text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">Official Remark:</span>
                        <span className="text-slate-600 dark:text-slate-400">{complaint.officerRemark}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
