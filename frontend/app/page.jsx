'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  FilePlus,
  ListFilter,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ArrowRight,
  Truck,
  Trash2,
  Droplets,
  Zap,
  HelpCircle,
  ShieldCheck,
  Search,
  MessageSquare,
  Lock,
  LayoutDashboard,
  FileText,
} from 'lucide-react';

export default function LandingPage() {
  const { user, isAuthenticated, isOfficer, isCitizen } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="border-b border-slate-200 bg-white py-16 md:py-24">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Institutional Seal / Badge */}
            <div className="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 mb-6">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-900" />
              <span>Official Municipal Civic Issue Portal</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-tight">
              Report it. Track it.{' '}
              <span className="text-slate-900 underline decoration-emerald-600 decoration-4 underline-offset-4">
                Get it resolved.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed">
              CivicFix is a transparent public complaint platform connecting citizens directly with municipal authorities. Report neighborhood infrastructure issues, upvote community priorities, and verify resolution quality.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                isOfficer ? (
                  <>
                    <Link href="/officer/dashboard" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white gap-2 px-6 h-11 shadow-sm">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        Go to Operations Center
                      </Button>
                    </Link>
                    <Link href="/complaints" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 px-6 h-11 border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
                        <ListFilter className="h-4 w-4 text-slate-600" />
                        Browse Issues
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white gap-2 px-6 h-11 shadow-sm">
                        <LayoutDashboard className="h-4 w-4" />
                        Go to Citizen Dashboard
                      </Button>
                    </Link>
                    <Link href="/complaints/new" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 px-6 h-11 border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
                        <FilePlus className="h-4 w-4 text-slate-600" />
                        Report an Issue
                      </Button>
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link href="/complaints/new" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white gap-2 px-6 h-11 shadow-sm">
                      <FilePlus className="h-4 w-4" />
                      Report an Issue
                    </Button>
                  </Link>
                  <Link href="/complaints" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 px-6 h-11 border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
                      <ListFilter className="h-4 w-4 text-slate-600" />
                      Browse Reported Issues
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Highlights Strip */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 text-left max-w-4xl mx-auto pt-8 border-t border-slate-100">
              <div className="p-3.5 rounded border border-slate-200 bg-slate-50/60">
                <div className="text-xs font-bold text-slate-900">Direct Dispatch</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Routed to municipal teams</div>
              </div>
              <div className="p-3.5 rounded border border-slate-200 bg-slate-50/60">
                <div className="text-xs font-bold text-slate-900">Community Upvotes</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Surface urgent local needs</div>
              </div>
              <div className="p-3.5 rounded border border-slate-200 bg-slate-50/60">
                <div className="text-xs font-bold text-slate-900">Verified Progress</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Status & officer remarks</div>
              </div>
              <div className="p-3.5 rounded border border-slate-200 bg-slate-50/60">
                <div className="text-xs font-bold text-slate-900">Citizen Feedback</div>
                <div className="text-[11px] text-slate-500 mt-0.5">1–5 star resolution rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS - 3 SUBTLE NUMBERED BLOCKS */}
        <section className="py-16 border-b border-slate-200 bg-[#f8f9ff]">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Resolution Workflow
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                How CivicFix Works
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                A structured three-step process built for civic accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 01 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded w-fit mb-4">
                  01 REPORT
                </div>
                <h3 className="text-base font-bold text-slate-900">Submit or Upvote</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Submit a complaint with location and category. If an identical problem exists, duplicate detection prompts you to upvote the existing ticket.
                </p>
              </div>

              {/* Step 02 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-xs font-mono font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded w-fit mb-4">
                  02 TRACK
                </div>
                <h3 className="text-base font-bold text-slate-900">Officer Operations</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Municipal officers inspect queues prioritized by community upvotes, generate AI operational summaries, and record resolution remarks.
                </p>
              </div>

              {/* Step 03 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-xs font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded w-fit mb-4">
                  03 RESOLVE
                </div>
                <h3 className="text-base font-bold text-slate-900">Verify & Feedback</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Upon completion, the ticket is marked resolved. The author evaluates resolution quality with a 1–5 star rating and service comment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ISSUE CATEGORIES */}
        <section className="py-16 border-b border-slate-200 bg-white">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Municipal Services
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Civic Issue Categories
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Issues are categorized to reach the correct municipal maintenance division without delay.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 hover:border-slate-300 transition-colors">
                <div className="h-9 w-9 rounded bg-slate-900 text-white flex items-center justify-center mb-3">
                  <Truck className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Road & Transport</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Potholes, broken asphalt, damaged walkways, missing manhole covers, and faulty traffic signals.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 hover:border-slate-300 transition-colors">
                <div className="h-9 w-9 rounded bg-emerald-700 text-white flex items-center justify-center mb-3">
                  <Trash2 className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Garbage & Sanitation</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Uncollected waste heaps, overflowing public dumpsters, clogged drains, and illegal dumping sites.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 hover:border-slate-300 transition-colors">
                <div className="h-9 w-9 rounded bg-blue-700 text-white flex items-center justify-center mb-3">
                  <Droplets className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Water Supply</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Burst pipeline mains, low supply pressure, contaminated tap water, and open sewer overflows.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 hover:border-slate-300 transition-colors">
                <div className="h-9 w-9 rounded bg-amber-600 text-white flex items-center justify-center mb-3">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Electricity & Power</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Exposed transformer cables, broken streetlights, hanging power wires, and local phase failures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST & ACCOUNTABILITY (AUTH-AWARE) */}
        <section className="py-16 bg-[#f8f9ff]">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Public Accountability by Design
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 leading-relaxed">
              Every complaint is logged with a persistent public tracking ID, transparent timestamp, dynamic community priority score, and official resolution record.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              {isAuthenticated ? (
                isOfficer ? (
                  <>
                    <Link href="/officer/dashboard" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 h-11 shadow-sm gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        Go to Operations Center
                      </Button>
                    </Link>
                    <Link href="/complaints" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 h-11 border-slate-300 bg-white text-slate-800 hover:bg-slate-50 gap-2">
                        <ListFilter className="h-4 w-4 text-slate-600" />
                        Browse Issues
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 h-11 shadow-sm gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Go to Citizen Dashboard
                      </Button>
                    </Link>
                    <Link href="/complaints/mine" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 h-11 border-slate-300 bg-white text-slate-800 hover:bg-slate-50 gap-2">
                        <FileText className="h-4 w-4 text-slate-600" />
                        My Complaints
                      </Button>
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 h-11 shadow-sm">
                      Register Citizen Account
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 h-11 border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
                      Sign In to Portal
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* REUSABLE INSTITUTIONAL FOOTER */}
      <Footer />
    </div>
  );
}
