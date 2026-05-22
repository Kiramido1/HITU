import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuditLogsPage } from '../../pages/AuditLogs';

describe('AuditLogsPage', () => {
  it('renders page title', () => {
    render(<AuditLogsPage />);
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it('renders export logs button', () => {
    render(<AuditLogsPage />);
    expect(screen.getByText('Export Logs')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<AuditLogsPage />);
    const searchInput = screen.getByPlaceholderText('Search logs...');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders filter dropdown', () => {
    render(<AuditLogsPage />);
    const filter = screen.getByRole('combobox');
    expect(filter).toBeInTheDocument();
  });

  it('renders audit log table', () => {
    render(<AuditLogsPage />);
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Entity')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('renders log entries', () => {
    render(<AuditLogsPage />);
    expect(screen.getByText('CREATE')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
    expect(screen.getByText('DELETE')).toBeInTheDocument();
  });

  it('renders severity badges', () => {
    render(<AuditLogsPage />);
    expect(screen.getByText('INFO')).toBeInTheDocument();
    expect(screen.getByText('WARNING')).toBeInTheDocument();
    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });
});
