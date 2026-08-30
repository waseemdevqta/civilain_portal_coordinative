import '@/app/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'CivicFix — Citizen Complaint Portal',
  description: 'A transparent municipal complaint platform connecting citizens with local authorities. Report, track, and resolve neighborhood civic issues.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8f9ff] font-sans text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
