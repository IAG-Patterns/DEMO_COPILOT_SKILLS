---
name: webapp-testing
description: Skill for testing and debugging the AviaBiz Next.js dashboard application. Use this when asked to test, debug, or verify the aviation and business dashboard web application.
license: MIT
---

# AviaBiz Dashboard Testing Skill

This skill provides instructions for testing and debugging the AviaBiz Next.js dashboard application.

## Application Overview

The AviaBiz Dashboard is a Next.js 14 application with the following features:
- **Flight Tracker** (`/flights`) - Real-time flight data from OpenSky Network API
- **Crypto Markets** (`/markets`) - Cryptocurrency prices from CoinGecko API
- **Currency Exchange** (`/currencies`) - Exchange rates from ExchangeRate API
- **Aviation Weather** (`/weather`) - Weather data from Open-Meteo API

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SWR for data fetching
- Recharts for charts
- Lucide React for icons

## Testing Procedures

### 1. Starting the Application

```bash
cd c:\cod\demo_copilot_skills
npm install
npm run dev
```

The application runs at `http://localhost:3000`

### 2. Verifying Each Page

#### Dashboard Home (`/`)
- [ ] World clocks display and update every second
- [ ] Quick stats cards render correctly
- [ ] Navigation links work
- [ ] Responsive layout on mobile/desktop

#### Flight Tracker (`/flights`)
- [ ] Flight data loads from OpenSky Network API
- [ ] Region selector buttons work (Europe, North America, Asia, Middle East)
- [ ] Auto-refresh toggle functions
- [ ] Manual refresh button works
- [ ] Flight table displays callsign, country, altitude, speed, heading, status
- [ ] Error handling when API is unavailable

#### Markets (`/markets`)
- [ ] Crypto data loads from CoinGecko API
- [ ] Top 20 cryptocurrencies display
- [ ] Price, 24h change, market cap columns render
- [ ] Sparkline charts show 7-day price history
- [ ] Auto-refresh every 30 seconds

#### Currencies (`/currencies`)
- [ ] Exchange rates load from ExchangeRate API
- [ ] Currency converter calculates correctly
- [ ] Swap currencies button works
- [ ] Exchange rates grid displays all currencies
- [ ] Base currency selector changes rates

#### Aviation Weather (`/weather`)
- [ ] Weather loads for all 10 airports
- [ ] Temperature, wind speed, conditions display
- [ ] Flight condition badges (Good VFR, Marginal, Hazardous) show correctly
- [ ] Weather icons match conditions

### 3. API Endpoints to Verify

| API | Endpoint | Expected Behavior |
|-----|----------|-------------------|
| OpenSky | `https://opensky-network.org/api/states/all` | Returns flight states array |
| CoinGecko | `https://api.coingecko.com/api/v3/coins/markets` | Returns crypto data |
| ExchangeRate | `https://api.exchangerate-api.com/v4/latest/USD` | Returns rates object |
| Open-Meteo | `https://api.open-meteo.com/v1/forecast` | Returns weather data |

### 4. Common Issues and Debugging

#### API Rate Limiting
- OpenSky Network may rate limit requests
- CoinGecko has a free tier limit
- Solution: Reduce refresh intervals or add API keys

#### Build Errors
```bash
npm run build
```
Check for TypeScript errors or missing dependencies.

#### Lint Errors
```bash
npm run lint
```

### 5. Browser DevTools Checks

- Open Network tab to verify API calls
- Check Console for JavaScript errors
- Verify responsive design with device toolbar
- Test dark mode if implemented

### 6. File Structure Reference

```
app/
├── layout.tsx          # Root layout with Navbar
├── page.tsx            # Dashboard home
├── flights/page.tsx    # Flight tracker
├── markets/page.tsx    # Crypto markets
├── currencies/page.tsx # Currency exchange
└── weather/page.tsx    # Aviation weather

components/
├── Navbar.tsx          # Navigation sidebar
├── Card.tsx            # Card components
└── LoadingSpinner.tsx  # Loading states

lib/
└── api.ts              # API fetching utilities
```

### 7. Testing Commands Summary

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check without emitting
npx tsc --noEmit

# Clear Next.js cache (PowerShell)
Remove-Item -Recurse -Force .next
```

## Fix Patterns & Solutions

### API Error Handling Pattern
When API calls fail, implement this pattern in `lib/api.ts`:

```typescript
export async function fetchWithFallback<T>(
  url: string, 
  fallback: T,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      next: { revalidate: 30 }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    console.error(`API Error for ${url}:`, error);
    return fallback;
  }
}
```

### Hydration Fix Pattern
For components with dynamic content (timestamps, random values):

```typescript
'use client';
import { useEffect, useState } from 'react';

function DynamicComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return <Skeleton />;
  return <ActualContent />;
}
```

### Loading State Pattern
Always show loading states for async data:

```typescript
if (loading) {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}
```

### Error Boundary Pattern
Wrap pages in error boundaries:

```typescript
'use client';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 bg-red-50 rounded-lg">
      <p className="text-red-600">Something went wrong</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}
```

### Responsive Design Fixes
Common Tailwind responsive patterns:

```tsx
// Mobile-first responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
```

## Smart Gradual Testing (Default Approach)

### Step-by-Step Availability Testing

**1. Check server is UP:**
```bash
# PowerShell - check if server responds
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Server UP - Status: $($response.StatusCode)"
} catch {
    Write-Host "✗ Server DOWN - $($_.Exception.Message)"
}
```

**2. Check all pages are available:**
```powershell
$pages = @(
    @{path="/"; name="Dashboard"},
    @{path="/flights"; name="Flights"},
    @{path="/markets"; name="Markets"},
    @{path="/currencies"; name="Currencies"},
    @{path="/weather"; name="Weather"}
)

foreach ($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000$($page.path)" -UseBasicParsing -TimeoutSec 10
        Write-Host "✓ $($page.name) - HTTP $($response.StatusCode)"
    } catch {
        Write-Host "✗ $($page.name) - FAILED"
    }
}
```

**3. Check external APIs are available:**
```powershell
$apis = @(
    @{url="https://api.coingecko.com/api/v3/ping"; name="CoinGecko"},
    @{url="https://api.exchangerate-api.com/v4/latest/USD"; name="ExchangeRate"},
    @{url="https://api.open-meteo.com/v1/forecast?latitude=52&longitude=13&current_weather=true"; name="Open-Meteo"}
)

foreach ($api in $apis) {
    try {
        $response = Invoke-WebRequest -Uri $api.url -UseBasicParsing -TimeoutSec 10
        Write-Host "✓ $($api.name) API - HTTP $($response.StatusCode)"
    } catch {
        Write-Host "⚠ $($api.name) API - $($_.Exception.Message)"
    }
}
```

## Playwright E2E Testing (OPTIONAL)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠️ PLAYWRIGHT IS OPTIONAL - Only run when explicitly requested     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Default testing = Gradual manual checks                            │
│  Playwright = Only when user explicitly asks for it                 │
│                                                                     │
│  Before Playwright, verify:                                         │
│  ✓ Build passes                                                     │
│  ✓ Lint passes                                                      │
│  ✓ Server is UP (HTTP 200)                                          │
│  ✓ All pages return HTTP 200                                        │
│  ✓ No runtime errors in terminal                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Pre-Playwright Checklist
```bash
# 1. Build check (must pass)
npm run build

# 2. Lint check (must pass)  
npm run lint

# 3. Start server
npm run dev

# 4. Verify server is UP
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Must return 200

# 5. Verify all pages available
# All must return 200

