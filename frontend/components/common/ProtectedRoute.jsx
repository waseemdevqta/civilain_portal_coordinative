'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export function ProtectedRoute({ children, officerOnly = false, citizenOnly = false }) {
  const { isAuthenticated, isOfficer, isCitizen, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (officerOnly && !isOfficer) {
        router.replace('/dashboard');
      } else if (citizenOnly && !isCitizen) {
        router.replace('/officer/dashboard');
      }
    }
  }, [isAuthenticated, isOfficer, isCitizen, loading, router, pathname, officerOnly, citizenOnly]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (officerOnly && !isOfficer) {
    return null;
  }

  if (citizenOnly && !isCitizen) {
    return null;
  }

  return children;
}
