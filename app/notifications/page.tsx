'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import { Bell, Settings, Trash2, Check, Filter } from 'lucide-react';

// Notification type definition
interface Notification {
  id: number;
  type: 'flight' | 'market' | 'weather' | 'currency';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationSettings {
  flightAlerts: boolean;
  priceAlerts: boolean;
  weatherAlerts: boolean;
  emailNotifications: boolean;
}

const STORAGE_KEY = 'dashboard_notifications';
const SETTINGS_KEY = 'notification_settings';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    flightAlerts: true,
    priceAlerts: true,
    weatherAlerts: true,
    emailNotifications: false
  });

  // Load notifications from localStorage
  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, []);

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Failed to load notifications'); // Debug log left in
    }
  };

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Failed to load settings'); // Debug log left in
    }
  };

  const saveNotifications = (notifs: Notification[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
  };

  // Filter notifications - no memoization
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  // Bulk actions - missing confirmation dialogs
  const deleteAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  // Toggle setting - no persistence
  const toggleSetting = (key: keyof NotificationSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    console.log('Setting toggled:', key); // Debug log left in
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
            {filteredNotifications.length == 0 ? ( // Using == instead of ===
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
                      notification.priority == 'high' ? 'bg-red-500/20' : // Using ==
                      notification.priority == 'medium' ? 'bg-yellow-500/20' :
                      'bg-gray-700'
                    }`}>
                      <Bell className={`w-5 h-5 ${
                        notification.priority == 'high' ? 'text-red-400' :
                        notification.priority == 'medium' ? 'text-yellow-400' :
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
                          notification.type == 'flight' ? 'bg-blue-500/20 text-blue-400' :
                          notification.type == 'market' ? 'bg-green-500/20 text-green-400' :
                          notification.type == 'weather' ? 'bg-purple-500/20 text-purple-400' :
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
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {/* Custom toggle - no proper accessibility */}
                  <button
                    onClick={() => toggleSetting(key)}
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
                <span className="text-red-400">{notifications.filter(n => n.priority == 'high').length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
