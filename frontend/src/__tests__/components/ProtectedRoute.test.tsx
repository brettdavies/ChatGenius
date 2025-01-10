import { render, screen } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';

// Mock useAuth0
jest.mock('@auth0/auth0-react');
const mockUseAuth0 = useAuth0 as jest.Mock;

// Mock component to capture location state
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-state">{JSON.stringify(location.state)}</div>;
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('snapshots', () => {
    it('matches snapshot when loading', () => {
      mockUseAuth0.mockReturnValue({
        isLoading: true,
        isAuthenticated: false
      });

      const { container } = render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when authenticated', () => {
      mockUseAuth0.mockReturnValue({
        isLoading: false,
        isAuthenticated: true
      });

      const { container } = render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when not authenticated', () => {
      mockUseAuth0.mockReturnValue({
        isLoading: false,
        isAuthenticated: false
      });

      const { container } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LocationDisplay />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      expect(container).toMatchSnapshot();
    });
  });

  it('shows loading spinner when authentication is loading', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: true,
      isAuthenticated: false
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false
    });

    const testPath = '/protected';

    render(
      <MemoryRouter initialEntries={[testPath]}>
        <Routes>
          <Route path="/login" element={<LocationDisplay />} />
          <Route
            path={testPath}
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Verify we're redirected and the location state is preserved
    const locationState = screen.getByTestId('location-state');
    expect(locationState).toHaveTextContent(testPath);
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('preserves location state when redirecting', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false
    });

    const testPath = '/protected';
    const testState = { someData: 'test-data' };

    render(
      <MemoryRouter initialEntries={[{ pathname: testPath, state: testState }]}>
        <Routes>
          <Route path="/login" element={<LocationDisplay />} />
          <Route
            path={testPath}
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Verify the location state includes both the 'from' path and original state
    const locationState = screen.getByTestId('location-state');
    expect(locationState).toHaveTextContent(testPath);
    expect(locationState).toHaveTextContent('test-data');
  });
}); 