import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Users, 
  Camera, 
  Save, 
  Info,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { useEffect } from 'react';

export default function CompanyProfile() {
  const { user, setUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    industry: 'Information Technology',
    companySize: '500-1000 employees',
    location: '',
    companyDescription: '',
    companyLogo: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.companyName || '',
        companyWebsite: user.companyWebsite || '',
        industry: user.industry || 'Information Technology',
        companySize: user.companySize || '500-1000 employees',
        location: user.location || '',
        companyDescription: user.companyDescription || '',
        companyLogo: user.companyLogo || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await apiService.updateRecruiterProfile(formData);
      if (response.success) {
        setUser({ ...user, ...response.data });
        alert('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium placeholder:font-normal placeholder:text-slate-400";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Company Profile</h1>
        <p className="text-slate-500 mt-1">Manage how your company appears to potential candidates.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Cover & Logo Section */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
           <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
             <Camera className="w-4 h-4 mr-2" />
             Change Cover
           </button>
        </div>
        
        <div className="px-6 sm:px-8 pb-8">
          <div className="relative flex justify-between items-end mb-8 -mt-16">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-4xl">
                   TC
                </div>
              </div>
              <button className="absolute bottom-[-10px] right-[-10px] bg-white p-2 rounded-full border border-slate-200 shadow-sm text-slate-600 hover:text-blue-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center mb-6">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Company Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Company Name</label>
                  <input 
                    type="text" 
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={inputClasses} 
                    required 
                  />
                </div>
                <div>
                  <label className={labelClasses}>Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleChange} className={inputClasses}>
                    <option>Information Technology</option>
                    <option>Financial Services</option>
                    <option>Healthcare</option>
                    <option>E-commerce</option>
                    <option>Education</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Company Size</label>
                  <select name="companySize" value={formData.companySize} onChange={handleChange} className={inputClasses}>
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>51-200 employees</option>
                    <option>201-500 employees</option>
                    <option>500-1000 employees</option>
                    <option>1000+ employees</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Headquarters Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`${inputClasses} pl-10`} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* About Section */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center mb-6">
                <Info className="w-5 h-5 mr-2 text-blue-600" />
                About the Company
              </h2>
              <div>
                <label className={labelClasses}>Company Description</label>
                <textarea 
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  rows="5" 
                  className={`${inputClasses} resize-y`} 
                  placeholder="Tell candidates what makes your company a great place to work..."
                ></textarea>
                <p className="text-xs text-slate-500 mt-2">Brief description for your company profile page (max 500 characters).</p>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Online Presence */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center mb-6">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Online Presence
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Company Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleChange}
                      className={`${inputClasses} pl-10`} 
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>LinkedIn Profile</label>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <span className="flex items-center justify-center px-4 bg-slate-100 border-r border-slate-200 text-sm font-medium text-slate-500">
                      https://
                    </span>
                    <input 
                      type="text" 
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-transparent outline-none text-slate-700 font-medium placeholder:font-normal placeholder:text-slate-400 text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-6">
              <button 
                type="submit" 
                disabled={isSaving}
                className={`px-8 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30 flex items-center transform active:scale-95 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
