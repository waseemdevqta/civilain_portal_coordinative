'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { complaintApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  ThumbsUp,
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  Check,
  AlertCircle,
  FileText,
  Route,
  Trash2,
  Droplets,
  Zap,
} from 'lucide-react';

export default function ComplaintDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams?.id;

  const router = useRouter();
  const { user, isAuthenticated, isCitizen, isOfficer } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchComplaint = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await complaintApi.getById(id);
        setComplaint(res.data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve complaint record');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to support this complaint.');
      router.push(`/login?redirect=/complaints/${id}`);
      return;
    }

    if (!isCitizen) {
      toast.error('Only citizens can support community complaints.');
      return;
    }

    setUpvoting(true);
    try {
      const res = await complaintApi.upvote(id);
      setComplaint(res.data);
      toast.success('Support registered! Issue priority recalculated.');
    } catch (err) {
      toast.error(err.message || 'Failed to register support');
    } finally {
      setUpvoting(false);
    }
  };

  const userIdStr = user?.id || user?._id;
  const hasUserUpvoted =
    userIdStr &&
    complaint?.upvotedBy &&
    complaint.upvotedBy.some(
      (uid) => (typeof uid === 'object' ? uid._id || uid : uid).toString() === userIdStr.toString()
    );

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

      <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
        {/* BACK BUTTON */}
        <div>
          <Link href="/complaints">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl h-9 px-3">
              <ArrowLeft className="h-4 w-4" />
              Back to Community Ledger
            </Button>
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 space-y-6">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="rounded-3xl border border-red-200/90 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/40 p-8 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
            <h2 className="text-base font-bold text-red-900 dark:text-red-200">Unable to locate complaint record</h2>
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 max-w-md mx-auto">{error}</p>
            <Link href="/complaints">
              <Button size="sm" variant="outline" className="text-xs rounded-xl mt-2">
                Return to Issues Feed
              </Button>
            </Link>
          </div>
        )}

        {/* CASE RECORD CONTAINER */}
        {complaint && !loading && (
          <div className="space-y-6">
            {/* MAIN CARD */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 sm:p-9 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-7">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    #CF-{complaint._id.slice(-6).toUpperCase()}
                  </span>
                  <CategoryBadge category={complaint.category} />
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore={true} />
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Logged {new Date(complaint.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                  {complaint.title}
                </h1>

                <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {complaint.area}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <User className="h-4 w-4 text-slate-400" />
                    Reported by {complaint.createdBy?.name || 'Citizen'}
                  </span>
                </div>
              </div>

              {/* LIFECYCLE PROGRESS BAR */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#182235]/60 p-5 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Lifecycle Progress
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Step 1: Reported */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      Reported
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Step 2: In Progress */}
                  <div
                    className={`p-3 rounded-xl border space-y-1 ${
                      complaint.status === 'in-progress' || complaint.status === 'resolved'
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-blue-700 dark:text-blue-400'
                        : 'bg-transparent border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 font-bold">
                      {complaint.status === 'in-progress' || complaint.status === 'resolved' ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      In Progress
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {complaint.status === 'in-progress' || complaint.status === 'resolved'
                        ? 'Field Crew Active'
                        : 'Pending dispatch'}
                    </div>
                  </div>

                  {/* Step 3: Resolved */}
                  <div
                    className={`p-3 rounded-xl border space-y-1 ${
                      complaint.status === 'resolved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-transparent border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 font-bold">
                      {complaint.status === 'resolved' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      Resolved
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {complaint.resolvedAt
                        ? new Date(complaint.resolvedAt).toLocaleDateString()
                        : 'Awaiting completion'}
                    </div>
                  </div>
                </div>
              </div>

              {/* WHAT HAPPENED — DESCRIPTION */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  What Happened?
                </h3>
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F8FC]/60 dark:bg-[#182235]/40 p-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {complaint.description}
                </div>
              </div>

              {/* OFFICIAL MUNICIPAL RESPONSE */}
              {complaint.officerRemark && (
                <div className="rounded-2xl border border-blue-200/90 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 p-5 sm:p-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Official Municipal Response
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {complaint.officerRemark}
                  </p>
                </div>
              )}

              {/* COMMUNITY SUPPORT & UPVOTES */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-slate-500" />
                    {complaint.upvotes || 0} Citizens Supporting This Issue
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Community support directly affects dynamic municipal priority score.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={handleUpvote}
                  disabled={upvoting || hasUserUpvoted}
                  className={`gap-1.5 h-10 px-5 rounded-xl text-xs font-bold transition-all ${
                    hasUserUpvoted
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 shadow-sm'
                  }`}
                >
                  {hasUserUpvoted ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Supported ({complaint.upvotes || 0})</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4" />
                      <span>Support This Issue</span>
                    </>
                  )}
                </Button>
              </div>

              {/* CITIZEN RESOLUTION REVIEW (IF GIVEN) */}
              {complaint.feedbackGiven && (
                <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      Citizen Resolution Rating
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < complaint.feedbackRating
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {complaint.feedbackComment && (
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
                      &quot;{complaint.feedbackComment}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
