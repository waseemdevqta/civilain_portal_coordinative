'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { complaintApi, uploadApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { EmptyState } from '@/components/common/EmptyState';
import ImageLightbox from '@/components/common/ImageLightbox';
import WorkOrderModal from '@/components/common/WorkOrderModal';
import { toast } from '@/components/ui/toaster';
import {
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  ThumbsUp,
  Camera,
  Upload,
  Printer,
  Eye,
  Loader2,
  ArrowUpDown,
  X,
  Play,
  Check,
  ShieldCheck,
  Phone,
  Briefcase,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Divisions' },
  { value: 'road', label: 'Roads & Transport' },
  { value: 'garbage', label: 'Garbage & Sanitation' },
  { value: 'water', label: 'Water Supply' },
  { value: 'electricity', label: 'Electricity & Power' },
  { value: 'other', label: 'Other Facilities' },
];

const STATUS_FILTERS = [
  { value: '', label: 'All Tasks' },
  { value: 'pending', label: 'Pending Inspection' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Completed' },
];

export default function StaffDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isTechnician, isOfficer, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Resolution modal state
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState('');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [uploadingResolution, setUploadingResolution] = useState(false);

  // Quick status update loading tracker
  const [updatingId, setUpdatingId] = useState(null);

  // Print Docket modal state
  const [printDocketComplaint, setPrintDocketComplaint] = useState(null);

  // Lightbox modal state
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Route security check
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/staff/login');
      } else if (!isTechnician && !isOfficer) {
        toast.error('Access restricted to field technicians and municipal staff.');
        router.replace('/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, isTechnician, isOfficer, router]);

  const fetchAssignedTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const res = await complaintApi.getAssignedToMe(params);
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load assigned field tasks.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => {
    if (!authLoading && (isTechnician || isOfficer)) {
      fetchAssignedTasks();
    }
  }, [authLoading, isTechnician, isOfficer, fetchAssignedTasks]);

  // 1-Click Quick Action: Transition from Pending -> In-Progress
  const handleStartWork = async (complaintId) => {
    setUpdatingId(complaintId);
    try {
      await complaintApi.updateStatus(complaintId, {
        status: 'in-progress',
        officerRemark: `Work initiated on site by technician ${user?.name || ''}.`,
      });
      toast.success('Work Order marked IN PROGRESS. Citizen alerted.');
      fetchAssignedTasks();
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Resolution Modal
  const openResolveModal = (complaint) => {
    setResolvingComplaint(complaint);
    setResolutionPhoto(null);
    setResolutionPreview(complaint.resolutionImageUrl || '');
    setResolutionRemarks(complaint.officerRemark || '');
  };

  // Handle Resolution Photo Selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResolutionPhoto(file);
      setResolutionPreview(URL.createObjectURL(file));
    }
  };

  // Submit Resolution with Proof Photo
  const handleCompleteTask = async (e) => {
    e.preventDefault();
    if (!resolvingComplaint) return;

    if (!resolutionRemarks.trim()) {
      toast.error('Please enter official resolution remarks describing the repair.');
      return;
    }

    setUploadingResolution(true);
    try {
      let finalResolutionUrl = resolvingComplaint.resolutionImageUrl || '';

      // Upload new resolution proof photo if provided
      if (resolutionPhoto) {
        const formData = new FormData();
        formData.append('image', resolutionPhoto);
        const uploadRes = await uploadApi.uploadImage(formData);
        finalResolutionUrl = uploadRes.data?.url || uploadRes.url;
      }

      await complaintApi.updateStatus(resolvingComplaint._id, {
        status: 'resolved',
        officerRemark: resolutionRemarks.trim(),
        resolutionImageUrl: finalResolutionUrl,
      });

      toast.success('Task marked RESOLVED with photographic proof!');
      setResolvingComplaint(null);
      setResolutionPhoto(null);
      setResolutionPreview('');
      setResolutionRemarks('');
      fetchAssignedTasks();
    } catch (err) {
      toast.error('Failed to complete work order: ' + err.message);
    } finally {
      setUploadingResolution(false);
    }
  };

  // Counts
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const resolvedTasks = tasks.filter((t) => t.status === 'resolved').length;
  const criticalTasks = tasks.filter((t) => t.priority === 'critical').length;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF] text-[#0B1C30]">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TECHNICIAN HERO BANNER */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(11,28,48,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200 shadow-2xs">
                <Wrench className="h-3.5 w-3.5 text-amber-600" />
                <span>FIELD CREW OPERATIONS CONSOLE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B1C30]">
                Welcome back, {user?.name || 'Technician'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                {user?.designation && (
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Briefcase className="h-3.5 w-3.5 text-amber-600" />
                    {user.designation}
                  </span>
                )}
                {user?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {user.phone}
                  </span>
                )}
                {user?.email && (
                  <span className="font-mono text-slate-400">
                    {user.email}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/complaints">
                <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold rounded-xl h-10 px-4">
                  <Layers className="h-4 w-4 text-slate-500" />
                  Public Feed
                </Button>
              </Link>
              {isOfficer && (
                <Link href="/officer/dashboard">
                  <Button variant="default" size="sm" className="gap-2 text-xs font-bold rounded-xl h-10 px-4">
                    <ShieldCheck className="h-4 w-4" />
                    Officer Portal
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* METRICS RIBBON */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Assigned Tasks</span>
              <Wrench className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B1C30]">{totalTasks}</div>
            <div className="text-[11px] text-slate-400 mt-1">Total in dispatch queue</div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Start</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900">{pendingTasks}</div>
            <div className="text-[11px] text-amber-700/80 mt-1">Requires crew mobilization</div>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-5 shadow-xs">
            <div className="flex items-center justify-between text-orange-800 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
              <Sparkles className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-orange-900">{inProgressTasks}</div>
            <div className="text-[11px] text-orange-700/80 mt-1">Repairs currently active</div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900">{resolvedTasks}</div>
            <div className="text-[11px] text-emerald-700/80 mt-1">Verified with proof</div>
          </div>
        </div>

        {/* WORK ORDERS FILTER BAR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search assigned work orders by title, area, or description..."
                className="pl-10 h-10 text-xs bg-[#F8F9FF] border-slate-200 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Division filter */}
            <div className="w-full sm:w-56 shrink-0">
              <select
                className="w-full h-10 text-xs rounded-xl border border-slate-200 bg-[#F8F9FF] text-[#0B1C30] px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tab Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatusFilter(s.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === s.value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-[#F8F9FF] text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* WORK ORDERS CARD GRID */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Fetching assigned field tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
            <Wrench className="h-10 w-10 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-[#0B1C30]">No Field Tasks Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {statusFilter || categoryFilter || search
                ? 'No assigned work orders match your active filter criteria.'
                : 'You currently have no tasks in your dispatch queue. Work orders assigned to you by supervising officers will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map((task) => {
              const ticketId = `CF-${task._id.slice(-6).toUpperCase()}`;
              const isTaskResolved = task.status === 'resolved';
              const isTaskInProgress = task.status === 'in-progress';
              const hasDamagePhoto = Boolean(task.imageUrl);
              const hasResolutionPhoto = Boolean(task.resolutionImageUrl);

              return (
                <div
                  key={task._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <CategoryBadge category={task.category} />
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={task.status} />
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {ticketId}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-sm font-bold text-[#0B1C30] line-clamp-1 hover:text-blue-600">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {/* Location & Metadata */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-600 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{task.area}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <PriorityBadge priority={task.priority} score={task.priorityScore} showScore={true} />
                      </div>
                    </div>

                    {/* BEFORE / AFTER PHOTO PREVIEWS */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      {/* Before: Citizen Damage Photo */}
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                          <Camera className="h-3 w-3" /> Hazard Evidence
                        </div>
                        {hasDamagePhoto ? (
                          <div
                            onClick={() =>
                              setActiveLightbox({
                                url: task.imageUrl,
                                title: `${task.title} — Hazard Evidence (Before)`,
                                subtitle: `Reported in ${task.area}`,
                              })
                            }
                            className="h-20 w-full rounded-xl overflow-hidden relative cursor-pointer border border-slate-200 group/img"
                          >
                            <img
                              src={task.imageUrl}
                              alt="Hazard evidence"
                              className="h-full w-full object-cover group-hover/img:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              <Eye className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 w-full rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400 text-center px-1">
                            No photo attached
                          </div>
                        )}
                      </div>

                      {/* After: Resolution Photo */}
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Resolution Proof
                        </div>
                        {hasResolutionPhoto ? (
                          <div
                            onClick={() =>
                              setActiveLightbox({
                                url: task.resolutionImageUrl,
                                title: `${task.title} — Official Fix Proof (After)`,
                                subtitle: task.officerRemark || 'Resolution completed',
                              })
                            }
                            className="h-20 w-full rounded-xl overflow-hidden relative cursor-pointer border border-emerald-300 group/img"
                          >
                            <img
                              src={task.resolutionImageUrl}
                              alt="Resolution proof"
                              className="h-full w-full object-cover group-hover/img:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              <Eye className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 w-full rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400 text-center px-1">
                            {isTaskResolved ? 'No proof attached' : 'Pending completion'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remarks snippet if available */}
                    {task.officerRemark && (
                      <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-2.5 text-[11px] text-emerald-900 leading-relaxed">
                        <span className="font-bold">Remarks: </span>
                        {task.officerRemark}
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex gap-2">
                      {!isTaskResolved ? (
                        <>
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs h-9 rounded-xl border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-900 font-bold gap-1.5"
                              disabled={updatingId === task._id}
                              onClick={() => handleStartWork(task._id)}
                            >
                              {updatingId === task._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Play className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
                              )}
                              Start Work
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 text-xs h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold gap-1.5 shadow-xs"
                            onClick={() => openResolveModal(task)}
                          >
                            <Camera className="h-3.5 w-3.5" />
                            {isTaskInProgress ? 'Complete & Upload Proof' : 'Resolve'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-9 rounded-xl border-emerald-300 bg-emerald-50 text-emerald-900 font-bold gap-1.5 cursor-default"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          Completed
                        </Button>
                      )}

                      {/* Print Docket button */}
                      <Button
                        size="sm"
                        variant="outline"
                        title="Print Field Work Order Docket"
                        className="text-xs h-9 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={() => setPrintDocketComplaint(task)}
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <Link href={`/complaints/${task._id}`} className="block text-center text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition-colors">
                      View Public Complaint Tracker &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* RESOLUTION PROOF MODAL */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B1C30]">
                    Complete Work Order & Upload Proof
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ticket CF-{resolvingComplaint._id.slice(-6).toUpperCase()} &bull; {resolvingComplaint.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResolvingComplaint(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteTask} className="space-y-4">
              {/* Photo Evidence Upload Box */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Resolution Proof Photo (Fix Evidence)
                </Label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center bg-[#F8F9FF] transition-colors relative">
                  {resolutionPreview ? (
                    <div className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={resolutionPreview}
                        alt="Resolution preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setResolutionPhoto(null);
                          setResolutionPreview('');
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2 py-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        Click to upload photo or take picture on mobile
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Attach visual evidence showing the hazard has been repaired
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Remarks Textarea */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Field Completion Remarks *
                </Label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the maintenance work completed (e.g. Cleared 2 metric tons of waste from dumpster, disinfected perimeter)..."
                  className="w-full text-xs rounded-xl border border-slate-200 bg-[#F8F9FF] p-3 text-[#0B1C30] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={resolutionRemarks}
                  onChange={(e) => setResolutionRemarks(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={uploadingResolution}
                  className="flex-1 font-bold text-xs h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs"
                >
                  {uploadingResolution ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Proof & Resolving...
                    </span>
                  ) : (
                    'Confirm & Mark Resolved'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs h-10 rounded-xl"
                  onClick={() => setResolvingComplaint(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Printable Work Order Modal */}
      {printDocketComplaint && (
        <WorkOrderModal
          isOpen={true}
          onClose={() => setPrintDocketComplaint(null)}
          complaint={printDocketComplaint}
        />
      )}

      <Footer />
    </div>
  );
}
