import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  UserCircle,
  Briefcase,
  Bookmark,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  MessageCircle,
  FileText,
  BarChart2,
  Home,
  ChevronLeft
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import notificationService from '../services/notificationService';
import NotificationDrawer from '../components/NotificationDrawer';

export default function DashboardLayout() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success) {
        setUnreadCount(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll for notifications every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const navigation = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', href: '/dashboard', end: true, icon: LayoutDashboard },
        { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
      ]
    },
    {
      group: 'Jobs',
      items: [
        { name: 'My Applications', href: '/dashboard/applied-jobs', icon: Briefcase },
        { name: 'Saved Jobs', href: '/dashboard/saved-jobs', icon: Bookmark },
        { name: 'Recommended Jobs', href: '/dashboard/recommended-jobs', icon: Sparkles },
      ]
    },
    {
      group: 'Career',
      items: [
        { name: 'Interviews', href: '/dashboard/interviews', icon: Calendar },
        { name: 'Recruiter Messages', href: '/dashboard/messages', icon: MessageCircle },
        { name: 'Resume Manager', href: '/dashboard/resume', icon: FileText },
      ]
    },
    {
      group: 'Account',
      items: [
        { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
        {
          name: 'Notifications',
          href: '/dashboard/notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : null
        },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // console.log(user, "user", isAuthenticated, "login from dashboard");

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-100 shadow-sm relative z-40">
      {/* Back to Home - Mobile only header in sidebar */}
      {/* Back to Home - Mobile only header in sidebar */}
      <div className="p-4 border-b border-slate-100 lg:hidden bg-slate-50/50 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-blue-600 bg-white border border-blue-100 rounded-xl shadow-sm hover:bg-blue-50 transition-all"
        >
          <Home className="w-4 h-4" />
          Main Site
        </button>
        <button
          onClick={closeSidebar}
          className="p-2.5 text-slate-400 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 py-6 px-3 overflow-y-auto space-y-6">
        {navigation.map((section) => (
          <div key={section.group}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3 mb-2">
              {section.group}
            </p>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.end}
                    onClick={closeSidebar}
                    className={({ isActive }) => `
                      relative group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 overflow-hidden
                      ${isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="sidebarActive"
                            className="absolute inset-0 bg-blue-50 rounded-xl"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        {isActive && (
                          <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full z-20" />
                        )}
                        <Icon className={`mr-3 flex-shrink-0 h-4.5 w-4.5 transition-colors duration-200 relative z-10 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'
                          }`} style={{ width: 18, height: 18 }} />
                        <span className="flex-1 relative z-10 truncate">{item.name}</span>
                        {item.badge && (
                          <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 relative ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-500'
                            }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-all duration-200 group"
        >
          <LogOut className="mr-3 h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" style={{ width: 18, height: 18 }} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="flex-1 flex w-full relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:top-[64px] lg:bottom-0 lg:left-0 lg:z-30">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeSidebar}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="fixed top-[64px] bottom-0 left-0 w-[280px] bg-white z-[50] lg:hidden flex flex-col shadow-2xl overflow-hidden"
              >
                <div className="flex-1 overflow-hidden h-full">
                  <SidebarContent />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 w-full lg:pl-64 focus:outline-none min-h-[calc(100vh-64px)] overflow-x-hidden">
          <main className="flex-1 relative py-8 px-4 sm:px-6 md:px-8 max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
