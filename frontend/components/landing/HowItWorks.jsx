import React from 'react';
import { ArrowRight, Code, Play, RefreshCw, Send, Check } from 'lucide-react';

export function LandingHowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Clone & Install',
      description: 'Clone the repository, install dependencies in frontend and backend with npm install, and start dev servers.',
      code: 'npm run dev',
    },
    {
      number: '02',
      title: 'Define Your Schema',
      description: 'Update the generic Resource model in backend/models/Resource.js to match your hackathon problem statement.',
      code: 'const ProjectSchema = new Schema(...)',
    },
    {
      number: '03',
      title: 'Customize the Dashboard',
      description: 'Replace column headers and form inputs using pre-wired shadcn/ui components and lib/api.js services.',
      code: 'await resourceApi.create(data)',
    },
    {
      number: '04',
      title: 'Present & Win',
      description: 'Demo a blazing fast full-stack application with real JWT authentication, responsive mobile layout, and live MongoDB records.',
      code: '🏆 University Ready',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/20 border-y border-border/60 relative">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest">
            Streamlined Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            How It Works in 4 Simple Steps
          </h2>
          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
            From the opening ceremony to final judging, customize this foundation in record time.
          </p>
        </div>

        {/* Workflow Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="text-3xl font-mono font-black text-primary/40 group-hover:text-primary transition-colors">
                {step.number}
              </div>
              <h3 className="text-lg font-bold text-foreground mt-4">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-grow">
                {step.description}
              </p>
              <div className="mt-5 rounded-lg bg-background/80 p-2.5 font-mono text-xs text-primary border border-border/40 flex items-center justify-between">
                <span>{step.code}</span>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Section */}
        <div id="architecture" className="mt-20 rounded-2xl border border-border/80 bg-card/70 p-6 md:p-10 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                Strict Separation of Concerns
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                Clean Decoupled Architecture
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Next.js App Router serves the client application on port 3000 and communicates with the Express.js server on port 5000 strictly via HTTP REST. No server actions or embedded backend mixing — pure university standard compliance.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span><strong>Frontend:</strong> Next.js (App Router, JS, Tailwind, shadcn)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Backend:</strong> Express.js, JWT, bcryptjs, Morgan</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span><strong>Database:</strong> MongoDB Atlas & Local Mongoose ODM</span>
                </li>
              </ul>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="w-full lg:w-auto flex-1 max-w-md rounded-xl bg-background/90 p-5 border border-border/80 font-mono text-xs text-muted-foreground shadow-xl">
              <div className="flex items-center justify-between text-foreground font-semibold border-b border-border/60 pb-3 mb-4">
                <span>Architecture Diagram</span>
                <span className="text-[11px] text-emerald-400">REST API</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center justify-between">
                  <span>🖥️ Next.js Frontend (Port 3000)</span>
                  <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded">Client UI</span>
                </div>
                <div className="text-center text-muted-foreground text-xs">
                  ↓ HTTP REST Requests (Authorization: Bearer &lt;token&gt;)
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                  <span>⚙️ Express.js Backend (Port 5000)</span>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">REST API</span>
                </div>
                <div className="text-center text-muted-foreground text-xs">
                  ↓ Mongoose Driver Connection
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-between">
                  <span>🍃 MongoDB Database (Atlas/Local)</span>
                  <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded">Collections</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
