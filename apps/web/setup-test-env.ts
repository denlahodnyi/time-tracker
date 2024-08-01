// import { installGlobals } from '@remix-run/node';
import '@testing-library/jest-dom';

// This installs globals such as "fetch", "Response", "Request" and "Headers".
// installGlobals();

beforeAll(() => {
  // Mock matchMedia which JSDOM hasn't implemented yet
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});
