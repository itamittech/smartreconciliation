import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global setup for E2E tests
 * This runs once before all tests to prepare the test environment
 */

// Create test data files for upload tests
setup('create test data files', async () => {
  const testDataDir = path.join(__dirname, '..', 'fixtures', 'test-files');

  // Create directory if it doesn't exist
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }

  // Create source CSV file
  const sourceCsvContent = `id,date,description,amount,reference
1,2026-01-01,Payment to Vendor A,1500.00,REF001
2,2026-01-02,Office Supplies,250.50,REF002
3,2026-01-03,Consulting Fee,3000.00,REF003
4,2026-01-04,Utility Bill,175.25,REF004
5,2026-01-05,Software License,499.99,REF005
6,2026-01-06,Travel Expense,850.00,REF006
7,2026-01-07,Marketing Services,2200.00,REF007
8,2026-01-08,Equipment Purchase,4500.00,REF008
9,2026-01-09,Insurance Premium,1200.00,REF009
10,2026-01-10,Professional Services,1750.00,REF010`;

  fs.writeFileSync(path.join(testDataDir, 'source-data.csv'), sourceCsvContent);

  // Create target CSV file
  const targetCsvContent = `transaction_id,transaction_date,vendor,amount,category
1,2026-01-01,Vendor A,1500.00,Payments
2,2026-01-02,Office Depot,250.50,Supplies
3,2026-01-03,ABC Consulting,3000.00,Services
4,2026-01-04,City Power,175.25,Utilities
5,2026-01-05,Microsoft,499.99,Software
6,2026-01-06,Delta Airlines,850.00,Travel
7,2026-01-07,AdAgency Inc,2200.00,Marketing
8,2026-01-08,TechEquip Co,4500.00,Equipment
9,2026-01-09,StateFarm,1200.00,Insurance
10,2026-01-10,Legal Partners,1750.00,Legal`;

  fs.writeFileSync(path.join(testDataDir, 'target-data.csv'), targetCsvContent);

  // Verify files were created
  expect(fs.existsSync(path.join(testDataDir, 'source-data.csv'))).toBe(true);
  expect(fs.existsSync(path.join(testDataDir, 'target-data.csv'))).toBe(true);
});

// Verify backend is running
setup('verify backend is running', async ({ request }) => {
  const response = await request.get('http://localhost:8080/api/v1/health');
  expect(response.ok()).toBe(true);

  const data = await response.json();
  expect(data.success).toBe(true);
});
