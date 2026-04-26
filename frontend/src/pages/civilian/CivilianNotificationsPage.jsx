import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { NotificationCard } from "@/components/common/NotificationCard";
import { Spinner } from "@/components/common/Spinner";
import { notificationService } from "@/services/notification.service";

export default function CivilianNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await notificationService.getNotifications();
      setNotifications(response.data?.data || []);
    } catch (fetchError) {
      console.error("Failed to fetch notifications", fetchError);
      const errorMessage =
        fetchError?.response?.data?.message ||
        "Failed to load notifications";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.isRead).length;
  }, [notifications]);

  const handleMarkAsRead = async (notificationId) => {
    if (!notificationId) return;

    try {
      setMarkingId(notificationId);
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
      message.success("Notification marked as read.");
    } catch (markError) {
      console.error("Failed to update notification", markError);
      const errorMessage =
        markError?.response?.data?.message || "Failed to update notification";
      message.error(errorMessage);
    } finally {
      setMarkingId("");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Spinner label="Loading notifications" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="mt-2 text-sm text-slate-600">
          Stay updated with event requests and request responses.
        </p>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Total: {notifications.length}
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Unread: {unreadCount}
        </span>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {sortedNotifications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-600">
          You have no notifications yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedNotifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              isMarking={markingId === notification._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
