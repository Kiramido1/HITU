import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingScreen } from '../../components/ui/LoadingScreen';

describe('LoadingScreen', () => {
  it('renders with default message', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingScreen message="Custom loading message" />);
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingScreen size="sm" />);
    const loader = container.querySelector('.w-8.h-8');
    expect(loader).toBeInTheDocument();
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingScreen size="lg" />);
    const loader = container.querySelector('.w-16.h-16');
    expect(loader).toBeInTheDocument();
  });
});
