import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/notifications/templates', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Welcome Email',
        subject: 'Welcome to our platform!',
        body: 'Thank you for joining us...',
      },
      {
        id: '2',
        name: 'Password Reset',
        subject: 'Password Reset Request',
        body: 'You have requested a password reset...',
      },
    ]);
  }),

  http.get('/api/notifications', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'New Message',
        message: 'You have a new message from John',
        read: false,
        createdAt: '2025-01-29T12:00:00Z',
      },
      {
        id: '2',
        title: 'System Update',
        message: 'System maintenance scheduled for tonight',
        read: true,
        createdAt: '2025-01-29T10:00:00Z',
      },
    ]);
  }),

  http.post('/api/notifications/mark-read', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/notifications/mark-all-read', () => {
    return HttpResponse.json({ success: true });
  }),
];
