import React from "react";
import { Link } from "react-router-dom";
import type { Notification } from "../../types";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const getNotificationLink = () => {
    if (!notification.related_id) return "#";

    switch (notification.type) {
      case "adoption":
        return `/profile?tab=adoptions`;
      case "rescue":
        return `/rescues/${notification.related_id}`;
      case "report":
        return `/reports/${notification.related_id}`;
      default:
        return "#";
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "adoption":
        return "🐾";
      case "rescue":
        return "🚑";
      case "report":
        return "📋";
      case "system":
        return "🔔";
      default:
        return "📬";
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case "adoption":
        return "bg-green-50 border-green-200";
      case "rescue":
        return "bg-orange-50 border-orange-200";
      case "report":
        return "bg-purple-50 border-purple-200";
      case "system":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Link
      to={getNotificationLink()}
      onClick={handleClick}
      className={`block border-b last:border-b-0 transition-colors hover:bg-gray-50 ${
        !notification.is_read ? "bg-blue-50/50" : ""
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${getNotificationColor()} flex items-center justify-center text-xl border`}
          >
            {getNotificationIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={`text-sm font-medium text-gray-900 ${
                  !notification.is_read ? "font-semibold" : ""
                }`}
              >
                {notification.title}
              </h4>
              {!notification.is_read && (
                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-600 break-words whitespace-normal">
              {notification.message}
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
              <span>{timeAgo(notification.date_created!)}</span>
              <span className="capitalize">{notification.type}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
