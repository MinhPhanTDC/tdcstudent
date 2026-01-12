import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render title as heading', () => {
    render(<EmptyState title="No items found" />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('No items found');
  });

  it('should render description when provided', () => {
    render(
      <EmptyState
        title="No items"
        description="Try adding some items to get started"
      />
    );
    expect(screen.getByText('Try adding some items to get started')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    render(<EmptyState title="No items" />);
    const description = document.querySelector('p.text-secondary-500');
    expect(description).not.toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    const TestIcon = () => <svg data-testid="test-icon" />;
    render(<EmptyState title="No items" icon={<TestIcon />} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should not render icon container when icon not provided', () => {
    render(<EmptyState title="No items" />);
    const iconContainer = document.querySelector('.mb-4.text-secondary-400');
    expect(iconContainer).not.toBeInTheDocument();
  });

  it('should render action when provided', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={<button onClick={handleClick}>Add Item</button>}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not render action container when action not provided', () => {
    render(<EmptyState title="No items" />);
    const actionContainer = document.querySelector('.mt-6');
    expect(actionContainer).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<EmptyState title="No items" className="custom-empty-class" />);
    const container = document.querySelector('.custom-empty-class');
    expect(container).toBeInTheDocument();
  });

  it('should center content', () => {
    render(<EmptyState title="No items" />);
    const container = document.querySelector('.flex.flex-col.items-center.justify-center');
    expect(container).toBeInTheDocument();
  });

  it('should have proper text styling', () => {
    render(
      <EmptyState
        title="No items"
        description="Description text"
      />
    );
    
    const title = screen.getByRole('heading');
    expect(title).toHaveClass('text-lg', 'font-medium', 'text-secondary-900');
    
    const description = screen.getByText('Description text');
    expect(description).toHaveClass('text-sm', 'text-secondary-500');
  });
});
