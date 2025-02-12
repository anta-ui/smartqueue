import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/mocks/server';
import { NotificationService } from '../index';

describe('NotificationService', () => {
  beforeAll(() => {
    // Start the MSW server before all tests
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    // Reset handlers after each test
    server.resetHandlers();
  });

  afterAll(() => {
    // Clean up after all tests are done
    server.close();
  });

  it('should load notification templates successfully', async () => {
    const templates = await NotificationService.loadTemplates();
    
    expect(templates).toHaveLength(2);
    expect(templates[0]).toEqual({
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to our platform!',
      body: 'Thank you for joining us...',
    });
  });

  it('should load notifications successfully', async () => {
    const notifications = await NotificationService.getNotifications();
    
    expect(notifications).toHaveLength(2);
    expect(notifications[0]).toEqual({
      id: '1',
      title: 'New Message',
      message: 'You have a new message from John',
      read: false,
      createdAt: '2025-01-29T12:00:00Z',
    });
  });

  it('should mark notification as read', async () => {
    const response = await NotificationService.markAsRead('1');
    expect(response.success).toBe(true);
  });

  it('should mark all notifications as read', async () => {
    const response = await NotificationService.markAllAsRead();
    expect(response.success).toBe(true);
  });
});
