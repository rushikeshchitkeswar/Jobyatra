import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Bell, Sparkles, Shield, Save, 
  Eye, Mail, Phone, Loader2, Key, CheckCircle2,
  ToggleLeft, ToggleRight, Trash2, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile',   label: 'Profile Details', icon: User },
  { id: 'security',  label: 'Security',      icon: Lock },
  { id: 'preferences', label: 'Availability', icon: Sparkles },
  { id: 'notifications', label: 'Alerts',      icon: Bell },
];

const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", disabled = false, mandatory = false }) => (
  <div className="space-y-2">
    <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {label} {mandatory && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium text-slate-900 placeholder:text-slate-300 ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      />
    </div>
  </div>
);

const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer" onClick={() => onChange(!checked)}>
    <div className="space-y-1">
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500 leading-relaxed max-w-sm">{description}</p>
    </div>
    <button className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-blue-600 shadow-sm shadow-blue-500/20' : 'bg-slate-200'}`}>
      <motion.div 
        animate={{ x: checked ? 24 : 4 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  </div>
);

export default function DashboardSettings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  // Form States
  const [accountData, setAccountData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [prefData, setPrefData] = useState({ noticePeriod: '', portfolioUrl: '', visibility: 'public' });
  const [notifData, setNotifData] = useState({
    jobAlerts: true,
    applicationUpdates: true,
    interviews: true,
    newsletter: false
  });

  useEffect(() => {
    if (user) {
      setAccountData({ name: user.name, email: user.email });
      setNotifData(user.preferences?.emailNotifications || {
        jobAlerts: true,
        applicationUpdates: true,
        interviews: true,
        newsletter: false
      });
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await candidateService.getProfile();
      if (res.success) {
        setProfile(res.data);
        setPrefData({
          noticePeriod: res.data.noticePeriod || '',
          portfolioUrl: res.data.portfolioUrl || '',
          visibility: user.preferences?.profileVisibility || 'public'
        });
      }
    } catch (error) {
       console.error(error);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateDetails(accountData);
      if (res.success) {
        // Update local auth state/localStorage for real-time UI sync
        updateUser(res.data);
        toast.success('Account details updated');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update details');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update Candidate Profile (noticePeriod, portfolio)
      await candidateService.updateProfile({
        noticePeriod: prefData.noticePeriod,
        portfolioUrl: prefData.portfolioUrl
      });
      
      // 2. Update User Profile Preferences (visibility)
      await authService.updatePreferences({
        ...user.preferences,
        profileVisibility: prefData.visibility
      });

      toast.success('Preferences updated');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setLoading(true);
    try {
      await authService.updatePreferences({
        ...user.preferences,
        emailNotifications: notifData
      });
      if (res.success) {
        updateUser({ preferences: { ...user.preferences, emailNotifications: notifData } });
        toast.success('Notification preferences saved');
      }
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">Manage your account and platform experience</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 md:gap-10">
        {/* Sidebar Tabs */}
        <div className="lg:w-72 shrink-0 px-4 sm:px-0">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-2 sm:p-3 flex flex-row lg:flex-col gap-1 sm:gap-2 shadow-sm sticky top-0 sm:top-24 z-30 overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-none lg:w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-blue-600 lg:bg-blue-50 text-white lg:text-blue-600 shadow-lg lg:shadow-none' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="tabMarker" className="hidden lg:block ml-auto w-1 h-4 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              {activeTab === 'profile' && (
                <div className="p-6 sm:p-8 md:p-12 space-y-8 md:space-y-10">
                  <div className="flex items-center gap-3 sm:gap-4 pb-6 border-b border-slate-50">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <User size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">Personal Information</h2>
                      <p className="text-xs sm:text-sm text-slate-500">Update your primary account details</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateDetails} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField
                        label="Full Name"
                        icon={User}
                        value={accountData.name}
                        onChange={(v) => setAccountData({ ...accountData, name: v })}
                        placeholder="John Doe"
                      />
                      <InputField
                        label="Email Address"
                        icon={Mail}
                        value={accountData.email}
                        onChange={(v) => setAccountData({ ...accountData, email: v })}
                        placeholder="john@example.com"
                        disabled={true} // Email should generally be protected
                      />
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                        Save Account Details
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-6 sm:p-8 md:p-12 space-y-8 md:space-y-10">
                  <div className="flex items-center gap-3 sm:gap-4 pb-6 border-b border-slate-50">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <Shield size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">Security & Password</h2>
                      <p className="text-xs sm:text-sm text-slate-500">Protect your account with a strong password</p>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-8">
                    <div className="max-w-md space-y-8">
                      <InputField
                        label="Current Password"
                        icon={Key}
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(v) => setPasswordData({ ...passwordData, currentPassword: v })}
                        placeholder="••••••••"
                      />
                      <InputField
                        label="New Password"
                        icon={Lock}
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(v) => setPasswordData({ ...passwordData, newPassword: v })}
                        placeholder="••••••••"
                      />
                      <InputField
                        label="Confirm New Password"
                        icon={Lock}
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(v) => setPasswordData({ ...passwordData, confirmPassword: v })}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield size={18} />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="p-8 md:p-12 space-y-10">
                   <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Career Availability</h2>
                      <p className="text-sm text-slate-500">Control your visibility to recruiters</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePreferences} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <InputField
                        label="Notice Period"
                        icon={Clock}
                        value={prefData.noticePeriod}
                        onChange={(v) => setPrefData({ ...prefData, noticePeriod: v })}
                        placeholder="e.g. 1 Month"
                      />
                      <InputField
                        label="Portfolio URL"
                        icon={Globe}
                        value={prefData.portfolioUrl}
                        onChange={(v) => setPrefData({ ...prefData, portfolioUrl: v })}
                        placeholder="https://john.dev"
                      />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Profile Visibility</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button 
                              type="button"
                              onClick={() => setPrefData({ ...prefData, visibility: 'public' })}
                              className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                                prefData.visibility === 'public' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100 bg-slate-50'
                              }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Eye className={prefData.visibility === 'public' ? 'text-blue-600' : 'text-slate-400'} size={24} />
                                    {prefData.visibility === 'public' && <CheckCircle2 className="text-blue-600" size={20} />}
                                </div>
                                <p className="font-bold text-slate-900 uppercase text-[10px] tracking-widest mb-1">Public Profile</p>
                                <p className="text-sm text-slate-500 leading-snug"> recruiters can find you in search results</p>
                            </button>

                            <button 
                              type="button"
                              onClick={() => setPrefData({ ...prefData, visibility: 'private' })}
                              className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                                prefData.visibility === 'private' ? 'border-slate-900 bg-slate-900/5' : 'border-slate-100 bg-slate-50'
                              }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Lock className={prefData.visibility === 'private' ? 'text-slate-900' : 'text-slate-400'} size={24} />
                                    {prefData.visibility === 'private' && <CheckCircle2 className="text-slate-900" size={20} />}
                                </div>
                                <p className="font-bold text-slate-900 uppercase text-[10px] tracking-widest mb-1">Private Profile</p>
                                <p className="text-sm text-slate-500 leading-snug">Only applied companies can see your profile</p>
                            </button>
                        </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles size={18} />}
                        Save Availability Settings
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                 <div className="p-8 md:p-12 space-y-10">
                   <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                      <Bell size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Push & Email Alerts</h2>
                      <p className="text-sm text-slate-500">Decide what you want to be notified about</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ToggleSwitch 
                      label="New Job Matches"
                      description="Get notified when jobs matching your skills are posted."
                      checked={notifData.jobAlerts}
                      onChange={(v) => setNotifData({ ...notifData, jobAlerts: v })}
                    />
                    <ToggleSwitch 
                      label="Application Status"
                      description="Receive alerts when a recruiter updates your application state."
                      checked={notifData.applicationUpdates}
                      onChange={(v) => setNotifData({ ...notifData, applicationUpdates: v })}
                    />
                    <ToggleSwitch 
                      label="Interviews"
                      description="Important alerts about scheduled and upcoming interviews."
                      checked={notifData.interviews}
                      onChange={(v) => setNotifData({ ...notifData, interviews: v })}
                    />
                    <ToggleSwitch 
                      label="Career Newsletter"
                      description="Receive weekly tips and market insights from our experts."
                      checked={notifData.newsletter}
                      onChange={(v) => setNotifData({ ...notifData, newsletter: v })}
                    />
                  </div>

                  <div className="pt-8 border-t border-slate-50">
                      <button 
                        onClick={handleUpdateNotifications}
                        disabled={loading}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                        Save Notification Preferences
                      </button>
                  </div>

                  <div className="mt-20 p-8 bg-rose-50 rounded-3xl border border-rose-100">
                      <div className="flex items-start gap-4">
                          <Trash2 className="text-rose-600 shrink-0" size={24} />
                          <div className="flex-1">
                              <h3 className="text-lg font-bold text-rose-900">Deactivate Account</h3>
                              <p className="text-sm text-rose-700/70 mt-1 leading-relaxed">
                                Temporarily disable your profile. You can reactivate it at any time by logging back in.
                                Your data remains safe but will not be visible to recruiters.
                              </p>
                              <button className="mt-6 px-6 py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-all active:scale-95 text-sm uppercase tracking-widest">
                                 Deactivate My Account
                              </button>
                          </div>
                      </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
