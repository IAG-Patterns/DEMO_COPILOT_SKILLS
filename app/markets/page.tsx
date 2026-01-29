'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CryptoData, fetchCryptoData } from '@/lib/api';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

function SparklineChart({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const chartData = data.slice(-24).map((price, index) => ({ value: price, index }));
  
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(6)}`;
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

export default function MarketsPage() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchCryptoData();
      setCryptos(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to fetch market data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  const totalMarketCap = cryptos.reduce((sum, c) => sum + c.market_cap, 0);
  const gainers = cryptos.filter(c => c.price_change_percentage_24h > 0).length;
  const losers = cryptos.filter(c => c.price_change_percentage_24h < 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            Cryptocurrency Markets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time prices from CoinGecko
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatMarketCap(totalMarketCap)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Market Cap</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{cryptos.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Coins Tracked</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{gainers}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gainers (24h)</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-red-600">{losers}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Losers (24h)</p>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Crypto Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Cryptocurrencies by Market Cap
          </h2>
          {lastUpdate && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>

        {loading && cryptos.length === 0 ? (
          <div className="py-12">
            <LoadingSpinner size="lg" />
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
              Loading market data...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">#</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Coin</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">24h Change</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Volume</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell w-32">7d Chart</th>
                </tr>
              </thead>
              <tbody>
                {cryptos.map((crypto, index) => {
                  const isPositive = crypto.price_change_percentage_24h >= 0;
                  return (
                    <tr
                      key={crypto.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{crypto.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">{crypto.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                        {formatPrice(crypto.current_price)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {formatMarketCap(crypto.market_cap)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400 hidden md:table-cell">
                        {formatMarketCap(crypto.total_volume)}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        {crypto.sparkline_in_7d?.price && (
                          <SparklineChart
                            data={crypto.sparkline_in_7d.price}
                            isPositive={isPositive}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
