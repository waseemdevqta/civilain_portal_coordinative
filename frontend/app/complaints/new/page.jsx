'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { complaintApi } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from '@/components/ui/toaster';
import {
  FilePlus,
  Route,
  Trash2,
  Droplets,
  Zap,
  FileText,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  {
    value: 'road',
    label: 'Roads & Transport',
    icon: Route,
    desc: 'Potholes, broken asphalt, traffic signals',
    activeContainer: 'bg-blue-100/80 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
    inactiveContainer: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  },
  {
    value: 'garbage',
    label: 'Garbage & Sanitation',
    icon: Trash2,
    desc: 'Trash heaps, overflowing dumpsters',
    activeContainer: 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    inactiveContainer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  {
    value: 'water',
    label: 'Water Supply',
    icon: Droplets,
    desc: 'Burst mains, dirty tap water, low pressure',
    activeContainer: 'bg-sky-100/80 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
    inactiveContainer: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  },
  {
    value: 'electricity',
    label: 'Electricity & Power',
    icon: Zap,
    desc: 'Exposed wires, broken streetlights',
    activeContainer: 'bg-amber-100/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    inactiveContainer: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  },
  {
    value: 'other',
    label: 'General Civic',
    icon: FileText,
    desc: 'Public spaces, park maintenance, hazards',
    activeContainer: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
    inactiveContainer: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
];

export default function ReportComplaintPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: 'road',
    area: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Duplicate detection state
  const [duplicates, setDuplicates] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  // Trigger duplicate check when category and area change
  useEffect(() => {
    if (!formData.category || !formData.area || formData.area.trim().length < 3) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingDuplicates(true);
      try {
        const res = await complaintApi.getDuplicates({
          category: formData.category,
          area: formData.area.trim(),
        });
        setDuplicates(res.data?.duplicates || []);
      } catch (err) {
        console.warn('Duplicate check warning:', err.message);
      } finally {
        setCheckingDuplicates(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.category, formData.area]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Please provide a clear issue title.');
      return;
    }

    if (!formData.category) {
      setError('Please select a problem category.');
      return;
    }

    if (!formData.area.trim()) {
      setError('Please specify the neighborhood area.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please describe what happened in detail.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await complaintApi.create({
        title: formData.title.trim(),
        category: formData.category,
        area: formData.area.trim(),
        description: formData.description.trim(),
      });

      toast.success('Issue reported successfully! Municipal tracking ticket generated.');
      router.push('/complaints/mine');
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute citizenOnly={true}>
      <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
          {/* HEADER */}
          <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <FilePlus className="h-3.5 w-3.5 text-slate-500" />
              <span>CIVIC REPORT DISPATCH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Report an Issue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Give your community and local authorities enough information to investigate and act quickly.
            </p>
          </div>

          {/* DUPLICATE WARNING ALERT */}
          {duplicates.length > 0 && (
            <div className="rounded-2xl border border-amber-300/90 dark:border-amber-900/70 bg-amber-50/90 dark:bg-amber-950/40 p-5 space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    A similar issue may already be reported in {formData.area}
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                    Found {duplicates.length} active ticket(s) in this area. You can support the existing report to boost municipal urgency or continue with your new report:
                  </p>
                </div>
              </div>

              <div className="space-y-2 pl-8">
                {duplicates.slice(0, 3).map((dup) => (
                  <div
                    key={dup._id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-xs"
                  >
                    <div className="truncate">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{dup.title}</span>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        <StatusBadge status={dup.status} />
                        <span>• {dup.upvotes || 0} supporters</span>
                      </div>
                    </div>
                    <Link
                      href={`/complaints/${dup._id}`}
                      target="_blank"
                      className="text-slate-900 dark:text-slate-100 font-bold shrink-0 flex items-center gap-1 text-xs hover:underline"
                    >
                      Support Issue
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200/90 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/40 p-4 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* FORM CONTAINER */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 sm:p-9 space-y-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: CATEGORY SELECTION */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                  1. WHAT KIND OF ISSUE?
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = formData.category === cat.value;

                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-[0_4px_12px_rgba(15,23,42,0.12)]'
                            : 'border-slate-200 dark:border-slate-800 bg-[#F7F8FC]/80 dark:bg-[#182235]/80 hover:bg-slate-100 dark:hover:bg-[#182235] text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-950'
                              : cat.inactiveContainer
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">{cat.label}</div>
                          <div
                            className={`text-[11px] mt-0.5 leading-snug ${
                              isSelected ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {cat.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: WHERE? */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <Label htmlFor="area" className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    2. WHERE IS IT LOCATED?
                  </Label>
                  {checkingDuplicates && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Checking area duplicates...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="area"
                    name="area"
                    placeholder="e.g. University Road, Satellite Town, Jinnah Avenue"
                    className="pl-10 h-10 text-xs sm:text-sm"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Specify the neighborhood, street, or nearest landmark for field inspection.
                </p>
              </div>

              {/* SECTION 3: WHAT HAPPENED? */}
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                  3. WHAT HAPPENED?
                </Label>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Headline / Summary
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Deep pothole damaging vehicle suspension near gate 3"
                    value={formData.title}
                    onChange={handleChange}
                    className="h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Provide specific details about issue severity, duration, and safety hazards to guide municipal crews..."
                    value={formData.description}
                    onChange={handleChange}
                    className="text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-bold px-6 h-10 text-xs sm:text-sm rounded-xl shadow-[0_2px_10px_rgba(15,23,42,0.1)]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Submitting Report...
                    </>
                  ) : (
                    'Submit Report to AWAZ'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
