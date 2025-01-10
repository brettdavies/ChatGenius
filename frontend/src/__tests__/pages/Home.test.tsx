import { render, screen, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import Home from '../../pages/Home';

// Mock useAuth0
jest.mock('@auth0/auth0-react');
const mockUseAuth0 = useAuth0 as jest.Mock;

// Mock console methods
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = mockConsoleLog;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe('snapshots', () => {
    it('matches snapshot when not authenticated', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        user: null,
        getAccessTokenSilently: jest.fn()
      });

      const { container } = render(<Home />);
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when authenticated with full user info', () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com'
      };

      mockUseAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: mockUser,
        getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token')
      });

      const { container } = render(<Home />);
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when authenticated without user name', () => {
      const mockUser = {
        email: 'test@example.com'
      };

      mockUseAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: mockUser,
        getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token')
      });

      const { container } = render(<Home />);
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with authentication error', () => {
      const mockError = new Error('Authentication failed');

      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: mockError,
        user: null,
        getAccessTokenSilently: jest.fn()
      });

      const { container } = render(<Home />);
      expect(container).toMatchSnapshot();
    });
  });

  it('shows welcome message when not authenticated', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
      getAccessTokenSilently: jest.fn()
    });

    render(<Home />);

    expect(screen.getByText('Welcome to ChatGenius')).toBeInTheDocument();
    expect(screen.getByText('Please log in to continue')).toBeInTheDocument();
  });

  it('shows user information when authenticated', async () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com'
    };

    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: mockUser,
      getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token')
    });

    render(<Home />);

    expect(screen.getByText('Welcome to ChatGenius')).toBeInTheDocument();
    expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
    expect(screen.getByText('You are now authenticated')).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it('shows generic user name when authenticated but name is not available', () => {
    const mockUser = {
      email: 'test@example.com'
    };

    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: mockUser,
      getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token')
    });

    render(<Home />);

    expect(screen.getByText('Welcome, User')).toBeInTheDocument();
  });

  it('shows error message when there is an authentication error', () => {
    const mockError = new Error('Authentication failed');

    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: mockError,
      user: null,
      getAccessTokenSilently: jest.fn()
    });

    render(<Home />);

    expect(screen.getByText(`Error: ${mockError.message}`)).toBeInTheDocument();
  });

  it('logs authentication state on mount', async () => {
    const mockToken = 'mock-token';
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com'
    };

    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: mockUser,
      getAccessTokenSilently: jest.fn().mockResolvedValue(mockToken)
    });

    // Mock localStorage with proper typing
    const mockLocalStorage: { [key: string]: string } = {
      'auth0.is.authenticated': 'true',
      'auth0.token': mockToken
    };

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn(),
        length: Object.keys(mockLocalStorage).length,
        key: jest.fn((index: number) => Object.keys(mockLocalStorage)[index] || null),
        clear: jest.fn()
      },
      writable: true
    });

    render(<Home />);

    await waitFor(() => {
      // Verify all expected log calls
      expect(mockConsoleLog).toHaveBeenCalledWith('=== Auth0 State in Home ===');
      expect(mockConsoleLog).toHaveBeenCalledWith('Is Authenticated:', true);
      expect(mockConsoleLog).toHaveBeenCalledWith('Is Loading:', false);
      expect(mockConsoleLog).toHaveBeenCalledWith('Error:', null);
      expect(mockConsoleLog).toHaveBeenCalledWith('User:', mockUser);
      expect(mockConsoleLog).toHaveBeenCalledWith('Access Token Available:', true);
      expect(mockConsoleLog).toHaveBeenCalledWith('Token Length:', mockToken.length);
    });
  });

  it('handles token fetch error in logging', async () => {
    const mockError = new Error('Token fetch failed');

    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: { name: 'Test User' },
      getAccessTokenSilently: jest.fn().mockRejectedValue(mockError)
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith('Token Error:', mockError);
    });
  });
}); 