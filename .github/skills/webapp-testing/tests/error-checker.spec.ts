/**
 * Fast Error Checker - Captures all console and network errors across pages
 * Copy this file to your tests/ folder
 */
import { test, expect, Page } from '@playwright/test';

// Store errors globally for this test file
let consoleErrors: string[] = [];
let consoleWarnings: string[] = [];
let networkErrors: string[] = [];

// Setup error capturing before each test
test.beforeEach(async ({ page }) => {
  consoleErrors = [];
  consoleWarnings = [];
  networkErrors = [];

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(`[CONSOLE ERROR] ${text}`);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(`[CONSOLE WARN] ${text}`);
    }
  });

  // Capture uncaught exceptions
  page.on('pageerror', error => {
    consoleErrors.push(`[PAGE ERROR] ${error.message}`);
  });

  // Capture failed network requests
  page.on('requestfailed', request => {
    networkErrors.push(`[REQUEST FAILED] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  // Capture HTTP error responses (4xx, 5xx)
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`[HTTP ${response.status()}] ${response.url()}`);
    }
  });
});

// Print errors after each test
test.afterEach(async () => {
  if (consoleErrors.length > 0) {
    console.log('\n🔴 CONSOLE ERRORS:');
    consoleErrors.forEach(e => console.log(`   ${e}`));
  }
  if (consoleWarnings.length > 0) {
    console.log('\n🟡 CONSOLE WARNINGS:');
    consoleWarnings.forEach(w => console.log(`   ${w}`));
  }
  if (networkErrors.length > 0) {
    console.log('\n🔴 NETWORK ERRORS:');
    networkErrors.forEach(n => console.log(`   ${n}`));
  }
});

// ============================================
// FAST ERROR SCAN - ALL PAGES
// ============================================

test.describe('Fast Error Scan', () => {
  const pages = [
    { path: '/', name: 'Dashboard' },
    { path: '/flights', name: 'Flights' },
    { path: '/markets', name: 'Markets' },
    { path: '/currencies', name: 'Currencies' },
    { path: '/weather', name: 'Weather' },
  ];

  for (const { path, name } of pages) {
    test(`${name} page - no console errors`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Wait a bit for any async errors
      await page.waitForTimeout(2000);

      // Assert no critical errors
      expect(
        consoleErrors.filter(e => !e.includes('favicon')), // Ignore favicon errors
        `Console errors on ${name}: ${consoleErrors.join(', ')}`
      ).toHaveLength(0);
    });
  }

  test('Full site scan - collect all errors', async ({ page }) => {
    const allErrors: { page: string; errors: string[] }[] = [];

    for (const { path, name } of pages) {
      consoleErrors = []; // Reset for each page
      networkErrors = [];
      
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      if (consoleErrors.length > 0 || networkErrors.length > 0) {
        allErrors.push({
          page: name,
          errors: [...consoleErrors, ...networkErrors],
        });
      }
    }

    // Report all errors found
    if (allErrors.length > 0) {
      console.log('\n📋 ERROR SUMMARY BY PAGE:');
      allErrors.forEach(({ page, errors }) => {
        console.log(`\n   ${page}:`);
        errors.forEach(e => console.log(`      - ${e}`));
      });
    }

    // Fail if critical errors found
    const criticalErrors = allErrors.flatMap(a => a.errors).filter(
      e => e.includes('[PAGE ERROR]') || e.includes('[CONSOLE ERROR]')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

// ============================================
// API RESPONSE CHECKER
// ============================================

test.describe('API Health Check', () => {
  test('Flights API responds', async ({ page }) => {
    await page.goto('/flights');
    
    // Wait for API call
    const response = await page.waitForResponse(
      resp => resp.url().includes('opensky-network.org'),
      { timeout: 15000 }
    ).catch(() => null);

    if (response) {
      console.log(`✓ OpenSky API: ${response.status()}`);
      expect(response.status()).toBeLessThan(500);
    } else {
      console.log('⚠ OpenSky API: No response (may be rate limited)');
    }
  });

  test('Crypto API responds', async ({ page }) => {
    await page.goto('/markets');
    
    const response = await page.waitForResponse(
      resp => resp.url().includes('coingecko.com'),
      { timeout: 15000 }
    ).catch(() => null);

    if (response) {
      console.log(`✓ CoinGecko API: ${response.status()}`);
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('Exchange Rate API responds', async ({ page }) => {
    await page.goto('/currencies');
    
    const response = await page.waitForResponse(
      resp => resp.url().includes('exchangerate-api.com'),
      { timeout: 15000 }
    ).catch(() => null);

    if (response) {
      console.log(`✓ ExchangeRate API: ${response.status()}`);
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('Weather API responds', async ({ page }) => {
    await page.goto('/weather');
    
    const response = await page.waitForResponse(
      resp => resp.url().includes('open-meteo.com'),
      { timeout: 15000 }
    ).catch(() => null);

    if (response) {
      console.log(`✓ Open-Meteo API: ${response.status()}`);
      expect(response.status()).toBeLessThan(500);
    }
  });
});

// ============================================
// INTERACTIVE DEBUG HELPERS
// ============================================

test.describe('Debug Helpers', () => {
  test.skip('Pause for manual DevTools inspection', async ({ page }) => {
    await page.goto('/');
    
    // This pauses the test and opens DevTools
    // Press F12 in the browser to inspect
    // Click "Resume" in Playwright Inspector to continue
    await page.pause();
  });

  test.skip('Take screenshots of all pages', async ({ page }) => {
    const pages = ['/', '/flights', '/markets', '/currencies', '/weather'];
    
    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      const name = path === '/' ? 'dashboard' : path.slice(1);
      await page.screenshot({ 
        path: `screenshots/${name}.png`,
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: screenshots/${name}.png`);
    }
  });
});
