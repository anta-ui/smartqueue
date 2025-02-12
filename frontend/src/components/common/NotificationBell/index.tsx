import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "@/hooks/notification/useNotifications";
import { Button } from "@/components/common/Button";
import { formatDistanceToNow } from "date-fns";

const notificationColors = {
  INFO: "bg-blue-50 text-blue-700",
  WARNING: "bg-yellow-50 text-yellow-700",
  ERROR: "bg-red-50 text-red-700",
  SUCCESS: "bg-green-50 text-green-700",
};

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    requestPushPermission,
  } = useNotifications();

  const handlePushPermission = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      // Afficher un message de succès
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="relative rounded-full p-1 hover:bg-gray-100 focus:outline-none">
        <BellIcon className="h-6 w-6 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => markAllAsRead()}
                >
                  Mark all as read
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-md ${
                      notification.read ? "opacity-75" : ""
                    } ${notificationColors[notification.type]}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm mt-1">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="mt-2 text-xs opacity-75">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="text-sm font-medium hover:underline mt-2 block"
                      >
                        View details
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handlePushPermission}
              >
                Enable Push Notifications
              </Button>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
