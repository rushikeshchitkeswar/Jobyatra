import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  Building2,
  Briefcase,
  FileText,
  BarChart3,
  Activity,
  Bell,
  Download,
  Settings,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const AdminLayout = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Recruiter Management', path: '/admin/recruiters', icon: UserSquare2 },
    { name: 'Company Management', path: '/admin/companies', icon: Building2 },
    { name: 'Job Management', path: '/admin/jobs', icon: Briefcase },
    { name: 'Applications Monitoring', path: '/admin/applications', icon: FileText },
    { name: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Activity Logs', path: '/admin/logs', icon: Activity },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Reports', path: '/admin/reports', icon: Download },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">J</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            JobYatra Admin
          </span>
        </div>
      </div>

      {/* Back to Home - Mobile only header in sidebar */}
      <div className="px-6 py-3 border-b border-gray-100 lg:hidden bg-gray-50/50">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-bold text-indigo-600 bg-white border border-indigo-100 rounded-lg shadow-sm hover:bg-indigo-50 transition-all group"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Go to Main Website
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            onClick={closeSidebar}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
              ${isActive
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 opacity-80" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 fixed top-[64px] bottom-0 left-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed top-[64px] bottom-0 left-0 w-72 z-50 lg:hidden shadow-2xl overflow-hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-[calc(100vh-64px)] overflow-x-hidden">

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
