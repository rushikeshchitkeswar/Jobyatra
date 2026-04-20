import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Plus, Trash2, Briefcase, GraduationCap, User,
  Link as LinkIcon, CheckCircle2, Loader2, FileText, Mail,
  Phone, MapPin, Linkedin, Github, Globe, Dribbble, Star,
  Clock, ChevronRight, AlertCircle, File as FileIcon,
} from 'lucide-react';
import { apiService } from '../services/apiService';

/* ─── Reusable sub-components ────────────────────────────────────────────── */

const SectionHeader = ({ icon: Icon, title, step }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Section {step}</p>
      <h3 className="text-xl font-black text-slate-900">{title}</h3>
    </div>
  </div>
);

const InputField = ({ label, icon: Icon, error, required: req, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-500 ml-1">
      {label}{req && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
        <Icon size={18} />
      </div>
      <input
        {...props}
        className={`w-full pl-14 pr-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 placeholder:text-slate-300 ${
          error ? 'border-red-400 bg-red-50/60' : 'border-slate-100'
        }`}
      />
    </div>
    {error && (
      <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */

const ApplicationFormModal = ({ isOpen, onClose, job }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);
  const [resumeFile, setResumeFile]     = useState(null);
  const [errors, setErrors]             = useState({});
  const resumeInputRef                  = useRef(null);

  /* Close on Escape */
  React.useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  /* ── Form State ──────────────────────────────────────────────────────────── */
  const [formData, setFormData] = useState({
    personalInfo: { fullName: '', email: '', phone: '', location: '' },
    links:        { linkedin: '', portfolio: '', github: '', dribbble: '' },
    education:    [{ qualification: '', university: '', field: '', year: '', cgpa: '' }],
    experience:   {
      status: 'Fresher', hasWorked: 'No',
      currentCompany: '', currentRole: '', yearsExp: '', responsibilities: '',
    },
    skills:    { primary: [], years: '' },
    documents: { coverLetter: '' },
    screening: { interest: '', strength: '', remote: 'Yes', expectedSalary: '', noticePeriod: 'Immediate' },
    declaration: false,
  });

  if (!isOpen) return null;

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const addEducation = () =>
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { qualification: '', university: '', field: '', year: '', cgpa: '' }],
    }));

  const removeEducation = (i) =>
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));

  const updateEdu = (i, field, value) => {
    const updated = [...formData.education];
    updated[i] = { ...updated[i], [field]: value };
    setFormData(prev => ({ ...prev, education: updated }));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setErrors(prev => { const e = { ...prev }; delete e.resume; return e; });
    }
  };

  /* ── Validation ──────────────────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    const p = formData.personalInfo;
    if (!p.fullName.trim())                       e.fullName = 'Full name is required';
    if (!p.email.trim())                          e.email    = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(p.email))    e.email    = 'Please enter a valid email address';
    if (!p.phone.trim())                          e.phone    = 'Phone number is required';
    if (!p.location.trim())                       e.location = 'Location is required';
    if (!resumeFile)                              e.resume   = 'Please upload your resume (PDF or DOCX)';
    if (!formData.screening.interest.trim())      e.interest = 'Please answer this question';
    if (!formData.screening.strength.trim())      e.strength = 'Please answer this question';
    if (!formData.screening.expectedSalary)       e.expectedSalary = 'Expected salary is required';
    return e;
  };

  /* ── Submit ──────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.declaration) {
      setErrors({ submit: 'Please accept the declaration before submitting.' });
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      document.querySelector('.app-form-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const fd = new FormData();

      /* Personal */
      fd.append('name',     formData.personalInfo.fullName.trim());
      fd.append('email',    formData.personalInfo.email.trim());
      fd.append('phone',    formData.personalInfo.phone.trim());
      fd.append('location', formData.personalInfo.location.trim());

      /* Links */
      fd.append('linkedin',  formData.links.linkedin.trim());
      fd.append('portfolio', formData.links.portfolio.trim());
      fd.append('github',    formData.links.github.trim());
      fd.append('dribbble',  formData.links.dribbble.trim());

      /* Education (JSON-serialised array) */
      fd.append('education', JSON.stringify(formData.education));

      /* Experience */
      fd.append('employmentStatus',  formData.experience.status);
      fd.append('hasWorked',         formData.experience.hasWorked);
      fd.append('currentCompany',    formData.experience.currentCompany);
      fd.append('currentRole',       formData.experience.currentRole);
      fd.append('yearsOfExperience', formData.experience.yearsExp);
      fd.append('responsibilities',  formData.experience.responsibilities);

      /* Skills */
      fd.append('primarySkills',    JSON.stringify(formData.skills.primary));
      fd.append('skillExposureYears', formData.skills.years);

      /* Documents */
      fd.append('coverLetter', formData.documents.coverLetter);
      fd.append('resume', resumeFile);          /* ← actual file */

      /* Screening */
      fd.append('interestReason',    formData.screening.interest);
      fd.append('strengthStatement', formData.screening.strength);
      fd.append('remoteComfortable', formData.screening.remote);
      fd.append('expectedSalary',    String(formData.screening.expectedSalary));
      fd.append('noticePeriod',      formData.screening.noticePeriod);

      /* Job meta */
      fd.append('jobTitle', job?.title || '');

      const response = await apiService.submitApplication(job?._id || job?.id, fd);

      if (response?.success) {
        setIsSuccess(true);
      } else {
        setErrors({ submit: response?.message || 'Submission failed. Please try again.' });
      }
    } catch (err) {
      setErrors({ submit: err?.message || 'Submission failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSkills = [
    'React', 'Node.js', 'Java', 'Python', 'AWS',
    'Tailwind CSS', 'Framer Motion', 'TypeScript', 'MongoDB',
  ];

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8"
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
          className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* ── Modal Header ── */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Apply for <span className="gradient-text">{job?.title}</span>
              </h2>
              <p className="text-slate-500 font-bold text-sm tracking-wide">at {job?.company}</p>
            </div>
            <button
              onClick={onClose}
              className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all active:scale-95 shadow-sm border border-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Success Screen ── */}
          {isSuccess ? (
            <div className="flex-grow flex flex-col items-center justify-center p-10 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-32 h-32 rounded-[2.5rem] bg-green-500 text-white flex items-center justify-center shadow-2xl shadow-green-500/40 mb-10"
              >
                <CheckCircle2 size={64} />
              </motion.div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">
                Application Submitted <span className="text-green-500 italic">Successfully!</span>
              </h2>
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-xl font-bold text-slate-500 leading-relaxed">
                  You have successfully applied for the{' '}
                  <span className="text-primary">{job?.title}</span> role at{' '}
                  <span className="text-slate-900 font-extrabold">{job?.company}</span>.
                </p>
                <p className="text-slate-400 font-medium">
                  Our hiring team will review your profile. You'll receive updates on your registered email address.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-16 px-12 py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl active:scale-95 transition-all hover:bg-slate-800"
              >
                Back to Job Listings
              </button>
            </div>

          ) : (
            /* ── Application Form ── */
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="app-form-scroll flex-grow overflow-y-auto px-8 py-10 space-y-16 custom-scrollbar"
            >

              {/* Global error banner */}
              {errors.submit && (
                <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="font-bold text-sm">{errors.submit}</p>
                </div>
              )}

              {/* ── SECTION 1 : Personal Information ── */}
              <section className="group">
                <SectionHeader icon={User} title="Personal Information" step="1" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField
                    label="Full Name" icon={User} placeholder="John Doe" required
                    value={formData.personalInfo.fullName} error={errors.fullName}
                    onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                  />
                  <InputField
                    label="Email Address" icon={Mail} type="email" placeholder="john@example.com" required
                    value={formData.personalInfo.email} error={errors.email}
                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  />
                  <InputField
                    label="Phone Number" icon={Phone} placeholder="+91 98765 43210" required
                    value={formData.personalInfo.phone} error={errors.phone}
                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  />
                  <InputField
                    label="Current Location" icon={MapPin} placeholder="Bangalore, India" required
                    value={formData.personalInfo.location} error={errors.location}
                    onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                  />
                </div>
              </section>

              {/* ── SECTION 2 : Professional Links ── */}
              <section>
                <SectionHeader icon={LinkIcon} title="Professional Links" step="2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="LinkedIn Profile"    icon={Linkedin} placeholder="https://linkedin.com/in/..."
                    value={formData.links.linkedin}  onChange={(e) => handleInputChange('links', 'linkedin', e.target.value)} />
                  <InputField label="Portfolio / Website" icon={Globe}    placeholder="https://johndoe.design"
                    value={formData.links.portfolio} onChange={(e) => handleInputChange('links', 'portfolio', e.target.value)} />
                  <InputField label="GitHub Profile"      icon={Github}   placeholder="https://github.com/..."
                    value={formData.links.github}    onChange={(e) => handleInputChange('links', 'github', e.target.value)} />
                  <InputField label="Dribbble / Behance"  icon={Dribbble} placeholder="https://dribbble.com/..."
                    value={formData.links.dribbble}  onChange={(e) => handleInputChange('links', 'dribbble', e.target.value)} />
                </div>
              </section>

              {/* ── SECTION 3 : Education ── */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <SectionHeader icon={GraduationCap} title="Education History" step="3" />
                  <button type="button" onClick={addEducation}
                    className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all">
                    <Plus size={18} /> Add More
                  </button>
                </div>
                <div className="space-y-8">
                  {formData.education.map((edu, idx) => (
                    <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                      {idx > 0 && (
                        <button type="button" onClick={() => removeEducation(idx)}
                          className="absolute -top-3 -right-3 p-3 bg-white text-red-500 rounded-xl shadow-lg border border-red-50 hover:scale-110 active:scale-90 transition-all">
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-500">Highest Qualification</label>
                          <select
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 appearance-none"
                            value={edu.qualification}
                            onChange={(e) => updateEdu(idx, 'qualification', e.target.value)}
                          >
                            <option value="">Select Qualification</option>
                            {['B.Tech','B.E','M.Tech','BCA','MCA','MBA','Other'].map(q => <option key={q}>{q}</option>)}
                          </select>
                        </div>
                        <InputField label="University / College" icon={Globe}     placeholder="IIT Bombay"
                          value={edu.university} onChange={(e) => updateEdu(idx, 'university', e.target.value)} />
                        <InputField label="Field of Study"       icon={Briefcase} placeholder="Computer Science"
                          value={edu.field}      onChange={(e) => updateEdu(idx, 'field', e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="Graduation Year" icon={Clock}         placeholder="2024"
                            value={edu.year} onChange={(e) => updateEdu(idx, 'year', e.target.value)} />
                          <InputField label="CGPA / %"        icon={CheckCircle2}  placeholder="9.0"
                            value={edu.cgpa} onChange={(e) => updateEdu(idx, 'cgpa', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── SECTION 4 : Work Experience ── */}
              <section>
                <SectionHeader icon={Briefcase} title="Work Experience" step="4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 ml-1">Current Employment Status</label>
                    <div className="flex flex-wrap gap-3">
                      {['Fresher', 'Employed', 'Freelancer', 'Student'].map((s) => (
                        <button key={s} type="button" onClick={() => handleInputChange('experience', 'status', s)}
                          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${formData.experience.status === s ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/30'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 ml-1">Have you worked at any company before?</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((c) => (
                        <button key={c} type="button" onClick={() => handleInputChange('experience', 'hasWorked', c)}
                          className={`flex-1 py-4 rounded-2xl font-black transition-all border ${formData.experience.hasWorked === c ? 'bg-secondary border-secondary text-white shadow-lg shadow-secondary/30' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-secondary/30'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {formData.experience.hasWorked === 'Yes' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="mt-10 overflow-hidden">
                      <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                          {[
                            { label: 'Previous Company',     field: 'currentCompany',   placeholder: 'Google Inc.' },
                            { label: 'Job Role',             field: 'currentRole',      placeholder: 'Senior Developer' },
                            { label: 'Years of Experience',  field: 'yearsExp',         placeholder: '3.5 Years' },
                          ].map(({ label, field, placeholder }) => (
                            <div key={field} className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
                              <input
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all font-bold text-white"
                                placeholder={placeholder}
                                value={formData.experience[field]}
                                onChange={(e) => handleInputChange('experience', field, e.target.value)}
                              />
                            </div>
                          ))}
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Key Responsibilities</label>
                            <textarea rows="4"
                              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium text-white/80"
                              placeholder="Briefly describe your core contributions..."
                              value={formData.experience.responsibilities}
                              onChange={(e) => handleInputChange('experience', 'responsibilities', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* ── SECTION 5 : Skills ── */}
              <section>
                <SectionHeader icon={Star} title="Expertise & Skills" step="5" />
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 ml-1">Primary Skills (Select tags)</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSkills.map((skill) => (
                        <button key={skill} type="button"
                          onClick={() => {
                            const cur = formData.skills.primary;
                            const upd = cur.includes(skill) ? cur.filter(s => s !== skill) : [...cur, skill];
                            handleInputChange('skills', 'primary', upd);
                          }}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${formData.skills.primary.includes(skill) ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50'}`}>
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <InputField label="How many years of exposure in these skills?" icon={Clock} placeholder="e.g. 2+ Years"
                    value={formData.skills.years} onChange={(e) => handleInputChange('skills', 'years', e.target.value)} />
                </div>
              </section>

              {/* ── SECTION 6 : Resume & Documents ── */}
              <section>
                <SectionHeader icon={FileText} title="Resume & Documents" step="6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                  {/* Resume upload zone */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 ml-1">
                      Upload Resume (PDF / DOCX) <span className="text-red-500">*</span>
                    </label>

                    {/* Hidden native file input */}
                    <input
                      ref={resumeInputRef}
                      type="file"
                      id="resume-file-input"
                      name="resume"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeChange}
                      className="hidden"
                    />

                    {/* Clickable drop-zone */}
                    <div
                      onClick={() => resumeInputRef.current?.click()}
                      className={`group relative border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer ${
                        errors.resume
                          ? 'border-red-400 bg-red-50/40'
                          : resumeFile
                          ? 'border-green-400 bg-green-50/40'
                          : 'border-slate-200 bg-slate-50 hover:border-primary/40'
                      }`}
                    >
                      <div className={`w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center transition-all mb-6 border ${
                        resumeFile
                          ? 'bg-green-500 text-white border-green-400 scale-105'
                          : 'bg-white text-primary border-slate-100 group-hover:scale-110 group-hover:bg-primary group-hover:text-white'
                      }`}>
                        {resumeFile ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                      </div>

                      {resumeFile ? (
                        <>
                          <p className="text-base font-black text-green-700 mb-1 text-center px-4 truncate max-w-full">
                            {resumeFile.name}
                          </p>
                          <p className="text-xs font-medium text-green-600">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB — click to change
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-black text-slate-900 mb-1">Click to Upload Resume</p>
                          <p className="text-sm font-medium text-slate-500">PDF or DOCX · Max 5 MB</p>
                        </>
                      )}
                    </div>

                    {errors.resume && (
                      <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1">
                        <AlertCircle size={12} /> {errors.resume}
                      </p>
                    )}
                  </div>

                  {/* Cover letter */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 ml-1">Cover Letter</label>
                    <textarea
                      rows="8"
                      className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-600 leading-relaxed placeholder:text-slate-300"
                      placeholder="Tell us why you are a great fit for this role..."
                      value={formData.documents.coverLetter}
                      onChange={(e) => handleInputChange('documents', 'coverLetter', e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* ── SECTION 7 : Screening Questions ── */}
              <section>
                <SectionHeader icon={Clock} title="Screening Questions" step="7" />
                <div className="space-y-10">

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-900 leading-relaxed">
                      Why are you interested in this role at {job?.company}? <span className="text-primary">*</span>
                    </label>
                    <textarea rows="4"
                      className={`w-full px-8 py-6 border rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-600 ${errors.interest ? 'border-red-400 bg-red-50/40' : 'border-slate-200 bg-white'}`}
                      placeholder="Share your motivation..."
                      value={formData.screening.interest}
                      onChange={(e) => handleInputChange('screening', 'interest', e.target.value)}
                    />
                    {errors.interest && <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1"><AlertCircle size={12} /> {errors.interest}</p>}
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-900 leading-relaxed">
                      What makes you a strong candidate for this position? <span className="text-primary">*</span>
                    </label>
                    <textarea rows="4"
                      className={`w-full px-8 py-6 border rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-600 ${errors.strength ? 'border-red-400 bg-red-50/40' : 'border-slate-200 bg-white'}`}
                      placeholder="Highlight your key achievements and skills..."
                      value={formData.screening.strength}
                      onChange={(e) => handleInputChange('screening', 'strength', e.target.value)}
                    />
                    {errors.strength && <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1"><AlertCircle size={12} /> {errors.strength}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-900">Comfortable working remotely?</label>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map((opt) => (
                          <button key={opt} type="button" onClick={() => handleInputChange('screening', 'remote', opt)}
                            className={`flex-1 py-4 rounded-2xl font-black transition-all border ${formData.screening.remote === opt ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/30'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <InputField
                      label="Expected Salary (per annum)" icon={MapPin}
                      placeholder="e.g. 1500000" type="number" required
                      value={formData.screening.expectedSalary} error={errors.expectedSalary}
                      onChange={(e) => handleInputChange('screening', 'expectedSalary', e.target.value)}
                    />

                    <div className="space-y-4 md:col-span-2">
                      <label className="text-sm font-bold text-slate-900">What is your notice period?</label>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {['Immediate', '15 Days', '30 Days', '60 Days'].map((period) => (
                          <button key={period} type="button" onClick={() => handleInputChange('screening', 'noticePeriod', period)}
                            className={`py-4 rounded-2xl font-bold text-sm transition-all border ${formData.screening.noticePeriod === period ? 'bg-secondary border-secondary text-white shadow-lg shadow-secondary/30' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── SECTION 8 : Declaration ── */}
              <section className="p-10 bg-primary/5 rounded-[3rem] border border-primary/10">
                <label className="flex items-start gap-5 cursor-pointer group">
                  <div className="relative mt-1">
                    <input type="checkbox" className="peer hidden"
                      checked={formData.declaration}
                      onChange={(e) => {
                        setFormData(p => ({ ...p, declaration: e.target.checked }));
                        if (errors.submit) setErrors({});
                      }}
                    />
                    <div className="w-8 h-8 rounded-xl border-2 border-slate-200 group-hover:border-primary peer-checked:bg-primary peer-checked:border-primary transition-all duration-300 flex items-center justify-center">
                      <CheckCircle2 size={18} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-lg font-black text-slate-900 mb-2">Final Declaration</h4>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                      I hereby confirm that all the information provided in this application is accurate and true to the best of my knowledge. I understand that any false representation may lead to disqualification.
                    </p>
                  </div>
                </label>
              </section>

              {/* ── Submit Actions ── */}
              <div className="flex flex-col md:flex-row gap-6 pt-10">
                <button type="button" onClick={onClose}
                  className="flex-1 py-6 rounded-3xl font-black text-slate-400 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95">
                  Cancel Application
                </button>
                <button type="submit"
                  disabled={isSubmitting || !formData.declaration}
                  className="flex-[2] gradient-btn py-6 px-16 rounded-3xl font-black text-lg text-white shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group">
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin" size={24} /> Submitting...</>
                  ) : (
                    <>Submit My Application <ChevronRight className="group-hover:translate-x-2 transition-transform" /></>
                  )}
                </button>
              </div>

            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApplicationFormModal;
