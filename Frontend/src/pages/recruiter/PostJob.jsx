import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Tag, 
  Save, 
  Send,
  Upload,
  CheckCircle2,
  X
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

export default function PostJob() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full Time',
    experience: '1-3 Years',
    salaryMin: '',
    salaryMax: '',
    description: '',
    skills: '',
    deadline: '',
    verified: false,
    logo: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e, status = 'Active') => {
    if (e) e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        logo: formData.logo || 'https://cdn-icons-png.flaticon.com/512/2800/2800115.png',
        location: formData.location,
        type: formData.type,
        isRemote: formData.type === 'Remote',
        experience: formData.experience,
        salary: `₹${formData.salaryMin}L - ₹${formData.salaryMax}L`,
        salaryValue: parseInt(formData.salaryMax) || 0,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s !== '') : [],
        description: formData.description,
        deadline: formData.deadline || null,
        verified: formData.verified,
        status: status === 'published' ? 'Active' : 'Draft',
        // Optional fields for modal view
        responsibilities: [
          "Lead the development of core product features",
          "Collaborate with cross-functional teams",
          "Ensure high-quality code and best practices"
        ],
        requirements: [
          "Relevant experience in the field",
          "Strong problem-solving skills",
          "Excellent communication skills"
        ]
      };

      if (jobData.skills.length === 0) {
        alert('Please add at least one skill.');
        setIsSubmitting(false);
        return;
      }

      await apiService.createJob(jobData);
      alert('Job posted successfully!');
      navigate('/recruiter/jobs');
    } catch (error) {
      console.error('Error posting job:', error);
      alert(typeof error === 'string' ? error : 'Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-slate-700 font-medium placeholder:font-normal placeholder:text-slate-400";
  const labelClasses = "block text-sm font-bold text-slate-700 mb-2 ml-1";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20"
    >
      <div className="mb-8 md:mb-10 text-center md:text-left px-4 md:px-0">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Post New <span className="gradient-text">Job Opportunity</span></h1>
        <p className="text-sm md:text-base text-slate-500 mt-2 font-medium">Reach the best talent by providing clear and detailed job information.</p>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 md:p-12">
          <form onSubmit={(e) => handleSubmit(e, 'published')} className="space-y-10">
            
            {/* Header: Logo Upload & Basic Info */}
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="w-full md:w-auto flex flex-col items-center gap-4">
                <label className={labelClasses}>Company Logo</label>
                <div 
                  onClick={triggerFileInput}
                  className="w-32 h-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group overflow-hidden relative"
                >
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-4" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="text-slate-400 group-hover:text-primary transition-colors mb-2" size={32} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center px-2">Upload Logo</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Job Title</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Senior Product Designer" 
                      className={`${inputClasses} pl-12`} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Company Name</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. Google India" 
                      className={`${inputClasses} pl-12`} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Bangalore, Remote" 
                      className={`${inputClasses} pl-12`} 
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Employment & Salary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className={labelClasses}>Job Type</label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange} 
                    className={`${inputClasses} pl-12 appearance-none relative`}
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClasses}>Experience Required</label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                  <select 
                    name="experience" 
                    value={formData.experience} 
                    onChange={handleChange} 
                    className={`${inputClasses} pl-12 appearance-none relative`}
                  >
                    <option value="Fresher">0-1 Year (Fresher)</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClasses}>Application Deadline</label>
                <input 
                  type="date" 
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={inputClasses} 
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Salary Range (Annual LPA) <span className="normal-case text-[10px] text-slate-400 opacity-80">(e.g. 5 for 5 Lakhs, 12 for 12 Lakhs)</span></label>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="number" 
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder="Min (e.g. 8)" 
                    className={`${inputClasses} pl-10`} 
                    required
                  />
                </div>
                <span className="text-slate-400 font-black">-</span>
                <div className="relative flex-1 group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="number" 
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder="Max (e.g. 15)" 
                    className={`${inputClasses} pl-10`} 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Description & Skills */}
            <div>
              <label className={labelClasses}>Job Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="8" 
                className={`${inputClasses} resize-none`} 
                placeholder="Describe the role, impact, and day-to-day responsibilities..."
                required
              ></textarea>
            </div>

            <div>
              <label className={labelClasses}>Required Skills (Comma separated)</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, TypeScript, AWS" 
                  className={`${inputClasses} pl-12`} 
                  required
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Verified Company</h4>
                  <p className="text-xs text-slate-500 font-medium tracking-wide">Show regular applicants that your company is vetted.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="verified"
                  checked={formData.verified}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-end pt-6">
              <button 
                type="button" 
                onClick={(e) => handleSubmit(e, 'draft')}
                className="w-full md:w-auto px-10 py-4 md:py-5 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save as Draft
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto px-10 md:px-16 py-4 md:py-5 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? 'Publishing...' : (
                  <>
                    Publish Job Listing
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </motion.div>
  );
}
