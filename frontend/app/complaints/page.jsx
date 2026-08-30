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
  Camera,
  CheckCircle2,
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

  // Lightbox State
  const [activeLightbox, setActiveLightbox] = useState(null);

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
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? res.data : c))
      );
      toast.success('Your support was registered! Dynamic priority score updated.');
    } catch (err) {
      toast.error(err.message || 'Could not register upvote.');
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(complaintId);
        return next;
      });
    }
  };

  const hasUpvoted = (complaint) => {
    const userIdStr = user?.id || user?._id;
    if (!userIdStr || !complaint.upvotedBy) return false;
    return complaint.upvotedBy.some(
      (uid) => (typeof uid === 'object' ? uid._id || uid : uid).toString() === userIdStr.toString()
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF] text-[#0B1C30] transition-colors">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-3 py-0.5 text-xs font-bold text-[#1E40AF]">
              <Layers className="h-3.5 w-3.5 text-[#1E40AF]" />
              <span>COMMUNITY LEDGER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1C30]">
              Neighborhood Issues Feed
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Browse public municipal reports, inspect verified photo evidence, rally community support, and track dispatch status in real time.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/complaints/new">
              <Button size="lg" className="w-full sm:w-auto bg-[#0F172A] hover:bg-[#1E293B] text-white gap-2 font-bold text-xs sm:text-sm h-11 px-5 rounded-xl shadow-[0_4px_16px_rgba(15,23,42,0.15)] hover:-translate-y-0.5 transition-all">
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
                className="pl-10 h-10 text-xs sm:text-sm rounded-xl bg-[#F8F9FF] border-slate-200"
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
                className="pl-10 h-10 text-xs sm:text-sm rounded-xl bg-[#F8F9FF] border-slate-200"
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
                className="w-full h-10 rounded-xl border border-slate-200 bg-[#F8F9FF] px-3 text-xs sm:text-sm font-semibold text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    category === cat.value
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'bg-[#F8F9FF] text-slate-700 hover:bg-[#EFF4FF] border border-slate-200'
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
                className="h-8 rounded-xl border border-slate-200 bg-[#F8F9FF] px-2.5 text-xs font-semibold text-[#0B1C30] focus:outline-none"
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
                className="text-[#1E40AF] hover:underline font-bold"
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
                    className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
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
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1F6C3A] bg-[#E8F9ED] px-2 py-0.5 rounded-full border border-[#A4F1B2]">
                              <CheckCircle2 className="w-3 h-3" />
                              Fixed With Photo Proof
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/complaints/${complaint._id}`}
                          className="text-base sm:text-lg font-bold text-[#0B1C30] hover:text-[#1E40AF] block transition-colors leading-snug"
                        >
                          {complaint.title}
                        </Link>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {complaint.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
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

                      {/* Right Action: Upvote & View Details */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 pt-2 sm:pt-0">
                        <Button
                          size="sm"
                          onClick={() => handleUpvote(complaint._id)}
                          disabled={isUpvotingThis || userUpvoted}
                          className={`gap-1.5 h-10 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            userUpvoted
                              ? 'bg-[#E8F9ED] text-[#1F6C3A] border border-[#A4F1B2] hover:bg-[#E8F9ED]'
                              : 'bg-[#0F172A] hover:bg-[#1E293B] text-white'
                          }`}
                        >
                          {userUpvoted ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#1F6C3A]" />
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
                            className="text-xs h-9 rounded-xl text-slate-600 hover:text-[#0B1C30] hover:bg-[#F8F9FF] px-3 font-semibold"
                          >
                            View Details &rarr;
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Officer Remark snippet if present */}
                    {complaint.officerRemark && (
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs bg-[#F8F9FF] p-3.5 rounded-2xl text-slate-700 flex items-start gap-2 border border-slate-100">
                        <span className="font-bold text-[#0B1C30] shrink-0">Official Response:</span>
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
