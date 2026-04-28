import React, { useState, useContext } from 'react';
import { Search, Bell, Menu, LogOut, User, X, ShoppingBag, Package } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar({ sidebarOpen, setSidebarOpen, isMobile }) {
  const { user, logout } = useContext(AuthContext);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Demo notifications - in production these would come from API/SSE
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'order', message: 'Comandă nouă #1042 - 87 lei', time: '2 min', read: false, link: '/orders' },
    { id: 2, type: 'order', message: 'Comandă #1041 - Livrată', time: '15 min', read: false, link: '/orders' },
    { id: 3, type: 'system', message: 'Sistem actualizat cu succes', time: '1 oră', read: true, link: null },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    // Mark as read
    setNotifications(prev => prev.map(n => 
      n.id === notif.id ? { ...n, read: true } : n
    ));
    
    // Show alert with notification details
    if (notif.type === 'order') {
      alert(`📦 ${notif.message}\n\nNavigare către pagina de comenzi...`);
      // In production: navigate(notif.link)
    } else {
      alert(`ℹ️ ${notif.message}`);
    }
  };

  const handleViewAllNotifications = () => {
    alert('📋 Toate notificările\n\nAici va fi o pagină cu istoricul complet al notificărilor.');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Caută..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-text-primary">Notificări</h3>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary hover:text-primary/80 px-2 py-1 rounded hover:bg-primary/5"
                        title="Marchează toate ca citite"
                      >
                        Marchează citite
                      </button>
                    )}
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded hover:bg-gray-100 text-text-muted"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Bell className="w-8 h-8 text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-muted">Nu ai notificări</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          notif.type === 'order' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {notif.type === 'order' ? (
                            <ShoppingBag className="w-4 h-4" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary">{notif.message}</p>
                          <p className="text-xs text-text-muted mt-0.5">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1"></span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
                  <button 
                    onClick={handleViewAllNotifications}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Vezi toate notificările
                  </button>
                  <span className="text-xs text-text-muted">
                    {unreadCount} necitite
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 pr-2 lg:pr-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-text-primary hidden sm:block">{user?.name || 'Admin'}</span>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-muted">{user?.email || 'admin@rotiserie.ro'}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Deconectare
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
