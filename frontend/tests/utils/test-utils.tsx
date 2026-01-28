import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface WrapperProps {
  children: ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Utility function to wait for loading states
export const waitForLoadingToFinish = async () => {
  // Wait for any pending promises
  await new Promise((resolve) => setTimeout(resolve, 0));
};

// Mock data generators
export const createMockFile = (overrides = {}) => ({
  id: 'file-' + Math.random().toString(36).substr(2, 9),
  filename: 'test-file.csv',
  originalFilename: 'test-file.csv',
  filePath: '/uploads/test-file.csv',
  fileSize: 1024,
  mimeType: 'text/csv',
  status: 'PROCESSED',
  rowCount: 100,
  columnCount: 5,
  detectedSchema: [],
  uploadedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockReconciliation = (overrides = {}) => ({
  id: 'recon-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Reconciliation',
  description: 'Test description',
  status: 'PENDING',
  sourceFileId: 'file-1',
  targetFileId: 'file-2',
  ruleSetId: 'rule-1',
  totalSourceRecords: 100,
  totalTargetRecords: 100,
  matchedRecords: 95,
  unmatchedRecords: 5,
  exceptionCount: 5,
  matchRate: 95.0,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockException = (overrides = {}) => ({
  id: 'exc-' + Math.random().toString(36).substr(2, 9),
  reconciliationId: 'recon-1',
  type: 'MISMATCH',
  severity: 'HIGH',
  status: 'OPEN',
  sourceRecordId: 'src-1',
  targetRecordId: 'tgt-1',
  sourceData: { id: '1', amount: '100' },
  targetData: { id: '1', amount: '99' },
  details: { field: 'amount', variance: '1' },
  aiSuggestion: 'Consider rounding difference',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockRuleSet = (overrides = {}) => ({
  id: 'rule-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Rule Set',
  description: 'Test description',
  isActive: true,
  fieldMappings: [
    { id: 'fm-1', sourceField: 'id', targetField: 'id', isKeyField: true },
  ],
  matchingRules: [
    { id: 'mr-1', name: 'Exact ID', matchType: 'EXACT', sourceField: 'id', targetField: 'id' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockDashboardMetrics = (overrides = {}) => ({
  totalReconciliations: 10,
  completedReconciliations: 8,
  pendingReconciliations: 1,
  inProgressReconciliations: 1,
  totalExceptions: 50,
  openExceptions: 20,
  resolvedExceptions: 25,
  ignoredExceptions: 5,
  overallMatchRate: 92.5,
  matchRateHistory: [],
  ...overrides,
});

// Custom matchers
export const expectApiCall = async (
  mockFn: jest.Mock | ReturnType<typeof vi.fn>,
  endpoint: string,
  method: string = 'GET'
) => {
  expect(mockFn).toHaveBeenCalled();
  const calls = mockFn.mock.calls;
  const matchingCall = calls.find(
    (call: unknown[]) => call[0]?.includes(endpoint) && call[1]?.method === method
  );
  expect(matchingCall).toBeTruthy();
};

// Import vi for TypeScript
import { vi } from 'vitest';
