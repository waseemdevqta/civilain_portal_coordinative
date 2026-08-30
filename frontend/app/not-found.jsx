import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Megaphone, Home, Layers } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FF] text-[#0B1C30] px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F172A] text-white shadow-sm mb-4">
        <Megaphone className="h-7 w-7" />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-3 py-0.5 text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider mb-2">
        <span>ERROR 404 • RECORD NOT FOUND</span>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-[#0B1C30] sm:text-4xl">
        Page or Record Not Found
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md">
        The municipal record, ticket ID, or navigation route you are attempting to view does not exist or has been relocated.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button size="sm" className="bg-[#0F172A] hover:bg-[#1E293B] text-white gap-1.5 h-10 px-5 text-xs font-bold rounded-xl shadow-xs hover:-translate-y-0.5 transition-all">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
        <Link href="/complaints">
          <Button size="sm" variant="outline" className="border-slate-200 bg-white text-slate-800 hover:bg-[#F8F9FF] h-10 px-5 text-xs font-semibold rounded-xl gap-1.5 shadow-xs hover:-translate-y-0.5 transition-all">
            <Layers className="h-4 w-4" />
            Explore Issues
          </Button>
        </Link>
      </div>
    </div>
  );
}
