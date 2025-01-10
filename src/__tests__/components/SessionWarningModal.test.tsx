import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import SessionWarningModal from '../../components/SessionWarningModal';

// Mock useAuth0
jest.mock('@auth0/auth0-react');
const mockUseAuth0 = useAuth0 as jest.Mock;

describe('SessionWarningModal', () => {
  const mockOnExtend = jest.fn();
  const mockOnClose = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth0.mockReturnValue({ logout: mockLogout });
  });

  describe('snapshots', () => {
    it('matches snapshot when modal is closed', () => {
      const { container } = render(
        <SessionWarningModal
          isOpen={false}
          remainingMinutes={5}
          onExtend={mockOnExtend}
          onClose={mockOnClose}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when modal is open', () => {
      const { container } = render(
        <SessionWarningModal
          isOpen={true}
          remainingMinutes={5}
          onExtend={mockOnExtend}
          onClose={mockOnClose}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with different remaining minutes', () => {
      const { container } = render(
        <SessionWarningModal
          isOpen={true}
          remainingMinutes={1}
          onExtend={mockOnExtend}
          onClose={mockOnClose}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  it('renders nothing when isOpen is false', () => {
    render(
      <SessionWarningModal
        isOpen={false}
        remainingMinutes={5}
        onExtend={mockOnExtend}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal content when isOpen is true', () => {
    const remainingMinutes = 5;
    
    render(
      <SessionWarningModal
        isOpen={true}
        remainingMinutes={remainingMinutes}
        onExtend={mockOnExtend}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Session Expiring Soon')).toBeInTheDocument();
    expect(screen.getByText(/Your session will expire in approximately/)).toBeInTheDocument();
    expect(screen.getByText('Extend Session')).toBeInTheDocument();
    expect(screen.getByText('Logout Now')).toBeInTheDocument();
  });

  it('calls onExtend when extend session button is clicked', () => {
    render(
      <SessionWarningModal
        isOpen={true}
        remainingMinutes={5}
        onExtend={mockOnExtend}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('Extend Session'));
    expect(mockOnExtend).toHaveBeenCalledTimes(1);
  });

  it('calls logout and onClose when logout button is clicked', () => {
    render(
      <SessionWarningModal
        isOpen={true}
        remainingMinutes={5}
        onExtend={mockOnExtend}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('Logout Now'));
    expect(mockLogout).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin }
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays correct remaining minutes', () => {
    const remainingMinutes = 3;
    
    render(
      <SessionWarningModal
        isOpen={true}
        remainingMinutes={remainingMinutes}
        onExtend={mockOnExtend}
        onClose={mockOnClose}
      />
    );

    // Use a more flexible text matcher that accounts for whitespace and line breaks
    expect(screen.getByText((content) => {
      return content.includes(`${remainingMinutes} minutes`) &&
             content.includes('Your session will expire in approximately');
    })).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(
      <SessionWarningModal
        isOpen={true}
        remainingMinutes={5}
        onExtend={mockOnExtend}
        onClose={mockOnClose}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'session-warning-title');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Session Expiring Soon')).toHaveAttribute('id', 'session-warning-title');
  });
}); 