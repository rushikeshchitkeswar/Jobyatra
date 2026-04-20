import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, X, Briefcase, Search, Bell, User, LayoutDashboard,
    Settings, LogOut, Bookmark, FileText
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import NotificationDrawer from './NotificationDrawer';
import notificationService from '../services/notificationService';

const Navbar = ({ onLogout }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    const profileRef = useRef(null);
    const { toggleSidebar } = useSidebar();

    const isDashboard = location.pathname.startsWith('/dashboard');
    const isRecruiter = location.pathname.startsWith('/recruiter');
    const isAdmin = location.pathname.startsWith('/admin');
    const isInDashboardEnv = isDashboard || isRecruiter || isAdmin;

    // Fetch unread count for notifications
    const fetchUnreadCount = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await notificationService.getUnreadCount();
            setUnreadCount(res.data);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            // Poll every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    // console.log(user, "user", isAuthenticated);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            logout();
            navigate('/login');
        }
        setIsProfileOpen(false);
    };

    const publicLinks = [
        { name: 'Home', href: '/' },
        { name: 'Jobs', href: '/jobs' },
        { name: 'Companies', href: '/companies' },
        { name: 'About', href: '/about' },
    ];

    const privateLinks = [
        { name: 'Home', href: '/' },
        { name: 'Jobs', href: '/jobs' },
        { name: 'Companies', href: '/companies' },
        { name: 'Saved Jobs', href: '/dashboard/saved-jobs', role: 'candidate' },
        { name: 'Applications', href: '/dashboard/applied-jobs', role: 'candidate' },
    ];

    const navLinks = isAuthenticated
        ? privateLinks.filter(link => !link.role || link.role === user?.role)
        : publicLinks;

    // Define role-specific menu items
    const candidateMenuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'My Profile', icon: User, href: '/dashboard/profile' },
        { name: 'Applied Jobs', icon: FileText, href: '/dashboard/applied-jobs' },
        { name: 'Saved Jobs', icon: Bookmark, href: '/dashboard/saved-jobs' },
        { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
    ];

    const recruiterMenuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/recruiter' },
        { name: 'My Profile', icon: User, href: '/recruiter/profile' },
        { name: 'Settings', icon: Settings, href: '/recruiter/settings' },
    ];

    const adminMenuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    const profileMenuItems = user?.role === 'recruiter'
        ? recruiterMenuItems
        : (user?.role === 'admin' ? adminMenuItems : candidateMenuItems);

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Section: Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-blue-200">
                            <Briefcase className="text-white w-6 h-6" />
                        </div>
                        <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                            JobYatra
                        </span>
                    </Link>

                    {/* Center Navigation Links (Desktop) */}
                    <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={`
                                        font-medium transition-colors duration-200 relative group
                                        ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}
                                    `}
                                >
                                    {link.name}
                                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right Section */}
                    <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                        {isAuthenticated ? (
                            <>
                                {/* Search Bar */}
                                <div className="relative group hidden lg:block">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search jobs, companies..."
                                        className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
                                    />
                                </div>

                                {/* Notification Bell */}
                                <button
                                    onClick={() => setIsNotificationOpen(true)}
                                    className="relative p-2 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-full transition-colors group"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 p-1 pr-2 rounded-full border border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/10 transition-all bg-white"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                                            {user?.profileImage ? (
                                                <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4 text-slate-400" />
                                            )}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                                    <p className="text-sm font-bold text-slate-900">{user?.name || 'User'}</p>
                                                    <p className="text-xs font-medium text-slate-500 truncate">{user?.email || ''}</p>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    {profileMenuItems.map((item) => {
                                                        const Icon = item.icon;
                                                        return (
                                                            <Link
                                                                key={item.name}
                                                                to={item.href}
                                                                onClick={() => setIsProfileOpen(false)}
                                                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                            >
                                                                <Icon className="w-4 h-4" />
                                                                {item.name}
                                                            </Link>
                                                        )
                                                    })}
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-5 py-2 text-slate-600 font-semibold border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                                    Login
                                </Link>
                                <Link to="/register" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-200 hover:opacity-90 transform hover:-translate-y-0.5 transition-all duration-200">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        {isAuthenticated && (
                            <button
                                onClick={() => setIsNotificationOpen(true)}
                                className="relative p-2 text-slate-500 hover:text-blue-600 bg-slate-50 rounded-full"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (isInDashboardEnv) {
                                    toggleSidebar();
                                } else {
                                    setIsOpen(!isOpen);
                                }
                            }}
                            className="text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            {isInDashboardEnv ? <Menu className="w-6 h-6" /> : (isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />)}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {isAuthenticated && (
                                <div className="flex items-center gap-3 p-3 mb-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border border-slate-300 shadow-sm">
                                        {user?.profileImage ? (
                                            <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-slate-400 w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{user?.name || 'User'}</p>
                                        <Link to={user?.role === 'recruiter' ? '/recruiter/profile' : '/dashboard/profile'} onClick={() => setIsOpen(false)} className="text-xs font-semibold text-blue-600">View Profile</Link>
                                    </div>
                                </div>
                            )}

                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="pt-4 flex flex-col space-y-3">
                                {isAuthenticated ? (
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-center text-rose-600 bg-rose-50 font-semibold rounded-xl"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full px-5 py-2 text-center text-slate-600 font-semibold border border-slate-200 rounded-full hover:bg-slate-50"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full px-6 py-2 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Drawer */}
            <NotificationDrawer
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onUpdateCount={fetchUnreadCount}
            />
        </nav>
    );
};

export default Navbar;
