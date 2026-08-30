'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { complaintApi, aiApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from '@/components/ui/toaster';
import {
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  UserPlus,
  Edit3,
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  Star,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Route,
  Trash2,
  Droplets,
  Zap,
} from 'lucide-react';

export default function OfficerDashboardPage() {
  const { user } = useAuth();

  // Primary states
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Briefing State
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // Status Update Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [officerRemark, setOfficerRemark] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // New Officer Provisioning Modal State
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionData, setProvisionData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [provisioning, setProvisioning] = useState(false);

  // CSV Export State
  const [exportingCsv, setExportingCsv] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      if (filterSearch.trim()) params.search = filterSearch.trim();

      const [statsRes, complaintsRes] = await Promise.all([
        complaintApi.getStats(),
        complaintApi.getAll(params),
      ]);

      setStats(statsRes.data);
      setComplaints(complaintsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load officer operations data');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus, filterSearch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Generate Gemini AI Operational Briefing
  const fetchAiSummary = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await aiApi.getOfficerSummary();
      setAiSummary(res.data.summary);
    } catch (err) {
      setAiError(err.message || 'Gemini AI briefing currently unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiSummary();
  }, []);

  // Handle status update
  const handleOpenStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setOfficerRemark(complaint.officerRemark || '');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdatingStatus(true);
    try {
      const res = await complaintApi.updateStatus(selectedComplaint._id, {
        status: newStatus,
        officerRemark: officerRemark.trim(),
      });

      toast.success(`Complaint status updated to ${newStatus}`);
      setComplaints((prev) =>
        prev.map((c) => (c._id === selectedComplaint._id ? res.data : c))
      );
      setSelectedComplaint(null);
      // Refresh stats
      complaintApi.getStats().then((res) => setStats(res.data));
    } catch (err) {
      toast.error(err.message || 'Failed to update complaint status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Provisioning New Officer
  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    if (!provisionData.name.trim() || !provisionData.email.trim() || !provisionData.password) {
      toast.error('All fields are required');
      return;
    }

    setProvisioning(true);
    try {
      const token = localStorage.getItem('civicfix_token');
      const response = await fetch('/api/officer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: provisionData.name.trim(),
          email: provisionData.email.trim(),
          password: provisionData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to provision officer');
      }

      toast.success(`Officer account created for ${data.user?.name || provisionData.name}`);
      setShowProvisionModal(false);
      setProvisionData({ name: '', email: '', password: '' });
    } catch (err) {
      toast.error(err.message || 'Officer provisioning failed');
    } finally {
      setProvisioning(false);
    }
  };

  // Section 5.14: CSV Export Trigger
  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const token = localStorage.getItem('civicfix_token');
      const queryParams = new URLSearchParams();
      if (filterCategory) queryParams.set('category', filterCategory);
      if (filterStatus) queryParams.set('status', filterStatus);

      const url = `/api/complaints/export?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate CSV export file');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `awaz-complaints-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Municipal CSV export downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'CSV Export failed');
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <ProtectedRoute officerOnly={true}>
      <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
          {/* HEADER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>MUNICIPAL OPERATIONS COMMAND</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Operations Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Municipal Officer: <strong className="text-slate-800 dark:text-slate-200">{user?.name}</strong> • Dispatch queue, priority escalation & feedback audit.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={exportingCsv}
                className="gap-1.5 h-10 px-4 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182235] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                {exportingCsv ? 'Exporting...' : 'Export CSV'}
              </Button>

              <Button
                size="sm"
                onClick={() => setShowProvisionModal(true)}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 gap-1.5 h-10 px-4 text-xs font-bold rounded-xl shadow-sm"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Provision Officer
              </Button>
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200/90 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/40 p-4 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 6 OPERATIONAL METRIC BLOCKS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Total */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Docket</div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                {stats ? stats.total : <Skeleton className="h-7 w-10" />}
              </div>
            </div>

            {/* Pending */}
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Pending Review</div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-900 dark:text-amber-200 mt-1">
                {stats ? stats.pending : <Skeleton className="h-7 w-10" />}
              </div>
            </div>

            {/* In Progress */}
            <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Field Dispatched</div>
              <div className="text-xl sm:text-2xl font-extrabold text-blue-900 dark:text-blue-200 mt-1">
                {stats ? stats.inProgress : <Skeleton className="h-7 w-10" />}
              </div>
            </div>

            {/* Resolved */}
            <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Resolved</div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
                {stats ? stats.resolved : <Skeleton className="h-7 w-10" />}
              </div>
            </div>

            {/* Critical Priority */}
            <div className="rounded-2xl border border-red-200/80 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-red-800 dark:text-red-300 flex items-center gap-1">
                <Flame className="h-3 w-3" /> Critical
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-red-900 dark:text-red-200 mt-1">
                {stats ? stats.criticalPriority : <Skeleton className="h-7 w-10" />}
              </div>
            </div>

            {/* Avg Rating */}
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-white dark:bg-[#111827] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> Satisfaction
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                {stats && typeof stats.averageRating === 'number' ? (
                  `${stats.averageRating.toFixed(1)} / 5.0`
                ) : (
                  <Skeleton className="h-7 w-10" />
                )}
              </div>
            </div>
          </div>

          {/* GEMINI AI OPERATIONS BRIEFING (SOFT TINTED CONTAINER, NOT FLASHY GRADIENTS) */}
          <div className="rounded-3xl border border-blue-200/80 dark:border-blue-950/80 bg-blue-50/50 dark:bg-[#111c30] p-6 sm:p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 dark:bg-blue-500 text-white shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-950 dark:text-blue-200">
                    AI OPERATIONS BRIEFING
                  </h3>
                  <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                    Generated from live municipal complaint dataset (Zero Citizen PII Exposed)
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchAiSummary}
                disabled={aiLoading}
                className="h-8 rounded-xl border-blue-200 dark:border-blue-900/60 bg-white dark:bg-[#182235] text-xs font-semibold text-blue-950 dark:text-blue-200 hover:bg-blue-50 gap-1 px-3 shadow-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'Analyzing...' : 'Regenerate Briefing'}</span>
              </Button>
            </div>

            <div className="rounded-2xl border border-blue-200/60 dark:border-blue-900/40 bg-white/90 dark:bg-[#0c1424] p-5">
              {aiLoading ? (
                <div className="space-y-2 py-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : aiError ? (
                <div className="text-xs text-red-600 dark:text-red-400">{aiError}</div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiSummary || 'Loading live operational briefing...'}
                </p>
              )}
            </div>
          </div>

          {/* DISPATCH QUEUE & COMPLAINTS LEDGER */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Municipal Dispatch Queue ({complaints.length})
                </h2>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <Input
                      placeholder="Search tickets..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="pl-8.5 h-9 text-xs w-44 rounded-xl"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182235] px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    <option value="road">Roads</option>
                    <option value="garbage">Garbage</option>
                    <option value="water">Water</option>
                    <option value="electricity">Electricity</option>
                    <option value="other">Other</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182235] px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#182235]/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3.5 rounded-l-xl">Ticket ID</th>
                      <th className="py-3 px-3.5">Title & Area</th>
                      <th className="py-3 px-3.5">Category</th>
                      <th className="py-3 px-3.5">Priority Score</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5">Support</th>
                      <th className="py-3 px-3.5 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {loading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <tr key={i}>
                          <td colSpan={7} className="py-3.5 px-3.5">
                            <Skeleton className="h-4 w-full rounded-md" />
                          </td>
                        </tr>
                      ))
                    ) : complaints.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                          No complaints match the current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      complaints.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                            #CF-{c._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-3.5 max-w-xs truncate">
                            <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{c.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {c.area}
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <CategoryBadge category={c.category} />
                          </td>
                          <td className="py-3.5 px-3.5">
                            <PriorityBadge priority={c.priority} score={c.priorityScore} showScore={true} />
                          </td>
                          <td className="py-3.5 px-3.5">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-3.5 px-3.5 font-bold text-slate-800 dark:text-slate-200">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-slate-400" />
                              {c.upvotes || 0}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenStatusModal(c)}
                              className="h-8 rounded-xl text-xs font-semibold px-2.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Review / Dispatch
                            </Button>
                            <Link href={`/complaints/${c._id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2"
                              >
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* STATUS UPDATE & DISPATCH MODAL */}
          <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
            <DialogContent className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-slate-100 text-lg font-bold">
                  Review & Update Municipal Ticket
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Update lifecycle dispatch state and provide official public remarks for citizens.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 py-2">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#182235] text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{selectedComplaint?.title}</div>
                  <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{selectedComplaint?.area}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedComplaint?.category}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newStatus" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Municipal Status
                  </Label>
                  <select
                    id="newStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182235] px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="pending">Pending Review (Awaiting Field Dispatch)</option>
                    <option value="in-progress">In Progress (Field Crew Deployed On Site)</option>
                    <option value="resolved">Resolved (Work Inspected & Completed)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="officerRemark" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Official Officer Remark (Publicly Visible)
                  </Label>
                  <Textarea
                    id="officerRemark"
                    placeholder="Enter dispatch notes, repair timeline, contractor details, or resolution summary..."
                    value={officerRemark}
                    onChange={(e) => setOfficerRemark(e.target.value)}
                    rows={3}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <DialogFooter className="pt-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedComplaint(null)}
                    disabled={updatingStatus}
                    className="text-xs h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-bold text-xs h-10 px-5 rounded-xl shadow-sm"
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? 'Updating Record...' : 'Confirm Update'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* PROVISION OFFICER MODAL */}
          <Dialog open={showProvisionModal} onOpenChange={setShowProvisionModal}>
            <DialogContent className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-slate-100 text-lg font-bold">
                  Provision Government Officer Account
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Authorized officers can create new officer credentials for municipal staff.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleProvisionSubmit} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prov-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Officer Full Name
                  </Label>
                  <Input
                    id="prov-name"
                    placeholder="e.g. Inspector Tariq Mahmood"
                    value={provisionData.name}
                    onChange={(e) => setProvisionData((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prov-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Official Email Address
                  </Label>
                  <Input
                    id="prov-email"
                    type="email"
                    placeholder="officer@municipal.gov"
                    value={provisionData.email}
                    onChange={(e) => setProvisionData((prev) => ({ ...prev, email: e.target.value }))}
                    className="h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prov-pass" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Initial Password (min 6 chars)
                  </Label>
                  <Input
                    id="prov-pass"
                    type="password"
                    placeholder="••••••••"
                    value={provisionData.password}
                    onChange={(e) => setProvisionData((prev) => ({ ...prev, password: e.target.value }))}
                    className="h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <DialogFooter className="pt-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProvisionModal(false)}
                    disabled={provisioning}
                    className="text-xs h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-bold text-xs h-10 px-5 rounded-xl shadow-sm"
                    disabled={provisioning}
                  >
                    {provisioning ? 'Provisioning...' : 'Create Officer Account'}
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
