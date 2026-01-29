'use client';

import { useEffect, useState, useCallback } from 'react';
import { Cloud, RefreshCw, Wind, Thermometer, AlertCircle, Plane } from 'lucide-react';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { WeatherData, fetchWeather, getWeatherDescription } from '@/lib/api';

interface Airport {
  code: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
}

const airports: Airport[] = [
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', lat: 40.6413, lon: -73.7781 },
  { code: 'LHR', name: 'Heathrow', city: 'London', lat: 51.47, lon: -0.4543 },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', lat: 49.0097, lon: 2.5479 },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', lat: 25.2532, lon: 55.3657 },
  { code: 'HND', name: 'Haneda', city: 'Tokyo', lat: 35.5494, lon: 139.7798 },
  { code: 'SIN', name: 'Changi', city: 'Singapore', lat: 1.3644, lon: 103.9915 },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', lat: 33.9425, lon: -118.4081 },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', lat: 50.0379, lon: 8.5622 },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', lat: 52.3105, lon: 4.7683 },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', lat: 22.308, lon: 113.9185 },
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', lat: -33.9399, lon: 151.1753 },
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', lat: 43.6777, lon: -79.6248 },
  { code: 'GRU', name: 'Guarulhos', city: 'São Paulo', lat: -23.4356, lon: -46.4731 },
  { code: 'ICN', name: 'Incheon', city: 'Seoul', lat: 37.4602, lon: 126.4407 },
  { code: 'MAD', name: 'Barajas', city: 'Madrid', lat: 40.4983, lon: -3.5676 },
  { code: 'BCN', name: 'El Prat', city: 'Barcelona', lat: 41.2974, lon: 2.0833 },
  { code: 'MEX', name: 'Benito Juárez', city: 'Mexico City', lat: 19.4361, lon: -99.0719 },
  { code: 'JNB', name: 'O. R. Tambo', city: 'Johannesburg', lat: -26.1337, lon: 28.2420 },
  { code: 'SVO', name: 'Sheremetyevo', city: 'Moscow', lat: 55.9726, lon: 37.4146 },
  { code: 'DME', name: 'Domodedovo', city: 'Moscow', lat: 55.4088, lon: 37.9063 },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', lat: 41.2753, lon: 28.7519 },
  { code: 'ATL', name: 'Hartsfield–Jackson', city: 'Atlanta', lat: 33.6407, lon: -84.4277 },
  { code: 'ORD', name: 'O’Hare', city: 'Chicago', lat: 41.9742, lon: -87.9073 },
  { code: 'DFW', name: 'Dallas/Fort Worth', city: 'Dallas', lat: 32.8998, lon: -97.0403 },
  { code: 'DEN', name: 'Denver International', city: 'Denver', lat: 39.8561, lon: -104.6737 },
  { code: 'SFO', name: 'San Francisco', city: 'San Francisco', lat: 37.6213, lon: -122.3790 },
  { code: 'SEA', name: 'Seattle-Tacoma', city: 'Seattle', lat: 47.4502, lon: -122.3088 },
  { code: 'MIA', name: 'Miami International', city: 'Miami', lat: 25.7959, lon: -80.2870 },
  { code: 'BOM', name: 'Chhatrapati Shivaji', city: 'Mumbai', lat: 19.0896, lon: 72.8656 },
  { code: 'DEL', name: 'Indira Gandhi', city: 'Delhi', lat: 28.5562, lon: 77.1000 },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', lat: 13.6900, lon: 100.7501 },
  { code: 'KUL', name: 'Kuala Lumpur', city: 'Kuala Lumpur', lat: 2.7456, lon: 101.7090 },
  { code: 'ZRH', name: 'Zurich', city: 'Zurich', lat: 47.4647, lon: 8.5492 },
  { code: 'VIE', name: 'Vienna', city: 'Vienna', lat: 48.1103, lon: 16.5697 },
  { code: 'BRU', name: 'Brussels', city: 'Brussels', lat: 50.9014, lon: 4.4844 },
  { code: 'OSL', name: 'Gardermoen', city: 'Oslo', lat: 60.1939, lon: 11.1004 },
  { code: 'ARN', name: 'Arlanda', city: 'Stockholm', lat: 59.6519, lon: 17.9186 },
  { code: 'HEL', name: 'Helsinki', city: 'Helsinki', lat: 60.3172, lon: 24.9633 },
  { code: 'CPH', name: 'Copenhagen', city: 'Copenhagen', lat: 55.6181, lon: 12.6560 },
  { code: 'DUB', name: 'Dublin', city: 'Dublin', lat: 53.4273, lon: -6.2436 },
  { code: 'LIS', name: 'Lisbon', city: 'Lisbon', lat: 38.7742, lon: -9.1342 },
  { code: 'PRG', name: 'Vaclav Havel', city: 'Prague', lat: 50.1062, lon: 14.2669 },
  { code: 'WAW', name: 'Chopin', city: 'Warsaw', lat: 52.1657, lon: 20.9671 },
  { code: 'ATH', name: 'Eleftherios Venizelos', city: 'Athens', lat: 37.9364, lon: 23.9475 },
  { code: 'SCL', name: 'Arturo Merino Benítez', city: 'Santiago', lat: -33.3929, lon: -70.7858 },
  { code: 'EZE', name: 'Ministro Pistarini', city: 'Buenos Aires', lat: -34.8222, lon: -58.5358 },
  { code: 'GIG', name: 'Galeão', city: 'Rio de Janeiro', lat: -22.8099, lon: -43.2506 },
  { code: 'LIM', name: 'Jorge Chávez', city: 'Lima', lat: -12.0219, lon: -77.1143 },
  { code: 'BOG', name: 'El Dorado', city: 'Bogotá', lat: 4.7016, lon: -74.1469 },
  { code: 'SJU', name: 'Luis Muñoz Marín', city: 'San Juan', lat: 18.4394, lon: -66.0018 },
  { code: 'CPT', name: 'Cape Town', city: 'Cape Town', lat: -33.9706, lon: 18.6021 },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', lat: 25.2731, lon: 51.6081 },
];

