import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Toast, ToastContainer } from '../../components/ui/Toast';

describe('Toast', () => {
  it('renders toast with title and message', () => {
    const mockClose = vi.fn();
    render(
      <Toast
        id="1"
        type="success"
        title="Success"
        message="Operation completed"
        onClose={mockClose}
      />
    );
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('renders success type with correct styling', () => {
    const { container } = render(
      <Toast
        id="1"
        type="success"
        title="Success"
        onClose={vi.fn()}
      />
    );
    const toast = container.querySelector('.from-emerald-500\\/20');
    expect(toast).toBeInTheDocument();
  });

  it('renders error type with correct styling', () => {
    const { container } = render(
      <Toast
        id="1"
        type="error"
        title="Error"
        onClose={vi.fn()}
      />
    );
    const toast = container.querySelector('.from-red-500\\/20');
    expect(toast).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockClose = vi.fn();
    const { container } = render(
      <Toast
        id="1"
        type="info"
        title="Info"
        onClose={mockClose}
      />
    );
    const closeButton = container.querySelector('button');
    closeButton?.click();
    expect(mockClose).toHaveBeenCalledWith('1');
  });

  it('auto-dismisses after duration', async () => {
    const mockClose = vi.fn();
    render(
      <Toast
        id="1"
        type="info"
        title="Info"
        duration={100}
        onClose={mockClose}
      />
    );
    await waitFor(
      () => expect(mockClose).toHaveBeenCalledWith('1'),
      { timeout: 200 }
    );
  });
});

describe('ToastContainer', () => {
  it('renders multiple toasts', () => {
    const toasts = [
      { id: '1', type: 'success' as const, title: 'Success 1' },
      { id: '2', type: 'error' as const, title: 'Error 1' },
    ];
    const { container } = render(
      <ToastContainer toasts={toasts} onClose={vi.fn()} />
    );
    const toastElements = container.querySelectorAll('.p-4');
    expect(toastElements.length).toBe(2);
  });

  it('renders empty when no toasts', () => {
    const { container } = render(
      <ToastContainer toasts={[]} onClose={vi.fn()} />
    );
    const toastElements = container.querySelectorAll('.p-4');
    expect(toastElements.length).toBe(0);
  });
});