# 6. ONLY if all above pass AND user requested, run Playwright
npx playwright test
```

### Setup Playwright
```bash
npm init playwright@latest
```

Select these options:
- TypeScript
- `tests` folder
- Add GitHub Actions workflow: Yes
- Install Playwright browsers: Yes

### Playwright Configuration
Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Tests for AviaBiz Dashboard

#### Dashboard Tests (`tests/dashboard.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Aviation & Business Dashboard');
  });

  test('shows world clocks for all timezones', async ({ page }) => {
    const timezones = ['New York', 'London', 'Tokyo', 'Dubai', 'Sydney'];
    for (const tz of timezones) {
      await expect(page.locator(`text=${tz}`)).toBeVisible();
    }
  });

  test('displays stat cards', async ({ page }) => {
    await expect(page.locator('text=Active Flights')).toBeVisible();
    await expect(page.locator('text=Cryptocurrencies')).toBeVisible();
    await expect(page.locator('text=Currency Pairs')).toBeVisible();
    await expect(page.locator('text=Weather Stations')).toBeVisible();
  });

  test('quick access cards link to correct pages', async ({ page }) => {
    await page.click('text=Flight Tracker');
    await expect(page).toHaveURL('/flights');
  });
});
```

#### Flights Page Tests (`tests/flights.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Flight Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/flights');
  });

  test('displays page title with plane icon', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Live Flight Tracker');
  });

  test('shows region selector buttons', async ({ page }) => {
    await expect(page.locator('text=Europe')).toBeVisible();
    await expect(page.locator('text=North America')).toBeVisible();
    await expect(page.locator('text=Asia')).toBeVisible();
    await expect(page.locator('text=Middle East')).toBeVisible();
  });

  test('can switch regions', async ({ page }) => {
    await page.click('button:has-text("North America")');
    await expect(page.locator('text=Flight List - North America')).toBeVisible();
  });

  test('displays flight table headers', async ({ page }) => {
    await expect(page.locator('th:has-text("Callsign")')).toBeVisible();
    await expect(page.locator('th:has-text("Country")')).toBeVisible();
    await expect(page.locator('th:has-text("Altitude")')).toBeVisible();
  });

  test('refresh button works', async ({ page }) => {
    const refreshBtn = page.locator('button:has-text("Refresh")');
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    // Should show loading state
  });
});
```

#### Markets Page Tests (`tests/markets.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Crypto Markets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/markets');
  });

  test('displays page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Cryptocurrency Markets');
  });

  test('shows market stats', async ({ page }) => {
    await expect(page.locator('text=Total Market Cap')).toBeVisible();
    await expect(page.locator('text=Coins Tracked')).toBeVisible();
    await expect(page.locator('text=Gainers')).toBeVisible();
    await expect(page.locator('text=Losers')).toBeVisible();
  });

  test('displays crypto table with data', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });
});
```

#### Currencies Page Tests (`tests/currencies.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Currency Exchange', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/currencies');
  });

  test('displays currency converter', async ({ page }) => {
    await expect(page.locator('text=Currency Converter')).toBeVisible();
  });

  test('converter calculates correctly', async ({ page }) => {
    const amountInput = page.locator('input[type="number"]');
    await amountInput.fill('100');
    
    // Result should be visible
    await expect(page.locator('text=100 USD =')).toBeVisible();
  });

  test('swap currencies button works', async ({ page }) => {
    const swapBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
    await swapBtn.click();
    // Currencies should swap
  });
});
```

#### Weather Page Tests (`tests/weather.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Aviation Weather', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/weather');
  });

  test('displays page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Aviation Weather');
  });

  test('shows airport weather cards', async ({ page }) => {
    // Check for known airport codes
    const airports = ['JFK', 'LHR', 'CDG', 'DXB'];
    for (const code of airports) {
      await expect(page.locator(`text=${code}`).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('displays flight conditions legend', async ({ page }) => {
    await expect(page.locator('text=Flight Conditions Legend')).toBeVisible();
    await expect(page.locator('text=Good VFR')).toBeVisible();
    await expect(page.locator('text=Marginal')).toBeVisible();
    await expect(page.locator('text=Hazardous')).toBeVisible();
  });
});
```

#### Navigation Tests (`tests/navigation.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('sidebar navigation works on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Click each nav item
    await page.click('a[href="/flights"]');
    await expect(page).toHaveURL('/flights');

    await page.click('a[href="/markets"]');
    await expect(page).toHaveURL('/markets');

    await page.click('a[href="/currencies"]');
    await expect(page).toHaveURL('/currencies');

    await page.click('a[href="/weather"]');
    await expect(page).toHaveURL('/weather');

    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('mobile menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Menu should be closed initially
    const menuBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await menuBtn.click();

    // Menu should open
    await expect(page.locator('nav a[href="/flights"]')).toBeVisible();
  });
});
```

#### Accessibility Tests (`tests/accessibility.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/flights', '/markets', '/currencies', '/weather'];

