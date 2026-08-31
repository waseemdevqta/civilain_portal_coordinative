'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { complaintApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import ImageLightbox from '@/components/common/ImageLightbox';
import WorkOrderModal from '@/components/common/WorkOrderModal';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toaster';
import {
  ArrowLeft,
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  Check,
  Loader2,
  Camera,
  ExternalLink,
  Printer,
  Sparkles,
  Wrench,
} from 'lucide-react';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isOfficer } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upvoting, setUpvoting] = useState(false);

  // Lightbox and Docket states
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [showDocketModal, setShowDocketModal] = useState(false);

  // Feedback modal state (for complaint creator upon resolution)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchComplaint = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintApi.getById(id);
      setComplaint(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load case record');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchComplaint();
    }
  }, [id, fetchComplaint]);

  // Handle Community Support Upvote
  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to support this neighborhood issue');
      router.push(`/login?redirect=/complaints/${complaint?._id || id}`);
      return;
    }

    if (!complaint || upvoting) return;

    setUpvoting(true);
    try {
      const res = await complaintApi.upvote(complaint._id);
      toast.success('Thank you! Your support has been recorded and priority escalated.');
      setComplaint(res.data);
    } catch (err) {
      toast.error(err.message || 'Could not record support');
    } finally {
      setUpvoting(false);
    }
  };

  // Handle Citizen Resolution Feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!complaint) return;

    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await complaintApi.submitFeedback(complaint._id, {
        rating,
        comment: feedbackComment.trim(),
      });

      toast.success('Thank you! Your resolution rating has been submitted.');
      setComplaint(res.data);
      setShowFeedbackModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const userIdStr = user?.id || user?._id;
  const hasUserUpvoted =
    userIdStr &&
    complaint?.upvotedBy &&
    complaint.upvotedBy.some(
      (uid) => (typeof uid === 'object' ? uid._id || uid : uid).toString() === userIdStr.toString()
    );

  const creatorIdStr =
    typeof complaint?.createdBy === 'object'
      ? complaint?.createdBy?._id || complaint?.createdBy?.id
      : complaint?.createdBy;
  const isOwner = userIdStr && creatorIdStr && userIdStr.toString() === creatorIdStr.toString();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF] text-[#0B1C30] transition-colors">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
        {/* TOP BAR WITH BACK & DOCKET ACTION */}
        <div className="flex items-center justify-between">
          <Link href="/complaints">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/60 rounded-xl h-9 px-3 font-semibold">
              <ArrowLeft className="h-4 w-4" />
              Back to Community Ledger
            </Button>
          </Link>

          {complaint && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDocketModal(true)}
              className="gap-1.5 text-xs font-semibold rounded-xl h-9 px-3.5 border-slate-200 bg-white hover:bg-emerald-50/50 hover:text-emerald-900 hover:border-emerald-200 text-[#0B1C30] shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5 text-emerald-600" />
              Print Municipal Docket
            </Button>
          )}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-6">
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
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-[#BA1A1A] mx-auto" />
            <h2 className="text-base font-bold text-red-900">Unable to locate complaint record</h2>
            <p className="text-xs sm:text-sm text-red-700 max-w-md mx-auto">{error}</p>
            <Link href="/complaints">
              <Button size="sm" variant="outline" className="text-xs rounded-xl mt-2 border-red-200">
                Return to Issues Feed
              </Button>
            </Link>
          </div>
        )}

        {/* CASE RECORD CONTAINER */}
        {complaint && !loading && (
          <div className="space-y-6">
            {/* MAIN CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 shadow-[0_4px_20px_rgba(11,28,48,0.03)] space-y-7">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    #CF-{complaint._id.slice(-6).toUpperCase()}
                  </span>
                  <CategoryBadge category={complaint.category} />
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore={true} />
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Logged {new Date(complaint.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B1C30] leading-tight">
                  {complaint.title}
                </h1>

                <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    {complaint.area}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <User className="h-4 w-4 text-slate-400" />
                    Reported by {complaint.createdBy?.name || 'Citizen'}
                  </span>
                  {complaint.assignedTechnician && (
                    <span className="flex items-center gap-1.5 font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      <Wrench className="h-3.5 w-3.5 text-blue-600" />
                      Assigned Crew: {complaint.assignedTechnician.name}
                      {complaint.assignedTechnician.designation ? ` (${complaint.assignedTechnician.designation})` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* LIFECYCLE PROGRESS BAR */}
              <div className="rounded-2xl border border-slate-200 bg-[#F8F9FF] p-5 space-y-3">
                <div className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider">
                  Lifecycle Progress
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Step 1: Reported */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Reported
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Step 2: In Progress */}
                  <div
                    className={`p-3 rounded-xl border space-y-1 ${
                      complaint.status === 'in-progress' || complaint.status === 'resolved'
                        ? 'bg-white border-slate-200 text-blue-700 shadow-2xs'
                        : 'bg-transparent border-dashed border-slate-300 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 font-bold">
                      {complaint.status === 'in-progress' || complaint.status === 'resolved' ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      In Progress
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {complaint.status === 'in-progress' || complaint.status === 'resolved'
                        ? 'Field Crew Active'
                        : 'Pending dispatch'}
                    </div>
                  </div>

                  {/* Step 3: Resolved */}
                  <div
                    className={`p-3 rounded-xl border space-y-1 ${
                      complaint.status === 'resolved'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-2xs'
                        : 'bg-transparent border-dashed border-slate-300 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 font-bold">
                      {complaint.status === 'resolved' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      Resolved
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {complaint.resolvedAt
                        ? new Date(complaint.resolvedAt).toLocaleDateString()
                        : 'Awaiting completion'}
                    </div>
                  </div>
                </div>
              </div>

              {/* WHAT HAPPENED — DESCRIPTION */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider">
                  What Happened?
                </h3>
                <div className="rounded-2xl border border-slate-200 bg-[#F8F9FF] p-5 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {complaint.description}
                </div>
              </div>

              {/* VISUAL EVIDENCE & BEFORE/AFTER FIX SECTION */}
              {(complaint.imageUrl || complaint.resolutionImageUrl) && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      Visual Photographic Evidence
                    </h3>
                    <span className="text-[11px] text-[#526071]">Click any photo to zoom</span>
                  </div>

                  {/* If both report and resolution images exist, display side-by-side Before/After */}
                  {complaint.imageUrl && complaint.resolutionImageUrl ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Before (Citizen Report) */}
                      <div
                        onClick={() =>
                          setActiveLightbox({
                            url: complaint.imageUrl,
                            title: 'Initial Incident Report (Before Fix)',
                            subtitle: `Submitted by citizen on ${new Date(complaint.createdAt).toLocaleDateString()}`,
                          })
                        }
                        className="group relative rounded-2xl overflow-hidden bg-[#F1F5F9] border border-[#CBD5E1] cursor-pointer shadow-xs"
                      >
                        <div className="h-52 w-full overflow-hidden">
                          <img
                            src={complaint.imageUrl}
                            alt="Before Fix"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3 bg-white border-t border-[#CBD5E1] flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold uppercase text-slate-700 block">Initial Citizen Report</span>
                            <span className="text-xs text-[#526071]">Before municipal repairs</span>
                          </div>
                          <span className="text-xs font-semibold text-emerald-700 group-hover:underline">Zoom ↗</span>
                        </div>
                      </div>

                      {/* After (Resolution Proof) */}
                      <div
                        onClick={() =>
                          setActiveLightbox({
                            url: complaint.resolutionImageUrl,
                            title: 'Municipal Resolution Proof (After Fix)',
                            subtitle: `Verified resolved on ${complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : 'Recent date'}`,
                          })
                        }
                        className="group relative rounded-2xl overflow-hidden bg-emerald-50/50 border border-emerald-200 cursor-pointer shadow-xs"
                      >
                        <div className="h-52 w-full overflow-hidden">
                          <img
                            src={complaint.resolutionImageUrl}
                            alt="After Fix"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3 bg-white border-t border-emerald-200 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold uppercase text-emerald-800 block">After Municipal Fix</span>
                            <span className="text-xs text-[#526071]">Officer Resolution Proof</span>
                          </div>
                          <span className="text-xs font-semibold text-emerald-700 group-hover:underline">Zoom ↗</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Single Image View */
                    <div
                      onClick={() =>
                        setActiveLightbox({
                          url: complaint.imageUrl || complaint.resolutionImageUrl,
                          title: complaint.imageUrl ? 'Citizen Report Photo Evidence' : 'Resolution Proof Photo',
                          subtitle: complaint.title,
                        })
                      }
                      className="group relative rounded-2xl overflow-hidden bg-[#F1F5F9] border border-[#CBD5E1] cursor-pointer shadow-xs max-w-lg"
                    >
                      <div className="h-64 w-full overflow-hidden">
                        <img
                          src={complaint.imageUrl || complaint.resolutionImageUrl}
                          alt="Evidence"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 bg-white border-t border-[#E2E8F0] flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#0B1C30]">
                          {complaint.imageUrl ? 'Citizen Incident Photo Evidence' : 'Officer Resolution Proof'}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 group-hover:underline">Click to view full photo ↗</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* OFFICIAL MUNICIPAL RESPONSE */}
              {complaint.officerRemark && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 sm:p-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Official Municipal Response
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {complaint.officerRemark}
                  </p>
                </div>
              )}

              {/* COMMUNITY SUPPORT & DEMOCRATIC PRIORITY SECTION */}
              <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-6 sm:p-7 shadow-[0_4px_20px_rgba(5,150,105,0.06)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
                        <ThumbsUp className="h-4 w-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-[#0B1C30]">
                        Community Support & Democratic Priority
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {isOfficer
                        ? 'Citizen upvotes directly affect the computed priority score used for dispatch ordering.'
                        : 'Every verified citizen upvote elevates this ticket in the municipal field crew dispatch queue.'}
                    </p>
                  </div>

                  {/* Only citizens can upvote; officers see a read-only badge */}
                  {!isOfficer ? (
                    <Button
                      size="lg"
                      onClick={handleUpvote}
                      disabled={upvoting || hasUserUpvoted}
                      className={`gap-2 h-12 px-6 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 shadow-md ${
                        hasUserUpvoted
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-100 cursor-default shadow-xs'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-[0_4px_16px_rgba(5,150,105,0.28)] hover:-translate-y-0.5'
                      }`}
                    >
                      {hasUserUpvoted ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-800" />
                          <span>You Supported This ({complaint.upvotes || 0})</span>
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="h-4 w-4" />
                          <span>Support & Upvote ({complaint.upvotes || 0})</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xs shrink-0">
                      <ThumbsUp className="h-4 w-4 text-emerald-600" />
                      {complaint.upvotes || 0} citizen supporters
                    </span>
                  )}
                </div>

                {/* Priority Impact & Support Status Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Citizen Upvotes</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-black text-emerald-800">{complaint.upvotes || 0}</span>
                      <span className="text-xs text-slate-500 font-medium">supporters</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Computed Priority Score</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-black text-[#0B1C30]">{complaint.priorityScore || 0} pts</span>
                      <PriorityBadge priority={complaint.priority} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Dispatch Escalation</span>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-800">
                      <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
                      <span>{complaint.upvotes >= 10 ? 'High Priority Accelerated' : 'Escalates at 10+ votes'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CITIZEN RESOLUTION REVIEW (IF GIVEN) */}
              {complaint.feedbackGiven && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
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
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {complaint.feedbackComment && (
                    <p className="text-xs sm:text-sm text-slate-700 italic">
                      &quot;{complaint.feedbackComment}&quot;
                    </p>
                  )}
                </div>
              )}

              {/* OWNER RESOLUTION FEEDBACK TRIGGER (IF RESOLVED AND NOT YET GIVEN) */}
              {complaint.status === 'resolved' && !complaint.feedbackGiven && isOwner && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <div className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Your reported issue has been marked resolved.
                    </div>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Please rate the quality of the municipal resolution to verify completion.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowFeedbackModal(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white gap-1.5 text-xs h-10 px-5 rounded-xl shrink-0 font-bold shadow-[0_4px_12px_rgba(5,150,105,0.25)] hover:-translate-y-0.5 transition-all"
                  >
                    <Star className="h-3.5 w-3.5" />
                    Rate Resolution Quality
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FEEDBACK DIALOG */}
        <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
          <DialogContent className="bg-white border-slate-200 sm:max-w-md shadow-[0_12px_32px_rgba(11,28,48,0.1)] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#0B1C30] text-lg font-bold">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Rate Resolution Quality
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500">
                Your rating confirms work completion and helps evaluate municipal service standards.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 py-2">
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8F9FF] text-xs">
                <div className="font-bold text-[#0B1C30] truncate">{complaint?.title}</div>
                <div className="text-slate-500 mt-0.5">{complaint?.area}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Service Rating (1–5 Stars)</Label>
                <div className="flex items-center gap-2.5 justify-center py-3 bg-[#F8F9FF] rounded-2xl border border-slate-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center text-xs font-bold text-[#0B1C30]">
                  {rating === 5 && '5 Stars — Excellent Resolution'}
                  {rating === 4 && '4 Stars — Good Work'}
                  {rating === 3 && '3 Stars — Acceptable'}
                  {rating === 2 && '2 Stars — Below Standard'}
                  {rating === 1 && '1 Star — Unsatisfactory'}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="detail-comment" className="text-xs font-semibold text-slate-700">
                  Feedback Remarks (Optional)
                </Label>
                <Textarea
                  id="detail-comment"
                  placeholder="Share any comments regarding work quality, timeliness, or cleanup..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={3}
                  className="text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedbackModal(false)}
                  disabled={submittingFeedback}
                  className="text-xs h-10 px-4 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  className="font-bold text-xs h-10 px-5 rounded-xl shadow-xs"
                  disabled={submittingFeedback}
                >
                  {submittingFeedback ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Rating'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* PRINTABLE DOCKET MODAL */}
        {showDocketModal && (
          <WorkOrderModal
            isOpen={true}
            onClose={() => setShowDocketModal(false)}
            complaint={complaint}
          />
        )}

        {/* IMAGE LIGHTBOX */}
        {activeLightbox && (
          <ImageLightbox
            isOpen={true}
            onClose={() => setActiveLightbox(null)}
            imageUrl={activeLightbox.url}
            title={activeLightbox.title}
            subtitle={activeLightbox.subtitle}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
