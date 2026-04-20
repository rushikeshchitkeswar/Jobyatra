import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Clock, 
  Info, 
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Filter,
  Check
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';

export default function RecruiterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [activeMenu, setActiveMenu] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await apiService.markNotificationRead(id);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      const response = await apiService.markNotificationUnread(id);
      if (response.success) {
        setNotifications(prev => 
            prev.map(n => n._id === id ? { ...n, read: false } : n)
        );
        setActiveMenu(null);
      }
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await apiService.markAllNotificationsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      const response = await apiService.clearAllNotifications();
      if (response.success) {
        setNotifications([]);
        toast.success('All notifications cleared');
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.read
  );

  const getIcon = (type) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Notification Center</h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated with applications, interviews, and platform news.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleMarkAllRead}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
          <button 
            onClick={handleClearAll}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-rose-600 rounded-xl text-xs sm:text-sm font-bold hover:bg-rose-50 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
        </div>
      </div>

      {/* Filters */}
      {/* Filters (Scrollable on tiny screens) */}
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mb-6 w-max">
          <button 
            onClick={() => setFilter('all')}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${
              filter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            All Notifications
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
              filter === 'unread' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Unread
            {notifications.filter(n => !n.read).length > 0 && (
              <span className={`w-1.5 h-1.5 rounded-full ${filter === 'unread' ? 'bg-white' : 'bg-blue-600'}`}></span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">All caught up!</h3>
              <p className="text-slate-500 mt-1">No new notifications for you right now.</p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification) => (
              <motion.div
                key={notification._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`group relative bg-white border rounded-3xl p-5 md:p-6 transition-all hover:shadow-xl hover:border-blue-100 ${
                  !notification.read ? 'border-blue-100 bg-blue-50/10' : 'border-slate-100'
                }`}
              >
                <div className="flex gap-4 md:gap-6">
                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                    !notification.read ? 'bg-blue-100/50' : 'bg-slate-50 group-hover:bg-blue-50'
                  } transition-colors`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className={`text-sm md:text-base font-bold ${!notification.read ? 'text-slate-900 font-black' : 'text-slate-700'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === notification._id ? null : notification._id)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenu === notification._id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-20 overflow-hidden"
                              >
                                {notification.read ? (
                                    <button 
                                      onClick={() => handleMarkAsUnread(notification._id)}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all text-left"
                                    >
                                      <Bell className="w-4 h-4" />
                                      Mark as unread
                                    </button>
                                ) : (
                                    <button 
                                      onClick={() => { handleMarkAsRead(notification._id); setActiveMenu(null); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all text-left"
                                    >
                                      <Check className="w-4 h-4" />
                                      Mark as read
                                    </button>
                                )}
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-left">
                                  <Trash2 className="w-4 h-4" />
                                  Remove alert
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(notification.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      {!notification.read && (
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Visual Accent for Unread */}
                {!notification.read && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-600 rounded-r-full shadow-lg shadow-blue-500/50"></div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
