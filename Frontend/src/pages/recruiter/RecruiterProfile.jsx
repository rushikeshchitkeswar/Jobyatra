import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Users, 
  Camera, 
  Save, 
  Info,
  Link as LinkIcon,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Briefcase,
  Edit3,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

export default function RecruiterProfile() {
  const { user, setUser, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', // Personal
    jobTitle: '', // Personal
    phone: '', // Personal
    bio: '', // Personal
    companyName: '', // Company
    companyWebsite: '', // Company
    industry: 'Information Technology', // Company
    companySize: '500-1000 employees', // Company
    location: '', // Company
    companyDescription: '', // Company
    companyLogo: '', // Company
    recruiterImage: '', // Personal Avatar
    linkedin: '', // Social
    twitter: '', // Social
    socialWebsite: '' // Social
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiService.getRecruiterProfile();
        if (response.success && response.data) {
          const profile = response.data;
          setFormData({
            name: user?.name || '',
            jobTitle: profile.personalInfo?.jobTitle || '',
            phone: profile.personalInfo?.phone || '',
            bio: profile.personalInfo?.bio || '',
            companyName: profile.companyInfo?.name || '',
            companyWebsite: profile.companyInfo?.website || '',
            industry: profile.companyInfo?.industry || 'Information Technology',
            companySize: profile.companyInfo?.size || '500-1000 employees',
            location: profile.companyInfo?.location || '',
            companyDescription: profile.companyInfo?.description || '',
            companyLogo: profile.companyInfo?.logo || '',
            recruiterImage: profile.personalInfo?.avatar || '',
            linkedin: profile.socialLinks?.linkedin || '',
            twitter: profile.socialLinks?.twitter || '',
            socialWebsite: profile.socialLinks?.website || ''
          });
        }
      } catch (error) {
        // If 404, it means profile hasn't been created yet, which is fine
        if (error?.status !== 404) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const avatarInputRef = React.useRef(null);
  const logoInputRef = React.useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      
      const loadingToast = toast.loading('Uploading avatar...');
      try {
        const response = await apiService.uploadImage(file, 'avatars');
        setFormData(prev => ({ ...prev, recruiterImage: response.data.url }));
        toast.success('Avatar uploaded!', { id: loadingToast });
      } catch (error) {
        toast.error('Avatar upload failed', { id: loadingToast });
      }
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }
      
      const loadingToast = toast.loading('Uploading logo...');
      try {
        const response = await apiService.uploadImage(file, 'logos');
        setFormData(prev => ({ ...prev, companyLogo: response.data.url }));
        toast.success('Logo uploaded!', { id: loadingToast });
      } catch (error) {
        toast.error('Logo upload failed', { id: loadingToast });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: formData.name,
      personalInfo: {
        jobTitle: formData.jobTitle,
        phone: formData.phone,
        bio: formData.bio,
        avatar: formData.recruiterImage
      },
      companyInfo: {
        name: formData.companyName,
        logo: formData.companyLogo,
        website: formData.companyWebsite,
        industry: formData.industry,
        size: formData.companySize,
        location: formData.location,
        description: formData.companyDescription
      },
      socialLinks: {
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        website: formData.socialWebsite
      }
    };

    try {
      const response = await apiService.updateRecruiterProfile(payload);
      if (response.success) {
        toast.success('Profile updated successfully!');
        await refreshUser(); // Update global Navbar image
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = "w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400";
  const labelClasses = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={handleAvatarChange} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={logoInputRef} 
        onChange={handleLogoChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {/* Header Section with Cover and Avatar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8"
      >
        <div className="h-40 md:h-64 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden relative shadow-lg">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <button className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-all flex items-center shadow-lg active:scale-95">
             <Camera className="w-3.5 h-3.5 md:w-4 h-4 mr-2" />
             Change Cover
           </button>
        </div>

        <div className="px-4 md:px-12">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 gap-4 md:gap-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-3xl border-[4px] md:border-[6px] border-white shadow-xl flex items-center justify-center overflow-hidden">
                {formData.recruiterImage ? (
                  <img src={formData.recruiterImage} alt="Recruiter" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 font-black text-4xl">
                     {user?.name?.charAt(0) || 'R'}
                  </div>
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={() => avatarInputRef.current.click()}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-inner"
                >
                   <div className="bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/30 hover:scale-110 transition-transform">
                     <Camera className="text-white w-6 h-6" />
                   </div>
                </button>
              )}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                    {formData.name || 'Recruiter'}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-2 text-slate-500 font-medium text-xs md:text-base">
                    <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-blue-500" /> {formData.jobTitle || 'Hiring Manager'}</span>
                    <span className="flex items-center gap-1.5"><Building2 size={14} className="text-indigo-500" /> {formData.companyName}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-rose-500" /> {formData.location || 'Location not set'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm active:scale-95 w-full md:w-auto justify-center"
                    >
                      <Edit3 size={18} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                       <button 
                        onClick={() => setIsEditing(false)}
                        className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 justify-center"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-70 justify-center"
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Check size={18} />
                        )}
                        {isSaving ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info & Social */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-8"
        >
          {/* Contact Details Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Info size={18} />
              </div>
              Contact Details
            </h3>
            
            <div className="space-y-6">
              <div className="flex flex-col">
                <span className={labelClasses}>Full Name</span>
                {!isEditing ? (
                  <p className="text-slate-800 font-bold ml-1">{formData.name}</p>
                ) : (
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} />
                )}
              </div>

              <div className="flex flex-col">
                <span className={labelClasses}>Primary Email</span>
                <p className="text-slate-800 font-bold ml-1 flex items-center gap-2">
                   <Mail size={16} className="text-slate-400" />
                   {user?.email}
                </p>
                <p className="text-[10px] text-slate-400 font-medium ml-7">Email cannot be changed from profile.</p>
              </div>

              <div className="flex flex-col">
                <span className={labelClasses}>Phone Number</span>
                {!isEditing ? (
                  <p className="text-slate-800 font-bold ml-1 flex items-center gap-2">
                    <Phone size={16} className="text-slate-400" />
                    {formData.phone || 'Not provided'}
                  </p>
                ) : (
                  <input type="text" name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} className={inputClasses} />
                )}
              </div>

              <div className="flex flex-col">
                <span className={labelClasses}>Designation</span>
                {!isEditing ? (
                  <p className="text-slate-800 font-bold ml-1">{formData.jobTitle || 'Hiring Manager'}</p>
                ) : (
                  <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={inputClasses} />
                )}
              </div>
            </div>
          </div>

          {/* Social Presence Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Globe size={18} />
              </div>
              Social Presence
            </h3>

            <div className="space-y-6">
              <div className="flex flex-col">
                <span className={labelClasses}>LinkedIn Profile</span>
                {!isEditing ? (
                  formData.linkedin ? (
                    <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold ml-1 flex items-center gap-2 hover:underline">
                      <Linkedin size={16} />
                      {formData.linkedin.replace('https://', '')}
                      <ExternalLink size={12} />
                    </a>
                  ) : <p className="text-slate-400 italic ml-1">Not connected</p>
                ) : (
                  <div className="relative">
                    <Linkedin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="linkedin.com/in/username" />
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <span className={labelClasses}>Personal Website / Portfolio</span>
                {!isEditing ? (
                  formData.socialWebsite ? (
                    <a href={formData.socialWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold ml-1 flex items-center gap-2 hover:underline">
                      <Globe size={16} />
                      {formData.socialWebsite.replace('https://', '').replace('http://', '')}
                      <ExternalLink size={12} />
                    </a>
                  ) : <p className="text-slate-400 italic ml-1">No personal website</p>
                ) : (
                  <div className="relative">
                    <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" name="socialWebsite" value={formData.socialWebsite} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="https://personalportfolio.com" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Company Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 md:p-10 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Building2 size={20} />
              </div>
              Company Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div 
                    className={`relative w-20 h-20 rounded-2xl border-2 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 ${isEditing ? 'border-dashed border-blue-300 bg-blue-50/30 cursor-pointer' : 'border-slate-100 bg-white shadow-sm'}`}
                    onClick={() => isEditing && logoInputRef.current.click()}
                  >
                     {formData.companyLogo ? (
                       <img src={formData.companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                     ) : (
                       <div className="text-2xl font-black text-slate-300">
                         {formData.companyName?.charAt(0) || 'C'}
                       </div>
                     )}
                     {isEditing && (
                       <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                         <div className="bg-white p-1.5 rounded-lg shadow-md border border-blue-100 text-blue-600 transform scale-90">
                            <Edit3 size={14} />
                         </div>
                       </div>
                     )}
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <span className={labelClasses}>Company Brand Name</span>
                    {!isEditing ? (
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{formData.companyName}</p>
                    ) : (
                      <input 
                        type="text" 
                        name="companyName" 
                        value={formData.companyName} 
                        onChange={handleChange} 
                        className={`${inputClasses} text-xl font-bold py-3`} 
                        placeholder="Enter your company name"
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className={labelClasses}>About Company</span>
                  {!isEditing ? (
                    <p className="text-slate-600 font-medium leading-relaxed ml-1 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                      {formData.companyDescription || 'No company description provided yet. Add one to help candidates understand your mission.'}
                    </p>
                  ) : (
                    <textarea 
                      name="companyDescription" 
                      value={formData.companyDescription} 
                      onChange={handleChange} 
                      rows="6" 
                      className={`${inputClasses} resize-none py-4`}
                      placeholder="Mission, vision, culture, and what makes your company special..."
                    />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col">
                  <span className={labelClasses}>Industry Domain</span>
                  {!isEditing ? (
                    <p className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-bold inline-block w-fit">
                      {formData.industry}
                    </p>
                  ) : (
                    <select name="industry" value={formData.industry} onChange={handleChange} className={inputClasses}>
                      <option>Information Technology</option>
                      <option>Financial Services</option>
                      <option>Healthcare</option>
                      <option>E-commerce</option>
                      <option>Education</option>
                      <option>Automotive</option>
                      <option>Real Estate</option>
                    </select>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className={labelClasses}>Company Website</span>
                  {!isEditing ? (
                    formData.companyWebsite ? (
                      <a href={formData.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold ml-1 flex items-center gap-2 hover:underline font-bold">
                        {formData.companyWebsite.replace('https://', '').replace('http://', '')}
                        <ExternalLink size={12} />
                      </a>
                    ) : <p className="text-slate-400 italic ml-1 font-medium">No company website set</p>
                  ) : (
                    <input type="text" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} className={inputClasses} placeholder="https://company.com" />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col">
                  <span className={labelClasses}>Company Location</span>
                  {!isEditing ? (
                    <p className="text-slate-800 font-bold ml-1 flex items-center gap-2">
                       <MapPin size={16} className="text-rose-500" />
                       {formData.location || 'Remote / Global'}
                    </p>
                  ) : (
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClasses} placeholder="City, Country" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className={labelClasses}>Team Size</span>
                  {!isEditing ? (
                    <p className="text-slate-800 font-bold ml-1 flex items-center gap-2">
                       <Users size={16} className="text-indigo-500" />
                       {formData.companySize}
                    </p>
                  ) : (
                    <select name="companySize" value={formData.companySize} onChange={handleChange} className={inputClasses}>
                      <option>1-10 employees</option>
                      <option>11-50 employees</option>
                      <option>51-200 employees</option>
                      <option>201-500 employees</option>
                      <option>500-1000 employees</option>
                      <option>1000+ employees</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col">
                  <span className={labelClasses}>Headquarters</span>
                  <p className="text-slate-800 font-bold ml-1 flex items-center gap-2">
                    <Globe size={16} className="text-slate-400" />
                    Global Office
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features / Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <Check size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-emerald-900">Verified Recruiter</h4>
                  <p className="text-xs text-emerald-600 font-medium">Your account is fully verified</p>
               </div>
             </div>
             <div className="bg-blue-50 rounded-[2rem] p-6 border border-blue-100 flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                  <Users size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-blue-900">Hiring Stats</h4>
                  <p className="text-xs text-blue-600 font-medium">Actively hiring for 8+ roles</p>
               </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
