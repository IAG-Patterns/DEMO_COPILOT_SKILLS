'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import { Bell, Settings, Trash2, Check, Filter } from 'lucide-react';

// TypeScript interfaces for type safety
interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: string;
}

interface NotificationSettings {
  flightAlerts: boolean;
  priceAlerts: boolean;
  weatherAlerts: boolean;
  emailNotifications: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    flightAlerts: true,
    priceAlerts: true,
    weatherAlerts: true,
    emailNotifications: false
  });

  // Loading state with simulated fetch
  useEffect(() => {
    setLoading(true);
    // Simulated fetch - no error handling
    const data = generateMockNotifications();
    setNotifications(data);
    setLoading(false);
  }, []);

  // Generate mock data - inefficient, regenerates on every call
  function generateMockNotifications(): Notification[] {
    const notifications: Notification[] = [];
    for (let i = 0; i < 20; i++) {
      notifications.push({
        id: i + 1,
        type: ['flight', 'market', 'weather', 'currency'][Math.floor(Math.random() * 4)],
        title: `Notification ${i + 1}`,
        message: `This is notification message number ${i + 1}. It contains important information.`,
        timestamp: new Date(Date.now() - Math.random() * 604800000).toISOString(),
        read: Math.random() > 0.5,
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
      });
    }
    return notifications;
  }

  // Filter notifications - no memoization
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  // Bulk actions with confirmation dialog
  const deleteAll = () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      setNotifications([]);
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Toggle setting - no persistence
  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-7 h-7" />
            Notification Center
          </h1>
          <p className="text-gray-400 mt-1">Manage your alerts and notifications</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={markAllRead}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Check size={16} />
            Mark All Read
          </button>
          <button 
            onClick={deleteAll}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main notifications list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter bar */}
          <Card>
            <div className="flex items-center gap-4 flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              {['all', 'unread', 'flight', 'market', 'weather', 'currency'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-sm capitalize ${
                    filter === f 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Card>

          {/* Notifications list - no pagination */}
          <div className="space-y-3">
            {loading ? (
              <Card>
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p>Loading notifications...</p>
                </div>
              </Card>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <div className="text-center py-8 text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications found</p>
                </div>
              </Card>
            ) : (
              filteredNotifications.map(notification => (
                <Card key={notification.id}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      notification.priority === 'high' ? 'bg-red-500/20' :
                      notification.priority === 'medium' ? 'bg-yellow-500/20' :
                      'bg-gray-700'
                    }`}>
                      <Bell className={`w-5 h-5 ${
                        notification.priority === 'high' ? 'text-red-400' :
                        notification.priority === 'medium' ? 'text-yellow-400' :
                        'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          notification.type === 'flight' ? 'bg-blue-500/20 text-blue-400' :
                          notification.type === 'market' ? 'bg-green-500/20 text-green-400' :
                          notification.type === 'weather' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {notification.type}
                        </span>
                        {!notification.read && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setNotifications(notifications.filter(n => n.id !== notification.id));
                      }}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Settings sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5" />
              Notification Settings
            </h3>
            <div className="space-y-4">
              {(Object.entries(settings) as [keyof NotificationSettings, boolean][]).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {/* Custom toggle with proper accessibility */}
                  <button
                    onClick={() => toggleSetting(key)}
                    role="switch"
                    aria-checked={value}
                    aria-label={key.replace(/([A-Z])/g, ' $1').trim()}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats card - hardcoded calculations */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total</span>
                <span className="text-white">{notifications.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Unread</span>
                <span className="text-blue-400">{notifications.filter(n => !n.read).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">High Priority</span>
                <span className="text-red-400">{notifications.filter(n => n.priority === 'high').length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