for (const path of pages) {
  test(`accessibility scan for ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });
}
```

### Running Playwright Tests

#### CRITICAL: Dev Server Must Run in Background - NEVER Stop During Testing

```
┌────────────────────────────────────────────────────────────────────┐
│  DEV SERVER LIFECYCLE                                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  1. START    → npm run dev (in background)                         │
│  2. VERIFY   → Wait for "Ready" message                            │
│  3. TEST     → Run Playwright tests (server running!)              │
│  4. FIX      → Fix any failing tests (server STILL running!)       │
│  5. RE-TEST  → Run tests again (server STILL running!)             │
│  6. REPEAT   → Steps 3-5 until all tests pass                      │
│  7. STOP     → ONLY after ALL testing complete, stop server        │
│                                                                    │
│  ⚠️  NEVER stop the dev server while testing is in progress!       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Two Terminal Setup:**
```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  TERMINAL 1 - DEV SERVER    │  │  TERMINAL 2 - TESTING       │
│  ⚠️ BACKGROUND - DON'T STOP │  │  (Run all tests here)       │
├─────────────────────────────┤  ├─────────────────────────────┤
│ > npm run dev               │  │ > npx playwright test --ui  │
│                             │  │                             │
│ ▲ Next.js 14.2.3            │  │ Running 15 tests...         │
│ - Local: localhost:3000     │  │ ✗ 2 tests failed            │
│ ✓ Ready in 2.5s             │  │                             │
│                             │  │ > # Fix code...             │
│ ╔═══════════════════════╗   │  │ > npx playwright test       │
│ ║ DO NOT CLOSE THIS     ║   │  │                             │
│ ║ TERMINAL UNTIL ALL    ║   │  │ ✓ All 15 tests passed!      │
│ ║ TESTING IS FINISHED!  ║   │  │                             │
│ ╚═══════════════════════╝   │  │ # NOW you can stop Term 1   │
└─────────────────────────────┘  └─────────────────────────────┘
```

**Stopping the server (ONLY after all testing complete):**
```bash
# Find the process ID
netstat -ano | findstr :3000

# Kill the process
taskkill /F /PID <pid>
```

**Alternative: webServer Auto-Start Config**

The `playwright.config.ts` includes automatic server management:

```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,  // Reuse if already running
  timeout: 120 * 1000,  // Wait up to 2 min for server
}
```

With this config:
- Playwright auto-starts `npm run dev` if not running
- Waits for server to be ready
- Reuses existing server if already running
- Server stays running between test runs

```bash
# Install Playwright and browsers
npm init playwright@latest

# Install accessibility testing
npm install -D @axe-core/playwright

# Run all tests (auto-starts dev server)
npx playwright test

# Run with visual UI (for debugging)
npx playwright test --ui

# Run in headed mode
npx playwright test --headed

# Debug specific test
npx playwright test tests/dashboard.spec.ts --debug

# Generate test by recording
npx playwright codegen http://localhost:3000

# View HTML report after tests
npx playwright show-report

# Update screenshots for visual testing
npx playwright test --update-snapshots
```

### Chrome DevTools - Fast Error Checking

#### Quick Error Scan Commands
```bash
# Run error checker test (scans all pages for console errors)
npx playwright test error-checker.spec.ts

# Debug mode with DevTools (opens browser with DevTools)
PWDEBUG=1 npx playwright test --headed

# Slow motion to see what's happening
npx playwright test --headed --slow-mo=500
```

#### Pre-Built Error Checker Test
Copy `tests/error-checker.spec.ts` from this skill folder. It provides:

1. **Console Error Capture** - Catches all `console.error()` messages
2. **Page Error Capture** - Catches uncaught JavaScript exceptions
3. **Network Error Capture** - Catches failed requests and HTTP 4xx/5xx
4. **Full Site Scan** - Scans all 5 pages and reports errors by page
5. **API Health Check** - Verifies all 4 APIs respond correctly

#### Manual DevTools Debugging
```typescript
// Add this line in any test to pause and open DevTools
await page.pause();

// Then in the browser:
// - Press F12 to open DevTools
// - Check Console tab for errors
// - Check Network tab for failed requests
// - Click "Resume" in Playwright Inspector when done
```

#### Capture Errors in Your Tests
```typescript
test.beforeEach(async ({ page }) => {
  // Log all console errors to terminal
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 Console Error:', msg.text());
    }
  });

  // Log uncaught exceptions
  page.on('pageerror', error => {
    console.log('🔴 Page Error:', error.message);
  });

  // Log failed network requests
  page.on('requestfailed', req => {
    console.log('🔴 Request Failed:', req.url());
  });
});
```

## Enhancement Opportunities

When testing is complete and everything works, consider these enhancements:

1. **Add skeleton loading states** to all data-fetching components
2. **Implement error boundaries** for graceful error handling
3. **Add accessibility attributes** (aria-labels, roles)
4. **Optimize images** with Next.js Image component
5. **Add meta tags** for SEO
6. **Implement dark mode toggle** (infrastructure exists)
7. **Add unit tests** with Jest/React Testing Library
8. **Add E2E tests** with Playwright (templates provided above)

## API Documentation Links

Use web search to access latest docs:
- OpenSky Network: https://openskynetwork.github.io/opensky-api/
- CoinGecko: https://www.coingecko.com/en/api/documentation
- Open-Meteo: https://open-meteo.com/en/docs
- ExchangeRate API: https://www.exchangerate-api.com/docs/overview
