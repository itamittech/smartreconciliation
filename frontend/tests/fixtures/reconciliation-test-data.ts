/**
 * Comprehensive Reconciliation Test Data
 * Based on User Stories from CLAUDE.md specification
 *
 * Covers all reconciliation scenarios:
 * - Exact matches
 * - Amount variances (MISMATCH)
 * - Date mismatches
 * - Missing in source (MISSING_SOURCE)
 * - Missing in target (MISSING_TARGET)
 * - Duplicates (DUPLICATE)
 * - Fuzzy matching scenarios
 * - Many-to-one matching (multiple payments → single invoice)
 * - Different severity levels (Critical, Warning, Info)
 */

// =============================================================================
// SCENARIO 1: Bank Statement vs Accounting Records
// Use Case: Monthly bank reconciliation (US-2.1, US-4.1)
// =============================================================================

export const bankStatementSource = `id,date,description,amount,reference,balance
101,2026-01-01,Opening Balance,0.00,OB-001,10000.00
102,2026-01-02,Payment to Vendor A,1500.00,PAY-001,8500.00
103,2026-01-03,Office Supplies Purchase,250.50,PAY-002,8249.50
104,2026-01-05,Consulting Fee - ABC Corp,3000.00,PAY-003,5249.50
105,2026-01-06,Utility Bill - City Power,175.25,PAY-004,5074.25
106,2026-01-07,Software License - Microsoft,499.99,PAY-005,4574.26
107,2026-01-08,Travel Expense Reimbursement,850.00,PAY-006,3724.26
108,2026-01-09,Marketing Services,2200.00,PAY-007,1524.26
109,2026-01-10,Equipment Purchase,4500.00,PAY-008,-2975.74
110,2026-01-11,Wire Transfer - Insurance,1200.00,PAY-009,-4175.74
111,2026-01-12,Professional Services - Legal,1750.00,PAY-010,-5925.74
112,2026-01-13,Client Payment Received,-5000.00,RCV-001,-925.74
113,2026-01-14,Refund from Supplier,-320.00,RCV-002,-605.74
114,2026-01-15,Bank Fee,25.00,FEE-001,-630.74
115,2026-01-15,Interest Charge,12.50,INT-001,-643.24
116,2026-01-16,Petty Cash Withdrawal,100.00,CASH-001,-743.24
117,2026-01-17,Duplicate Entry - Error,100.00,CASH-001,-843.24
118,2026-01-18,ATM Withdrawal,200.00,ATM-001,-1043.24
119,2026-01-19,Online Payment - Subscription,49.99,SUB-001,-1093.23
120,2026-01-20,Vendor Payment - Partial,750.00,PAY-011,-1843.23`;

export const accountingRecordsTarget = `transaction_id,transaction_date,vendor,debit,credit,category,invoice_no,approved
A001,2026-01-01,Opening Balance,0.00,0.00,Opening,OB-001,true
A002,2026-01-02,Vendor A Inc,1500.00,0.00,Payments,INV-1001,true
A003,2026-01-03,Office Depot,250.50,0.00,Supplies,INV-1002,true
A004,2026-01-04,ABC Consulting LLC,3000.00,0.00,Services,INV-1003,true
A005,2026-01-06,City Power & Light,175.25,0.00,Utilities,INV-1004,true
A006,2026-01-07,Microsoft Corporation,500.00,0.00,Software,INV-1005,true
A007,2026-01-08,Employee Travel,850.00,0.00,Travel,EXP-001,true
A008,2026-01-09,AdAgency Inc,2200.00,0.00,Marketing,INV-1006,true
A009,2026-01-10,TechEquip Solutions,4500.00,0.00,Equipment,INV-1007,true
A010,2026-01-12,StateFarm Insurance,1200.00,0.00,Insurance,INV-1008,true
A011,2026-01-12,Legal Partners LLP,1750.00,0.00,Legal,INV-1009,true
A012,2026-01-13,Client ABC Corp,0.00,5000.00,Revenue,RCV-001,true
A013,2026-01-14,Supplier XYZ,0.00,320.00,Refund,CRD-001,true
A014,2026-01-15,Bank Charges,25.00,0.00,Fees,BANK-001,true
A015,2026-01-20,New Vendor - Not in Bank,500.00,0.00,Supplies,INV-1010,false
A016,2026-01-21,Pending Approval Entry,1000.00,0.00,Services,INV-1011,false
A017,2026-01-08,Employee Travel - Per Diem,150.00,0.00,Travel,EXP-002,true
A018,2026-01-19,Netflix Business,49.99,0.00,Subscriptions,SUB-001,true
A019,2026-01-20,Vendor A Inc - Partial,750.00,0.00,Payments,INV-1012,true`;

