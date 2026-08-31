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
  Camera,
  Printer,
} from 'lucide-react';

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lightbox and Docket states
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [docketComplaint, setDocketComplaint] = useState(null);

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
      <div className="flex min-h-screen flex-col bg-[#F8F9FF] text-[#0B1C30] transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                <span>MY CIVIC RECORD</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1C30]">
                My Reported Complaints
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Track status updates, inspect uploaded photo evidence, and rate municipal field repairs.
              </p>
            </div>

            <div className="shrink-0">
              <Link href="/complaints/new">
                <Button size="lg" variant="default" className="w-full sm:w-auto gap-2 font-bold text-xs sm:text-sm h-11 px-5 rounded-xl">
                  <FilePlus className="h-4 w-4" />
                  Report New Issue
                </Button>
              </Link>
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-[#BA1A1A]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* COMPLAINTS LIST */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3">
                    <Skeleton className="h-5 w-1/4 rounded-full" />
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <EmptyState
                icon={FilePlus}
                title="You have not filed any reports yet."
                description="When you lodge a municipal complaint regarding roads, waste, water, or electricity, it will appear here with live tracking."
                actionText="File Your First Report"
                onAction={() => {
                  window.location.href = '/complaints/new';
                }}
              />
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => {
                  const hasPhoto = Boolean(complaint.imageUrl);

                  return (
                    <div
                      key={complaint._id}
                      className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-4"
                    >
                      {/* Top Badges & ID */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
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

                      {/* Content Section with Photo */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        {hasPhoto && (
                          <div
                            onClick={() =>
                              setActiveLightbox({
                                url: complaint.imageUrl,
                                title: complaint.title,
                                subtitle: `Photo evidence for ${complaint.area}`,
                              })
                            }
                            className="relative w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-[#F1F5F9] border border-[#CBD5E1] flex-shrink-0 cursor-pointer group shadow-2xs"
                            title="Click to zoom photo"
                          >
                            <img
                              src={complaint.imageUrl}
                              alt={complaint.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-[#0B1C30]/80 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                              <Camera className="w-3 h-3" />
                              Photo
                            </span>
                          </div>
                        )}

                        <div className="space-y-2 flex-1 min-w-0">
                          <Link
                            href={`/complaints/${complaint._id}`}
                            className="text-base sm:text-lg font-bold text-[#0B1C30] hover:text-emerald-700 block transition-colors"
                          >
                            {complaint.title}
                          </Link>

                          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {complaint.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                              {complaint.area}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-slate-800">
                              <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                              {complaint.upvotes || 0} neighborhood supporter(s)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Official Municipal Response (If any) */}
                      {complaint.officerRemark && (
                        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
                          <div className="font-bold text-blue-800 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                            Official Municipal Response
                          </div>
                          <p className="text-slate-800 leading-relaxed">{complaint.officerRemark}</p>
                        </div>
                      )}

                      {/* Resolution Rating Box / Trigger */}
                      {complaint.status === 'resolved' && (
                        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              Issue Resolved & Closed
                            </div>
                            <p className="text-emerald-700 text-[11px] mt-0.5">
                              {complaint.feedbackGiven
                                ? `You rated this resolution ${complaint.feedbackRating} / 5 stars.`
                                : 'Please submit your feedback to verify resolution quality for municipal records.'}
                            </p>
                          </div>

                          {complaint.feedbackGiven ? (
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-white px-3 py-1.5 rounded-full border border-amber-200">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                              <span>{complaint.feedbackRating}.0 / 5.0</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openFeedbackDialog(complaint)}
                              className="gap-1.5 text-xs font-bold rounded-xl h-9 px-4 shrink-0"
                            >
                              <Star className="h-3.5 w-3.5" />
                              Rate Resolution
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Bottom Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDocketComplaint(complaint)}
                          className="text-xs text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 gap-1.5 h-8 px-2.5 rounded-lg"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-600" />
                          Docket
                        </Button>

                        <Link href={`/complaints/${complaint._id}`}>
                          <Button variant="ghost" size="sm" className="text-xs rounded-xl text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/60 font-semibold gap-1">
                            View Full Case Record
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RESOLUTION FEEDBACK MODAL */}
          <Dialog open={!!feedbackComplaint} onOpenChange={(open) => !open && setFeedbackComplaint(null)}>
            <DialogContent className="bg-white border-slate-200 sm:max-w-md rounded-3xl shadow-[0_12px_32px_rgba(11,28,48,0.1)]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#0B1C30] text-lg font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Rate Municipal Resolution Quality
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500">
                  Your feedback helps maintain public service accountability and confirms field repair standards.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4 py-2">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8F9FF] text-xs">
                  <div className="font-bold text-[#0B1C30] truncate">{feedbackComplaint?.title}</div>
                  <div className="text-slate-500 mt-0.5">{feedbackComplaint?.area}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Quality Rating (1–5 Stars)</Label>
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
                    {rating === 5 && '5 Stars — Excellent Work'}
                    {rating === 4 && '4 Stars — Good Quality'}
                    {rating === 3 && '3 Stars — Acceptable'}
                    {rating === 2 && '2 Stars — Needs Improvement'}
                    {rating === 1 && '1 Star — Unsatisfactory'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="comment" className="text-xs font-semibold text-slate-700">
                    Verification Comments (Optional)
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Share any comments regarding work quality, timeliness, or cleanup..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="text-xs sm:text-sm bg-[#F8F9FF] border-slate-200 focus-visible:ring-emerald-600"
                  />
                </div>

                <DialogFooter className="pt-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFeedbackComplaint(null)}
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

          {/* DOCKET MODAL */}
          {docketComplaint && (
            <WorkOrderModal
              isOpen={true}
              onClose={() => setDocketComplaint(null)}
              complaint={docketComplaint}
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
    </ProtectedRoute>
  );
}
