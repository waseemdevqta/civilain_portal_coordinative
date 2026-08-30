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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import ImageUploader from '@/components/common/ImageUploader';
import ImageLightbox from '@/components/common/ImageLightbox';
import WorkOrderModal from '@/components/common/WorkOrderModal';
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
  Camera,
  Printer,
  ExternalLink,
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

  // Lightbox and Docket states
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [docketComplaint, setDocketComplaint] = useState(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // Status Update Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [officerRemark, setOfficerRemark] = useState('');
  const [resolutionImageUrl, setResolutionImageUrl] = useState('');
  const [resolutionImagePublicId, setResolutionImagePublicId] = useState('');
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

  // Handle status update modal open
  const handleOpenStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setOfficerRemark(complaint.officerRemark || '');
    setResolutionImageUrl(complaint.resolutionImageUrl || '');
    setResolutionImagePublicId(complaint.resolutionImagePublicId || '');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdatingStatus(true);
    try {
      const res = await complaintApi.updateStatus(selectedComplaint._id, {
        status: newStatus,
        officerRemark: officerRemark.trim(),
        resolutionImageUrl: resolutionImageUrl.trim(),
        resolutionImagePublicId: resolutionImagePublicId.trim(),
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

  // Handle Provisioning New Officer via authApi.addOfficer
  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    if (!provisionData.name.trim() || !provisionData.email.trim() || !provisionData.password) {
      toast.error('All fields are required');
      return;
    }

    setProvisioning(true);
    try {
      const res = await authApi.addOfficer({
        name: provisionData.name.trim(),
        email: provisionData.email.trim(),
        password: provisionData.password,
      });

      const officerUser = res.data?.user || res.data;
      toast.success(`Officer account created for ${officerUser?.name || provisionData.name}`);
      setShowProvisionModal(false);
      setProvisionData({ name: '', email: '', password: '' });
    } catch (err) {
      toast.error(err.message || 'Officer provisioning failed');
    } finally {
      setProvisioning(false);
    }
  };

  // CSV Export Trigger via complaintApi.exportCSV
  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;

      const res = await complaintApi.exportCSV(params);

      const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' });
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
      <div className="flex min-h-screen flex-col bg-[#F8F9FF] text-[#0B1C30] transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
          {/* HEADER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F9ED] px-3 py-0.5 text-xs font-bold text-[#1F6C3A] border border-[#A4F1B2]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1F6C3A]" />
                <span>MUNICIPAL OPERATIONS COMMAND</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B1C30]">
                Operations Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Municipal Officer: <strong className="text-slate-800">{user?.name}</strong> • Dispatch queue, photo verification, priority escalation & feedback audit.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={exportingCsv}
                className="gap-1.5 text-xs font-semibold rounded-xl h-10 px-3.5 border-slate-200 bg-white hover:bg-[#F8F9FF] text-slate-800 shadow-2xs"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#1F6C3A]" />
                {exportingCsv ? 'Exporting...' : 'Export CSV Report'}
              </Button>

              <Button
                size="sm"
                onClick={() => setShowProvisionModal(true)}
                className="gap-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl h-10 px-4 shadow-[0_4px_14px_rgba(15,23,42,0.15)] hover:-translate-y-0.5 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                Add New Officer
              </Button>
            </div>
          </div>

          {/* AI OPERATIONAL BRIEFING CARD */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-[#EFF4FF] to-white p-6 sm:p-7 shadow-[0_4px_20px_rgba(30,64,175,0.04)] space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-[#1E40AF] flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1C30]">Gemini AI Operational Briefing</h3>
                  <p className="text-xs text-slate-500">Live intelligence summary generated from active complaints database</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchAiSummary}
                disabled={aiLoading}
                className="gap-1 text-xs text-[#1E40AF] hover:text-[#1E3A8A] hover:bg-[#EFF4FF] rounded-xl h-8 px-2.5 font-semibold"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'Analyzing...' : 'Refresh AI'}</span>
              </Button>
            </div>

            {aiLoading ? (
              <div className="py-4 space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
              </div>
            ) : aiError ? (
              <div className="p-3.5 rounded-2xl bg-white border border-red-200 text-xs text-[#BA1A1A]">
                {aiError}
              </div>
            ) : aiSummary ? (
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-blue-100 text-xs sm:text-sm text-slate-800 leading-relaxed">
                {aiSummary}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No AI briefing generated yet.</p>
            )}
          </div>

          {/* METRIC STATS TILES */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Workload</span>
                <span className="text-2xl font-black text-[#0B1C30]">{stats.total || 0}</span>
                <span className="text-[10px] text-slate-400 block">{stats.complaintsToday || 0} logged today</span>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-amber-800 block">Pending</span>
                <span className="text-2xl font-black text-amber-900">{stats.pending || 0}</span>
                <span className="text-[10px] text-amber-700 block">Awaiting field crew</span>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-blue-800 block">In Progress</span>
                <span className="text-2xl font-black text-blue-900">{stats.inProgress || 0}</span>
                <span className="text-[10px] text-blue-700 block">Active field repairs</span>
              </div>

              <div className="rounded-2xl border border-[#A4F1B2] bg-[#E8F9ED]/50 p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-[#1F6C3A] block">Resolved</span>
                <span className="text-2xl font-black text-[#14532D]">{stats.resolved || 0}</span>
                <span className="text-[10px] text-[#1F6C3A] block">Completed & verified</span>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-[#BA1A1A] block">Critical / High</span>
                <span className="text-2xl font-black text-red-900">{(stats.critical || 0) + (stats.high || 0)}</span>
                <span className="text-[10px] text-[#BA1A1A] block">{stats.critical || 0} critical urgent</span>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-amber-700 block">Citizen Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  <span className="text-2xl font-black text-[#0B1C30]">
                    {stats.averageFeedbackRating || stats.averageRating || '0.0'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block">Across resolved cases</span>
              </div>
            </div>
          )}

          {/* DISPATCH & QUEUE MANAGEMENT SECTION */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(11,28,48,0.03)] p-5 sm:p-7 space-y-5">
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-[#0B1C30]">Municipal Dispatch Queue</h3>
                  <p className="text-xs text-slate-500">Filter complaints by sector, dispatch status, or search area</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <Input
                      placeholder="Search tickets..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="pl-8 h-9 text-xs rounded-xl bg-[#F8F9FF] border-slate-200"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-[#F8F9FF] px-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
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
                    className="h-9 rounded-xl border border-slate-200 bg-[#F8F9FF] px-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
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
                    <tr className="border-b border-slate-200 bg-[#F8F9FF] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3.5 rounded-l-xl">Ticket ID</th>
                      <th className="py-3 px-3.5">Photo Evidence</th>
                      <th className="py-3 px-3.5">Title & Area</th>
                      <th className="py-3 px-3.5">Category</th>
                      <th className="py-3 px-3.5">Priority</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5">Support</th>
                      <th className="py-3 px-3.5 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <tr key={i}>
                          <td colSpan={8} className="py-3.5 px-3.5">
                            <Skeleton className="h-4 w-full rounded-md" />
                          </td>
                        </tr>
                      ))
                    ) : complaints.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No complaints match the current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      complaints.map((c) => {
                        const hasPhoto = Boolean(c.imageUrl);

                        return (
                          <tr key={c._id} className="hover:bg-[#F8F9FF] transition-colors">
                            <td className="py-3.5 px-3.5 font-mono font-bold text-[#0B1C30]">
                              #CF-{c._id.slice(-6).toUpperCase()}
                            </td>
                            <td className="py-3.5 px-3.5">
                              {hasPhoto ? (
                                <div
                                  onClick={() =>
                                    setActiveLightbox({
                                      url: c.imageUrl,
                                      title: c.title,
                                      subtitle: `Photo Evidence in ${c.area}`,
                                    })
                                  }
                                  className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group shadow-2xs flex-shrink-0"
                                  title="Click to view full photo"
                                >
                                  <img
                                    src={c.imageUrl}
                                    alt="Evidence"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No Photo</span>
                              )}
                            </td>
                            <td className="py-3.5 px-3.5 max-w-xs truncate">
                              <div className="font-bold text-[#0B1C30] truncate">{c.title}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-slate-400" />
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
                            <td className="py-3.5 px-3.5 font-bold text-slate-800">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3 text-slate-400" />
                                {c.upvotes || 0}
                              </span>
                            </td>
                            <td className="py-3.5 px-3.5 text-right space-x-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenStatusModal(c)}
                                className="h-8 rounded-xl text-xs font-semibold px-2.5 border-slate-200 hover:bg-[#EFF4FF] hover:text-[#0B1C30]"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Review
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDocketComplaint(c)}
                                className="h-8 rounded-xl text-xs text-slate-600 hover:text-[#0B1C30] px-2"
                                title="Print Municipal Docket"
                              >
                                <Printer className="h-3.5 w-3.5 text-[#1F6C3A]" />
                              </Button>
                              <Link href={`/complaints/${c._id}`}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 rounded-xl text-xs text-slate-600 hover:text-[#0B1C30] px-2"
                                >
                                  Details
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* STATUS UPDATE & DISPATCH MODAL */}
          <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
            <DialogContent className="bg-white border-slate-200 sm:max-w-lg rounded-3xl shadow-[0_12px_32px_rgba(11,28,48,0.1)]">
              <DialogHeader>
                <DialogTitle className="text-[#0B1C30] text-lg font-bold">
                  Review & Update Municipal Ticket
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500">
                  Update lifecycle dispatch state, attach resolution proof, and provide official public remarks for citizens.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 py-2">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8F9FF] text-xs space-y-1">
                  <div className="font-bold text-[#0B1C30] truncate">{selectedComplaint?.title}</div>
                  <div className="text-slate-500 flex items-center gap-2">
                    <span>{selectedComplaint?.area}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedComplaint?.category}</span>
                  </div>
                </div>

                {/* Citizen Evidence Preview if available */}
                {selectedComplaint?.imageUrl && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <img
                      src={selectedComplaint.imageUrl}
                      alt="Citizen Evidence"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-300 flex-shrink-0"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#0B1C30] block">Citizen Photo Attached</span>
                      <a
                        href={selectedComplaint.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1F6C3A] font-semibold hover:underline"
                      >
                        Inspect full resolution ↗
                      </a>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="newStatus" className="text-xs font-semibold text-slate-700">
                    Municipal Status
                  </Label>
                  <select
                    id="newStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="pending">Pending Review (Awaiting Field Dispatch)</option>
                    <option value="in-progress">In Progress (Field Crew Deployed On Site)</option>
                    <option value="resolved">Resolved (Work Inspected & Completed)</option>
                  </select>
                </div>

                {/* Optional Resolution Proof Image if Resolved */}
                {newStatus === 'resolved' && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <ImageUploader
                      value={resolutionImageUrl}
                      onChange={(url, publicId) => {
                        setResolutionImageUrl(url);
                        setResolutionImagePublicId(publicId);
                      }}
                      type="resolution"
                      label="Attach Resolution Photo Proof (Optional)"
                      description="Upload photo showing completed asphalt, cleared dumpster, or repaired wire"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="officerRemark" className="text-xs font-semibold text-slate-700">
                    Official Officer Remark (Publicly Visible)
                  </Label>
                  <Textarea
                    id="officerRemark"
                    placeholder="Enter dispatch notes, repair timeline, contractor details, or resolution summary..."
                    value={officerRemark}
                    onChange={(e) => setOfficerRemark(e.target.value)}
                    rows={3}
                    className="text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
                  />
                </div>

                <DialogFooter className="pt-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedComplaint(null)}
                    disabled={updatingStatus}
                    className="text-xs h-10 px-4 rounded-xl border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs"
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
            <DialogContent className="bg-white border-slate-200 sm:max-w-md rounded-3xl shadow-[0_12px_32px_rgba(11,28,48,0.1)]">
              <DialogHeader>
                <DialogTitle className="text-[#0B1C30] text-lg font-bold">
                  Provision Government Officer Account
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500">
                  Authorized officers can create new officer credentials for municipal staff.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleProvisionSubmit} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prov-name" className="text-xs font-semibold text-slate-700">
                    Officer Full Name
                  </Label>
                  <Input
                    id="prov-name"
                    placeholder="e.g. Inspector Tariq Mahmood"
                    value={provisionData.name}
                    onChange={(e) => setProvisionData((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-10 text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prov-email" className="text-xs font-semibold text-slate-700">
                    Official Email Address
                  </Label>
                  <Input
                    id="prov-email"
                    type="email"
                    placeholder="officer@municipal.gov"
                    value={provisionData.email}
                    onChange={(e) => setProvisionData((prev) => ({ ...prev, email: e.target.value }))}
                    className="h-10 text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prov-pass" className="text-xs font-semibold text-slate-700">
                    Initial Password (min 6 chars)
                  </Label>
                  <Input
                    id="prov-pass"
                    type="password"
                    placeholder="••••••••"
                    value={provisionData.password}
                    onChange={(e) => setProvisionData((prev) => ({ ...prev, password: e.target.value }))}
                    className="h-10 text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
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
                    className="text-xs h-10 px-4 rounded-xl border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs"
                    disabled={provisioning}
                  >
                    {provisioning ? 'Provisioning...' : 'Create Officer Account'}
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
