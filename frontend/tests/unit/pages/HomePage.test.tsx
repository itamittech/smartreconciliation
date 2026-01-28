import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render, createMockDashboardMetrics } from '../../utils/test-utils';
import { HomePage } from '../../../src/pages/HomePage';

// Mock the hooks module
vi.mock('../../../src/services/hooks', () => ({
  useDashboardMetrics: vi.fn(),
}));

import { useDashboardMetrics } from '../../../src/services/hooks';

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    vi.mocked(useDashboardMetrics).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<HomePage />);

    // Loading indicator should be present
    expect(
      screen.getByText(/loading/i) ||
      document.querySelector('.animate-spin') ||
      document.querySelector('[class*="loading"]')
    ).toBeTruthy();
  });

  it('renders dashboard with metrics', async () => {
    const mockMetrics = createMockDashboardMetrics();

    vi.mocked(useDashboardMetrics).mockReturnValue({
      data: { success: true, data: mockMetrics },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<HomePage />);

    await waitFor(() => {
      // Page shows "Welcome back" instead of "Dashboard"
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    // Stats should be visible
    expect(screen.getByText(/total reconciliations/i)).toBeInTheDocument();
    // Use getAllByText since "Match Rate" appears in stats card and chart
    expect(screen.getAllByText(/match rate/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/open exceptions/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    vi.mocked(useDashboardMetrics).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<HomePage />);

    // Error message should be shown - use specific text to avoid multiple matches
    expect(screen.getByText(/failed to load dashboard/i)).toBeInTheDocument();
  });

  it('displays correct metric values', async () => {
    const mockMetrics = createMockDashboardMetrics({
      totalReconciliations: 25,
      overallMatchRate: 95.5,
      openExceptions: 15,
    });

    vi.mocked(useDashboardMetrics).mockReturnValue({
      data: { success: true, data: mockMetrics },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    // Match rate should show percentage
    expect(screen.getByText(/95\.5/)).toBeInTheDocument();
  });

  it('renders quick actions section', async () => {
    const mockMetrics = createMockDashboardMetrics();

    vi.mocked(useDashboardMetrics).mockReturnValue({
      data: { success: true, data: mockMetrics },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
    });
  });

  it('renders recent reconciliations section', async () => {
    const mockMetrics = createMockDashboardMetrics();

    vi.mocked(useDashboardMetrics).mockReturnValue({
      data: { success: true, data: mockMetrics },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/recent reconciliations/i)).toBeInTheDocument();
    });
  });
});
