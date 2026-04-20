import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  Calendar,
  Building2,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Columns,
  Home,
  MessageCircle
} from 'lucide-react';

const baseNavigation = [
  { name: 'Dashboard', href: '/recruiter', end: true, icon: LayoutDashboard },
  { name: 'Post New Job', href: '/recruiter/post-job', icon: FileText },
  { name: 'Manage Jobs', href: '/recruiter/jobs', icon: Briefcase },
  { name: 'Applicants', href: '/recruiter/applicants', icon: Users },
  { name: 'Hiring Pipeline', href: '/recruiter/pipeline', icon: Columns },
  { name: 'Interviews', href: '/recruiter/interviews', icon: Calendar },
  { name: 'Messages', href: '/recruiter/messages', icon: MessageCircle },
  { name: 'My Profile', href: '/recruiter/profile', icon: Building2 },
  { name: 'Analytics', href: '/recruiter/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/recruiter/notifications', icon: Bell },
  { name: 'Settings', href: '/recruiter/settings', icon: Settings },
];

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function RecruiterLayout() {
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiService.getUnreadNotificationsCount();
      if (response.success) {
        setUnreadCount(response.data);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const navigation = baseNavigation.map(item => {
    if (item.name === 'Notifications' && unreadCount > 0) {
      return { ...item, badge: unreadCount.toString() };
    }
    return item;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm relative z-40">
      <div className="p-6 border-b border-slate-100 flex items-center mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg shadow-blue-200">
          JY
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg">JobYatra</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Recruiter Portal</p>
        </div>
      </div>

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

      <div className="flex-1 py-4 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="mb-4 px-4 hidden lg:block">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Menu
          </h2>
        </div>
        <nav className="space-y-1.5 relative">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                onClick={closeSidebar}
                className={({ isActive }) => `
                  relative group flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 overflow-hidden
                  ${isActive
                    ? 'text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`
                      mr-3 flex-shrink-0 h-[18px] w-[18px] transition-colors duration-300 relative z-10
                      ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}
                    `} />
                    <span className="flex-1 relative z-10 transition-transform duration-300 group-hover:translate-x-1">{item.name}</span>

                    {item.badge && (
                      <span className={`
                        ml-3 inline-block py-0.5 px-2.5 text-xs font-semibold rounded-full relative z-10 transition-all duration-300
                        ${isActive ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-red-50 text-red-600 group-hover:bg-red-100'}
                      `}>
                        {item.badge}
                      </span>
                    )}

                    {/* Active Indicator Background */}
                    {isActive && (
                      <motion.div
                        layoutId="recruiterActiveTab"
                        className="absolute inset-0 bg-blue-50 border border-blue-100/50 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Active Left Border Glow */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.6)] z-20"></div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-5 border-t border-slate-200 bg-slate-50/50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm transition-all duration-300 group"
        >
          <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="flex-1 flex w-full relative">

        {/* Desktop Sidebar - Sticky! */}
        <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:top-[64px] lg:bottom-0 lg:left-0 lg:z-30">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeSidebar}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                className="fixed top-[64px] bottom-0 left-0 w-[280px] bg-white z-[50] lg:hidden flex flex-col shadow-2xl overflow-hidden"
              >
                <div className="flex-1 overflow-hidden h-full">
                  <SidebarContent />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 w-full lg:pl-72 focus:outline-none min-h-[calc(100vh-64px)]">
          {/* Top Header / Breadcrumb area (optional) */}
          <header className="sticky top-[50px] z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 lg:px-10 py-4 flex items-center justify-between overflow-y-auto">
            <div className="flex items-center gap-4">
              {/* <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Menu className="w-6 h-6" />
              </button> */}
              <div>
                <h2 className="text-xl font-bold text-slate-800 capitalize leading-tight">
                  {location.pathname === '/recruiter' ? 'Dashboard Overview' : location.pathname.split('/').pop().replace('-', ' ')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Welcome, {user?.name || 'Recruiter'}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* <button
                onClick={() => navigate('/recruiter/notifications')}
                className="relative p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
              </button> */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{user?.name || 'Recruiter'}</p>
                  <p className="text-xs text-slate-500">{user?.role === 'recruiter' ? 'Hiring Manager' : 'Team Member'}</p>
                </div>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:border-blue-100 transition-all object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm group-hover:border-blue-100 transition-all">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 relative py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
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
