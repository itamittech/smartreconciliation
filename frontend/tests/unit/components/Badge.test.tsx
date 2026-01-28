import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../../src/components/ui/Badge';

describe('Badge Component', () => {
  it('renders with text', () => {
    render(<Badge>Status</Badge>);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toBeInTheDocument();
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge).toBeInTheDocument();
  });

  it('renders with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge).toBeInTheDocument();
  });

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge).toBeInTheDocument();
  });

  it('accepts className prop', () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge.className).toContain('custom-badge');
  });

  it('renders status badge correctly', () => {
    const statuses = ['COMPLETED', 'IN_PROGRESS', 'PENDING', 'FAILED'];

    statuses.forEach((status) => {
      const { unmount } = render(<Badge>{status}</Badge>);
      expect(screen.getByText(status)).toBeInTheDocument();
      unmount();
    });
  });
});
