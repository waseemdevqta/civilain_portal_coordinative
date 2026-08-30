'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { complaintApi, aiApi, authApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  Flame,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  MapPin,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Star,
  Edit3,
  Loader2,
  AlertCircle,
  BarChart3,
  Layers,
  ArrowRight,
  UserPlus,
  Lock,
  Mail,
  User,
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

export default function OfficerDashboardPage() {
  const { user } = useAuth();

  // Stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Gemini AI state
  const [aiBriefing, setAiBriefing] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState('');
  const [briefingTimestamp, setBriefingTimestamp] = useState(null);

  // Complaints state & filters
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  // Review & Update Dialog state (Screen 10)
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('in-progress');
  const [officerRemark, setOfficerRemark] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Add Officer Account Modal state
  const [addOfficerOpen, setAddOfficerOpen] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [addingOfficer, setAddingOfficer] = useState(false);
  const [addOfficerError, setAddOfficerError] = useState('');

  // Fetch stats from GET /api/complaints/stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await complaintApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Stats fetch error:', err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch complaints from GET /api/complaints
  const fetchComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (status) params.status = status;

      const res = await complaintApi.getAll(params);
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Complaints fetch error:', err.message);
    } finally {
      setLoadingComplaints(false);
    }
  }, [search, category, status]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaints();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchComplaints]);

  // Generate AI briefing from POST /api/ai/officer-summary
  const generateAiBriefing = async () => {
    setGeneratingAi(true);
    setAiError('');
    try {
      const res = await aiApi.getOfficerSummary();
      setAiBriefing(res.data?.summary || '');
      setBriefingTimestamp(new Date());
      toast.success('Gemini AI operations briefing generated.');
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI briefing');
      toast.error(err.message || 'AI generation failed');
    } finally {
      setGeneratingAi(false);
    }
  };

  // Open Review Dialog (Screen 10)
  const openReviewModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status || 'in-progress');
    setOfficerRemark(complaint.officerRemark || '');
  };

  // Handle status update submission PATCH /api/complaints/:id/status
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmittingStatus(true);
    try {
      const res = await complaintApi.updateStatus(selectedComplaint._id, {
        status: updateStatus,
        remark: officerRemark.trim(),
      });

      const updated = res.data;
      toast.success(`Complaint status updated to "${updateStatus}"`);

      // Update in table state
      setComplaints((prev) =>
        prev.map((c) => (c._id === selectedComplaint._id ? updated : c))
      );

      // Refresh overall stats
      fetchStats();
      setSelectedComplaint(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update complaint status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Handle Add Officer Account
  const handleAddOfficerSubmit = async (e) => {
    e.preventDefault();

    if (!newOfficer.name.trim() || !newOfficer.email.trim() || !newOfficer.password) {
      setAddOfficerError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(newOfficer.email.trim())) {
      setAddOfficerError('Please enter a valid email format.');
      return;
    }

    if (newOfficer.password.length < 6) {
      setAddOfficerError('Password must be at least 6 characters.');
      return;
    }

    if (newOfficer.password !== newOfficer.confirmPassword) {
      setAddOfficerError('Passwords do not match.');
      return;
    }

    setAddingOfficer(true);
    setAddOfficerError('');

    try {
      await authApi.addOfficer({
        name: newOfficer.name.trim(),
        email: newOfficer.email.trim(),
        password: newOfficer.password,
      });

      toast.success(`Officer account for "${newOfficer.name.trim()}" created successfully!`);
      setAddOfficerOpen(false);
      setNewOfficer({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setAddOfficerError(err.message || 'Failed to provision officer account.');
      toast.error(err.message || 'Failed to provision officer account.');
    } finally {
      setAddingOfficer(false);
    }
  };

  return (
    <ProtectedRoute officerOnly={true}>
      <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-slate-900">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* TOP OPERATIONS HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-white">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Municipal Operations Console
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                Operations Overview
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Logged in as <strong>{user?.name || 'Officer'}</strong> • Municipal Dispatch & Case Triage
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setAddOfficerOpen(true)}
                variant="outline"
                size="sm"
                className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50 gap-1.5 font-semibold text-xs h-9 shadow-sm shrink-0"
              >
                <UserPlus className="h-3.5 w-3.5 text-slate-700" />
                Add Officer Account
              </Button>

              <Button
                onClick={generateAiBriefing}
                disabled={generatingAi}
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white gap-2 font-medium text-xs h-9 shadow-sm shrink-0"
              >
                {generatingAi ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating Operations Briefing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-slate-300" />
                    Generate AI Briefing
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* GEMINI AI DAILY OPERATIONS BRIEFING CARD */}
          {(aiBriefing || generatingAi || aiError) && (
            <div className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    AI-ASSISTED BRIEFING
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Daily Operations Briefing
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {briefingTimestamp && (
                    <span className="text-[11px] text-slate-500">
                      Generated at {briefingTimestamp.toLocaleTimeString()}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateAiBriefing}
                    disabled={generatingAi}
                    className="h-7 text-xs border-slate-300 gap-1 text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${generatingAi ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {generatingAi ? (
                <div className="space-y-2 py-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : aiError ? (
                <div className="text-xs text-red-700 bg-red-50 p-3 rounded border border-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-800 leading-relaxed font-normal bg-slate-50 p-3.5 rounded border border-slate-200">
                  {aiBriefing}
                </p>
              )}
            </div>
          )}

          {/* COMPACT STAT BLOCKS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total */}
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Total Tickets
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {loadingStats ? <Skeleton className="h-6 w-10" /> : stats?.total ?? 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Cumulative filed</div>
            </div>

            {/* Pending */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 shadow-sm">
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Pending Action
              </div>
              <div className="text-xl font-bold text-amber-900 mt-1">
                {loadingStats ? <Skeleton className="h-6 w-10" /> : stats?.pending ?? 0}
              </div>
              <div className="text-[10px] text-amber-700/80 mt-1">Awaiting dispatch</div>
            </div>

            {/* In Progress */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5 shadow-sm">
              <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                In Progress
              </div>
              <div className="text-xl font-bold text-blue-900 mt-1">
                {loadingStats ? <Skeleton className="h-6 w-10" /> : stats?.inProgress ?? 0}
              </div>
              <div className="text-[10px] text-blue-700/80 mt-1">Crews deployed</div>
            </div>

            {/* Resolved */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5 shadow-sm">
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Resolved
              </div>
              <div className="text-xl font-bold text-emerald-900 mt-1">
                {loadingStats ? <Skeleton className="h-6 w-10" /> : stats?.resolved ?? 0}
              </div>
              <div className="text-[10px] text-emerald-700/80 mt-1">Completed & sealed</div>
            </div>

            {/* Critical Priority */}
            <div className="rounded-lg border border-red-200 bg-red-50/60 p-3.5 shadow-sm">
              <div className="text-[10px] font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
                <Flame className="h-3 w-3 text-red-600" />
                Critical Priority
              </div>
              <div className="text-xl font-bold text-red-900 mt-1">
                {loadingStats ? <Skeleton className="h-6 w-10" /> : stats?.critical ?? 0}
              </div>
              <div className="text-[10px] text-red-700/80 mt-1">Urgent triage needed</div>
            </div>

            {/* Citizen Satisfaction */}
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500" />
                Citizen Rating
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {loadingStats ? <Skeleton className="h-6 w-10" /> : `${stats?.averageFeedbackRating ?? 0} / 5`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Average satisfaction</div>
            </div>
          </div>

          {/* COMPLAINTS QUEUE TABLE */}
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Complaints Queue & Dispatch</h2>
                <p className="text-xs text-slate-500">
                  Review incoming tickets, evaluate priority scores, and update municipal dispatch status.
                </p>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs w-40"
                  />
                </div>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-8 rounded border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>

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
            </div>

            {/* TABLE */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              {loadingComplaints ? (
                <div className="p-5 space-y-2.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : complaints.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <Layers className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="font-semibold text-sm text-slate-800">No tickets found</p>
                  <p className="text-xs">No complaint records match the current filter selection.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Ticket / Title</th>
                        <th className="px-4 py-3">Area / Category</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Upvotes</th>
                        <th className="px-4 py-3">Filed Date</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {complaints.map((c, index) => (
                        <tr
                          key={c._id}
                          className={`transition-colors ${
                            index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                          } hover:bg-slate-100/70`}
                        >
                          {/* Ticket & Title */}
                          <td className="px-4 py-3 max-w-xs">
                            <div className="font-mono text-[10px] font-medium text-slate-500">
                              #CF-{c._id.slice(-6).toUpperCase()}
                            </div>
                            <Link
                              href={`/complaints/${c._id}`}
                              className="font-bold text-slate-900 hover:text-slate-700 block truncate"
                            >
                              {c.title}
                            </Link>
                          </td>

                          {/* Area & Category */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-slate-800 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                {c.area}
                              </span>
                              <CategoryBadge category={c.category} />
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <StatusBadge status={c.status} />
                          </td>

                          {/* Priority */}
                          <td className="px-4 py-3">
                            <PriorityBadge priority={c.priority} score={c.priorityScore} showScore={true} />
                          </td>

                          {/* Upvotes */}
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-slate-500" />
                              {c.upvotes || 0}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              onClick={() => openReviewModal(c)}
                              className="h-7 px-2.5 bg-slate-900 hover:bg-slate-800 text-white gap-1 text-[11px]"
                            >
                              <Edit3 className="h-3 w-3" />
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* SCREEN 10: OFFICER STATUS UPDATE & REVIEW DIALOG */}
          <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
            <DialogContent className="bg-white border-slate-200 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-slate-900 text-base">
                  <ShieldCheck className="h-5 w-5 text-slate-900" />
                  Review Complaint & Update Dispatch
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600">
                  Update lifecycle status and record official resolution remarks visible to the reporting citizen.
                </DialogDescription>
              </DialogHeader>

              {selectedComplaint && (
                <form onSubmit={handleStatusSubmit} className="space-y-4 py-2">
                  {/* Complaint Snapshot */}
                  <div className="p-3.5 rounded border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-medium text-slate-500">
                        #CF-{selectedComplaint._id.slice(-6).toUpperCase()}
                      </span>
                      <CategoryBadge category={selectedComplaint.category} />
                      <PriorityBadge priority={selectedComplaint.priority} score={selectedComplaint.priorityScore} showScore={true} />
                      <span className="text-slate-500">• {selectedComplaint.upvotes || 0} upvotes</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">{selectedComplaint.title}</div>
                    <p className="text-slate-600">{selectedComplaint.description}</p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1.5 border-t border-slate-200">
                      <span>Location: <strong>{selectedComplaint.area}</strong></span>
                      <span>• Author: <strong>{selectedComplaint.createdBy?.name || 'Citizen'}</strong></span>
                    </div>
                  </div>

                  {/* Status Picker */}
                  <div className="space-y-1">
                    <Label htmlFor="statusSelect" className="text-xs font-semibold text-slate-700">
                      Lifecycle Status
                    </Label>
                    <select
                      id="statusSelect"
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full h-9 rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="pending">Pending (Awaiting Field Team)</option>
                      <option value="in-progress">In Progress (Field Team Dispatched)</option>
                      <option value="resolved">Resolved (Work Completed & Sealed)</option>
                    </select>
                  </div>

                  {/* Officer Remark */}
                  <div className="space-y-1">
                    <Label htmlFor="remark" className="text-xs font-semibold text-slate-700">
                      Official Officer Remark / Instructions
                    </Label>
                    <Textarea
                      id="remark"
                      placeholder="e.g. Municipal asphalt team deployed on site. Heavy bitumen roller leveling the crater..."
                      value={officerRemark}
                      onChange={(e) => setOfficerRemark(e.target.value)}
                      rows={3}
                      className="text-xs"
                    />
                    <p className="text-[10px] text-slate-500">
                      This note will be recorded publicly into the citizen&apos;s ticket progress record.
                    </p>
                  </div>

                  <DialogFooter className="pt-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedComplaint(null)}
                      disabled={submittingStatus}
                      className="text-xs h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs h-9"
                      disabled={submittingStatus}
                    >
                      {submittingStatus ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          Saving...
                        </>
                      ) : (
                        'Save & Dispatch'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* PROVISION NEW OFFICER ACCOUNT DIALOG */}
          <Dialog open={addOfficerOpen} onOpenChange={setAddOfficerOpen}>
            <DialogContent className="bg-white border-slate-200 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-slate-900 text-base">
                  <UserPlus className="h-5 w-5 text-slate-900" />
                  Provision Officer Account
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600">
                  Create an authorized municipal officer account. Only existing officers can authorize team members.
                </DialogDescription>
              </DialogHeader>

              {addOfficerError && (
                <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{addOfficerError}</span>
                </div>
              )}

              <form onSubmit={handleAddOfficerSubmit} className="space-y-3.5 py-1">
                <div className="space-y-1">
                  <Label htmlFor="officerName" className="text-xs font-semibold text-slate-700">
                    Officer Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="officerName"
                      placeholder="e.g. Engr. Tariq Mehmood"
                      value={newOfficer.name}
                      onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                      className="pl-9 h-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="officerEmail" className="text-xs font-semibold text-slate-700">
                    Official Municipal Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="officerEmail"
                      type="email"
                      placeholder="tariq@civicfix.gov / tariq@dept.org"
                      value={newOfficer.email}
                      onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                      className="pl-9 h-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="officerPass" className="text-xs font-semibold text-slate-700">
                    Temporary Password (min 6 characters)
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="officerPass"
                      type="password"
                      placeholder="••••••••"
                      value={newOfficer.password}
                      onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                      className="pl-9 h-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="officerConfirm" className="text-xs font-semibold text-slate-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="officerConfirm"
                      type="password"
                      placeholder="••••••••"
                      value={newOfficer.confirmPassword}
                      onChange={(e) => setNewOfficer({ ...newOfficer, confirmPassword: e.target.value })}
                      className="pl-9 h-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <DialogFooter className="pt-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddOfficerOpen(false)}
                    disabled={addingOfficer}
                    className="text-xs h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs h-9"
                    disabled={addingOfficer}
                  >
                    {addingOfficer ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        Provisioning...
                      </>
                    ) : (
                      'Provision Officer Account'
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
