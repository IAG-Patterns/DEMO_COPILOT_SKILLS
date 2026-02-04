'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Plane, 
  TrendingUp, 
  DollarSign, 
  Cloud,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import NotificationCenter from './NotificationCenter';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/flights', label: 'Flights', icon: Plane },
  { href: '/markets', label: 'Markets', icon: TrendingUp },
  { href: '/currencies', label: 'Currencies', icon: DollarSign },
  { href: '/weather', label: 'Weather', icon: Cloud },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex-col z-50">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Plane className="w-6 h-6 text-blue-400" />
              AviaBiz Dashboard
            </h1>
            <NotificationCenter />
          </div>
        </div>
        
        <div className="flex-1 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-6 py-3 transition-colors',
                  isActive 
                    ? 'bg-blue-600 text-white border-r-4 border-blue-400' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t border-gray-700 text-xs text-gray-400">
          <p>Real-time data from:</p>
          <ul className="mt-2 space-y-1">
            <li>• OpenSky Network</li>
            <li>• CoinGecko</li>
            <li>• Open-Meteo</li>
          </ul>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white flex items-center justify-between px-4 z-50">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Plane className="w-5 h-5 text-blue-400" />
          AviaBiz
        </h1>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-gray-900 z-40">
          <nav className="py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-6 py-4 transition-colors',
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
