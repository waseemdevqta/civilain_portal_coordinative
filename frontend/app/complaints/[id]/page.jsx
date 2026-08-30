'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { complaintApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
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
  MapPin,
  Calendar,
  ThumbsUp,
  User,
  ArrowLeft,
  MessageSquare,
  Star,
  Check,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Loader2,
  FileText,
} from 'lucide-react';

export default function ComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isCitizen } = useAuth();
  const id = params?.id;

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upvoting, setUpvoting] = useState(false);

  // Feedback dialog state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchComplaint = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await complaintApi.getById(id);
      setComplaint(res.data);
    } catch (err) {
      setError(err.message || 'Complaint not found or invalid ID format');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in as a citizen to upvote complaints.');
      return;
    }
    if (!isCitizen) {
      toast.error('Only citizens can upvote community complaints.');
      return;
    }

    setUpvoting(true);
    try {
      const res = await complaintApi.upvote(id);
      setComplaint(res.data);
      toast.success('Upvote registered! Priority urgency updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to upvote complaint');
    } finally {
      setUpvoting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await complaintApi.submitFeedback(id, {
        rating,
        comment: comment.trim(),
      });
      setComplaint(res.data);
      toast.success('Thank you! Your feedback has been recorded.');
      setFeedbackOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const userIdStr = user?.id || user?._id;
  const isAuthor =
    userIdStr &&
    complaint?.createdBy &&
    (typeof complaint.createdBy === 'object'
      ? complaint.createdBy._id || complaint.createdBy.id
      : complaint.createdBy
    )?.toString() === userIdStr.toString();

  const hasUpvoted =
    userIdStr &&
    complaint?.upvotedBy &&
    complaint.upvotedBy.some(
      (uid) => (typeof uid === 'object' ? uid._id || uid : uid)?.toString() === userIdStr.toString()
    );

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* BREADCRUMB / BACK */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to previous view
          </button>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error || !complaint ? (
          <div className="rounded-lg border border-dashed border-red-300 bg-white p-10 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <h3 className="text-base font-bold text-slate-900">Complaint Record Not Found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {error || 'The requested ticket ID does not exist in the municipal registry.'}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/complaints">
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs">
                  Browse All Complaints
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* OFFICIAL RECORD CARD */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              {/* Header Badges & ID */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    TICKET #CF-{complaint._id.slice(-6).toUpperCase()}
                  </span>
                  <CategoryBadge category={complaint.category} />
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge
                    priority={complaint.priority}
                    score={complaint.priorityScore}
                    showScore={true}
                  />
                </div>

                <Button
                  variant={hasUpvoted ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={handleUpvote}
                  disabled={upvoting || hasUpvoted}
                  className={`gap-1.5 h-8 text-xs font-semibold ${
                    hasUpvoted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {hasUpvoted ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-700" />
                      Upvoted ({complaint.upvotes || 0})
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-3.5 w-3.5 text-slate-600" />
                      Upvote Issue ({complaint.upvotes || 0})
                    </>
                  )}
                </Button>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {complaint.title}
                </h1>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pt-1">
                  {complaint.description}
                </div>
              </div>

              {/* Resolution Progress Bar */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Lifecycle Progress
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded border border-slate-200 bg-slate-50">
                    <div className="font-bold text-slate-900">1. Reported</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded border ${
                      complaint.status === 'in-progress' || complaint.status === 'resolved'
                        ? 'border-blue-300 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <div>2. In Progress</div>
                    <div className="text-[10px] mt-0.5">
                      {complaint.status === 'pending' ? 'Pending dispatch' : 'Crew active'}
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded border ${
                      complaint.status === 'resolved'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <div>3. Resolved</div>
                    <div className="text-[10px] mt-0.5">
                      {complaint.resolvedAt
                        ? new Date(complaint.resolvedAt).toLocaleDateString()
                        : 'Pending resolution'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">Location</div>
                  <div className="font-bold text-slate-900 mt-0.5">{complaint.area}</div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">Reported By</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {complaint.createdBy?.name || 'Citizen'}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">Community Priority</div>
                  <div className="font-bold text-slate-900 mt-0.5 capitalize">
                    {complaint.priority} (Score: {complaint.priorityScore || 0})
                  </div>
                </div>
              </div>
            </div>

            {/* OFFICER REMARK SECTION */}
            {complaint.officerRemark && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <MessageSquare className="h-4 w-4 text-blue-700" />
                  Official Municipal Officer Remark
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pl-5.5">
                  {complaint.officerRemark}
                </p>
                {complaint.resolvedAt && (
                  <div className="text-[11px] text-slate-500 pl-5.5 pt-1">
                    Recorded on {new Date(complaint.resolvedAt).toLocaleDateString()} at{' '}
                    {new Date(complaint.resolvedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}

            {/* CITIZEN FEEDBACK SECTION */}
            {complaint.status === 'resolved' && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    Citizen Resolution Rating & Feedback
                  </div>

                  {isAuthor && !complaint.feedbackGiven && (
                    <Button
                      size="sm"
                      onClick={() => setFeedbackOpen(true)}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white gap-1 text-xs h-8"
                    >
                      <Star className="h-3 w-3" />
                      Submit Rating
                    </Button>
                  )}
                </div>

                {complaint.feedbackGiven ? (
                  <div className="space-y-1.5 pl-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < complaint.feedbackRating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {complaint.feedbackRating} / 5 Stars
                      </span>
                    </div>

                    {complaint.feedbackComment && (
                      <p className="text-xs text-slate-700 italic">
                        &quot;{complaint.feedbackComment}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 pl-6">
                    {isAuthor
                      ? 'This issue has been marked resolved by municipal teams. Please rate resolution quality to complete the ticket evaluation.'
                      : 'Awaiting author citizen evaluation.'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FEEDBACK SUBMISSION DIALOG */}
        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogContent className="bg-white border-slate-200 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-900 text-base">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                Rate Resolution Quality
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                Confirm service quality and field team response for this ticket.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Rating (1–5 Stars)</Label>
                <div className="flex items-center gap-2 justify-center py-2 bg-slate-50 rounded border border-slate-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center text-xs font-semibold text-slate-800">
                  {rating === 5 && '5 Stars — Excellent Resolution'}
                  {rating === 4 && '4 Stars — Good Resolution'}
                  {rating === 3 && '3 Stars — Acceptable'}
                  {rating === 2 && '2 Stars — Below Standard'}
                  {rating === 1 && '1 Star — Unsatisfactory'}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="comment" className="text-xs font-semibold text-slate-700">
                  Feedback Remarks (Optional)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Share details regarding work completion or cleanup..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFeedbackOpen(false)}
                  disabled={submittingFeedback}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs h-9"
                  disabled={submittingFeedback}
                >
                  {submittingFeedback ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
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
      </main>
      <Footer />
    </div>
  );
}
