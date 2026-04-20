import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCircle2, Clock, Inbox, Megaphone, 
  AlertCircle, Briefcase, Calendar, Trash2, Filter,
  MoreVertical, Check, Eye
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await notificationService.clearAll();
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
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

  const getIconColor = (type, read) => {
    if (read) return 'bg-slate-100 text-slate-400';
    switch (type) {
      case 'Announcement': return 'bg-blue-100 text-blue-600';
      case 'Alert': return 'bg-amber-100 text-amber-600';
      case 'Job': return 'bg-emerald-100 text-emerald-600';
      case 'Interview': return 'bg-purple-100 text-purple-600';
      case 'Application': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">Stay updated with your job search progress</p>
        </div>

        <div className="grid grid-cols-2 lg:flex items-center gap-3">
          <button 
            onClick={handleMarkAllRead}
            className="px-3 sm:px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Mark All
          </button>
          <button 
            onClick={handleClearAll}
            className="px-3 sm:px-4 py-2.5 bg-white border border-slate-200 text-rose-600 text-xs sm:text-sm font-bold rounded-xl hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-6 border-b border-slate-100 px-4 sm:px-0">
        <button 
          onClick={() => setFilter('all')}
          className={`pb-4 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap ${
            filter === 'all' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          All ({notifications.length})
          {filter === 'all' && (
            <motion.div layoutId="notifFilter" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`pb-4 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap ${
            filter === 'unread' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Unread ({notifications.filter(n => !n.read).length})
          {filter === 'unread' && (
            <motion.div layoutId="notifFilter" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching updates...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
              {filter === 'unread' 
                ? "You've read all your notifications. Great job!" 
                : "No notifications to show right now. Check back later."}
            </p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-50"
          >
             {filteredNotifications.map((notification) => (
              <motion.div 
                key={notification._id}
                variants={item}
                className={`p-5 sm:p-6 md:p-8 flex items-start gap-3 sm:gap-5 transition-all cursor-pointer hover:bg-slate-50/50 group border-l-4 ${
                  notification.read ? 'border-transparent' : 'border-blue-600 bg-blue-50/10'
                }`}
                onClick={() => !notification.read && handleMarkRead(notification._id)}
              >
                <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[1rem] flex items-center justify-center shadow-sm ${getIconColor(notification.type, notification.read)}`}>
                  {React.cloneElement(getIcon(notification.type), { size: 18, className: 'sm:w-5 sm:h-5' })}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                    <div className="min-w-0">
                      <h4 className={`text-[10px] sm:text-sm font-bold uppercase tracking-wider mb-0.5 sm:mb-1 ${notification.read ? 'text-slate-400' : 'text-blue-600'}`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm sm:text-base md:text-lg leading-relaxed break-words ${notification.read ? 'text-slate-500 font-medium' : 'text-slate-900 font-bold'}`}>
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end shrink-0 gap-2">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-2">
                       View Details
                    </button>
                    {!notification.read && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notification._id);
                        }}
                        className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
