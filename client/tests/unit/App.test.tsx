import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('App Component', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to PERN Starter Kit/i)).toBeInTheDocument();
  });

  it('fetches initial count on mount', async () => {
    const mockResponse = { count: 5 };
    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Current count: 5')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/api/counter`
    );
  });

  it('increments count when button is clicked', async () => {
    const initialResponse = { count: 5 };
    const incrementResponse = { count: 6 };

    mockFetch
      .mockResolvedValueOnce({
        json: async () => initialResponse
      })
      .mockResolvedValueOnce({
        json: async () => incrementResponse
      });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Current count: 5')).toBeInTheDocument();
    });

    const button = screen.getByText('Increment Count');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Current count: 6')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/api/counter/increment`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  });

  it('handles fetch errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<App />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Error fetching count:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });
}); 