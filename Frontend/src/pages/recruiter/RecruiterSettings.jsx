import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Building2, 
  Lock, 
  Bell, 
  Globe, 
  MapPin, 
  Mail, 
  Phone,
  Camera,
  CheckCircle2,
  Trash2,
  Save,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import authService from '../../services/authService';
import { toast } from 'react-hot-toast';

export default function RecruiterSettings() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Form States
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    jobTitle: '',
    phone: '',
    bio: '',
    avatar: user?.profileImage || ''
  });

  const [companyForm, setCompanyForm] = useState({
    name: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    description: '',
    logo: ''
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    newApplicants: true,
    interviewReminders: true,
    marketingEmails: false,
    autoShortlist: false
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiService.getRecruiterProfile();
        if (response.success && response.data) {
          setProfileData(response.data);
          const p = response.data;
          setAccountForm(prev => ({
            ...prev,
            jobTitle: p.personalInfo?.jobTitle || '',
            phone: p.personalInfo?.phone || '',
            bio: p.personalInfo?.bio || '',
            avatar: p.personalInfo?.avatar || user?.profileImage || ''
          }));
          setCompanyForm({
            name: p.companyInfo?.name || '',
            website: p.companyInfo?.website || '',
            industry: p.companyInfo?.industry || '',
            size: p.companyInfo?.size || '',
            location: p.companyInfo?.location || '',
            description: p.companyInfo?.description || '',
            logo: p.companyInfo?.logo || ''
          });
        }
      } catch (error) {
        console.error('Error fetching recruiter profile:', error);
      }
    };
    fetchProfile();
    if (user?.preferences) {
        setPreferences(prev => ({ ...prev, ...user.preferences }));
    }
  }, [user]);

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Update User Details (Name/Email)
      await authService.updateDetails({ name: accountForm.name, email: accountForm.email });
      
      // 2. Update Recruiter Profile Details
      const response = await apiService.updateRecruiterProfile({
        personalInfo: {
          jobTitle: accountForm.jobTitle,
          phone: accountForm.phone,
          bio: accountForm.bio,
          avatar: accountForm.avatar
        }
      });
      
      if (response.success) {
        toast.success('Account details updated');
      }
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiService.updateRecruiterProfile({
        companyInfo: companyForm
      });
      if (response.success) {
        toast.success('Company settings saved');
      }
    } catch (error) {
      toast.error('Failed to update company information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setIsLoading(true);
    try {
      const response = await authService.updatePassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword
      });
      if (response.success) {
        toast.success('Password changed successfully');
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Security update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceToggle = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    try {
      await authService.updatePreferences(updated);
      toast.success('Preference updated', { duration: 1000 });
    } catch (error) {
      toast.error('Failed to save preference');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading('Uploading photo...');
    try {
      const uploadRes = await apiService.uploadImage(file, 'avatars');
      if (uploadRes.success) {
        setAccountForm(prev => ({ ...prev, avatar: uploadRes.url }));
        toast.success('Photo uploaded', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Upload failed', { id: loadingToast });
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading('Uploading logo...');
    try {
      const uploadRes = await apiService.uploadImage(file, 'logos');
      if (uploadRes.success) {
        setCompanyForm(prev => ({ ...prev, logo: uploadRes.url }));
        toast.success('Company logo uploaded', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Logo upload failed', { id: loadingToast });
    }
  };

  const tabs = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Bell }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Portal Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Configure your professional identity and hiring workspace.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Nav (Scrollable on mobile) */}
        <div className="lg:w-64 shrink-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          <div className="flex lg:flex-col bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 p-1.5 lg:p-2 shadow-sm sticky top-32 min-w-max lg:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-5 py-3 lg:py-4 rounded-[1.5rem] lg:rounded-[2rem] text-xs lg:text-sm font-bold transition-all relative group whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeSettingTab"
                    className="absolute inset-0 bg-blue-50/80 rounded-[1.5rem] lg:rounded-[2rem] border border-blue-100/50"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon className={`w-4 lg:w-5 h-4 lg:h-5 relative z-10 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-blue-600 relative z-10 hidden lg:block"
                    />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 p-5 md:p-8 shadow-sm"
              >
                <form onSubmit={handleAccountUpdate} className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                          <img 
                            src={accountForm.avatar || `https://ui-avatars.com/api/?name=${accountForm.name}&background=random`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl border-4 border-white cursor-pointer hover:scale-110 transition-all active:scale-95">
                          <Camera className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                      </div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Recruiter Profile</p>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-tighter">Full Name</label>
                          <input 
                            type="text" 
                            value={accountForm.name}
                            onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                            placeholder="Your Name"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-tighter">Email Address</label>
                          <input 
                            type="email" 
                            value={accountForm.email}
                            onChange={(e) => setAccountForm({...accountForm, email: e.target.value})}
                            placeholder="email@company.com"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-tighter">Job Title</label>
                          <input 
                            type="text" 
                            value={accountForm.jobTitle}
                            onChange={(e) => setAccountForm({...accountForm, jobTitle: e.target.value})}
                            placeholder="e.g. Talent Acquisition Lead"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-tighter">Phone Number</label>
                          <input 
                            type="tel" 
                            value={accountForm.phone}
                            onChange={(e) => setAccountForm({...accountForm, phone: e.target.value})}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-800"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-tighter">Professional Bio</label>
                        <textarea 
                          rows={4}
                          value={accountForm.bio}
                          onChange={(e) => setAccountForm({...accountForm, bio: e.target.value})}
                          placeholder="Tell candidates about yourself and your role..."
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-3xl transition-all outline-none font-bold text-slate-800 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 w-full md:w-auto"
                    >
                      <Save className="w-5 h-5 group-hover:animate-pulse" />
                      Save Account Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'company' && (
              <motion.div
                key="company"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm"
              >
                <form onSubmit={handleCompanyUpdate} className="space-y-8">
                   <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-slate-50/50 rounded-[2rem]">
                      <div className="relative">
                        <div className="w-24 h-24 bg-white rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                          {companyForm.logo ? (
                            <img src={companyForm.logo} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="w-10 h-10 text-slate-200" />
                          )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 p-2 bg-white text-blue-600 rounded-xl shadow-lg border border-slate-100 cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
                          <Camera className="w-3.5 h-3.5" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </label>
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Company Presence</h3>
                        <p className="text-sm text-slate-500 font-medium">This information is displayed to candidates on your job postings.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
                        <input 
                          type="text" 
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                          placeholder="Acme Corp"
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Website URL</label>
                        <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                            type="text" 
                            value={companyForm.website}
                            onChange={(e) => setCompanyForm({...companyForm, website: e.target.value})}
                            placeholder="https://acme.org"
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-800"
                            />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Industry</label>
                        <select 
                          value={companyForm.industry}
                          onChange={(e) => setCompanyForm({...companyForm, industry: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-800 appearance-none"
                        >
                          <option value="">Select Industry</option>
                          <option value="IT">Information Technology</option>
                          <option value="Finance">Finance / Fintech</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="E-commerce">E-commerce</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Headquarters</label>
                        <div className="relative">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                            type="text" 
                            value={companyForm.location}
                            onChange={(e) => setCompanyForm({...companyForm, location: e.target.value})}
                            placeholder="City, Country"
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-800"
                            />
                        </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">About the Company</label>
                      <textarea 
                        rows={4}
                        value={companyForm.description}
                        onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                        placeholder="Company mission and culture..."
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-3xl transition-all outline-none font-bold text-slate-800 resize-none font-medium text-sm leading-relaxed"
                      />
                   </div>

                   <div className="pt-6 border-t border-slate-50 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="group flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:shadow-2xl hover:shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                      <Building2 className="w-5 h-5" />
                      Save Company Profile
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row gap-10"
              >
                <div className="md:w-72 space-y-6">
                    <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-rose-100 border border-rose-100">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Security & Privacy</h3>
                        <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">Ensure your recruiter account remains secure. We recommend changing your password every 90 days.</p>
                    </div>
                </div>

                <form onSubmit={handleSecurityUpdate} className="flex-1 space-y-6">
                    <div className="space-y-2 group">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                        <div className="relative">
                            <input 
                            type={showPasswords.current ? "text" : "password"}
                            value={securityForm.currentPassword}
                            onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                            className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-rose-500/20 focus:bg-white rounded-[2rem] transition-all outline-none font-black tracking-widest"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative">
                                <input 
                                type={showPasswords.new ? "text" : "password"}
                                value={securityForm.newPassword}
                                onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[2rem] transition-all outline-none font-black tracking-widest"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                >
                                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative">
                                <input 
                                type={showPasswords.confirm ? "text" : "password"}
                                value={securityForm.confirmPassword}
                                onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[2rem] transition-all outline-none font-black tracking-widest"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-rose-600 hover:shadow-2xl hover:shadow-rose-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm"
              >
                <div className="mb-8 p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/30 flex items-center gap-6">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Bell className="w-6 h-6 animate-swing" />
                   </div>
                   <div>
                        <h3 className="font-bold text-slate-900 underline decoration-blue-500/30 underline-offset-4 decoration-4">Notification Preferences</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Control how JobYatra communicates with you about your hiring workflow.</p>
                   </div>
                </div>

                <div className="space-y-2">
                    {[
                        { id: 'emailNotifications', label: 'Primary Email Notifications', desc: 'Critical alerts about your account and job statuses.' },
                        { id: 'newApplicants', label: 'New Applicant Alerts', desc: 'Get notified immediately when someone applies to your job.' },
                        { id: 'interviewReminders', label: 'Interview Reminders', desc: '1-hour and 24-hour reminders for scheduled interviews.' },
                        { id: 'marketingEmails', label: 'Platform Announcements', desc: 'Monthly newsletter and feature update announcements.' }
                    ].map((item) => (
                        <div 
                            key={item.id}
                            className={`flex items-center justify-between p-6 rounded-[2rem] transition-all border ${
                                preferences[item.id] ? 'bg-slate-50 border-slate-100' : 'bg-white border-transparent hover:bg-slate-25'
                            }`}
                        >
                            <div>
                                <h4 className="text-base font-black text-slate-800">{item.label}</h4>
                                <p className="text-sm text-slate-500 font-medium mt-1">{item.desc}</p>
                            </div>
                            <button 
                                onClick={() => handlePreferenceToggle(item.id)}
                                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                                    preferences[item.id] ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'
                                }`}
                            >
                                <motion.div 
                                    animate={{ x: preferences[item.id] ? 26 : 4 }}
                                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                                />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <Info className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-600">Want to silence all alerts? Use "Hiring Freeze" mode.</p>
                   </div>
                   <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Enable Mode</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
