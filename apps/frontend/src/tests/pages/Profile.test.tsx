import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePage } from '../../pages/Profile';

describe('ProfilePage', () => {
  it('renders page title', () => {
    render(<ProfilePage />);
    expect(screen.getByText('My Profile')).toBeInTheDocument();
  });

  it('renders profile card', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
  });

  it('renders profile information section', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
  });

  it('renders edit button', () => {
    render(<ProfilePage />);
    const editButton = screen.getByText('Edit');
    expect(editButton).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(<ProfilePage />);
    expect(screen.getByDisplayValue('Dr. John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@hitu.edu')).toBeInTheDocument();
  });

  it('renders member since information', () => {
    render(<ProfilePage />);
    expect(screen.getByText(/Member since/)).toBeInTheDocument();
  });
});
