import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import registerImage from '../assets/register-auth.png';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user' // Default role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    // Illustration image
    const Illustration = <img src={registerImage} alt="Register Illustration" className="w-full h-auto rounded-3xl" />;

    const inputClasses = "w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 placeholder:text-slate-400";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError('');

        try {
            const { confirmPassword, ...registerData } = formData;
            const res = await register(registerData);

            // Recruiters must wait for admin approval — show a specific message
            if (res?.recruiterPending) {
                setSuccess('Registration successful! Your recruiter application is pending admin approval. You will be notified once approved.');
            } else {
                setSuccess('Registration successful! Redirecting to login...');
            }

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Your Account"
            subtitle="Start your career journey with JobYatra"
            illustration={Illustration}
        >
            <form className="space-y-4" onSubmit={handleRegister}>
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
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        className={inputClasses}
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 py-2">
                    <label className="relative cursor-pointer group">
                        <input
                            type="radio"
                            name="role"
                            value="user"
                            className="peer sr-only"
                            checked={formData.role === 'user'}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <div className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-xl transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-50/50 group-hover:border-slate-300">
                            <User className="text-slate-400 group-hover:text-slate-500 peer-checked:group-[]:text-indigo-600 transition-colors" size={24} />
                            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 peer-checked:group-[]:text-indigo-600">Candidate</span>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity">
                            <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </label>
                    <label className="relative cursor-pointer group">
                        <input
                            type="radio"
                            name="role"
                            value="recruiter"
                            className="peer sr-only"
                            checked={formData.role === 'recruiter'}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <div className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-xl transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-50/50 group-hover:border-slate-300">
                            <Briefcase className="text-slate-400 group-hover:text-slate-500 peer-checked:group-[]:text-indigo-600 transition-colors" size={24} />
                            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 peer-checked:group-[]:text-indigo-600">Recruiter</span>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity">
                            <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </label>
                </div>

                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        className={inputClasses}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className={inputClasses}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        className={inputClasses}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="py-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative w-5 h-5 mt-0.5 shrink-0">
                            <input type="checkbox" className="peer absolute opacity-0 cursor-pointer" required />
                            <div className="w-full h-full border-2 border-slate-200 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-xs text-slate-500 leading-normal">
                            By creating an account, you agree to JobYatra's <Link to="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                        </span>
                    </label>
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
                            Creating Account...
                        </>
                    ) : (
                        <>
                            <UserPlus size={20} />
                            Register
                        </>
                    )}
                </motion.button>

                <div className="relative flex items-center justify-center py-2">
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

                <p className="text-center text-slate-500 text-sm mt-6">
                    Already have an account? {' '}
                    <Link to="/login" title="Login" className="text-indigo-600 font-bold hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Register;
