import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import resetPasswordImage from '../assets/login-auth.png';
import api from '../api/api';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    });

    useEffect(() => {
        const validateToken = async () => {
            try {
                await api.get(`/auth/validate-reset-token/${token}`);
                setIsValid(true);
            } catch (err) {
                setError('The reset link is invalid or has expired.');
                toast.error('Invalid or expired token');
            } finally {
                setVerifying(false);
            }
        };
        validateToken();
    }, [token]);


    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, password: value });
        
        setPasswordStrength({
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            number: /[0-9]/.test(value),
            special: /[^A-Za-z0-9]/.test(value)
        });
    };

    const isStrong = Object.values(passwordStrength).every(Boolean);

    const handleReset = async (e) => {
        e.preventDefault();
        
        if (!isStrong) {
            setError('Please meet all password requirements.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post(`/auth/reset-password/${token}`, {
                newPassword: formData.password
            });
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
            toast.error('Reset failed');
        } finally {
            setLoading(false);
        }
    };

    const Illustration = <img src={resetPasswordImage} alt="Reset Password Illustration" className="w-full h-auto rounded-3xl" />;

    if (verifying) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <p className="text-slate-600 font-medium">Verifying reset link...</p>
            </div>
        );
    }

    if (!isValid) {
        return (
            <AuthLayout 
                title="Invalid Link" 
                subtitle="This password reset link is no longer valid."
                illustration={Illustration}
            >
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={40} />
                    </div>
                    <p className="text-slate-600">
                        {error} Password reset links are only valid for 15 minutes and can only be used once.
                    </p>
                    <Link 
                        to="/forgot-password" 
                        className="block w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                    >
                        Request New Link
                    </Link>
                    <Link to="/login" className="block text-sm font-semibold text-slate-500 hover:text-indigo-600">
                        Back to Login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Set New Password"
            subtitle="Please create a strong password for your account."
            illustration={Illustration}
        >
            <form onSubmit={handleReset} className="space-y-5">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium"
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 placeholder:text-slate-400"
                        value={formData.password}
                        onChange={handlePasswordChange}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Password Strength Checklist */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 italic">
                    <Requirement met={passwordStrength.length} text="8+ Characters" />
                    <Requirement met={passwordStrength.uppercase} text="Uppercase Letter" />
                    <Requirement met={passwordStrength.number} text="Includes Number" />
                    <Requirement met={passwordStrength.special} text="Special Character" />
                </div>

                <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 placeholder:text-slate-400"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />
                </div>

                <motion.button
                    whileHover={{ scale: loading || !isStrong ? 1 : 1.02 }}
                    whileTap={{ scale: loading || !isStrong ? 1 : 0.98 }}
                    type="submit"
                    disabled={loading || !isStrong}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Updating...
                        </>
                    ) : (
                        'Reset Password'
                    )}
                </motion.button>
            </form>
        </AuthLayout>
    );
};

const Requirement = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-xs font-semibold ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
        {met ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 border border-slate-300 rounded-full" />}
        {text}
    </div>
);

export default ResetPassword;
