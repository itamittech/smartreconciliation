/**
 * Test fixtures for both E2E and unit tests
 * These represent realistic data structures matching backend DTOs
 */

// Dashboard metrics (for unit test mocks only)
export const mockDashboardMetrics = {
  totalReconciliations: 25,
  completedReconciliations: 18,
  pendingReconciliations: 4,
  inProgressReconciliations: 3,
  totalExceptions: 142,
  openExceptions: 45,
  resolvedExceptions: 87,
  ignoredExceptions: 10,
  overallMatchRate: 94.5,
  matchRateHistory: [
    { date: '2026-01-01', matchRate: 92.3, exceptions: 15 },
    { date: '2026-01-08', matchRate: 93.1, exceptions: 12 },
    { date: '2026-01-15', matchRate: 94.5, exceptions: 8 },
  ],
};

// Files (for unit test mocks only)
export const mockFiles = [
  {
    id: 'file-1',
    filename: 'bank_statement_jan.csv',
    originalFilename: 'bank_statement_jan.csv',
    filePath: '/uploads/bank_statement_jan.csv',
    fileSize: 45678,
    mimeType: 'text/csv',
    status: 'PROCESSED',
    rowCount: 250,
    columnCount: 6,
    detectedSchema: [
      { name: 'id', type: 'STRING' },
      { name: 'date', type: 'DATE' },
      { name: 'description', type: 'STRING' },
      { name: 'amount', type: 'DECIMAL' },
      { name: 'balance', type: 'DECIMAL' },
      { name: 'reference', type: 'STRING' },
    ],
    uploadedAt: '2026-01-15T10:30:00Z',
  },
  {
    id: 'file-2',
    filename: 'accounting_export.xlsx',
    originalFilename: 'accounting_export.xlsx',
    filePath: '/uploads/accounting_export.xlsx',
    fileSize: 123456,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    status: 'PROCESSED',
    rowCount: 312,
    columnCount: 8,
    detectedSchema: [
      { name: 'transaction_id', type: 'STRING' },
      { name: 'transaction_date', type: 'DATE' },
      { name: 'vendor', type: 'STRING' },
      { name: 'debit', type: 'DECIMAL' },
      { name: 'credit', type: 'DECIMAL' },
      { name: 'category', type: 'STRING' },
      { name: 'notes', type: 'STRING' },
      { name: 'approved', type: 'BOOLEAN' },
    ],
    uploadedAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'file-3',
    filename: 'inventory_check.csv',
    originalFilename: 'inventory_check.csv',
    filePath: '/uploads/inventory_check.csv',
    fileSize: 8901,
    mimeType: 'text/csv',
    status: 'PROCESSING',
    rowCount: null,
    columnCount: null,
    detectedSchema: [],
    uploadedAt: '2026-01-20T14:00:00Z',
  },
];

// Reconciliations (for unit test mocks only)
export const mockReconciliations = [
  {
    id: 'recon-1',
    name: 'January Bank Reconciliation',
    description: 'Monthly bank statement reconciliation for January 2026',
    status: 'COMPLETED',
    sourceFileId: 'file-1',
    targetFileId: 'file-2',
    ruleSetId: 'rule-1',
    totalSourceRecords: 250,
    totalTargetRecords: 312,
    matchedRecords: 235,
    unmatchedRecords: 15,
    exceptionCount: 22,
    matchRate: 94.0,
    createdAt: '2026-01-16T09:00:00Z',
    startedAt: '2026-01-16T09:01:00Z',
    completedAt: '2026-01-16T09:05:00Z',
  },
  {
    id: 'recon-2',
    name: 'Payment Verification Q4',
    description: 'Quarterly payment verification',
    status: 'IN_PROGRESS',
    sourceFileId: 'file-1',
    targetFileId: 'file-2',
    ruleSetId: 'rule-2',
    totalSourceRecords: 1500,
    totalTargetRecords: 1480,
    matchedRecords: 1200,
    unmatchedRecords: 300,
    exceptionCount: 45,
    matchRate: 80.0,
    createdAt: '2026-01-20T10:00:00Z',
    startedAt: '2026-01-20T10:01:00Z',
    completedAt: null,
  },
  {
    id: 'recon-3',
    name: 'Vendor Invoice Match',
    description: 'Match vendor invoices with payments',
    status: 'PENDING',
    sourceFileId: 'file-2',
    targetFileId: 'file-1',
    ruleSetId: 'rule-1',
    totalSourceRecords: 0,
    totalTargetRecords: 0,
    matchedRecords: 0,
    unmatchedRecords: 0,
    exceptionCount: 0,
    matchRate: 0,
    createdAt: '2026-01-21T08:00:00Z',
    startedAt: null,
    completedAt: null,
  },
  {
    id: 'recon-4',
    name: 'Failed Import Test',
    description: 'This reconciliation failed',
    status: 'FAILED',
    sourceFileId: 'file-3',
    targetFileId: 'file-1',
    ruleSetId: null,
    totalSourceRecords: 0,
    totalTargetRecords: 0,
    matchedRecords: 0,
    unmatchedRecords: 0,
    exceptionCount: 0,
    matchRate: 0,
    errorMessage: 'Source file processing failed',
    createdAt: '2026-01-19T15:00:00Z',
    startedAt: '2026-01-19T15:01:00Z',
    completedAt: null,
  },
];

