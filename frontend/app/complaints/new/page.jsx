'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import ImageUploader from '@/components/common/ImageUploader';
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
  Sparkles,
  Camera,
} from 'lucide-react';

const CATEGORIES = [
  {
    value: 'road',
    label: 'Roads & Transport',
    icon: Route,
    desc: 'Potholes, broken asphalt, traffic signals',
    activeContainer: 'bg-[#EFF4FF] text-[#1E40AF] border-[#BFDBFE]',
    inactiveContainer: 'bg-[#EFF4FF] text-[#1E40AF]',
  },
  {
    value: 'garbage',
    label: 'Garbage & Sanitation',
    icon: Trash2,
    desc: 'Trash heaps, overflowing dumpsters',
    activeContainer: 'bg-[#E8F9ED] text-[#1F6C3A] border-[#A4F1B2]',
    inactiveContainer: 'bg-[#E8F9ED] text-[#1F6C3A]',
  },
  {
    value: 'water',
    label: 'Water Supply',
    icon: Droplets,
    desc: 'Burst mains, dirty tap water, low pressure',
    activeContainer: 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]',
    inactiveContainer: 'bg-[#F0F9FF] text-[#0369A1]',
  },
  {
    value: 'electricity',
    label: 'Electricity & Power',
    icon: Zap,
    desc: 'Exposed wires, broken streetlights',
    activeContainer: 'bg-[#FEFCE8] text-[#A16207] border-[#FEF08A]',
    inactiveContainer: 'bg-[#FEFCE8] text-[#A16207]',
  },
  {
    value: 'other',
    label: 'General Civic',
    icon: FileText,
    desc: 'Public spaces, park maintenance, hazards',
    activeContainer: 'bg-slate-100 text-slate-800 border-slate-300',
    inactiveContainer: 'bg-slate-100 text-slate-700',
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
    imageUrl: '',
    imagePublicId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI Triage Assistant State
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

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

  const handleImageChange = (url, publicId) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
      imagePublicId: publicId,
    }));
  };

  // Run AI Smart Triage Assistant
  const handleAiSmartTriage = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      setError('Please enter a brief title or description first for AI Smart Triage.');
      return;
    }

    setAnalyzingAi(true);
    setError('');

    try {
      const res = await aiApi.analyzeComplaint({
        title: formData.title,
        description: formData.description,
        area: formData.area,
      });

      if (res?.data) {
        setAiSuggestions(res.data);
        toast.success('AI Triage complete! Insights and category recommendations ready.');
      }
    } catch (err) {
      toast.error('AI assistant temporarily unavailable. You can still submit manually.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const applyAiSuggestions = () => {
    if (!aiSuggestions) return;

    setFormData((prev) => ({
      ...prev,
      category: aiSuggestions.suggestedCategory || prev.category,
      title: aiSuggestions.refinedTitle || prev.title,
    }));

    toast.success('Applied AI recommended category and optimized headline!');
    setAiSuggestions(null);
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
      await complaintApi.create({
        title: formData.title.trim(),
        category: formData.category,
        area: formData.area.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim(),
        imagePublicId: formData.imagePublicId.trim(),
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
      <div className="flex min-h-screen flex-col bg-[#F8F9FF] text-[#0B1C30] transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
          {/* HEADER */}
          <div className="border-b border-slate-200/80 pb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-3 py-0.5 text-xs font-bold text-[#1E40AF] mb-2">
              <FilePlus className="h-3.5 w-3.5 text-[#1E40AF]" />
              <span>CIVIC REPORT DISPATCH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1C30]">
              Report an Issue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Give your community and local authorities clear information and photo evidence to investigate and act quickly.
            </p>
          </div>

          {/* DUPLICATE WARNING ALERT */}
          {duplicates.length > 0 && (
            <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5 space-y-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    A similar issue may already be reported in {formData.area}
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Found {duplicates.length} active ticket(s) in this area. You can support the existing report to boost municipal urgency or continue with your new report:
                  </p>
                </div>
              </div>

              <div className="space-y-2 pl-8">
                {duplicates.slice(0, 3).map((dup) => (
                  <div
                    key={dup._id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-amber-200 bg-white text-xs shadow-2xs"
                  >
                    <div className="truncate">
                      <span className="font-bold text-[#0B1C30]">{dup.title}</span>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                        <StatusBadge status={dup.status} />
                        <span>• {dup.upvotes || 0} supporters</span>
                      </div>
                    </div>
                    <Link
                      href={`/complaints/${dup._id}`}
                      target="_blank"
                      className="text-[#0B1C30] font-bold shrink-0 flex items-center gap-1 text-xs hover:text-[#1E40AF] hover:underline"
                    >
                      Support Issue
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI TRIAGE SUGGESTIONS CARD */}
          {aiSuggestions && (
            <div className="rounded-3xl border border-[#1F6C3A]/30 bg-[#E8F9ED]/50 p-5 space-y-3 shadow-xs animate-scale-up">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1F6C3A] text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B1C30]">Gemini AI Triage Assessment</h4>
                    <p className="text-xs text-[#526071]">Recommended Sector & Risk Level</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={applyAiSuggestions}
                  className="bg-[#1F6C3A] hover:bg-[#18552E] text-white text-xs font-bold rounded-xl h-8 px-3"
                >
                  Apply Suggestions
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-white border border-[#A4F1B2]">
                  <span className="text-[10px] uppercase font-bold text-[#526071] block">Suggested Category</span>
                  <span className="text-sm font-bold text-[#1F6C3A] capitalize">
                    {aiSuggestions.suggestedCategory}
                  </span>
                  <span className="text-[11px] text-[#526071] block mt-0.5">
                    Severity: <strong>{aiSuggestions.severityLevel}</strong>
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#A4F1B2]">
                  <span className="text-[10px] uppercase font-bold text-[#526071] block">Refined Headline</span>
                  <p className="text-xs font-semibold text-[#0B1C30] mt-0.5 leading-snug">
                    {aiSuggestions.refinedTitle}
                  </p>
                </div>
              </div>

              {aiSuggestions.keyHazards && aiSuggestions.keyHazards.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-[#0B1C30] block mb-1">Identified Safety Hazards:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiSuggestions.keyHazards.map((hazard, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-white border border-[#CBD5E1] text-[#334155]">
                        ⚠️ {hazard}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ERROR ALERT */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-[#BA1A1A]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* FORM CONTAINER */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(11,28,48,0.03)] p-6 sm:p-9 space-y-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: CATEGORY SELECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider block">
                    1. WHAT KIND OF ISSUE?
                  </Label>
                  <button
                    type="button"
                    onClick={handleAiSmartTriage}
                    disabled={analyzingAi}
                    className="text-xs font-bold text-[#1F6C3A] hover:text-[#18552E] flex items-center gap-1.5 hover:underline disabled:opacity-50"
                  >
                    {analyzingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        AI Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Smart Triage
                      </>
                    )}
                  </button>
                </div>

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
                            ? 'border-slate-900 bg-[#0F172A] text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)]'
                            : 'border-slate-200 bg-[#F8F9FF] hover:bg-[#EFF4FF] text-slate-800'
                        }`}
                      >
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : cat.inactiveContainer
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">{cat.label}</div>
                          <div
                            className={`text-[11px] mt-0.5 leading-snug ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
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
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label htmlFor="area" className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider">
                    2. WHERE IS IT LOCATED?
                  </Label>
                  {checkingDuplicates && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
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
                    className="pl-10 h-10 text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Specify the neighborhood, street, or nearest landmark for field inspection.
                </p>
              </div>

              {/* SECTION 3: WHAT HAPPENED? */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <Label className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider block">
                  3. WHAT HAPPENED?
                </Label>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold text-slate-700">
                    Headline / Summary
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Deep pothole damaging vehicle suspension near gate 3"
                    value={formData.title}
                    onChange={handleChange}
                    className="h-10 text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Provide specific details about issue severity, duration, and safety hazards to guide municipal crews..."
                    value={formData.description}
                    onChange={handleChange}
                    className="text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
                    required
                  />
                </div>
              </div>

              {/* SECTION 4: PHOTO EVIDENCE (CLOUDINARY) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <ImageUploader
                  value={formData.imageUrl}
                  onChange={handleImageChange}
                  label="4. ATTACH PHOTO EVIDENCE (OPTIONAL)"
                  description="Upload a photo from your phone or desktop (PNG, JPG, WebP up to 5MB)"
                  type="evidence"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 bg-white hover:bg-[#F8F9FF]">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full sm:w-auto bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-6 h-10 text-xs sm:text-sm rounded-xl shadow-[0_4px_14px_rgba(15,23,42,0.15)] hover:-translate-y-0.5 transition-all"
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
