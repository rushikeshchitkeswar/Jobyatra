import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Globe, 
  Mail, 
  ShieldCheck, 
  Save,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    platformName: '',
    supportEmail: '',
    platformDescription: '',
    maintenanceMode: false,
    featuredJobPrice: 0,
    sessionTimeout: 24,
    passwordMinLength: 6,
    allowRegistration: true,
    showAnalyticsPublicly: false
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSettings();
      setFormData({
        platformName: res.data.platformName || '',
        supportEmail: res.data.supportEmail || '',
        platformDescription: res.data.platformDescription || '',
        maintenanceMode: res.data.maintenanceMode || false,
        featuredJobPrice: res.data.featuredJobPrice || 0,
        sessionTimeout: res.data.sessionTimeout || 24,
        passwordMinLength: res.data.passwordMinLength || 6,
        allowRegistration: res.data.allowRegistration !== undefined ? res.data.allowRegistration : true,
        showAnalyticsPublicly: res.data.showAnalyticsPublicly || false
      });
    } catch (error) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updateSettings(formData);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500 mt-1">Configure global platform preferences and system behaviors.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors font-medium
                  ${activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
          >
            {activeTab === 'general' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your platform's basic profile information.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                    <input 
                      name="platformName"
                      type="text" 
                      value={formData.platformName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                    <input 
                      name="supportEmail"
                      type="email" 
                      value={formData.supportEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Description (SEO)</label>
                    <textarea 
                      name="platformDescription"
                      rows="3" 
                      value={formData.platformDescription}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                    ></textarea>
                  </div>
                  <div className="flex items-center justify-between py-4 border-y border-gray-100">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Maintenance Mode</h4>
                      <p className="text-xs text-gray-500">Temporarily disable access to the platform for users.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        name="maintenanceMode"
                        type="checkbox" 
                        checked={formData.maintenanceMode}
                        onChange={handleChange}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            ) : activeTab === 'security' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Security & Authentication</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage password policies and access controls.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (Hours)</label>
                      <input 
                        name="sessionTimeout"
                        type="number" 
                        value={formData.sessionTimeout}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min. Password Length</label>
                      <input 
                        name="passwordMinLength"
                        type="number" 
                        value={formData.passwordMinLength}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-4 border-t border-gray-100">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Allow New Registrations</h4>
                        <p className="text-xs text-gray-500">Enable or disable public account creation.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          name="allowRegistration"
                          type="checkbox" 
                          checked={formData.allowRegistration}
                          onChange={handleChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-gray-100">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Public Analytics</h4>
                        <p className="text-xs text-gray-500">Allow visitors to see platform statistics.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          name="showAnalyticsPublicly"
                          type="checkbox" 
                          checked={formData.showAnalyticsPublicly}
                          onChange={handleChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Save Security Settings' : 'Save Security Settings'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{tabs.find(t => t.id === activeTab)?.label} Settings</h3>
                <p className="text-gray-500 max-w-sm mt-2">Configuration for this module is coming soon in the next major release.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
