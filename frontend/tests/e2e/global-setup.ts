import { FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import {
  bankStatementSource,
  accountingRecordsTarget,
  invoicesSource,
  paymentsTarget,
  physicalInventorySource,
  systemInventoryTarget,
} from '../fixtures/reconciliation-test-data';

/**
 * Global setup for Playwright E2E tests
 * Creates comprehensive test data covering all reconciliation scenarios:
 * - Exact matches
 * - Amount variances (MISMATCH)
 * - Date mismatches
 * - Missing in source (MISSING_SOURCE)
 * - Missing in target (MISSING_TARGET)
 * - Duplicates (DUPLICATE)
 * - Fuzzy matching scenarios
 * - Many-to-one matching
 */
async function globalSetup(config: FullConfig) {
  console.log('\n🚀 Setting up E2E test environment...\n');

  // Create test data directory
  const testDataDir = path.join(__dirname, 'fixtures', 'test-files');

  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
    console.log('✅ Created test data directory');
  }

  // ==========================================================================
  // SCENARIO 1: Bank Statement vs Accounting Records
  // ==========================================================================
  fs.writeFileSync(
    path.join(testDataDir, 'bank-statement-source.csv'),
    bankStatementSource
  );
  console.log('✅ Created bank-statement-source.csv (20 records)');

  fs.writeFileSync(
    path.join(testDataDir, 'accounting-records-target.csv'),
    accountingRecordsTarget
  );
  console.log('✅ Created accounting-records-target.csv (19 records)');

  // ==========================================================================
  // SCENARIO 2: Invoice vs Payment Matching
  // ==========================================================================
  fs.writeFileSync(
    path.join(testDataDir, 'invoices-source.csv'),
    invoicesSource
  );
  console.log('✅ Created invoices-source.csv (10 records)');

  fs.writeFileSync(
    path.join(testDataDir, 'payments-target.csv'),
    paymentsTarget
  );
  console.log('✅ Created payments-target.csv (9 records)');

  // ==========================================================================
  // SCENARIO 3: Inventory Reconciliation
  // ==========================================================================
  fs.writeFileSync(
    path.join(testDataDir, 'physical-inventory-source.csv'),
    physicalInventorySource
  );
  console.log('✅ Created physical-inventory-source.csv (10 records)');

  fs.writeFileSync(
    path.join(testDataDir, 'system-inventory-target.csv'),
    systemInventoryTarget
  );
  console.log('✅ Created system-inventory-target.csv (10 records)');

  // ==========================================================================
  // Simple test files (for basic upload tests)
  // ==========================================================================
  const simpleSourceCsv = `id,date,description,amount,reference
1,2026-01-01,Payment to Vendor A,1500.00,REF001
2,2026-01-02,Office Supplies,250.50,REF002
3,2026-01-03,Consulting Fee,3000.00,REF003
4,2026-01-04,Utility Bill,175.25,REF004
5,2026-01-05,Software License,499.99,REF005`;

  fs.writeFileSync(path.join(testDataDir, 'source-data.csv'), simpleSourceCsv);
  console.log('✅ Created source-data.csv (simple - 5 records)');

  const simpleTargetCsv = `transaction_id,transaction_date,vendor,amount,category
1,2026-01-01,Vendor A,1500.00,Payments
2,2026-01-02,Office Depot,250.50,Supplies
3,2026-01-03,ABC Consulting,3000.00,Services
4,2026-01-04,City Power,175.25,Utilities
5,2026-01-05,Microsoft,499.99,Software`;

  fs.writeFileSync(path.join(testDataDir, 'target-data.csv'), simpleTargetCsv);
  console.log('✅ Created target-data.csv (simple - 5 records)');

  // ==========================================================================
  // Test file summary
  // ==========================================================================
  console.log('\n📊 Test Data Summary:');
  console.log('─'.repeat(60));
  console.log('| Scenario                  | Source Records | Target Records |');
  console.log('─'.repeat(60));
  console.log('| Bank Reconciliation       |      20        |       19       |');
  console.log('| Invoice-Payment Match     |      10        |        9       |');
  console.log('| Inventory Reconciliation  |      10        |       10       |');
  console.log('| Simple (Upload Tests)     |       5        |        5       |');
  console.log('─'.repeat(60));

  console.log('\n📋 Expected Exception Scenarios:');
  console.log('  • EXACT MATCH: ~15 records');
  console.log('  • MISMATCH (Amount): ~5 records');
  console.log('  • MISMATCH (Date): ~3 records');
  console.log('  • MISSING_TARGET: ~5 records');
  console.log('  • MISSING_SOURCE: ~4 records');
  console.log('  • DUPLICATE: ~1 record');
  console.log('  • FUZZY MATCH needed: ~8 records');
  console.log('  • MANY-TO-ONE: ~1 scenario (3 invoices → 1 payment)');

  // ==========================================================================
  // Verify backend is accessible
  // ==========================================================================
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

  try {
    const response = await fetch(`${backendUrl}/api/v1/health`);
    if (response.ok) {
      console.log('\n✅ Backend is running and healthy');
    } else {
      console.warn('\n⚠️ Backend responded but may not be healthy');
    }
  } catch (error) {
    console.error('\n❌ Backend is not accessible. Make sure it is running.');
    console.error('   Start backend:');
    console.error('     cd D:\\AmitStudy\\ClaudeCode\\smartreconciliation');
    console.error('     docker-compose up -d');
    console.error('     mvnw.cmd spring-boot:run');
  }

  console.log('\n✅ E2E setup complete!\n');
}

export default globalSetup;
