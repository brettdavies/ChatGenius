import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Use Node.js TextEncoder and TextDecoder implementations
Object.defineProperty(global, 'TextEncoder', {
  value: TextEncoder
});

Object.defineProperty(global, 'TextDecoder', {
  value: TextDecoder
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 