import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationBell } from "@/components/common/NotificationBell";
import { useNotifications } from "@/hooks/notification/useNotifications";

// Mock the useNotifications hook
vi.mock("@/hooks/notification/useNotifications");

const mockNotifications = [
  {
    id: "1",
    title: "Test Notification",
    message: "This is a test notification",
    type: "INFO",
    read: false,
    createdAt: new Date().toISOString(),
  },
];

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      requestPushPermission: vi.fn(),
    });
  });

  it("renders correctly", () => {
    render(<NotificationBell />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows unread count badge", () => {
    render(<NotificationBell />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("opens notification menu on click", async () => {
    render(<NotificationBell />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Test Notification")).toBeInTheDocument();
    });
  });

  it("marks notification as read when clicked", async () => {
    const markAsRead = vi.fn();
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead,
      markAllAsRead: vi.fn(),
      requestPushPermission: vi.fn(),
    });

    render(<NotificationBell />);
    
    // Open the menu
    fireEvent.click(screen.getByRole("button"));
    
    // Wait for notification to appear
    await waitFor(() => {
      expect(screen.getByText("Test Notification")).toBeInTheDocument();
    });

    // Click the notification
    fireEvent.click(screen.getByText("Test Notification"));
    
    expect(markAsRead).toHaveBeenCalledWith("1");
  });

  it("marks all notifications as read", async () => {
    const markAllAsRead = vi.fn();
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead,
      requestPushPermission: vi.fn(),
    });

    render(<NotificationBell />);
    
    // Open the menu
    fireEvent.click(screen.getByRole("button"));
    
    // Click "Mark all as read"
    const markAllButton = await screen.findByText(/mark all as read/i);
    fireEvent.click(markAllButton);
    
    expect(markAllAsRead).toHaveBeenCalled();
  });

  it("shows loading state", () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: true,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      requestPushPermission: vi.fn(),
    });

    render(<NotificationBell />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows empty state when no notifications", () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      requestPushPermission: vi.fn(),
    });

    render(<NotificationBell />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("requests push permission when enabling notifications", async () => {
    const requestPushPermission = vi.fn().mockResolvedValue(true);
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      requestPushPermission,
    });

    render(<NotificationBell />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    const enableButton = await screen.findByText("Enable Push Notifications");
    fireEvent.click(enableButton);

    expect(requestPushPermission).toHaveBeenCalled();
  });
});
