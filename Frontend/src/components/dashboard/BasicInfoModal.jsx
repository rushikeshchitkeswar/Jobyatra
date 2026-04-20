import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Globe, Loader2, Save, Camera, Upload } from 'lucide-react';
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

export default function BasicInfoModal({ isOpen, onClose, profile, onSave }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        professionalHeadline: profile.professionalHeadline || '',
        currentJobTitle: profile.currentJobTitle || '',
        location: profile.location || '',
        phone: profile.phone || '',
        summary: profile.summary || '',
        socialLinks: profile.socialLinks || {}
      });
      setPhotoPreview(profile.profilePhoto || null);
    }
  }, [profile, isOpen]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to backend
    setUploadingPhoto(true);
    const uploadData = new FormData();
    uploadData.append('photo', file);

    try {
      const response = await candidateService.uploadPhoto(uploadData);
      if (response.success) {
          onSave(response.data);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

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
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Professional Info" maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Photo Upload Section */}
        <div className="flex flex-col items-center gap-4 py-4">
             <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center text-slate-200 text-4xl font-black shrink-0 overflow-hidden">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User size={64} />
                    )}
                    {uploadingPhoto && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all duration-300 cursor-pointer">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended: 500x500px JPG/PNG</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputField
            label="Full Name"
            icon={User}
            value={formData.fullName}
            onChange={(val) => setFormData({ ...formData, fullName: val })}
            placeholder="e.g. John Doe"
          />
          <InputField
            label="Email Address"
            icon={Mail}
            value={formData.email}
            onChange={(val) => setFormData({ ...formData, email: val })}
            placeholder="e.g. john@example.com"
            type="email"
          />
          <InputField
            label="Professional Headline"
            icon={Briefcase}
            value={formData.professionalHeadline}
            onChange={(val) => setFormData({ ...formData, professionalHeadline: val })}
            placeholder="e.g. Full Stack Developer | React Expert"
          />
          <InputField
            label="Current Job Title"
            icon={Briefcase}
            value={formData.currentJobTitle}
            onChange={(val) => setFormData({ ...formData, currentJobTitle: val })}
            placeholder="e.g. Senior Software Engineer"
          />
          <InputField
            label="Phone Number"
            icon={Phone}
            value={formData.phone}
            onChange={(val) => setFormData({ ...formData, phone: val })}
            placeholder="e.g. +91 98765 43210"
          />
          <InputField
            label="Location"
            icon={MapPin}
            value={formData.location}
            onChange={(val) => setFormData({ ...formData, location: val })}
            placeholder="e.g. Mumbai, India"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputField
            label="LinkedIn Username"
            icon={Globe}
            value={formData.socialLinks?.linkedin}
            onChange={(val) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: val } })}
            placeholder="e.g. johndoe"
          />
          <InputField
            label="GitHub Username"
            icon={Globe}
            value={formData.socialLinks?.github}
            onChange={(val) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: val } })}
            placeholder="e.g. johndoe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 ml-1">About Me / Summary</label>
          <textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            rows="5"
            placeholder="Briefly describe your career, goals, and key expertise..."
            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none"
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
