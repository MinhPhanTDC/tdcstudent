import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('should render with children', () => {
    render(<Badge>Active</Badge>);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  describe('variants', () => {
    it('should render default variant', () => {
      render(<Badge>Default</Badge>);

      expect(screen.getByText('Default')).toHaveClass('bg-secondary-100');
    });

    it('should render primary variant', () => {
      render(<Badge variant="primary">Primary</Badge>);

      expect(screen.getByText('Primary')).toHaveClass('bg-primary-100');
    });

    it('should render success variant', () => {
      render(<Badge variant="success">Success</Badge>);

      expect(screen.getByText('Success')).toHaveClass('bg-green-100');
    });

    it('should render warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);

      expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100');
    });

    it('should render danger variant', () => {
      render(<Badge variant="danger">Danger</Badge>);

      expect(screen.getByText('Danger')).toHaveClass('bg-red-100');
    });
  });

  it('should accept custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);

    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });
});
