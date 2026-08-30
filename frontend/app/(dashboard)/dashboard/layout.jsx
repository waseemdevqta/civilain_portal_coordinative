'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { DashboardNavbar } from '@/components/dashboard/Navbar';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Desktop Fixed Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
          <DashboardSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col md:pl-64 h-full overflow-hidden">
          <DashboardNavbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
