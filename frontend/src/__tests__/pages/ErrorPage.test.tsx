import { render, screen } from '@testing-library/react';
import { useRouteError } from 'react-router-dom';
import ErrorPage from '../../pages/ErrorPage';

// Mock useRouteError
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteError: jest.fn()
}));

const mockUseRouteError = useRouteError as jest.Mock;

describe('ErrorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('snapshots', () => {
    it('matches snapshot with Error object', () => {
      mockUseRouteError.mockReturnValue(new Error('Test error message'));
      const { container } = render(<ErrorPage />);
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with route error response', () => {
      mockUseRouteError.mockReturnValue({
        statusText: 'Not Found',
        data: 'Page not found',
        status: 404,
        internal: true,
        error: new Error(),
      });
      const { container } = render(<ErrorPage />);
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with string error', () => {
      mockUseRouteError.mockReturnValue('Direct string error message');
      const { container } = render(<ErrorPage />);
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with unknown error type', () => {
      mockUseRouteError.mockReturnValue({ custom: 'error' });
      const { container } = render(<ErrorPage />);
      expect(container).toMatchSnapshot();
    });
  });

  it('renders common error elements', () => {
    mockUseRouteError.mockReturnValue(new Error('Test error'));

    render(<ErrorPage />);

    expect(screen.getByText('Oops!')).toBeInTheDocument();
    expect(screen.getByText('Sorry, an unexpected error has occurred.')).toBeInTheDocument();
  });

  it('displays error message from Error object', () => {
    const errorMessage = 'Test error message';
    mockUseRouteError.mockReturnValue(new Error(errorMessage));

    render(<ErrorPage />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays error message from route error response with statusText', () => {
    const errorStatusText = 'Not Found';
    mockUseRouteError.mockReturnValue({
      statusText: errorStatusText,
      data: 'Some data',
      status: 404,
      internal: true,
      error: new Error(),
    });

    render(<ErrorPage />);

    expect(screen.getByText(errorStatusText)).toBeInTheDocument();
  });

  it('displays error message from route error response with data when statusText is empty', () => {
    const errorData = 'Error data message';
    mockUseRouteError.mockReturnValue({
      statusText: '',
      data: errorData,
      status: 500,
      internal: true,
      error: new Error(),
    });

    render(<ErrorPage />);

    expect(screen.getByText(errorData)).toBeInTheDocument();
  });

  it('displays string error message directly', () => {
    const errorMessage = 'Direct string error message';
    mockUseRouteError.mockReturnValue(errorMessage);

    render(<ErrorPage />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays "Unknown error" for unhandled error types', () => {
    mockUseRouteError.mockReturnValue({ custom: 'error' });

    render(<ErrorPage />);

    expect(screen.getByText('Unknown error')).toBeInTheDocument();
  });

  it('handles null error gracefully', () => {
    mockUseRouteError.mockReturnValue(null);

    render(<ErrorPage />);

    expect(screen.getByText('Unknown error')).toBeInTheDocument();
  });

  it('handles undefined error gracefully', () => {
    mockUseRouteError.mockReturnValue(undefined);

    render(<ErrorPage />);

    expect(screen.getByText('Unknown error')).toBeInTheDocument();
  });
}); 