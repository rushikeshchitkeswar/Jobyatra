import React, { useState, useEffect } from 'react';
import { Clock, Globe, Loader2, Save, ExternalLink } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import BaseModal from './BaseModal';
import toast from 'react-hot-toast';

const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-500 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-300"
      />
    </div>
  </div>
);

export default function PreferencesModal({ isOpen, onClose, profile, onSave }) {
  const [formData, setFormData] = useState({
    noticePeriod: '',
    portfolioUrl: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        noticePeriod: profile.noticePeriod || '',
        portfolioUrl: profile.portfolioUrl || ''
      });
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await candidateService.updateProfile(formData);
      if (response.success) {
        onSave(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Availability & Preferences" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <InputField
            label="Notice Period"
            icon={Clock}
            value={formData.noticePeriod}
            onChange={(val) => setFormData({ ...formData, noticePeriod: val })}
            placeholder="e.g. Immediate, 30 Days, 3 Months"
          />
          <InputField
            label="Portfolio URL"
            icon={ExternalLink}
            value={formData.portfolioUrl}
            onChange={(val) => setFormData({ ...formData, portfolioUrl: val })}
            placeholder="e.g. https://johndoe.dev"
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-white bg-indigo-600 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