interface AirportWeather {
  airport: Airport;
  weather: WeatherData | null;
  loading: boolean;
  error: boolean;
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌧️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}

function getFlightCondition(weather: WeatherData): { status: string; color: string } {
  const { weathercode, windspeed } = weather;
  
  if (weathercode >= 95 || windspeed > 50) {
    return { status: 'Hazardous', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
  }
  if (weathercode >= 61 || weathercode === 45 || weathercode === 48 || windspeed > 35) {
    return { status: 'Marginal', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
  }
  return { status: 'Good VFR', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
}

export default function WeatherPage() {
  const [airportWeather, setAirportWeather] = useState<AirportWeather[]>(
    airports.map((airport) => ({
      airport,
      weather: null,
      loading: true,
      error: false,
    }))
  );
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [search, setSearch] = useState('');

  const loadWeather = useCallback(async () => {
    setAirportWeather((prev) =>
      prev.map((aw) => ({ ...aw, loading: true, error: false }))
    );

    const results = await Promise.all(
      airports.map(async (airport) => {
        try {
          const weather = await fetchWeather(airport.lat, airport.lon);
          return { airport, weather, loading: false, error: !weather };
        } catch {
          return { airport, weather: null, loading: false, error: true };
        }
      })
    );

    setAirportWeather(results);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    loadWeather();
    const interval = setInterval(loadWeather, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [loadWeather]);

  const goodConditions = airportWeather.filter(
    (aw) => aw.weather && getFlightCondition(aw.weather).status === 'Good VFR'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Cloud className="w-8 h-8 text-orange-600" />
            Aviation Weather
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time weather conditions at major airports
          </p>
        </div>
        <button
          onClick={loadWeather}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search Box */}
      <div className="mb-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search airport code, city, or name..."
          className="w-full md:w-96 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{airports.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Airports</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">{goodConditions}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Good VFR</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {airportWeather.filter(
              (aw) => aw.weather && getFlightCondition(aw.weather).status === 'Marginal'
            ).length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Marginal</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-red-600">
            {airportWeather.filter(
              (aw) => aw.weather && getFlightCondition(aw.weather).status === 'Hazardous'
            ).length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hazardous</p>
        </Card>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}

      {/* Weather Grid - scrollable for responsiveness */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-2">
        {airportWeather
          .filter(({ airport }) => {
            if (!search.trim()) return true;
            const s = search.trim().toLowerCase();
            return (
              airport.code.toLowerCase().startsWith(s) ||
              airport.city.toLowerCase().startsWith(s) ||
              airport.name.toLowerCase().startsWith(s)
            );
          })
          .map(({ airport, weather, loading, error }) => {
            let cardContent;
            if (loading) {
              cardContent = (
                <div className="py-8">
                  <LoadingSpinner />
                </div>
              );
            } else if (error) {
              cardContent = (
                <div className="py-8 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load</p>
                </div>
              );
            } else if (weather) {
              cardContent = (
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-xl text-gray-900 dark:text-white">
                          {airport.code}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{airport.city}</p>
                      <p className="text-xs text-gray-400">{airport.name}</p>
                    </div>
                    <span className="text-4xl">{getWeatherIcon(weather.weathercode)}</span>
                  </div>

                  {/* Weather Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Thermometer className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {weather.temperature}°C
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Temperature</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Wind className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {weather.windspeed} km/h
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Wind from {weather.winddirection}°
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getWeatherDescription(weather.weathercode)}
                    </p>
                  </div>

                  {/* Flight Condition Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        getFlightCondition(weather).color
                      }`}
                    >
                      {getFlightCondition(weather).status}
                    </span>
                  </div>
                </>
              );
            } else {
              cardContent = null;
            }
            return (
              <Card key={airport.code} className="relative">
                {cardContent}
              </Card>
            );
          })}
      </div>

      {/* Legend */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Flight Conditions Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Good VFR - Clear conditions, low winds</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Marginal - Fog, rain, or moderate winds</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Hazardous - Thunderstorms or high winds</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
