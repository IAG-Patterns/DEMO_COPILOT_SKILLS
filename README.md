# AviaBiz Dashboard

A modern, real-time aviation and business intelligence dashboard built with Next.js 14.

## Features

- **Flight Tracker**: Live aircraft positions from OpenSky Network API
- **Crypto Markets**: Real-time cryptocurrency prices from CoinGecko
- **Currency Exchange**: Live exchange rates with converter tool
- **Aviation Weather**: Weather conditions at major airports worldwide
- **World Clocks**: Multiple timezone displays for global operations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR for real-time updates
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Data Sources

| API | Purpose | Update Interval |
|-----|---------|-----------------|
| [OpenSky Network](https://opensky-network.org/) | Live flight tracking | 15 seconds |
| [CoinGecko](https://www.coingecko.com/) | Cryptocurrency prices | 30 seconds |
| [ExchangeRate API](https://www.exchangerate-api.com/) | Currency rates | 60 seconds |
| [Open-Meteo](https://open-meteo.com/) | Weather data | 5 minutes |

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Dashboard home
│   ├── flights/page.tsx    # Flight tracker
│   ├── markets/page.tsx    # Crypto markets
│   ├── currencies/page.tsx # Currency exchange
│   └── weather/page.tsx    # Aviation weather
├── components/
│   ├── Navbar.tsx          # Navigation sidebar
│   ├── Card.tsx            # Reusable card components
│   └── LoadingSpinner.tsx  # Loading states
├── lib/
│   └── api.ts              # API utilities
└── public/                 # Static assets
```

## License

MIT
