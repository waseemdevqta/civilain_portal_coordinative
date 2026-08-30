'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { complaintApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  FileText,
  FilePlus,
  MapPin,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Star,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Feedback modal state
  const [feedbackComplaint, setFeedbackComplaint] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

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

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const openFeedbackDialog = (complaint) => {
    setFeedbackComplaint(complaint);
    setRating(5);
    setComment('');
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackComplaint) return;

    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await complaintApi.submitFeedback(feedbackComplaint._id, {
        rating,
        comment: comment.trim(),
      });

      toast.success('Thank you! Your resolution rating has been submitted.');

      setComplaints((prev) =>
        prev.map((c) => (c._id === feedbackComplaint._id ? res.data : c))
      );
      setFeedbackComplaint(null);
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <ProtectedRoute citizenOnly={true}>
      <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-slate-900">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Citizen Tracking Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                My Reported Complaints
              </h1>
              <p className="mt-0.5 text-xs text-slate-600">
                Direct lifecycle tracking, official municipal remarks, and verified resolution feedback.
              </p>
            </div>

            <Link href="/complaints/new">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 shadow-sm shrink-0">
                <FilePlus className="h-4 w-4" />
                Report New Issue
              </Button>
            </Link>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* COMPLAINTS LIST */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
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
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-600 mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No complaints registered yet</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Whenever you notice civic issues like potholes, waste accumulation, or water outages, submit them here.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Link href="/complaints/new">
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 text-xs">
                    <FilePlus className="h-3.5 w-3.5" />
                    Report an Issue
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3"
                >
                  {/* Badges & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-medium text-slate-500">
                        #CF-{complaint._id.slice(-4).toUpperCase()}
                      </span>
                      <CategoryBadge category={complaint.category} />
                      <StatusBadge status={complaint.status} />
                      <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore={true} />
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Submitted {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/complaints/${complaint._id}`}
                    className="text-base font-bold text-slate-900 hover:text-slate-700 block leading-snug"
                  >
                    {complaint.title}
                  </Link>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {complaint.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-800">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      {complaint.area}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-800">
                      <ThumbsUp className="h-3.5 w-3.5 text-slate-500" />
                      {complaint.upvotes || 0} community upvotes
                    </span>
                  </div>

                  {/* Officer Remark Block */}
                  {complaint.officerRemark && (
                    <div className="p-3 rounded border border-blue-100 bg-blue-50/50 text-xs space-y-1">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-700" />
                        Official Municipal Officer Remark:
                      </div>
                      <p className="text-slate-700 pl-5">{complaint.officerRemark}</p>
                    </div>
                  )}

                  {/* RESOLVED ACTION / FEEDBACK ROW */}
                  {complaint.status === 'resolved' && (
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 -mx-5 -mb-5 p-3.5 rounded-b-lg">
                      {complaint.feedbackGiven ? (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-slate-900">Your Rating:</span>
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
                          {complaint.feedbackComment && (
                            <span className="text-slate-600 italic truncate max-w-xs">
                              &quot;{complaint.feedbackComment}&quot;
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                          <div className="text-xs text-slate-700">
                            <strong className="text-slate-900">Issue Marked Resolved.</strong> Please rate municipal resolution quality.
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openFeedbackDialog(complaint)}
                            className="bg-emerald-800 hover:bg-emerald-900 text-white gap-1.5 text-xs h-8 shrink-0 font-medium"
                          >
                            <Star className="h-3 w-3" />
                            Rate Resolution Quality
                          </Button>
                        </div>
                      )}

                      <Link href={`/complaints/${complaint._id}`} className="shrink-0 self-end sm:self-auto">
                        <Button variant="ghost" size="sm" className="text-xs gap-1 h-8 text-slate-600 hover:text-slate-900">
                          View Details
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FEEDBACK DIALOG */}
          <Dialog open={!!feedbackComplaint} onOpenChange={(open) => !open && setFeedbackComplaint(null)}>
            <DialogContent className="bg-white border-slate-200 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-slate-900 text-base">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  Rate Resolution Quality
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600">
                  Your rating confirms work completion and helps evaluate municipal service standards.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4 py-2">
                <div className="p-3 rounded border border-slate-200 bg-slate-50 text-xs">
                  <div className="font-bold text-slate-900 truncate">{feedbackComplaint?.title}</div>
                  <div className="text-slate-500 mt-0.5">{feedbackComplaint?.area}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Service Rating (1–5 Stars)</Label>
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
                    {rating === 4 && '4 Stars — Good Work'}
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
                    placeholder="Share any comments regarding work quality, timeliness, or cleanup..."
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
                    onClick={() => setFeedbackComplaint(null)}
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
    </ProtectedRoute>
  );
}
