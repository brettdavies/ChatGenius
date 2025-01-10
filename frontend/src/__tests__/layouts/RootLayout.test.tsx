import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { MemoryRouter } from 'react-router-dom';
import RootLayout from '../../layouts/RootLayout';

// Mock Auth0
jest.mock('@auth0/auth0-react');

const mockUseAuth0 = useAuth0 as jest.Mock;

describe('RootLayout', () => {
  const mockLogout = jest.fn();
  const mockLoginWithRedirect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLayout = (isAuthenticated = false) => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated,
      logout: mockLogout,
      loginWithRedirect: mockLoginWithRedirect
    });

    return render(
      <MemoryRouter>
        <RootLayout />
      </MemoryRouter>
    );
  };

  test('should render header with app name', () => {
    renderLayout();
    expect(screen.getByText('ChatGenius')).toBeInTheDocument();
  });

  test('should show login button when not authenticated', () => {
    renderLayout(false);
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('should show logout button when authenticated', () => {
    renderLayout(true);
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });

  test('should call loginWithRedirect when login button clicked', () => {
    renderLayout(false);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(mockLoginWithRedirect).toHaveBeenCalled();
  });

  test('should call logout with correct params when logout button clicked', () => {
    renderLayout(true);
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    expect(mockLogout).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin }
    });
  });

  test('should render footer with copyright notice', () => {
    renderLayout();
    expect(screen.getByText(/© 2024 ChatGenius/i)).toBeInTheDocument();
  });

  test('should render main content area', () => {
    renderLayout();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
}); 