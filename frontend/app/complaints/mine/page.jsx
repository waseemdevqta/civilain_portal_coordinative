'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { complaintApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { EmptyState } from '@/components/common/EmptyState';
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
  Loader2,
  Route,
  Trash2,
  Droplets,
  Zap,
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
    <ProtectedRoute citizenOnly={true}>
      <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span>CASE TRACKER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                My Reported Complaints
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Direct lifecycle tracking, official municipal remarks, and verified resolution feedback.
              </p>
            </div>

            <Link href="/complaints/new">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 gap-2 font-bold text-xs sm:text-sm h-11 px-5 rounded-xl shadow-[0_2px_10px_rgba(15,23,42,0.1)] shrink-0">
                <FilePlus className="h-4 w-4" />
                Report New Issue
              </Button>
            </Link>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200/90 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/40 p-4 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* COMPLAINTS LIST */}
          {loading ? (
            <div className="space-y-3.5">
              {[1, 2, 3].map((i) => (
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
              icon={FileText}
              title="No complaints registered yet"
              description="Whenever you notice civic issues like potholes, waste accumulation, or water outages, report them to alert municipal crews."
              actionText="Report an Issue"
              onAction={() => {
                window.location.href = '/complaints/new';
              }}
            />
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => {
                const { icon: CatIcon, color: iconContainerClass } = getCategoryIconDetails(complaint.category);

                return (
                  <div
                    key={complaint._id}
                    className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 sm:p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    {/* Badges & Date */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                          #CF-{complaint._id.slice(-6).toUpperCase()}
                        </span>
                        <CategoryBadge category={complaint.category} />
                        <StatusBadge status={complaint.status} />
                        <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore={true} />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Submitted {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="flex items-start gap-3.5">
                      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${iconContainerClass}`}>
                        <CatIcon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <Link
                          href={`/complaints/${complaint._id}`}
                          className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300 block leading-snug"
                        >
                          {complaint.title}
                        </Link>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                          {complaint.description}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {complaint.area}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <ThumbsUp className="h-3.5 w-3.5 text-slate-500" />
                        {complaint.upvotes || 0} supporters
                      </span>
                    </div>

                    {/* Officer Remark Block */}
                    {complaint.officerRemark && (
                      <div className="p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 text-xs space-y-1.5">
                        <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          Official Municipal Officer Remark:
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 pl-5.5 leading-relaxed">{complaint.officerRemark}</p>
                      </div>
                    )}

                    {/* RESOLVED ACTION / FEEDBACK ROW */}
                    {complaint.status === 'resolved' && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F7F8FC] dark:bg-[#182235]/60 -mx-6 sm:-mx-7 -mb-6 sm:-mb-7 p-4 sm:p-5 rounded-b-3xl">
                        {complaint.feedbackGiven ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-900 dark:text-slate-100">Your Rating:</span>
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
                            {complaint.feedbackComment && (
                              <span className="text-slate-600 dark:text-slate-400 italic truncate max-w-xs">
                                &quot;{complaint.feedbackComment}&quot;
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                              <strong className="text-slate-900 dark:text-slate-100">Issue Resolved.</strong> Please rate municipal resolution quality.
                            </div>
                            <Button
                              size="sm"
                              onClick={() => openFeedbackDialog(complaint)}
                              className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white gap-1.5 text-xs h-9 px-4 rounded-xl shrink-0 font-bold shadow-sm"
                            >
                              <Star className="h-3.5 w-3.5" />
                              Rate Resolution Quality
                            </Button>
                          </div>
                        )}

                        <Link href={`/complaints/${complaint._id}`} className="shrink-0 self-end sm:self-auto">
                          <Button variant="ghost" size="sm" className="text-xs gap-1 h-9 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold">
                            View Details
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* FEEDBACK DIALOG */}
          <Dialog open={!!feedbackComplaint} onOpenChange={(open) => !open && setFeedbackComplaint(null)}>
            <DialogContent className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100 text-lg font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Rate Resolution Quality
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Your rating confirms work completion and helps evaluate municipal service standards.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4 py-2">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#182235] text-xs">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{feedbackComplaint?.title}</div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">{feedbackComplaint?.area}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Service Rating (1–5 Stars)</Label>
                  <div className="flex items-center gap-2.5 justify-center py-3 bg-[#F7F8FC] dark:bg-[#182235] rounded-2xl border border-slate-200 dark:border-slate-800">
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
                              : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    {rating === 5 && '5 Stars — Excellent Resolution'}
                    {rating === 4 && '4 Stars — Good Work'}
                    {rating === 3 && '3 Stars — Acceptable'}
                    {rating === 2 && '2 Stars — Below Standard'}
                    {rating === 1 && '1 Star — Unsatisfactory'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="comment" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Feedback Remarks (Optional)
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Share any comments regarding work quality, timeliness, or cleanup..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <DialogFooter className="pt-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFeedbackComplaint(null)}
                    disabled={submittingFeedback}
                    className="text-xs h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-bold text-xs h-10 px-5 rounded-xl shadow-sm"
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
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
