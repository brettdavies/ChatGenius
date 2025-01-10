import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Login from '../../pages/Login';

// Mock useAuth0
jest.mock('@auth0/auth0-react');
const mockUseAuth0 = useAuth0 as jest.Mock;

// Mock component to capture navigation
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('Login', () => {
  const mockLoginWithRedirect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('snapshots', () => {
    it('matches snapshot when loading', () => {
      mockUseAuth0.mockReturnValue({
        isLoading: true,
        isAuthenticated: false,
        loginWithRedirect: mockLoginWithRedirect
      });

      const { container } = render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when not authenticated', () => {
      mockUseAuth0.mockReturnValue({
        isLoading: false,
        isAuthenticated: false,
        loginWithRedirect: mockLoginWithRedirect
      });

      const { container } = render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when authenticated', () => {
      mockUseAuth0.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        loginWithRedirect: mockLoginWithRedirect
      });

      const { container } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      );
      expect(container).toMatchSnapshot();
    });
  });

  it('shows loading spinner when authentication is loading', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to home when already authenticated', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      loginWithRedirect: mockLoginWithRedirect
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('location-display')).toHaveTextContent('/');
  });

  it('redirects to previous location when authenticated', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      loginWithRedirect: mockLoginWithRedirect
    });

    const previousPath = '/dashboard';
    
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: previousPath } } }]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path={previousPath} element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('location-display')).toHaveTextContent(previousPath);
  });

  it('renders login page when not authenticated', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome to ChatGenius')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to continue')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls loginWithRedirect with correct parameters when sign in button is clicked', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect
    });

    const previousPath = '/dashboard';
    
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: previousPath } } }]}>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockLoginWithRedirect).toHaveBeenCalledWith({
      appState: { returnTo: previousPath }
    });
  });

  it('calls loginWithRedirect with default path when no previous location', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockLoginWithRedirect).toHaveBeenCalledWith({
      appState: { returnTo: undefined }
    });
  });
}); 