/**
 * Expected Exception Scenarios from above data:
 *
 * 1. EXACT MATCH (no exception):
 *    - 101 ↔ A001: Opening Balance
 *    - 102 ↔ A002: Vendor A payment (but fuzzy name match needed)
 *    - 103 ↔ A003: Office Supplies
 *
 * 2. DATE MISMATCH (Warning):
 *    - 104 (Jan 5) ↔ A004 (Jan 4): Consulting Fee - 1 day variance
 *    - 110 (Jan 11) ↔ A010 (Jan 12): Insurance - 1 day variance
 *
 * 3. AMOUNT VARIANCE (Critical/Warning):
 *    - 106 ($499.99) ↔ A006 ($500.00): Software License - $0.01 variance
 *
 * 4. MISSING_TARGET (Critical):
 *    - 114: Bank Fee (no matching in target - but A014 exists with same amount, date)
 *    - 115: Interest Charge (no matching in accounting)
 *    - 116: Petty Cash (no matching in accounting)
 *    - 118: ATM Withdrawal (no matching in accounting)
 *
 * 5. MISSING_SOURCE (Warning):
 *    - A015: New Vendor entry (not in bank statement)
 *    - A016: Pending Approval (not in bank statement)
 *    - A017: Per Diem (separate from main travel expense)
 *
 * 6. DUPLICATE (Info):
 *    - 116 & 117: Same reference CASH-001, same amount
 *
 * 7. FUZZY MATCH needed:
 *    - "Vendor A" ↔ "Vendor A Inc"
 *    - "ABC Corp" ↔ "ABC Consulting LLC"
 *    - "Microsoft" ↔ "Microsoft Corporation"
 *
 * 8. MANY-TO-ONE potential:
 *    - 107 ($850) + A017 ($150) = A007 total travel expense
 */


// =============================================================================
// SCENARIO 2: Invoice vs Payment Matching
// Use Case: Payment verification (US-4.2 - AI suggested resolutions)
// =============================================================================

export const invoicesSource = `invoice_no,invoice_date,customer,amount_due,due_date,status
INV-2001,2026-01-01,Customer Alpha,1500.00,2026-01-31,OPEN
INV-2002,2026-01-02,Customer Beta,2500.00,2026-02-01,OPEN
INV-2003,2026-01-03,Customer Gamma,750.00,2026-02-02,OPEN
INV-2004,2026-01-04,Customer Delta,3200.00,2026-02-03,OPEN
INV-2005,2026-01-05,Customer Alpha,500.00,2026-02-04,OPEN
INV-2006,2026-01-05,Customer Alpha,750.00,2026-02-04,OPEN
INV-2007,2026-01-05,Customer Alpha,250.00,2026-02-04,OPEN
INV-2008,2026-01-10,Customer Epsilon,4500.00,2026-02-09,OPEN
INV-2009,2026-01-12,Customer Zeta,1800.00,2026-02-11,PAID
INV-2010,2026-01-15,Customer Eta,999.99,2026-02-14,OPEN`;

export const paymentsTarget = `payment_id,payment_date,payer,amount_paid,reference,method
PAY-3001,2026-01-15,Customer Alpha,1500.00,INV-2001,WIRE
PAY-3002,2026-01-20,Customer Beta,2400.00,INV-2002,CHECK
PAY-3003,2026-01-18,Customer Gamma,750.00,INV-2003,ACH
PAY-3004,2026-01-25,Customer Delta,3200.00,INV-2004,WIRE
PAY-3005,2026-01-22,Alpha Corp,1500.00,MULTI-INV,WIRE
PAY-3006,2026-01-28,Customer Epsilon,4500.00,INV-2008,WIRE
PAY-3007,2026-01-12,Customer Zeta,1800.00,INV-2009,ACH
PAY-3008,2026-02-01,Customer Eta,1000.00,INV-2010,CHECK
PAY-3009,2026-01-30,Unknown Customer,500.00,UNKNOWN,CASH`;

