import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders with title and description', () => {
    render(
      <EmptyState
        title="No Data"
        description="There is no data to display"
      />
    );
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('There is no data to display')).toBeInTheDocument();
  });

  it('renders with inbox icon', () => {
    const { container } = render(<EmptyState icon="inbox" title="Test" />);
    const icon = container.querySelector('.w-24.h-24');
    expect(icon).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const customIcon = <div data-testid="custom-icon">Custom</div>;
    render(<EmptyState icon={customIcon} title="Test" />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const mockAction = vi.fn();
    render(
      <EmptyState
        title="Test"
        action={{ label: 'Add Item', onClick: mockAction }}
      />
    );
    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();
    button.click();
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState title="Test" />);
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });
});
