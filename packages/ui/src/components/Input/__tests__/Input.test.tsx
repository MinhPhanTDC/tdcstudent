import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Input label="Email" />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should render with placeholder', () => {
    render(<Input placeholder="Enter email" />);

    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('should handle value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should display error message', () => {
    render(<Input error="This field is required" />);

    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('should have error styling when error is present', () => {
    render(<Input error="Error" />);

    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('should display helper text', () => {
    render(<Input helperText="Enter your email address" />);

    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('should not display helper text when error is present', () => {
    render(<Input helperText="Helper" error="Error" />);

    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should have aria-invalid when error is present', () => {
    render(<Input error="Error" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('should associate label with input', () => {
    render(<Input label="Username" id="username" />);

    const input = screen.getByRole('textbox');
    const label = screen.getByText('Username');

    expect(label).toHaveAttribute('for', 'username');
    expect(input).toHaveAttribute('id', 'username');
  });
});
