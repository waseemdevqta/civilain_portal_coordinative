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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from '@/components/ui/toaster';
import {
  FilePlus,
  Truck,
  Trash2,
  Droplets,
  Zap,
  HelpCircle,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'road', label: 'Road & Transport', icon: Truck, desc: 'Potholes, asphalt, signals' },
  { value: 'garbage', label: 'Garbage & Sanitation', icon: Trash2, desc: 'Trash piles, overflowing bins' },
  { value: 'water', label: 'Water Supply', icon: Droplets, desc: 'Burst mains, contamination' },
  { value: 'electricity', label: 'Electricity & Power', icon: Zap, desc: 'Exposed wires, streetlights' },
  { value: 'other', label: 'General Civic', icon: HelpCircle, desc: 'Public parks, stray animals' },
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
      setError('Please provide a clear complaint title.');
      return;
    }

    if (!formData.category) {
      setError('Please select a complaint category.');
      return;
    }

    if (!formData.area.trim()) {
      setError('Please specify the neighborhood location.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please describe the problem details.');
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

      toast.success('Complaint filed successfully! Municipal ticket generated.');
      router.push('/complaints/mine');
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please try again.');
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute citizenOnly={true}>
      <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-slate-900">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* HEADER */}
          <div className="border-b border-slate-200 pb-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Municipal Ticket Form
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Report a Civic Issue
            </h1>
            <p className="mt-0.5 text-xs text-slate-600">
              Provide precise location and problem details to assist municipal field crews with swift investigation and resolution.
            </p>
          </div>

          {/* DUPLICATE WARNING ALERT */}
          {duplicates.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Similar Active Issues Already Reported in {formData.area}
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Found {duplicates.length} active ticket(s) matching this category and location. You can upvote an existing report to boost municipal urgency:
                  </p>
                </div>
              </div>

              <div className="space-y-2 pl-7">
                {duplicates.slice(0, 3).map((dup) => (
                  <div
                    key={dup._id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded border border-amber-200 bg-white text-xs"
                  >
                    <div className="truncate">
                      <span className="font-semibold text-slate-900">{dup.title}</span>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                        <StatusBadge status={dup.status} />
                        <span>• {dup.upvotes || 0} community upvotes</span>
                      </div>
                    </div>
                    <Link
                      href={`/complaints/${dup._id}`}
                      target="_blank"
                      className="text-slate-900 hover:text-slate-700 font-semibold shrink-0 flex items-center gap-1 text-xs underline"
                    >
                      View & Upvote
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {error && (
            <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* FORM CARD */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Issue Specification</CardTitle>
              <CardDescription className="text-xs text-slate-600">
                All fields are registered into the municipal public ledger.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Select Problem Category
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.category === cat.value;

                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                          className={`flex items-start gap-2.5 p-3 rounded border text-left transition-colors ${
                            isSelected
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                              : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 mt-0.5 shrink-0 ${
                              isSelected ? 'text-white' : 'text-slate-600'
                            }`}
                          />
                          <div>
                            <div className="text-xs font-bold leading-tight">{cat.label}</div>
                            <div
                              className={`text-[10px] mt-0.5 leading-snug ${
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

                {/* Title */}
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-xs font-semibold text-slate-700">
                    Complaint Title / Headline
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Deep pothole damaging vehicle suspension near gate 3"
                    value={formData.title}
                    onChange={handleChange}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                {/* Area Location */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="area" className="text-xs font-semibold text-slate-700">
                      Neighborhood Area / Street
                    </Label>
                    {checkingDuplicates && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Checking area duplicates...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="area"
                      name="area"
                      placeholder="e.g. University Road, Satellite Town, Cantt"
                      className="pl-9 h-9 text-xs"
                      value={formData.area}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Provide specific details about issue severity, duration, and landmarks to guide field dispatch..."
                    value={formData.description}
                    onChange={handleChange}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto h-9 text-xs">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 h-9 text-xs shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Submitting Ticket...
                      </>
                    ) : (
                      'Submit Official Complaint'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
