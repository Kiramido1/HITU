import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsPage } from '../../pages/Settings';

describe('SettingsPage', () => {
  it('renders page title', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders profile settings section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
  });

  it('renders notification settings section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders security settings section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('renders appearance settings section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('renders save changes button', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('renders form inputs', () => {
    render(<SettingsPage />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