/**
 * Expected Scenarios:
 *
 * 1. EXACT MATCH:
 *    - INV-2001 ↔ PAY-3001: Perfect match
 *    - INV-2003 ↔ PAY-3003: Perfect match
 *    - INV-2004 ↔ PAY-3004: Perfect match
 *    - INV-2008 ↔ PAY-3006: Perfect match
 *    - INV-2009 ↔ PAY-3007: Perfect match
 *
 * 2. AMOUNT VARIANCE (Critical - $100 underpayment):
 *    - INV-2002 ($2500) ↔ PAY-3002 ($2400): $100 variance
 *
 * 3. AMOUNT VARIANCE (Info - rounding):
 *    - INV-2010 ($999.99) ↔ PAY-3008 ($1000.00): $0.01 variance
 *
 * 4. MANY-TO-ONE (AI Suggestion needed - US-4.2):
 *    - INV-2005 ($500) + INV-2006 ($750) + INV-2007 ($250) = PAY-3005 ($1500)
 *    - All from Customer Alpha, combined payment
 *
 * 5. FUZZY MATCH:
 *    - "Customer Alpha" ↔ "Alpha Corp" (PAY-3005)
 *
 * 6. MISSING_SOURCE:
 *    - PAY-3009: Unknown customer payment, no matching invoice
 */


// =============================================================================
// SCENARIO 3: Inventory Reconciliation
// Use Case: Stock count vs system records
// =============================================================================

export const physicalInventorySource = `sku,product_name,location,counted_qty,count_date,counter
SKU-001,Widget A,Warehouse-1,100,2026-01-20,John
SKU-002,Widget B,Warehouse-1,250,2026-01-20,John
SKU-003,Gadget X,Warehouse-1,75,2026-01-20,John
SKU-004,Gadget Y,Warehouse-2,500,2026-01-20,Sarah
SKU-005,Component Z,Warehouse-2,1000,2026-01-20,Sarah
SKU-006,Assembly Kit,Warehouse-1,30,2026-01-20,John
SKU-007,Spare Part A,Warehouse-2,200,2026-01-20,Sarah
SKU-008,Spare Part B,Warehouse-2,150,2026-01-20,Sarah
SKU-009,New Product,Warehouse-1,50,2026-01-20,John
SKU-010,Discontinued Item,Warehouse-1,5,2026-01-20,John`;

export const systemInventoryTarget = `item_code,description,warehouse,system_qty,last_updated,status
SKU-001,Widget Type A,WH1,100,2026-01-19,ACTIVE
SKU-002,Widget Type B,WH1,245,2026-01-19,ACTIVE
SKU-003,Gadget Model X,WH1,75,2026-01-19,ACTIVE
SKU-004,Gadget Model Y,WH2,502,2026-01-19,ACTIVE
SKU-005,Component Z-100,WH2,1000,2026-01-19,ACTIVE
SKU-006,Assembly Kit Pro,WH1,28,2026-01-19,ACTIVE
SKU-007,Spare Part Alpha,WH2,200,2026-01-19,ACTIVE
SKU-008,Spare Part Beta,WH2,150,2026-01-19,ACTIVE
SKU-011,Old Product,WH1,10,2026-01-19,DISCONTINUED
SKU-012,Reserved Stock,WH2,100,2026-01-19,RESERVED`;

/**
 * Expected Scenarios:
 *
 * 1. EXACT MATCH:
 *    - SKU-001: 100 = 100
 *    - SKU-003: 75 = 75
 *    - SKU-005: 1000 = 1000
 *    - SKU-007: 200 = 200
 *    - SKU-008: 150 = 150
 *
 * 2. QUANTITY VARIANCE (Warning):
 *    - SKU-002: 250 counted vs 245 system (+5 variance)
 *    - SKU-004: 500 counted vs 502 system (-2 variance)
 *    - SKU-006: 30 counted vs 28 system (+2 variance)
 *
 * 3. MISSING_TARGET (Critical - in physical but not in system):
 *    - SKU-009: New Product - not in system
 *    - SKU-010: Discontinued Item - might be removed from system
 *
 * 4. MISSING_SOURCE (Warning - in system but not counted):
 *    - SKU-011: Old Product - not counted
 *    - SKU-012: Reserved Stock - not counted
 *
 * 5. FUZZY MATCH needed:
 *    - "Warehouse-1" ↔ "WH1"
 *    - "Warehouse-2" ↔ "WH2"
 *    - "Widget A" ↔ "Widget Type A"
 */


