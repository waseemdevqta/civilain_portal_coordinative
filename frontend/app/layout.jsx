import '@/app/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'AWAZ — Your Voice. Your City. Your Change.',
  description:
    'A transparent municipal complaint and civic accountability platform connecting citizens directly with local authorities. Report neighborhood infrastructure issues, rally community support, and track verified resolutions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-slate-900 selection:text-white"
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
