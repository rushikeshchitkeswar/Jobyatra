import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import loginImage from '../assets/login-auth.png';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    // Illustration image
    const Illustration = <img src={loginImage} alt="Login Illustration" className="w-full h-auto rounded-3xl" />;

    const inputClasses = "w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 placeholder:text-slate-400";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.type === 'email' ? 'email' : 'password']: e.target.value });
        if (error) setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // console.log('[Login] Attempting login for:', formData.email);
            const data = await login(formData);
            // console.log('[Login] Data received:', data);

            // Debugging as per requirements
            // console.log("Role from response:", data?.user?.role);
            // console.log("Role from localStorage:", localStorage.getItem("role"));

            // Role-based redirection - Immediate
            const userRole = data?.user?.role || localStorage.getItem('role') || 'user';
            const redirectPath = userRole === 'admin' ? '/admin' : (userRole === 'recruiter' ? '/recruiter' : '/dashboard');
            // console.log('[Login] Redirecting to:', redirectPath, 'Role:', userRole);
            navigate(redirectPath);
        } catch (err) {
            setError(err || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Login to continue your career journey"
            illustration={Illustration}
        >
            <form className="space-y-5" onSubmit={handleLogin}>
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium"
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium"
                        >
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="email"
                        placeholder="Email Address"
                        className={inputClasses}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="password"
                        placeholder="Password"
                        className={inputClasses}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative w-5 h-5">
                            <input type="checkbox" className="peer absolute opacity-0 cursor-pointer" />
                            <div className="w-full h-full border-2 border-slate-200 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                    </label>
                    <Link to="/forgot-password" title="Forgot Password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                        Forgot Password?
                    </Link>
                </div>

                <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Logging in...
                        </>
                    ) : (
                        <>
                            <LogIn size={20} />
                            Login
                        </>
                    )}
                </motion.button>

                <div className="relative flex items-center justify-center py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <span className="relative px-4 text-xs font-semibold text-slate-400 bg-white uppercase tracking-wider italic">
                        or continue with
                    </span>
                </div>

                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, backgroundColor: '#F8FAFC' }}
                    className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-slate-300 transition-all"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </motion.button>

                <p className="text-center text-slate-500 text-sm mt-8">
                    Don't have an account? {' '}
                    <Link to="/register" title="Register" className="text-indigo-600 font-bold hover:underline">
                        Register
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Login;
