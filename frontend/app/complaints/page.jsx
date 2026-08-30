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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import {
  Search,
  Filter,
  ArrowUpDown,
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  FilePlus,
  ArrowRight,
  AlertCircle,
  X,
  Check,
  Building2,
} from 'lucide-react';

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Road', value: 'road' },
  { label: 'Garbage', value: 'garbage' },
  { label: 'Water', value: 'water' },
  { label: 'Electricity', value: 'electricity' },
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
      toast.error('Please sign in as a citizen to upvote complaints.');
      return;
    }

    if (!isCitizen) {
      toast.error('Only citizens can upvote community complaints.');
      return;
    }

    setUpvotingIds((prev) => new Set(prev).add(complaintId));

    try {
      const res = await complaintApi.upvote(complaintId);
      const updated = res.data;

      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? updated : c))
      );
      toast.success('Upvote registered! Urgency updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to upvote complaint');
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

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Public Ledger
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Civic Complaints Feed
            </h1>
            <p className="mt-0.5 text-xs text-slate-600">
              Public record of community infrastructure issues. Upvote reported problems to indicate civic urgency.
            </p>
          </div>

          {isAuthenticated && isCitizen && (
            <Link href="/complaints/new">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 shadow-sm shrink-0">
                <FilePlus className="h-4 w-4" />
                Report an Issue
              </Button>
            </Link>
          )}
        </div>

        {/* SEARCH & FILTERS TOOLBAR */}
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Search Bar */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search by keywords, problem title, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Area Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Filter by neighborhood area..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              {area && (
                <button
                  onClick={() => setArea('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-600 mr-1">Category:</span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    category === cat.value
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
                <span className="text-xs font-semibold text-slate-600">Status:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-8 rounded border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                <span className="text-xs font-semibold text-slate-600">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-8 rounded border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="recent">Newest First</option>
                  <option value="upvotes">Most Upvoted</option>
                </select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs text-slate-600 hover:text-red-700 gap-1 px-2"
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
          <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* COMPLAINTS LIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900">{complaints.length}</strong> complaints
            </span>
            {hasActiveFilters && <span className="font-medium text-slate-700">Filtered view active</span>}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
              <Filter className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">No complaints match your selection</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Try modifying your search keywords or resetting filters.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button size="sm" variant="outline" onClick={clearFilters} className="text-xs">
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint) => {
                const userIdStr = user?.id || user?._id;
                const hasUserUpvoted =
                  userIdStr &&
                  complaint.upvotedBy &&
                  complaint.upvotedBy.some(
                    (uid) => (typeof uid === 'object' ? uid._id || uid : uid).toString() === userIdStr.toString()
                  );
                const isUpvoting = upvotingIds.has(complaint._id);

                return (
                  <div
                    key={complaint._id}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-medium text-slate-500">
                            #CF-{complaint._id.slice(-4).toUpperCase()}
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
                          className="text-base font-bold text-slate-900 hover:text-slate-700 block leading-snug"
                        >
                          {complaint.title}
                        </Link>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {complaint.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-medium text-slate-800">
                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
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

                      {/* Right Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <Button
                          variant={hasUserUpvoted ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => handleUpvote(complaint._id)}
                          disabled={isUpvoting || hasUserUpvoted}
                          className={`gap-1.5 h-8 text-xs font-semibold ${
                            hasUserUpvoted
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          {hasUserUpvoted ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Upvoted ({complaint.upvotes || 0})</span>
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="h-3.5 w-3.5 text-slate-600" />
                              <span>Upvote ({complaint.upvotes || 0})</span>
                            </>
                          )}
                        </Button>

                        <Link href={`/complaints/${complaint._id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600 hover:text-slate-900 gap-1">
                            View Record
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Officer Remark */}
                    {complaint.officerRemark && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs bg-slate-50 p-2.5 rounded text-slate-700 flex items-start gap-2">
                        <span className="font-semibold text-slate-900 shrink-0">Officer Remark:</span>
                        <span className="text-slate-600">{complaint.officerRemark}</span>
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
