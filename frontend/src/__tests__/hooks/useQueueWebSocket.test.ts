import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useQueueWebSocket } from '@/hooks/queue/useQueueWebSocket';
import { wsService } from '@/services/socket';

const mockWebSocket = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
};

describe('useQueueWebSocket', () => {
  const queueId = '123';
  const mockQueue = { id: queueId, name: 'Test Queue' };
  const mockTicket = { id: '456', queueId };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "WebSocket").mockImplementation(() => mockWebSocket as any);
  });

  it('connects to WebSocket on mount', () => {
    renderHook(() => useQueueWebSocket({ queueId }));
    expect(wsService.connect).toHaveBeenCalled();
  });

  it('subscribes to queue events', () => {
    renderHook(() => useQueueWebSocket({ queueId }));
    expect(wsService.subscribeToQueue).toHaveBeenCalledWith(queueId);
  });

  it('unsubscribes from queue events on unmount', () => {
    const { unmount } = renderHook(() => useQueueWebSocket({ queueId }));
    unmount();
    expect(wsService.unsubscribeFromQueue).toHaveBeenCalledWith(queueId);
  });

  it('subscribes to all event handlers', () => {
    const handlers = {
      onQueueUpdate: vi.fn(),
      onTicketCreated: vi.fn(),
      onTicketUpdated: vi.fn(),
      onTicketCalled: vi.fn(),
    };

    renderHook(() => useQueueWebSocket({ queueId, ...handlers }));

    expect(wsService.subscribe).toHaveBeenCalledWith('queue:updated', handlers.onQueueUpdate);
    expect(wsService.subscribe).toHaveBeenCalledWith('ticket:created', handlers.onTicketCreated);
    expect(wsService.subscribe).toHaveBeenCalledWith('ticket:updated', handlers.onTicketUpdated);
    expect(wsService.subscribe).toHaveBeenCalledWith('ticket:called', handlers.onTicketCalled);
  });

  it('disconnects WebSocket on unmount', () => {
    const { unmount } = renderHook(() => useQueueWebSocket({ queueId }));
    unmount();
    expect(wsService.disconnect).toHaveBeenCalled();
  });
});