// Exceptions (for unit test mocks only)
export const mockExceptions = [
  {
    id: 'exc-1',
    reconciliationId: 'recon-1',
    type: 'MISMATCH',
    severity: 'HIGH',
    status: 'OPEN',
    sourceRecordId: 'src-101',
    targetRecordId: 'tgt-201',
    sourceData: { id: '101', amount: '1500.00', date: '2026-01-05' },
    targetData: { transaction_id: '201', total: '1450.00', transaction_date: '2026-01-05' },
    details: { field: 'amount', sourceValue: '1500.00', targetValue: '1450.00', variance: '50.00' },
    aiSuggestion: 'Amount variance of $50. This may be due to a service fee deduction.',
    createdAt: '2026-01-16T09:05:00Z',
  },
  {
    id: 'exc-2',
    reconciliationId: 'recon-1',
    type: 'MISSING_TARGET',
    severity: 'HIGH',
    status: 'OPEN',
    sourceRecordId: 'src-102',
    targetRecordId: null,
    sourceData: { id: '102', amount: '2500.00', date: '2026-01-08', description: 'Wire Transfer' },
    targetData: null,
    details: { reason: 'No matching record found in target' },
    aiSuggestion: 'This wire transfer may not have been recorded in accounting yet. Check pending transactions.',
    createdAt: '2026-01-16T09:05:00Z',
  },
  {
    id: 'exc-3',
    reconciliationId: 'recon-1',
    type: 'MISSING_SOURCE',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    sourceRecordId: null,
    targetRecordId: 'tgt-303',
    sourceData: null,
    targetData: { transaction_id: '303', total: '75.00', transaction_date: '2026-01-10', vendor: 'Office Supplies' },
    details: { reason: 'No matching record found in source' },
    resolution: { action: 'MATCHED_MANUALLY', note: 'Matched to petty cash withdrawal' },
    aiSuggestion: null,
    createdAt: '2026-01-16T09:05:00Z',
    resolvedAt: '2026-01-17T14:30:00Z',
  },
  {
    id: 'exc-4',
    reconciliationId: 'recon-1',
    type: 'DUPLICATE',
    severity: 'LOW',
    status: 'IGNORED',
    sourceRecordId: 'src-104',
    targetRecordId: 'tgt-404',
    sourceData: { id: '104', amount: '100.00', date: '2026-01-12' },
    targetData: { transaction_id: '404', total: '100.00', transaction_date: '2026-01-12' },
    details: { reason: 'Potential duplicate entry detected' },
    aiSuggestion: 'This appears to be a system-generated duplicate. Safe to ignore.',
    createdAt: '2026-01-16T09:05:00Z',
  },
];

// Rule sets (for unit test mocks only)
export const mockRuleSets = [
  {
    id: 'rule-1',
    name: 'Bank Statement Matching',
    description: 'Standard rules for matching bank statements with accounting records',
    isActive: true,
    fieldMappings: [
      { id: 'fm-1', sourceField: 'id', targetField: 'transaction_id', isKeyField: true, confidence: 0.95 },
      { id: 'fm-2', sourceField: 'date', targetField: 'transaction_date', isKeyField: true, confidence: 0.98 },
      { id: 'fm-3', sourceField: 'amount', targetField: 'debit', isKeyField: false, confidence: 0.85 },
      { id: 'fm-4', sourceField: 'description', targetField: 'vendor', isKeyField: false, confidence: 0.72 },
    ],
    matchingRules: [
      { id: 'mr-1', name: 'Exact Amount', matchType: 'EXACT', sourceField: 'amount', targetField: 'debit', priority: 1 },
      { id: 'mr-2', name: 'Date Tolerance', matchType: 'RANGE', sourceField: 'date', targetField: 'transaction_date', tolerance: { days: 2 }, priority: 2 },
      { id: 'mr-3', name: 'Fuzzy Description', matchType: 'FUZZY', sourceField: 'description', targetField: 'vendor', tolerance: { threshold: 0.8 }, priority: 3 },
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'rule-2',
    name: 'Payment Verification Rules',
    description: 'Rules for verifying payments against invoices',
    isActive: true,
    fieldMappings: [
      { id: 'fm-5', sourceField: 'invoice_number', targetField: 'ref_no', isKeyField: true, confidence: 0.99 },
      { id: 'fm-6', sourceField: 'payment_amount', targetField: 'amount_due', isKeyField: false, confidence: 0.92 },
    ],
    matchingRules: [
      { id: 'mr-4', name: 'Invoice Match', matchType: 'EXACT', sourceField: 'invoice_number', targetField: 'ref_no', priority: 1 },
      { id: 'mr-5', name: 'Amount Tolerance', matchType: 'RANGE', sourceField: 'payment_amount', targetField: 'amount_due', tolerance: { amount: 0.01 }, priority: 2 },
    ],
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },
];

// Chat sessions (for unit test mocks only)
export const mockChatSessions = [
  {
    id: 'session-1',
    title: 'Bank Reconciliation Help',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
  },
  {
    id: 'session-2',
    title: 'Rule Configuration',
    createdAt: '2026-01-16T14:00:00Z',
    updatedAt: '2026-01-16T14:45:00Z',
  },
];

// Chat messages (for unit test mocks only)
export const mockChatMessages = [
  {
    id: 'msg-1',
    sessionId: 'session-1',
    role: 'user',
    content: 'How do I reconcile my bank statement with accounting records?',
    timestamp: '2026-01-15T10:00:00Z',
  },
  {
    id: 'msg-2',
    sessionId: 'session-1',
    role: 'assistant',
    content: 'To reconcile your bank statement, follow these steps:\n\n1. Upload your bank statement (CSV or Excel)\n2. Upload your accounting export\n3. I\'ll automatically detect the columns and suggest field mappings\n4. Review and adjust the mappings if needed\n5. Start the reconciliation\n\nWould you like me to help you get started?',
    timestamp: '2026-01-15T10:00:30Z',
  },
];

/**
 * Test data files for E2E testing
 * These will be used to create actual test files for upload
 */
export const testCsvContent = `id,date,description,amount,reference
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

export const testTargetCsvContent = `transaction_id,transaction_date,vendor,amount,category
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
