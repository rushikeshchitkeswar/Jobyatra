import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Trash2, CheckCircle2, Clock, Inbox, Megaphone, AlertCircle, Briefcase, Calendar } from 'lucide-react';
import notificationService from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const NotificationDrawer = ({ isOpen, onClose, onUpdateCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      if (onUpdateCount) onUpdateCount();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (onUpdateCount) onUpdateCount();
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await notificationService.clearAll();
      setNotifications([]);
      if (onUpdateCount) onUpdateCount();
      toast.success('Notifications cleared');
    } catch (error) {
      toast.error('Failed to clear');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Announcement': return <Megaphone className="w-5 h-5" />;
      case 'Alert': return <AlertCircle className="w-5 h-5" />;
      case 'Job': return <Briefcase className="w-5 h-5" />;
      case 'Interview': return <Calendar className="w-5 h-5" />;
      case 'Application': return <CheckCircle2 className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'Announcement': return 'bg-blue-50 text-blue-600';
      case 'Alert': return 'bg-amber-50 text-amber-600';
      case 'Job': return 'bg-emerald-50 text-emerald-600';
      case 'Interview': return 'bg-purple-50 text-purple-600';
      case 'Application': return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[9998]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-screen w-full sm:w-[350px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[9999] flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
              </button>
            </div>

            {notifications.length > 0 && (
              <div className="px-5 py-2.5 bg-slate-50 flex justify-between items-center border-b border-slate-100 shrink-0">
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Read
                </button>
                <button 
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No Notifications</h3>
                  <p className="text-xs text-slate-500 mt-1">We'll notify you when something important happens.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notification, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      key={notification._id}
                      onClick={() => handleMarkRead(notification._id)}
                      className={`
                        p-5 transition-all cursor-pointer hover:bg-slate-50 group border-l-2
                        ${notification.read ? 'border-transparent opacity-75' : 'border-blue-600 bg-blue-50/20'}
                      `}
                    >
                      <div className="flex gap-3">
                        <div className={`
                          w-8 h-8 shrink-0 rounded-lg flex items-center justify-center
                          ${notification.read ? 'bg-slate-50 text-slate-400' : getIconColor(notification.type)}
                        `}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${notification.read ? 'text-slate-400' : 'text-indigo-600'}`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm leading-snug mb-2 ${notification.read ? 'text-slate-500' : 'text-slate-900 font-semibold'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center shrink-0">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                JobYatra Notifications
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDrawer;
