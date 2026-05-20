import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll({ limit: 50 });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getIcon = (type) => {
    const icons = { transfer: '↔️', loan: '💵', payment: '💳', alert: '🔔' };
    return icons[type] || '🔔';
  };

  if (loading) {
    return <div className="spinner" />;
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn btn-ghost">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`notification-item ${notif.read ? '' : 'unread'}`}
              onClick={() => !notif.read && handleMarkAsRead(notif._id)}
            >
              <div className="notif-icon">{getIcon(notif.type)}</div>
              <div className="notif-content">
                <span className="notif-title">{notif.title}</span>
                <span className="notif-message">{notif.message}</span>
                <span className="notif-time">{formatTime(notif.createdAt)}</span>
              </div>
              {!notif.read && <div className="unread-dot" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">No notifications yet</div>
      )}
    </div>
  );
};

export default Notifications;
