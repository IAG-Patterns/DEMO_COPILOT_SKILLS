'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plane, RefreshCw, Globe, AlertCircle } from 'lucide-react';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Flight, fetchFlights } from '@/lib/api';

const regions = [
  { name: 'Europe', bounds: { lamin: 35, lomin: -10, lamax: 55, lomax: 25 } },
  { name: 'North America', bounds: { lamin: 25, lomin: -130, lamax: 50, lomax: -60 } },
  { name: 'South America', bounds: { lamin: -60, lomin: -90, lamax: 15, lomax: -30 } },
  { name: 'Africa', bounds: { lamin: -35, lomin: -20, lamax: 38, lomax: 55 } },
  { name: 'Asia', bounds: { lamin: 10, lomin: 60, lamax: 50, lomax: 150 } },
  { name: 'Middle East', bounds: { lamin: 12, lomin: 30, lamax: 42, lomax: 65 } },
];

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadFlights = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchFlights(selectedRegion.bounds);
      setFlights(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch flight data. The API may be rate-limited.');
      setLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  // Ensure error message is always rendered if error is set
  useEffect(() => {
    if (error) setLoading(false);
  }, [error]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadFlights, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, loadFlights]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Plane className="w-8 h-8 text-blue-600" />
            Live Flight Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time aircraft positions from OpenSky Network
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          <button
            onClick={loadFlights}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Region Selector */}
      <div className="flex flex-wrap gap-2">
        {regions.map((region) => (
          <button
            key={region.name}
            onClick={() => {
              setSelectedRegion(region);
              setLoading(true);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRegion.name === region.name
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            {region.name}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{flights.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Flights</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">
            {flights.filter(f => !f.on_ground).length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">In Air</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-orange-600">
            {flights.filter(f => f.on_ground).length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">On Ground</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600">
            {new Set(flights.map(f => f.origin_country)).size}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Countries</p>
        </Card>
      </div>

      {/* Error Message */}
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Flight List - {selectedRegion.name}
            </h2>
            {lastUpdate && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>

          {loading && flights.length === 0 ? (
            <div className="py-12">
              <LoadingSpinner size="lg" />
              <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
                Loading flight data...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Callsign</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Country</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Altitude</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Speed</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Heading</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map((flight) => (
                    <tr
                      key={flight.icao24}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-gray-900 dark:text-white">
                          {flight.callsign}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {flight.origin_country}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {flight.altitude ? `${flight.altitude.toLocaleString()} m` : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {flight.velocity ? `${flight.velocity} km/h` : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {flight.heading ? `${flight.heading}°` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            flight.on_ground
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {flight.on_ground ? 'Ground' : 'Airborne'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
