import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from '../mocks/server';

// Extend Vitest's expect method with methods from @testing-library/jest-dom
expect.extend(matchers);

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Mock timers
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-29T15:34:28Z'));
});

afterEach(() => {
  vi.useRealTimers();
});
