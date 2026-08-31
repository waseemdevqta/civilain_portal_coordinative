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
import ImageLightbox from '@/components/common/ImageLightbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import {
  Layers,
  Search,
  Filter,
  PlusCircle,
  FilePlus,
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  ArrowUpDown,
  CheckCircle2,
  X,
  AlertCircle,
  Flame,
  Check,
  Camera,
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'road', label: 'Roads' },
  { value: 'garbage', label: 'Garbage' },
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'other', label: 'Other' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function ComplaintsPage() {
  const { user, isAuthenticated } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Query State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [area, setArea] = useState('');
  const [sort, setSort] = useState('recent');

  // Upvoting loading map to prevent rapid multi-clicks
  const [upvotingIds, setUpvotingIds] = useState(new Set());

  // Lightbox Modal state
  const [activeLightbox, setActiveLightbox] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (category) params.category = category;
      if (status) params.status = status;
      if (area.trim()) params.area = area.trim();
      if (search.trim()) params.search = search.trim();
      if (sort) params.sort = sort;

      const res = await complaintApi.getAll(params);
      setComplaints(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load civic complaints');
    } finally {
      setLoading(false);
    }
  }, [category, status, area, search, sort]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Handle Community Upvote
  const handleUpvote = async (complaintId) => {
    if (!isAuthenticated) {
      toast.info('Please sign in or register to support neighborhood reports');
      return;
    }

    if (upvotingIds.has(complaintId)) return;

    setUpvotingIds((prev) => new Set(prev).add(complaintId));

    try {
      const res = await complaintApi.upvote(complaintId);
      toast.success('Thank you! Your support has been recorded.');

      // Update complaint in state
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? res.data : c))
      );
    } catch (err) {
      toast.error(err.message || 'Could not record support');
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(complaintId);
        return next;
      });
    }
  };

  const hasUpvoted = (complaint) => {
    if (!user || !complaint?.upvotedBy) return false;
    const userId = user.id || user._id;
    return complaint.upvotedBy.some(
      (upvoterId) => (upvoterId._id || upvoterId).toString() === userId?.toString()
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF] text-[#0B1C30] transition-colors">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              <Layers className="h-3.5 w-3.5 text-emerald-600" />
              <span>LIVE CIVIC LEDGER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1C30]">
              Community Issues Feed
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Browse public municipal reports, inspect verified photo evidence, rally community support, and track dispatch status in real time.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/complaints/new">
              <Button size="lg" variant="default" className="w-full sm:w-auto gap-2 font-bold text-xs sm:text-sm h-11 px-5 rounded-xl">
                <FilePlus className="h-4 w-4" />
                Report an Issue
              </Button>
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(11,28,48,0.03)] p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Search Input */}
            <div className="relative md:col-span-6">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search by keywords, title, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 text-xs sm:text-sm rounded-xl bg-[#F8F9FF] border-slate-200 focus-visible:ring-emerald-600"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Area Filter */}
            <div className="relative md:col-span-3">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Filter by neighborhood..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="pl-10 h-10 text-xs sm:text-sm rounded-xl bg-[#F8F9FF] border-slate-200 focus-visible:ring-emerald-600"
              />
              {area && (
                <button
                  onClick={() => setArea('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-[#F8F9FF] px-3 text-xs sm:text-sm font-semibold text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="recent">Sort: Newest First</option>
                <option value="upvotes">Sort: Highest Community Support</option>
                <option value="priority">Sort: Priority Urgency</option>
              </select>
            </div>
          </div>

          {/* Category Chips & Status Filter Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    category === cat.value
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_2px_8px_rgba(5,150,105,0.3)] scale-[1.02]'
                      : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Status Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-8 rounded-xl border border-slate-200 bg-[#F8F9FF] px-2.5 text-xs font-semibold text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-[#BA1A1A]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* COMPLAINTS LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
            <span>Showing {complaints.length} complaint(s)</span>
            {(category || status || area || search) && (
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setStatus('');
                  setArea('');
                  setSort('recent');
                }}
                className="text-emerald-700 hover:underline font-bold"
              >
                Clear all filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No complaints match your filter."
              description="Try clearing your search query or selecting another category to see more neighborhood reports."
              actionText="Reset All Filters"
              onAction={() => {
                setSearch('');
                setCategory('');
                setStatus('');
                setArea('');
              }}
            />
          ) : (
            <div className="space-y-3.5">
              {complaints.map((complaint) => {
                const userUpvoted = hasUpvoted(complaint);
                const isUpvotingThis = upvotingIds.has(complaint._id);
                const hasPhoto = Boolean(complaint.imageUrl);
                const hasResolutionPhoto = Boolean(complaint.resolutionImageUrl);

                return (
                  <div
                    key={complaint._id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Photo Thumbnail if present */}
                      {hasPhoto && (
                        <div
                          onClick={() =>
                            setActiveLightbox({
                              url: complaint.imageUrl,
                              title: complaint.title,
                              subtitle: `Reported in ${complaint.area}`,
                            })
                          }
                          className="relative w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-[#F1F5F9] border border-[#CBD5E1] flex-shrink-0 cursor-pointer group shadow-2xs"
                          title="Click to expand photo"
                        >
                          <img
                            src={complaint.imageUrl}
                            alt={complaint.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-[#0B1C30]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Camera className="w-5 h-5 drop-shadow-md" />
                          </div>
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-[#0B1C30]/80 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            Photo
                          </span>
                        </div>
                      )}

                      {/* Complaint Information */}
                      <div className="space-y-2.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            #CF-{complaint._id.slice(-6).toUpperCase()}
                          </span>
                          <CategoryBadge category={complaint.category} />
                          <StatusBadge status={complaint.status} />
                          <PriorityBadge
                            priority={complaint.priority}
                            score={complaint.priorityScore}
                            showScore={true}
                          />
                          {hasResolutionPhoto && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Fixed With Photo Proof
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/complaints/${complaint._id}`}
                          className="text-base sm:text-lg font-bold text-[#0B1C30] hover:text-emerald-700 block transition-colors leading-snug"
                        >
                          {complaint.title}
                        </Link>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {complaint.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
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

                      {/* Right Action: Support / Upvote Button */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 pt-2 sm:pt-0">
                        <Button
                          size="sm"
                          onClick={() => handleUpvote(complaint._id)}
                          disabled={isUpvotingThis || userUpvoted}
                          className={`gap-1.5 h-10 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            userUpvoted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-900'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-[0_4px_12px_rgba(5,150,105,0.22)]'
                          }`}
                        >
                          {userUpvoted ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Supported ({complaint.upvotes || 0})</span>
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="h-3.5 w-3.5" />
                              <span>Support ({complaint.upvotes || 0})</span>
                            </>
                          )}
                        </Button>

                        <Link href={`/complaints/${complaint._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-9 rounded-xl text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/60 px-3 font-semibold"
                          >
                            View Details &rarr;
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Officer Remark snippet if present */}
                    {complaint.officerRemark && (
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs bg-emerald-50/40 p-3.5 rounded-2xl text-slate-700 flex items-start gap-2 border border-emerald-100">
                        <span className="font-bold text-emerald-900 shrink-0">Official Response:</span>
                        <span className="text-slate-600 leading-relaxed">{complaint.officerRemark}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <ImageLightbox
          isOpen={true}
          onClose={() => setActiveLightbox(null)}
          imageUrl={activeLightbox.url}
          title={activeLightbox.title}
          subtitle={activeLightbox.subtitle}
        />
      )}

      <Footer />
    </div>
  );
}
