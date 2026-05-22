import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonTable, SkeletonCard } from '../../components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('.bg-slate-700\\/50');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders with text variant', () => {
    const { container } = render(<Skeleton variant="text" />);
    const skeleton = container.querySelector('.rounded');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders with circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const skeleton = container.querySelector('.rounded-full');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies custom width and height', () => {
    const { container } = render(<Skeleton width={100} height={50} />);
    const skeleton = container.querySelector('.bg-slate-700\\/50');
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
  });
});

describe('SkeletonTable', () => {
  it('renders with default rows and columns', () => {
    render(<SkeletonTable />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(6); // 1 header + 5 data rows
  });

  it('renders with custom rows', () => {
    render(<SkeletonTable rows={3} />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(4); // 1 header + 3 data rows
  });
});

describe('SkeletonCard', () => {
  it('renders card skeleton', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.querySelector('.p-6');
    expect(card).toBeInTheDocument();
  });
});
