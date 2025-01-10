import { render, screen, fireEvent, act } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import SessionManager from '../../components/SessionManager';

// Mock useAuth0
jest.mock('@auth0/auth0-react');
const mockUseAuth0 = useAuth0 as jest.Mock;

describe('SessionManager', () => {
  const mockLogout = jest.fn();
  const mockGetAccessTokenSilently = jest.fn();
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup default mock implementation
    mockUseAuth0.mockReturnValue({
      logout: mockLogout,
      getAccessTokenSilently: mockGetAccessTokenSilently
    });

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children correctly', () => {
    render(
      <SessionManager>
        <div data-testid="child">Test Child</div>
      </SessionManager>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('initializes last activity on mount', () => {
    render(<SessionManager><div /></SessionManager>);
    expect(localStorage.getItem('lastActivity')).not.toBeNull();
  });

  it('resets timer on user activity', () => {
    render(<SessionManager><div /></SessionManager>);
    const initialTime = localStorage.getItem('lastActivity');
    
    // Fast-forward 1 minute
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    
    // Simulate user activity
    fireEvent.mouseDown(document);
    
    const newTime = localStorage.getItem('lastActivity');
    expect(newTime).not.toBe(initialTime);
  });

  it('shows warning modal when approaching timeout', () => {
    const timeoutMinutes = 10;
    const warningMinutes = 2;
    
    render(
      <SessionManager timeoutMinutes={timeoutMinutes} warningMinutes={warningMinutes}>
        <div />
      </SessionManager>
    );

    // Fast-forward to just before warning time
    act(() => {
      jest.advanceTimersByTime((timeoutMinutes - warningMinutes) * 60 * 1000);
    });

    // Check for warning modal
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('logs out user when session expires', () => {
    const timeoutMinutes = 10;
    
    render(
      <SessionManager timeoutMinutes={timeoutMinutes}>
        <div />
      </SessionManager>
    );

    // Fast-forward past timeout
    act(() => {
      jest.advanceTimersByTime(timeoutMinutes * 60 * 1000 + 1000);
    });

    expect(mockLogout).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin }
    });
  });

  it('extends session when requested', async () => {
    mockGetAccessTokenSilently.mockResolvedValueOnce('new-token');
    
    render(
      <SessionManager>
        <div />
      </SessionManager>
    );

    // Fast-forward to show warning
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000); // 25 minutes (with default 30 min timeout)
    });

    // Click extend session button
    const extendButton = screen.getByText(/extend session/i);
    await act(async () => {
      fireEvent.click(extendButton);
    });

    expect(mockGetAccessTokenSilently).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('handles session extension failure', async () => {
    mockGetAccessTokenSilently.mockRejectedValueOnce(new Error('Token error'));
    
    render(
      <SessionManager>
        <div />
      </SessionManager>
    );

    // Fast-forward to show warning
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // Click extend session button
    const extendButton = screen.getByText(/extend session/i);
    await act(async () => {
      fireEvent.click(extendButton);
    });

    expect(mockLogout).toHaveBeenCalled();
  });
}); 