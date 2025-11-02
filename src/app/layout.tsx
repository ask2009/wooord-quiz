import type {Metadata} from 'next';
import './globals.css';
import { LinguaLiftProvider } from '@/contexts/LinguaLiftContext';
import { Toaster } from "@/components/ui/toaster";
import { AppContent } from '@/components/layout/AppContent';


export const metadata: Metadata = {
  title: 'LinguaLift',
  description: 'Master new languages with AI-powered quizzes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LinguaLiftProvider>
            <AppContent>
                {children}
            </AppContent>
        </LinguaLiftProvider>
        <Toaster />
      </body>
    </html>
  );
}
