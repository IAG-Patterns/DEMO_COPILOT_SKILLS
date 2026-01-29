'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plane, TrendingUp, DollarSign, Cloud, Clock, Activity, Globe } from 'lucide-react';
import { StatCard } from '@/components/Card';

const timezones = [
  { name: 'New York', zone: 'America/New_York', code: 'EST' },
  { name: 'London', zone: 'Europe/London', code: 'GMT' },
  { name: 'Tokyo', zone: 'Asia/Tokyo', code: 'JST' },
  { name: 'Dubai', zone: 'Asia/Dubai', code: 'GST' },
  { name: 'Sydney', zone: 'Australia/Sydney', code: 'AEDT' },
];

function WorldClock() {
  const [times, setTimes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: { [key: string]: string } = {};
      timezones.forEach((tz) => {
        newTimes[tz.zone] = new Date().toLocaleTimeString('en-US', {
          timeZone: tz.zone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">World Clocks</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {timezones.map((tz) => (
          <div key={tz.zone} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">{tz.name}</p>
            <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
              {times[tz.zone] || '--:--:--'}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">{tz.code}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const quickLinks = [
  { href: '/flights', label: 'Flight Tracker', icon: Plane, description: 'Live aircraft positions', color: 'bg-blue-500' },
  { href: '/markets', label: 'Crypto Markets', icon: TrendingUp, description: 'Real-time prices', color: 'bg-green-500' },
  { href: '/currencies', label: 'Exchange Rates', icon: DollarSign, description: 'Currency converter', color: 'bg-purple-500' },
  { href: '/weather', label: 'Aviation Weather', icon: Cloud, description: 'Airport conditions', color: 'bg-orange-500' },
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Aviation & Business Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time data at your fingertips
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Activity className="w-4 h-4 text-green-500" />
          <span>All systems operational</span>
        </div>
      </div>

      {/* World Clocks */}
      {mounted && <WorldClock />}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Flights"
          value="~50,000+"
          icon={<Plane className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Cryptocurrencies"
          value="20 tracked"
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Currency Pairs"
          value="150+"
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Weather Stations"
          value="10 airports"
          icon={<Cloud className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{link.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Data Sources</h2>
        <p className="text-blue-100 mb-4">
          This dashboard aggregates real-time data from multiple free public APIs:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-semibold">OpenSky Network</p>
            <p className="text-blue-200">Flight tracking</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-semibold">CoinGecko</p>
            <p className="text-blue-200">Crypto prices</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-semibold">ExchangeRate API</p>
            <p className="text-blue-200">Currency rates</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-semibold">Open-Meteo</p>
            <p className="text-blue-200">Weather data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
