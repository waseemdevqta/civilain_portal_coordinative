import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  KeyRound,
  Layers,
  Server,
  Zap,
  Layout,
  Cpu,
  Lock,
  ArrowUpRight,
  Database,
} from 'lucide-react';

export function LandingFeatures() {
  const features = [
    {
      icon: KeyRound,
      title: 'JWT Authentication & Roles',
      description:
        'Complete registration, password hashing with bcrypt, token generation, protected routes, and role-based permissions (user / admin).',
      tag: 'Auth Ready',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400',
    },
    {
      icon: Layers,
      title: 'Generic Resource CRUD',
      description:
        'A plug-and-play generic Resource controller and model designed to instantly adapt into Projects, Bookings, Clients, or any hackathon idea.',
      tag: 'Modular',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400',
    },
    {
      icon: Server,
      title: 'Decoupled Express.js REST API',
      description:
        'Standardized { success, message, data } API response structure, centralized error handling, CORS headers, and Morgan dev logging.',
      tag: 'Backend',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    },
    {
      icon: Layout,
      title: 'Next.js App Router (JS)',
      description:
        'Fast client-side routing, protected dashboard layout, responsive sidebar with mobile sheet drawers, and zero TypeScript friction for fast hackathons.',
      tag: 'Frontend',
      color: 'from-sky-500/20 to-cyan-500/20 text-sky-400',
    },
    {
      icon: Cpu,
      title: 'shadcn/ui Inspired Design',
      description:
        'Prebuilt modals, dropdowns, tables, stat cards, alerts, form inputs, and sleek dark mode styling with Tailwind CSS tokens.',
      tag: 'UI Library',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400',
    },
    {
      icon: Database,
      title: 'MongoDB & Mongoose ODM',
      description:
        'Pre-configured database connections supporting both MongoDB Atlas cloud clusters and local instances with robust connection pooling.',
      tag: 'Database',
      color: 'from-indigo-500/20 to-violet-500/20 text-indigo-400',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest">
            Production Features
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Everything You Need to Win
          </h2>
          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
            Engineered specifically to satisfy strict university hackathon requirements without extra bloat or vendor lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="border border-border/80 bg-card/60 hover:bg-card/90 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl hover:shadow-primary/5 group"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} border border-white/5 transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/50">
                      {feature.tag}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
