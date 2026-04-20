import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Mail, Phone, Edit2, Briefcase, GraduationCap,
  Code, Award, ExternalLink, Github, Linkedin, Globe,
  CheckCircle2, Calendar, Target, User, ChevronRight,
  LayoutGrid, BookOpen, Star, Plus, Trash2, FileText, Upload,
  Clock, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';

// Modals
import BasicInfoModal from '../../components/dashboard/BasicInfoModal';
import ExperienceModal from '../../components/dashboard/ExperienceModal';
import EducationModal from '../../components/dashboard/EducationModal';
import ProjectModal from '../../components/dashboard/ProjectModal';
import { SkillModal, LanguageModal } from '../../components/dashboard/SkillLanguageModals';
import PreferencesModal from '../../components/dashboard/PreferencesModal';
import CertificationModal from '../../components/dashboard/CertificationModal';
import ResumeManager from '../../components/dashboard/ResumeManager';

const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8 animate-pulse">
    <div className="h-48 md:h-64 bg-slate-200 rounded-3xl md:rounded-[3rem]" />
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-40 h-40 bg-slate-200 rounded-3xl -mt-20 border-8 border-white shadow-xl" />
      <div className="flex-1 space-y-4 pt-4">
        <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-4 bg-slate-200 rounded-lg w-1/4" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 h-96 bg-slate-100 rounded-[2.5rem]" />
      <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
    </div>
  </div>
);

const DashboardProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const { updateUser } = useAuth();

  // Modal States
  const [modals, setModals] = useState({
    basicInfo: false,
    experience: false,
    education: false,
    project: false,
    skill: false,
    language: false,
    preferences: false,
    certification: false
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [selectedItem, setSelectedItem] = useState(null);

  const fetchProfile = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await candidateService.getProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleModalToggle = (modalName, isOpen, item = null) => {
    setSelectedItem(item);
    setModals(prev => ({ ...prev, [modalName]: isOpen }));
  };

  const handleSuccess = (message) => {
    toast.success(message || 'Profile updated successfully!');
    fetchProfile(true);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG or PNG image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('Image size must be less than 2MB');
      return;
    }

    // 2. Instant Local Preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // 3. Background Upload
    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await candidateService.uploadPhoto(formData);
      if (response.success) {
        toast.success('Profile photo updated successfully!');
        // Update local profile state with the persistent Cloudinary URL
        setProfile(prev => ({ ...prev, profilePhoto: response.data.profilePhoto }));
        
        // Sync with global auth state to update navbar instantly
        updateUser({ profileImage: response.data.profilePhoto });
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast.error(typeof error === 'string' ? error : 'Failed to upload photo');
      // Revert preview on failure
      setPhotoPreview(null);
    } finally {
      setIsUploadingPhoto(false);
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    }
  };

  const tabs = [
    { id: 'Overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'Experience', label: 'Experience & Skills', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'Education', label: 'Education', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'Projects', label: 'Projects & More', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'Certifications', label: 'Certifications', icon: <Award className="w-4 h-4" /> },
  ];

  const levelColors = {
    Expert: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Intermediate: "bg-sky-100 text-sky-700 border-sky-200",
    Beginner: "bg-amber-100 text-amber-700 border-amber-200"
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Not Found</h2>
      <p className="text-slate-500 max-w-md mb-8">We couldn't retrieve your profile data. If you're new here, you might need to complete your onboarding.</p>
      <button onClick={() => fetchProfile()} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
        Try Again
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <User className="w-6 h-6 text-indigo-500" /> Professional Summary
                </h3>
                <button
                  onClick={() => handleModalToggle('basicInfo', true)}
                  className="p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 text-slate-500 hover:text-indigo-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg italic whitespace-pre-wrap">
                {profile.summary || "Write a brief summary about your professional journey..."}
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-indigo-500" /> Availability & Preferences
                </h3>
                <button
                  onClick={() => handleModalToggle('preferences', true)}
                  className="p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 text-slate-500 hover:text-indigo-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Notice Period</span>
                  <p className="text-lg font-bold text-slate-800">{profile.noticePeriod || 'Not specified'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Portfolio</span>
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-lg font-bold text-indigo-600 hover:underline flex items-center gap-2">
                    {profile.portfolioUrl ? 'Visit Portfolio' : 'None added'} <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'Experience':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-indigo-500" /> Work Experience
                  </h3>
                  <button
                    onClick={() => handleModalToggle('experience', true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 text-sm"
                  >
                    <Plus size={18} /> Add Experience
                  </button>
                </div>

                {!profile.experience || profile.experience.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                      <Briefcase size={32} />
                    </div>
                    <p className="text-slate-400 font-medium">No work experience added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-10 relative before:absolute before:left-[13px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                    {profile.experience.map((job, idx) => (
                      <div key={job._id || idx} className="relative pl-12 group">
                        <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-white border-[5px] border-indigo-50 z-10 flex items-center justify-center shadow-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        </div>
                        <div className="bg-slate-50/50 p-6 rounded-3xl group-hover:bg-white border border-transparent group-hover:border-slate-100 group-hover:shadow-sm transition-all">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                              <h4 className="font-black text-slate-800 text-lg">{job.jobTitle}</h4>
                              <p className="text-indigo-600 font-black text-sm uppercase tracking-wider">{job.companyName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                                {new Date(job.startDate).toLocaleDateString()} - {job.currentlyWorking ? 'Present' : new Date(job.endDate).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => handleModalToggle('experience', true, job)}
                                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600 border border-slate-200"
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-500 text-sm leading-relaxed mb-4">{job.description}</p>
                          {job.keyAchievements && (
                            <div className="pt-4 border-t border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Key Achievements</p>
                              <p className="text-slate-600 text-sm">{job.keyAchievements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skills & Stats Column */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Star className="w-6 h-6 text-indigo-500" /> Skills
                  </h3>
                  <button
                    onClick={() => handleModalToggle('skill', true)}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-100"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Technical Arsenal</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {profile.skills?.length > 0 ? profile.skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-black text-slate-700 hover:bg-white hover:border-indigo-100 hover:text-indigo-600 transition-all group/skill">
                          {typeof skill === 'string' ? skill : skill.skillName}
                          <button
                            onClick={async () => {
                              const updatedSkills = profile.skills.filter((_, index) => index !== i);
                              const formattedSkills = updatedSkills.map(s => ({
                                skillName: s.skillName,
                                skillType: s.skillType,
                                skillLevel: s.skillLevel
                              }));
                              try {
                                const response = await candidateService.addSkill({ skills: formattedSkills });
                                if (response.success) {
                                  setProfile(prev => ({ ...prev, skills: updatedSkills }));
                                  toast.success('Skill removed');
                                }
                              } catch (err) {
                                toast.error('Failed to remove skill');
                              }
                            }}
                            className="opacity-0 group-hover/skill:opacity-100 hover:text-rose-500 transition-all p-0.5"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Globe className="w-6 h-6 text-indigo-500" /> Languages
                  </h3>
                  <button
                    onClick={() => handleModalToggle('language', true)}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-100"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {profile.languages?.length > 0 ? profile.languages.map((lang, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 group/lang relative">
                      <div>
                        <p className="text-sm font-black text-slate-800">{lang.languageName}</p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{lang.proficiencyLevel}</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const response = await candidateService.deleteLanguage(lang._id);
                            if (response.success) {
                              setProfile(prev => ({
                                ...prev,
                                languages: prev.languages.filter(l => l._id !== lang._id)
                              }));
                              toast.success('Language removed');
                            }
                          } catch (err) {
                            toast.error('Failed to remove language');
                          }
                        }}
                        className="opacity-0 group-hover/lang:opacity-100 hover:text-rose-500 transition-all p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic font-medium">No languages listed.</p>
                  )}
                </div>
              </div>

              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-600/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold">Profile Strength</h4>
                </div>
                <div className="space-y-4">
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.completionPercentage || 0}%` }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                  <p className="text-sm text-indigo-100">
                    Your profile is <strong>{profile.completionPercentage || 0}%</strong> complete. 
                    {profile.completionPercentage < 100 ? ' Complete missing sections to stand out!' : ' Your profile is legendary!'}
                  </p>
                  
                  {profile.missingSections?.length > 0 && (
                    <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Next Steps</p>
                      {profile.missingSections.slice(0, 2).map((section, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-white/80">
                          <Plus size={12} /> Add {section.label} (+{section.weight}%)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'Education':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="flex items-center justify-between mb-6 px-4">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Academic Background</h3>
              <button
                onClick={() => handleModalToggle('education', true)}
                className="flex items-center gap-2 px-8 py-4 bg-white text-slate-800 border-2 border-slate-100 rounded-3xl font-black shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95"
              >
                <Plus size={20} /> Add Education
              </button>
            </div>

            {!profile.education || profile.education.length === 0 ? (
              <div className="bg-white p-20 text-center rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-400 mx-auto mb-6">
                  <GraduationCap size={40} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Build your academic foundation</h4>
                <p className="text-slate-400 mb-8">Tell us about your degrees and learning history.</p>
                <button onClick={() => handleModalToggle('education', true)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100">Start Adding</button>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.education.map((edu, idx) => (
                  <motion.div
                    key={edu._id || idx}
                    whileHover={{ scale: 1.01 }}
                    className="group bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col md:flex-row items-start md:items-center gap-8 relative"
                  >
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-50/50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                      <GraduationCap className="w-10 h-10" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{edu.degree}</h4>
                        <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Completed</span>
                      </div>
                      <p className="text-indigo-600 font-black text-lg mb-1">{edu.fieldOfStudy}</p>
                      <p className="text-slate-500 font-bold mb-6 italic">{edu.schoolName}</p>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                          <Calendar size={14} className="text-slate-300" />
                          Class of {new Date(edu.endDate).getFullYear()}
                        </div>
                        {edu.grade && (
                          <div className="flex items-center gap-2 text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                            <Star size={14} fill="currentColor" />
                            GPA: {edu.grade}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleModalToggle('education', true, edu)}
                      className="absolute top-10 right-10 p-4 rounded-[1.5rem] bg-slate-50 text-slate-400 hover:bg-slate-800 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 size={20} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        );
      case 'Projects':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Project Showcase</h3>
                  <p className="text-slate-400 font-medium">Demonstrate your technical depth through real projects.</p>
                </div>
                <button
                  onClick={() => handleModalToggle('project', true)}
                  className="flex items-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Plus size={24} /> New Project
                </button>
              </div>

              {!profile.projects || profile.projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                    <LayoutGrid size={48} />
                  </div>
                  <p className="text-slate-400 font-bold mb-4">No projects showcased yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {profile.projects.map((proj, idx) => (
                    <div key={proj._id || idx} className="group p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all flex flex-col justify-between relative h-full">
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <MapPin size={32} />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleModalToggle('project', true, proj)}
                              className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <a href={proj.link} target="_blank" rel="noreferrer" className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm hover:scale-110 transition-all">
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        </div>
                        <h4 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">{proj.projectName}</h4>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 line-clamp-3">
                          {proj.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {proj.technologiesUsed?.map((t, i) => (
                          <span key={i} className="px-4 py-1.5 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ResumeManager profile={profile} onUpdate={() => fetchProfile(true)} />

              {/* Socials card */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                    <Globe className="w-8 h-8 text-indigo-500" /> Digital Presence
                  </h3>
                  <button
                    onClick={() => handleModalToggle('basicInfo', true)}
                    className="p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 text-slate-500 hover:text-indigo-600"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] group hover:bg-slate-900 transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                      <Github className="w-8 h-8 text-slate-800 group-hover:text-white" />
                      <div>
                        <p className="text-lg font-black text-slate-800 group-hover:text-white">GitHub</p>
                        <p className="text-xs text-slate-400 font-medium">github.com/{profile.socialLinks?.github || '---'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-white" />
                  </div>
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] group hover:bg-blue-600 transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                      <Linkedin className="w-8 h-8 text-[#0077b5] group-hover:text-white" />
                      <div>
                        <p className="text-lg font-black text-slate-800 group-hover:text-white">LinkedIn</p>
                        <p className="text-xs text-slate-400 font-medium font-medium">linkedin.com/in/{profile.socialLinks?.linkedin || '---'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'Certifications':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between px-4">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Professional Certifications</h3>
              <button
                onClick={() => handleModalToggle('certification', true)}
                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus size={20} /> Add Certification
              </button>
            </div>

            {!profile.certifications || profile.certifications.length === 0 ? (
              <div className="bg-white p-20 text-center rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-400 mx-auto mb-6">
                  <Award size={40} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Showcase your verified skills</h4>
                <p className="text-slate-400 mb-8">Add certifications from AWS, Google, etc. to boost your profile.</p>
                <button onClick={() => handleModalToggle('certification', true)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100">Add First Certification</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profile.certifications.map((cert, idx) => (
                  <div key={cert._id || idx} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex items-start gap-6 relative">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black text-slate-800 mb-1">{cert.certificationName}</h4>
                      <p className="text-indigo-600 font-bold text-sm mb-4">{cert.issuingOrganization}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">
                          Issued {new Date(cert.issueDate).toLocaleDateString()}
                        </span>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline text-xs flex items-center gap-1 font-bold">
                            Verify <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm('Delete this certification?')) {
                          try {
                            const res = await candidateService.deleteCertification(cert._id);
                            if (res.success) {
                              setProfile(prev => ({
                                ...prev,
                                certifications: prev.certifications.filter(c => c._id !== cert._id)
                              }));
                              toast.success('Certification removed');
                            }
                          } catch (err) {
                            toast.error('Failed to remove certification');
                          }
                        }
                      }}
                      className="absolute top-8 right-8 p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="relative">
        {/* Modern Dynamic Banner */}
        <div className="h-48 sm:h-64 md:h-80 w-full relative overflow-hidden animate-gradient-slow bg-gradient-to-br from-indigo-700 via-violet-600 to-emerald-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50" />
          <div className="absolute top-10 left-10 text-white/10 select-none pointer-events-none">
            <Calendar size={200} />
          </div>

          <div className="absolute bottom-6 right-6 flex gap-4">
            <button className="px-8 py-3 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all">
              Change Cover
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-20">
          <div className="relative -mt-20 sm:-mt-24 md:-mt-32 mb-12">
            <div className="flex flex-col items-center md:flex-row md:items-end gap-6 md:gap-10 text-center md:text-left">
              <div className="relative group">
                <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl md:rounded-[3rem] border-[8px] md:border-[12px] border-slate-50 shadow-2xl overflow-hidden bg-white shadow-indigo-600/10 transform transition-transform duration-300">
                  <img
                    src={photoPreview || profile.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                    alt={profile.fullName}
                    className="w-full h-full object-cover transition-all duration-500"
                  />

                  {/* Loading State */}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-indigo-600/20 animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden File Input - Maintained but not triggered from the image anymore */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="flex-1 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tightest">
                        {profile.fullName}
                      </h1>
                      <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border border-blue-100 shadow-sm w-fit mx-auto md:mx-0">
                        <CheckCircle2 size={14} className="sm:w-4 sm:h-4" fill="currentColor" /> Verified Profile
                      </div>
                    </div>
                    <p className="text-xl font-bold text-slate-500 tracking-tight font-serif italic">
                      {profile.jobTitle || "Your Professional Identity"}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6 md:gap-8 pt-2">
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black text-slate-400 group cursor-default">
                        <MapPin className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        {profile.location || 'Location missing'}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black text-slate-400 group cursor-default">
                        <Mail className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="max-w-[150px] sm:max-w-none truncate">{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black text-slate-400 group cursor-default">
                        <Phone className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        {profile.phone || 'Phone missing'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleModalToggle('basicInfo', true)}
                    className="flex-none px-10 py-5 bg-slate-900 text-white rounded-3xl font-black shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3"
                  >
                    <Edit2 size={20} /> Edit Base Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 border-slate-200 sticky top-0 bg-slate-50/90 backdrop-blur-xl z-[40] px-4 py-6 md:py-8 -mx-4 mb-8 md:mb-12 scroll-px-4 no-scrollbar overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-black tracking-tighter transition-all whitespace-nowrap border-2 ${activeTab === tab.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-900/30'
                    : 'bg-white text-slate-400 border-white hover:border-slate-200 hover:text-slate-600 shadow-sm'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <main className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Persistence Modals Integration */}
      <BasicInfoModal
        isOpen={modals.basicInfo}
        onClose={() => handleModalToggle('basicInfo', false)}
        profile={profile}
        onSave={(updatedData) => {
          setProfile(prev => ({ ...prev, ...updatedData }));
          handleSuccess('Basic information updated!');
        }}
      />
      <ExperienceModal
        isOpen={modals.experience}
        onClose={() => handleModalToggle('experience', false)}
        experience={selectedItem}
        onSave={() => handleSuccess(selectedItem ? 'Experience updated!' : 'New experience added!')}
        onDelete={() => handleSuccess('Experience removed.')}
      />
      <EducationModal
        isOpen={modals.education}
        onClose={() => handleModalToggle('education', false)}
        education={selectedItem}
        onSave={() => handleSuccess(selectedItem ? 'Education updated!' : 'Academic history added!')}
        onDelete={() => handleSuccess('Education entry removed.')}
      />
      <ProjectModal
        isOpen={modals.project}
        onClose={() => handleModalToggle('project', false)}
        project={selectedItem}
        onSave={() => handleSuccess(selectedItem ? 'Project updated!' : 'New project showcased!')}
        onDelete={() => handleSuccess('Project removed.')}
      />
      <SkillModal
        isOpen={modals.skill}
        onClose={() => handleModalToggle('skill', false)}
        currentSkills={profile.skills || []}
        onSave={(updatedSkills) => {
          setProfile(prev => ({ ...prev, skills: updatedSkills }));
          handleSuccess('Skills updated!');
        }}
      />
      <PreferencesModal
        isOpen={modals.preferences}
        onClose={() => handleModalToggle('preferences', false)}
        profile={profile}
        onSave={(updatedData) => {
          setProfile(prev => ({ ...prev, ...updatedData }));
          handleSuccess('Preferences updated!');
        }}
      />
      <LanguageModal
        isOpen={modals.language}
        onClose={() => handleModalToggle('language', false)}
        profile={profile}
        onSave={(newLang) => {
          setProfile(prev => ({
            ...prev,
            languages: [...(prev.languages || []), newLang]
          }));
          handleSuccess('Language added!');
        }}
      />
      <CertificationModal
        isOpen={modals.certification}
        onClose={() => handleModalToggle('certification', false)}
        certification={selectedItem}
        onSave={(newCert) => {
          if (selectedItem) {
            setProfile(prev => ({
              ...prev,
              certifications: prev.certifications.map(c => c._id === selectedItem._id ? newCert : c)
            }));
          } else {
            setProfile(prev => ({
              ...prev,
              certifications: [...(prev.certifications || []), newCert]
            }));
          }
          handleSuccess(selectedItem ? 'Certification updated!' : 'Certification added!');
        }}
        onDelete={(id) => {
          setProfile(prev => ({
            ...prev,
            certifications: prev.certifications.filter(c => c._id !== id)
          }));
        }}
      />
    </div>
  );
};

export default DashboardProfile;
