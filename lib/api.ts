// API utilities for fetching real-time data

export interface Flight {
  icao24: string;
  callsign: string;
  origin_country: string;
  longitude: number | null;
  latitude: number | null;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
  on_ground: boolean;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export interface ExchangeRates {
  base: string;
  rates: { [key: string]: number };
  time_last_updated: number;
}

export interface WeatherData {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
}

// OpenSky Network API - Live flight data
export async function fetchFlights(bounds?: { lamin: number; lamax: number; lomin: number; lomax: number }): Promise<Flight[]> {
  try {
    // Default bounds: Europe area for demo
    const params = bounds 
      ? `?lamin=${bounds.lamin}&lomin=${bounds.lomin}&lamax=${bounds.lamax}&lomax=${bounds.lomax}`
      : '?lamin=35&lomin=-10&lamax=55&lomax=25'; // Europe
    
    const res = await fetch(`https://opensky-network.org/api/states/all${params}`, {
      next: { revalidate: 10 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch flights');
    }
    
    const data = await res.json();
    
    if (!data.states) return [];
    
    return data.states.slice(0, 50).map((state: any[]) => ({
      icao24: state[0],
      callsign: state[1]?.trim() || 'N/A',
      origin_country: state[2],
      longitude: state[5],
      latitude: state[6],
      altitude: state[7] ? Math.round(state[7]) : null,
      velocity: state[9] ? Math.round(state[9] * 3.6) : null, // Convert m/s to km/h
      heading: state[10] ? Math.round(state[10]) : null,
      on_ground: state[8],
    }));
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw error;
  }
}

// CoinGecko API - Cryptocurrency data
export async function fetchCryptoData(): Promise<CryptoData[]> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true',
      { next: { revalidate: 30 } }
    );
    
    if (!res.ok) throw new Error('Failed to fetch crypto data');
    
    return res.json();
  } catch (error) {
    console.error('Error fetching crypto:', error);
    return [];
  }
}

// Exchange Rate API - Currency rates
export async function fetchExchangeRates(base: string = 'USD'): Promise<ExchangeRates | null> {
  try {
    const res = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${base}`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) throw new Error('Failed to fetch exchange rates');
    
    return res.json();
  } catch (error) {
    console.error('Error fetching rates:', error);
    return null;
  }
}

// Open-Meteo API - Weather data
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
      { next: { revalidate: 300 } }
    );
    
    if (!res.ok) throw new Error('Failed to fetch weather');
    
    const data = await res.json();
    return data.current_weather;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

// Weather code descriptions
export function getWeatherDescription(code: number): string {
  const codes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  };
  return codes[code] || 'Unknown';
}
