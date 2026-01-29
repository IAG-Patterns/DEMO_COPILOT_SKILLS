import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AviaBiz Dashboard - Aviation & Business Intelligence',
  description: 'Real-time aviation and business data dashboard with flight tracking, crypto markets, currency exchange, and weather information.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <Navbar />
        <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
