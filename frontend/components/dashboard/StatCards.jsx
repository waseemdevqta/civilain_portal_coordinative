import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, FolderKanban, CheckCircle2, Activity } from 'lucide-react';

export function DashboardStatCards({ totalUsers, totalResources, activeResources, loading }) {
  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      description: 'Registered accounts',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400',
    },
    {
      title: 'Total Resources',
      value: totalResources,
      icon: FolderKanban,
      description: 'Generic items in MongoDB',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400',
    },
    {
      title: 'Active Resources',
      value: activeResources,
      icon: CheckCircle2,
      description: 'Operational status',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    },
    {
      title: 'System Health',
      value: '99.9%',
      icon: Activity,
      description: 'REST API latency ~40ms',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className="border-border/80 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {loading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-muted/60" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