// =============================================================================
// MOCK DATA FOR UNIT TESTS - Comprehensive Exception Scenarios
// =============================================================================

export const comprehensiveExceptions = [
  // CRITICAL - Amount Variance > $100
  {
    id: 'exc-crit-001',
    reconciliationId: 'recon-1',
    type: 'MISMATCH',
    severity: 'HIGH',
    status: 'OPEN',
    sourceRecordId: 'INV-2002',
    targetRecordId: 'PAY-3002',
    sourceData: { invoice_no: 'INV-2002', customer: 'Customer Beta', amount_due: '2500.00' },
    targetData: { payment_id: 'PAY-3002', payer: 'Customer Beta', amount_paid: '2400.00' },
    details: {
      field: 'amount',
      sourceValue: '2500.00',
      targetValue: '2400.00',
      variance: '100.00',
      variancePercent: '4.0%'
    },
    aiSuggestion: 'Underpayment of $100. Check if partial payment or discount applied. Customer may owe remaining balance.',
    createdAt: '2026-01-20T10:00:00Z',
  },

  // CRITICAL - Missing in Target (payment not received)
  {
    id: 'exc-crit-002',
    reconciliationId: 'recon-1',
    type: 'MISSING_TARGET',
    severity: 'HIGH',
    status: 'OPEN',
    sourceRecordId: '115',
    targetRecordId: null,
    sourceData: { id: '115', date: '2026-01-15', description: 'Interest Charge', amount: '12.50' },
    targetData: null,
    details: { reason: 'Bank interest charge not recorded in accounting system' },
    aiSuggestion: 'This is a bank interest charge. Create a journal entry to record this expense in the Interest Expense account.',
    createdAt: '2026-01-20T10:05:00Z',
  },

  // WARNING - Date Mismatch (1 day variance)
  {
    id: 'exc-warn-001',
    reconciliationId: 'recon-1',
    type: 'MISMATCH',
    severity: 'MEDIUM',
    status: 'OPEN',
    sourceRecordId: '104',
    targetRecordId: 'A004',
    sourceData: { id: '104', date: '2026-01-05', description: 'Consulting Fee - ABC Corp', amount: '3000.00' },
    targetData: { transaction_id: 'A004', transaction_date: '2026-01-04', vendor: 'ABC Consulting LLC', debit: '3000.00' },
    details: {
      field: 'date',
      sourceValue: '2026-01-05',
      targetValue: '2026-01-04',
      varianceDays: 1
    },
    aiSuggestion: 'Date difference of 1 day is within normal processing tolerance. This is likely the same transaction recorded on different dates. Safe to match.',
    createdAt: '2026-01-20T10:10:00Z',
  },

  // WARNING - Missing in Source (unrecorded payment)
  {
    id: 'exc-warn-002',
    reconciliationId: 'recon-1',
    type: 'MISSING_SOURCE',
    severity: 'MEDIUM',
    status: 'OPEN',
    sourceRecordId: null,
    targetRecordId: 'A015',
    sourceData: null,
    targetData: { transaction_id: 'A015', transaction_date: '2026-01-20', vendor: 'New Vendor', debit: '500.00' },
    details: { reason: 'Accounting entry exists but no corresponding bank transaction found' },
    aiSuggestion: 'Entry A015 appears to be recorded in accounting but not yet cleared by the bank. Check if payment is pending or if it was paid from a different account.',
    createdAt: '2026-01-20T10:15:00Z',
  },

  // INFO - Small Amount Variance (rounding)
  {
    id: 'exc-info-001',
    reconciliationId: 'recon-1',
    type: 'MISMATCH',
    severity: 'LOW',
    status: 'OPEN',
    sourceRecordId: '106',
    targetRecordId: 'A006',
    sourceData: { id: '106', date: '2026-01-07', description: 'Software License - Microsoft', amount: '499.99' },
    targetData: { transaction_id: 'A006', transaction_date: '2026-01-07', vendor: 'Microsoft Corporation', debit: '500.00' },
    details: {
      field: 'amount',
      sourceValue: '499.99',
      targetValue: '500.00',
      variance: '0.01',
      variancePercent: '0.002%'
    },
    aiSuggestion: 'Variance of $0.01 is likely a rounding difference. Safe to auto-match with rounding adjustment.',
    createdAt: '2026-01-20T10:20:00Z',
  },

  // INFO - Duplicate Detection
  {
    id: 'exc-info-002',
    reconciliationId: 'recon-1',
    type: 'DUPLICATE',
    severity: 'LOW',
    status: 'OPEN',
    sourceRecordId: '116',
    targetRecordId: '117',
    sourceData: { id: '116', date: '2026-01-16', description: 'Petty Cash Withdrawal', amount: '100.00', reference: 'CASH-001' },
    targetData: { id: '117', date: '2026-01-17', description: 'Duplicate Entry - Error', amount: '100.00', reference: 'CASH-001' },
    details: {
      reason: 'Same reference number CASH-001 used twice',
      duplicateFields: ['reference', 'amount']
    },
    aiSuggestion: 'Duplicate entry detected with same reference CASH-001. Transaction 117 appears to be an erroneous duplicate. Recommend deleting entry 117.',
    createdAt: '2026-01-20T10:25:00Z',
  },

  // CRITICAL - Many-to-One Match Suggestion (US-4.2)
  {
    id: 'exc-crit-003',
    reconciliationId: 'recon-1',
    type: 'MISSING_TARGET',
    severity: 'HIGH',
    status: 'OPEN',
    sourceRecordId: 'INV-2005,INV-2006,INV-2007',
    targetRecordId: 'PAY-3005',
    sourceData: {
      invoices: [
        { invoice_no: 'INV-2005', customer: 'Customer Alpha', amount_due: '500.00' },
        { invoice_no: 'INV-2006', customer: 'Customer Alpha', amount_due: '750.00' },
        { invoice_no: 'INV-2007', customer: 'Customer Alpha', amount_due: '250.00' }
      ],
      totalAmount: '1500.00'
    },
    targetData: { payment_id: 'PAY-3005', payer: 'Alpha Corp', amount_paid: '1500.00', reference: 'MULTI-INV' },
    details: {
      matchType: 'MANY_TO_ONE',
      reason: 'Single payment matches sum of multiple invoices'
    },
    aiSuggestion: 'Found 3 invoices from Customer Alpha totaling $1,500.00 that match payment PAY-3005:\n• INV-2005: $500.00\n• INV-2006: $750.00\n• INV-2007: $250.00\n\nThis appears to be a consolidated payment. Accept match to resolve all 3 invoices.',
    createdAt: '2026-01-20T10:30:00Z',
  },

  // RESOLVED - Example of resolved exception
  {
    id: 'exc-resolved-001',
    reconciliationId: 'recon-1',
    type: 'MISMATCH',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    sourceRecordId: '102',
    targetRecordId: 'A002',
    sourceData: { id: '102', description: 'Payment to Vendor A', amount: '1500.00' },
    targetData: { transaction_id: 'A002', vendor: 'Vendor A Inc', debit: '1500.00' },
    details: { field: 'vendor_name', sourceValue: 'Vendor A', targetValue: 'Vendor A Inc' },
    resolution: {
      action: 'MATCHED_FUZZY',
      note: 'Vendor name matched using fuzzy matching (85% similarity)',
      resolvedBy: 'system',
      confidence: 0.85
    },
    aiSuggestion: null,
    createdAt: '2026-01-20T09:00:00Z',
    resolvedAt: '2026-01-20T09:05:00Z',
  },

  // IGNORED - Example of ignored exception
  {
    id: 'exc-ignored-001',
    reconciliationId: 'recon-1',
    type: 'MISSING_SOURCE',
    severity: 'LOW',
    status: 'IGNORED',
    sourceRecordId: null,
    targetRecordId: 'A016',
    sourceData: null,
    targetData: { transaction_id: 'A016', vendor: 'Pending Approval', debit: '1000.00', approved: false },
    details: { reason: 'Unapproved accounting entry' },
    resolution: {
      action: 'IGNORED',
      note: 'Entry not yet approved - will be included in next reconciliation after approval',
      resolvedBy: 'analyst@company.com'
    },
    aiSuggestion: null,
    createdAt: '2026-01-20T09:30:00Z',
    resolvedAt: '2026-01-20T09:35:00Z',
  },
];


