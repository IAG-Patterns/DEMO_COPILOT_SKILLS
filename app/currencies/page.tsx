'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, RefreshCw, ArrowRightLeft, AlertCircle } from 'lucide-react';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ExchangeRates, fetchExchangeRates } from '@/lib/api';

const popularCurrencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
];

export default function CurrenciesPage() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [amount, setAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadRates = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchExchangeRates(baseCurrency);
      setRates(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to fetch exchange rates.');
    } finally {
      setLoading(false);
    }
  }, [baseCurrency]);

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadRates]);

  const convertedAmount = rates
    ? (amount / (rates.rates[fromCurrency] || 1)) * (rates.rates[toCurrency] || 1)
    : 0;

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-purple-600" />
            Currency Exchange
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time exchange rates from ExchangeRate API
          </p>
        </div>
        <button
          onClick={loadRates}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Currency Converter */}
      <Card className="max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Currency Converter
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {popularCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={swapCurrencies}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mt-6 md:mt-0"
            >
              <ArrowRightLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1 w-full">
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {popularCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {amount.toLocaleString()} {fromCurrency} =
            </p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
            </p>
            {rates && (
              <p className="text-xs text-gray-400 mt-2">
                1 {fromCurrency} = {((rates.rates[toCurrency] || 1) / (rates.rates[fromCurrency] || 1)).toFixed(4)} {toCurrency}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Base Currency Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-600 dark:text-gray-400">Base Currency:</label>
        <select
          value={baseCurrency}
          onChange={(e) => {
            setBaseCurrency(e.target.value);
            setLoading(true);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {popularCurrencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
        {lastUpdate && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Exchange Rates Grid */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Exchange Rates (Base: {baseCurrency})
        </h2>

        {loading && !rates ? (
          <div className="py-12">
            <LoadingSpinner size="lg" />
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
              Loading exchange rates...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularCurrencies
              .filter((c) => c.code !== baseCurrency)
              .map((currency) => {
                const rate = rates?.rates[currency.code] || 0;
                return (
                  <div
                    key={currency.code}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{currency.code}</span>
                      <span className="text-lg">{currency.symbol}</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {rate.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{currency.name}</p>
                  </div>
                );
              })}
          </div>
        )}
      </Card>
    </div>
  );
}
