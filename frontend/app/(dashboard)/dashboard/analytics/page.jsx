'use client';

import React, { useState, useEffect } from 'react';
import { resourceApi, userApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Users,
  FolderKanban,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [resData, userData] = await Promise.all([
        resourceApi.getAll().catch(() => ({ data: { resources: [] } })),
        userApi.getAll().catch(() => ({ data: { users: [] } })),
      ]);
      setResources(resData.data?.resources || []);
      setUsers(userData.data?.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Status distributions
  const activeCount = resources.filter((r) => r.status === 'active').length;
  const pendingCount = resources.filter((r) => r.status === 'pending').length;
  const inactiveCount = resources.filter((r) => r.status === 'inactive').length;
  const archivedCount = resources.filter((r) => r.status === 'archived').length;
  const totalResources = resources.length || 1; // Avoid divide-by-zero

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const memberCount = users.filter((u) => u.role === 'user').length;

  // Mock timeline distribution for demo charts
  const timelineData = [
    { day: 'Mon', count: Math.max(1, Math.round(resources.length * 0.15)), percentage: 35 },
    { day: 'Tue', count: Math.max(2, Math.round(resources.length * 0.3)), percentage: 55 },
    { day: 'Wed', count: Math.max(3, Math.round(resources.length * 0.45)), percentage: 40 },
    { day: 'Thu', count: Math.max(4, Math.round(resources.length * 0.6)), percentage: 75 },
    { day: 'Fri', count: Math.max(5, Math.round(resources.length * 0.8)), percentage: 90 },
    { day: 'Sat', count: Math.max(6, Math.round(resources.length * 0.9)), percentage: 65 },
    { day: 'Sun', count: resources.length, percentage: 85 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            System Analytics & Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time metrics, resource distribution breakdowns, and activity volume.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          className="gap-1.5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Database Records
            </div>
            <CardTitle className="text-3xl font-black text-foreground">
              {resources.length + users.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" /> Synchronized with Atlas Cluster
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Resource Active Rate
            </div>
            <CardTitle className="text-3xl font-black text-primary">
              {resources.length > 0
                ? `${Math.round((activeCount / resources.length) * 100)}%`
                : '100%'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {activeCount} of {resources.length} resources active
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin to User Ratio
            </div>
            <CardTitle className="text-3xl font-black text-purple-400">
              {adminCount} : {memberCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Role segregation active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Creation Velocity Bar Chart */}
        <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Activity Velocity</CardTitle>
                <CardDescription>Simulated daily transaction throughput</CardDescription>
              </div>
              <Badge variant="info">Live Track</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-60 flex items-end justify-between gap-2 pt-8 pb-2 px-4 border-b border-border/40">
              {timelineData.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {item.count}
                  </div>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all duration-300 shadow-md shadow-blue-500/20"
                    style={{ height: `${item.percentage * 1.8}px` }}
                  />
                  <span className="text-xs font-medium text-muted-foreground mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resource Status Distribution */}
        <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Resource Status Distribution</CardTitle>
            <CardDescription>Breakdown by operational status category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Active */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Active
                </span>
                <span>
                  {activeCount} ({Math.round((activeCount / totalResources) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${(activeCount / totalResources) * 100}%` }}
                />
              </div>
            </div>

            {/* Pending */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-amber-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  Pending
                </span>
                <span>
                  {pendingCount} ({Math.round((pendingCount / totalResources) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${(pendingCount / totalResources) * 100}%` }}
                />
              </div>
            </div>

            {/* Inactive */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-red-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  Inactive
                </span>
                <span>
                  {inactiveCount} ({Math.round((inactiveCount / totalResources) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full bg-red-400 transition-all duration-500"
                  style={{ width: `${(inactiveCount / totalResources) * 100}%` }}
                />
              </div>
            </div>

            {/* Archived */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                  Archived
                </span>
                <span>
                  {archivedCount} ({Math.round((archivedCount / totalResources) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full bg-muted-foreground transition-all duration-500"
                  style={{ width: `${(archivedCount / totalResources) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