// =============================================================================
// RULE SETS - Comprehensive matching rules
// =============================================================================

export const comprehensiveRuleSets = [
  {
    id: 'rule-bank-recon',
    name: 'Bank Statement Reconciliation',
    description: 'Rules for matching bank statements with accounting records. Supports date tolerance, fuzzy vendor matching, and amount variance thresholds.',
    isActive: true,
    fieldMappings: [
      { id: 'fm-1', sourceField: 'id', targetField: 'transaction_id', isKeyField: true, confidence: 0.95 },
      { id: 'fm-2', sourceField: 'date', targetField: 'transaction_date', isKeyField: true, confidence: 0.98 },
      { id: 'fm-3', sourceField: 'amount', targetField: 'debit', isKeyField: false, confidence: 0.90 },
      { id: 'fm-4', sourceField: 'description', targetField: 'vendor', isKeyField: false, confidence: 0.75 },
      { id: 'fm-5', sourceField: 'reference', targetField: 'invoice_no', isKeyField: false, confidence: 0.85 },
    ],
    matchingRules: [
      {
        id: 'mr-1',
        name: 'Exact Reference Match',
        matchType: 'EXACT',
        sourceField: 'reference',
        targetField: 'invoice_no',
        priority: 1,
        description: 'Match transactions by reference/invoice number'
      },
      {
        id: 'mr-2',
        name: 'Amount with Tolerance',
        matchType: 'RANGE',
        sourceField: 'amount',
        targetField: 'debit',
        tolerance: { amount: 0.01, percent: 0.1 },
        priority: 2,
        description: 'Allow $0.01 or 0.1% variance for rounding differences'
      },
      {
        id: 'mr-3',
        name: 'Date Tolerance',
        matchType: 'RANGE',
        sourceField: 'date',
        targetField: 'transaction_date',
        tolerance: { days: 2 },
        priority: 3,
        description: 'Allow ±2 days for processing delays'
      },
      {
        id: 'mr-4',
        name: 'Fuzzy Vendor Match',
        matchType: 'FUZZY',
        sourceField: 'description',
        targetField: 'vendor',
        tolerance: { threshold: 0.75 },
        priority: 4,
        description: 'Match similar vendor names (75% similarity)'
      },
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'rule-invoice-payment',
    name: 'Invoice to Payment Matching',
    description: 'Rules for matching customer invoices with received payments. Supports partial payments and many-to-one matching.',
    isActive: true,
    fieldMappings: [
      { id: 'fm-10', sourceField: 'invoice_no', targetField: 'reference', isKeyField: true, confidence: 0.99 },
      { id: 'fm-11', sourceField: 'customer', targetField: 'payer', isKeyField: true, confidence: 0.85 },
      { id: 'fm-12', sourceField: 'amount_due', targetField: 'amount_paid', isKeyField: false, confidence: 0.95 },
      { id: 'fm-13', sourceField: 'invoice_date', targetField: 'payment_date', isKeyField: false, confidence: 0.70 },
    ],
    matchingRules: [
      {
        id: 'mr-10',
        name: 'Invoice Number Match',
        matchType: 'EXACT',
        sourceField: 'invoice_no',
        targetField: 'reference',
        priority: 1,
        description: 'Direct invoice to payment reference matching'
      },
      {
        id: 'mr-11',
        name: 'Amount Match',
        matchType: 'EXACT',
        sourceField: 'amount_due',
        targetField: 'amount_paid',
        priority: 2,
        description: 'Exact amount matching'
      },
      {
        id: 'mr-12',
        name: 'Fuzzy Customer Match',
        matchType: 'FUZZY',
        sourceField: 'customer',
        targetField: 'payer',
        tolerance: { threshold: 0.80 },
        priority: 3,
        description: 'Match similar customer/payer names'
      },
      {
        id: 'mr-13',
        name: 'Partial Payment Tolerance',
        matchType: 'RANGE',
        sourceField: 'amount_due',
        targetField: 'amount_paid',
        tolerance: { percent: 5 },
        priority: 4,
        description: 'Allow up to 5% underpayment (flag for review)'
      },
    ],
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-01-18T14:00:00Z',
  },
  {
    id: 'rule-inventory',
    name: 'Inventory Count Reconciliation',
    description: 'Rules for matching physical inventory counts with system records. Supports quantity tolerance and location mapping.',
    isActive: true,
    fieldMappings: [
      { id: 'fm-20', sourceField: 'sku', targetField: 'item_code', isKeyField: true, confidence: 1.0 },
      { id: 'fm-21', sourceField: 'location', targetField: 'warehouse', isKeyField: true, confidence: 0.90 },
      { id: 'fm-22', sourceField: 'counted_qty', targetField: 'system_qty', isKeyField: false, confidence: 0.95 },
      { id: 'fm-23', sourceField: 'product_name', targetField: 'description', isKeyField: false, confidence: 0.80 },
    ],
    matchingRules: [
      {
        id: 'mr-20',
        name: 'SKU Exact Match',
        matchType: 'EXACT',
        sourceField: 'sku',
        targetField: 'item_code',
        priority: 1,
        description: 'Match by exact SKU/item code'
      },
      {
        id: 'mr-21',
        name: 'Quantity Tolerance',
        matchType: 'RANGE',
        sourceField: 'counted_qty',
        targetField: 'system_qty',
        tolerance: { units: 2, percent: 1 },
        priority: 2,
        description: 'Allow ±2 units or 1% variance for counting errors'
      },
      {
        id: 'mr-22',
        name: 'Location Fuzzy Match',
        matchType: 'FUZZY',
        sourceField: 'location',
        targetField: 'warehouse',
        tolerance: { threshold: 0.70 },
        priority: 3,
        description: 'Match similar location names (Warehouse-1 ↔ WH1)'
      },
    ],
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
  },
];


// =============================================================================
// DASHBOARD METRICS - Realistic data
// =============================================================================

export const comprehensiveDashboardMetrics = {
  totalReconciliations: 45,
  completedReconciliations: 38,
  pendingReconciliations: 4,
  inProgressReconciliations: 2,
  failedReconciliations: 1,
  totalExceptions: 287,
  openExceptions: 52,
  resolvedExceptions: 198,
  ignoredExceptions: 37,
  overallMatchRate: 91.3,
  matchRateHistory: [
    { date: '2026-01-01', matchRate: 88.5, exceptions: 45 },
    { date: '2026-01-08', matchRate: 89.2, exceptions: 38 },
    { date: '2026-01-15', matchRate: 90.1, exceptions: 32 },
    { date: '2026-01-22', matchRate: 91.3, exceptions: 28 },
  ],
  exceptionsByType: {
    MISMATCH: 125,
    MISSING_SOURCE: 78,
    MISSING_TARGET: 62,
    DUPLICATE: 22,
  },
  exceptionsBySeverity: {
    HIGH: 45,
    MEDIUM: 142,
    LOW: 100,
  },
  topExceptionReasons: [
    { reason: 'Amount variance > $100', count: 28 },
    { reason: 'Date mismatch (1-2 days)', count: 45 },
    { reason: 'Missing bank entry', count: 32 },
    { reason: 'Vendor name mismatch', count: 25 },
    { reason: 'Duplicate reference', count: 12 },
  ],
  recentActivity: [
    { action: 'Reconciliation completed', details: 'January Bank Recon', timestamp: '2026-01-22T14:30:00Z' },
    { action: 'Exception resolved', details: '15 exceptions auto-matched', timestamp: '2026-01-22T14:25:00Z' },
    { action: 'File uploaded', details: 'bank_statement_jan.csv', timestamp: '2026-01-22T14:00:00Z' },
    { action: 'Rule set updated', details: 'Bank Statement Matching', timestamp: '2026-01-21T16:00:00Z' },
  ],
};
