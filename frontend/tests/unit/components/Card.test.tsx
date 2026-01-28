import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../src/components/ui/Card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('accepts className prop', () => {
      render(<Card className="custom-card">Content</Card>);
      const card = screen.getByText('Content').closest('div');
      expect(card?.className).toContain('custom-card');
    });
  });

  describe('CardHeader', () => {
    it('renders children', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('accepts className prop', () => {
      render(<CardHeader className="custom-header">Header</CardHeader>);
      const header = screen.getByText('Header').closest('div');
      expect(header?.className).toContain('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('renders title text', () => {
      render(<CardTitle>My Title</CardTitle>);
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('accepts className prop', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title.className).toContain('custom-title');
    });
  });

  describe('CardContent', () => {
    it('renders content', () => {
      render(<CardContent>Content here</CardContent>);
      expect(screen.getByText('Content here')).toBeInTheDocument();
    });

    it('accepts className prop', () => {
      render(<CardContent className="custom-content">Content</CardContent>);
      const content = screen.getByText('Content').closest('div');
      expect(content?.className).toContain('custom-content');
    });
  });

  describe('Card composition', () => {
    it('renders complete card with all parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome to the dashboard</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome to the dashboard')).toBeInTheDocument();
    });
  });
});
