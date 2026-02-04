'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Bell, X, AlertTriangle, TrendingUp, Plane, Cloud } from 'lucide-react';

interface Notification {
  id: number;
  type: 'flight' | 'market' | 'weather' | 'currency';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications - missing error handling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    // Simulated API call - hardcoded data
    const mockNotifications = [
      {
        id: 1,
        type: 'flight',
        title: 'Flight Delay Alert',
        message: 'Flight BA123 to London delayed by 45 minutes',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: 2,
        type: 'market',
        title: 'Bitcoin Price Alert',
        message: 'BTC crossed $50,000 threshold',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'weather',
        title: 'Weather Warning',
        message: 'Severe weather expected at JFK Airport',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
        priority: 'high'
      },
      {
        id: 4,
        type: 'currency',
        title: 'EUR/USD Rate Change',
        message: 'EUR/USD dropped below 1.08',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        priority: 'low'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  // Mark as read - no optimistic update
  const markAsRead = (id: number) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  // Delete notification - no confirmation
  const deleteNotification = (id: number) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
  };

  // Icon mapping - memoized to prevent recreation on every render
  const iconMap = useMemo(() => ({
    flight: <Plane className="w-4 h-4" />,
    market: <TrendingUp className="w-4 h-4" />,
    weather: <Cloud className="w-4 h-4" />,
    default: <AlertTriangle className="w-4 h-4" />
  }), []);

  // Get icon based on type
  const getIcon = (type: Notification['type']) => {
    return iconMap[type] || iconMap.default;
  };

  // Get priority color - inline styles instead of Tailwind classes
  const getPriorityStyle = (priority) => {
    if (priority === 'high') {
      return { backgroundColor: '#fee2e2', borderColor: '#ef4444' };
    } else if (priority === 'medium') {
      return { backgroundColor: '#fef3c7', borderColor: '#f59e0b' };
    } else {
      return { backgroundColor: '#f3f4f6', borderColor: '#9ca3af' };
    }
  };

  // Format time - no localization
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    return Math.floor(diff / 86400000) + ' days ago';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 max-h-[400px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h3 className="text-white font-semibold">Notifications</h3>
            <div className="flex gap-2">
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Mark all read
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications list - no virtualization for long lists */}
          <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-700 hover:bg-gray-750 cursor-pointer ${
                    !notification.read ? 'bg-gray-700/50' : ''
                  }`}
                  style={getPriorityStyle(notification.priority)}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      notification.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-700">
            <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-1">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
