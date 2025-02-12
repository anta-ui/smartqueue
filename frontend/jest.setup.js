import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
}));

// Mock WebSocket service
jest.mock('@/services/socket', () => ({
  wsService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribeToQueue: jest.fn(),
    unsubscribeFromQueue: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));
