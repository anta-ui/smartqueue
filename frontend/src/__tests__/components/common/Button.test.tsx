import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/common/Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('opacity-50');
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="secondary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');

    rerender(<Button variant="destructive">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });

  it('applies size styles', () => {
    const { rerender } = render(<Button size="sm">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9 px-3');

    rerender(<Button size="lg">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11 px-8');
  });
});
