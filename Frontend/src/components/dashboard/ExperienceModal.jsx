import React, { useState, useEffect } from 'react';
import { Briefcase, Building, MapPin, Calendar, Loader2, Save, Trash2, CheckCircle2 } from 'lucide-react';
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

export default function ExperienceModal({ isOpen, onClose, experience, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    employmentType: 'Full-time',
    location: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    description: '',
    keyAchievements: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (experience) {
      setFormData({
        companyName: experience.companyName || '',
        jobTitle: experience.jobTitle || '',
        employmentType: experience.employmentType || 'Full-time',
        location: experience.location || '',
        startDate: experience.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
        endDate: experience.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
        currentlyWorking: experience.currentlyWorking || false,
        description: experience.description || '',
        keyAchievements: experience.keyAchievements || ''
      });
    } else {
      setFormData({
        companyName: '',
        jobTitle: '',
        employmentType: 'Full-time',
        location: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: '',
        keyAchievements: ''
      });
    }
  }, [experience, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (experience?._id) {
        const response = await candidateService.updateExperience(experience._id, formData);
        if (response.success) onSave(response.data);
      } else {
        const response = await candidateService.addExperience(formData);
        if (response.success) onSave(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving experience:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save experience');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!experience?._id) return;
    if (!window.confirm('Are you sure you want to delete this work experience entry?')) return;
    
    setLoading(true);
    try {
      const response = await candidateService.deleteExperience(experience._id);
      if (response.success) {
        onDelete(experience._id);
        onClose();
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const employmentTypes = ['Full-time', 'Part-time', 'Self-employed', 'Freelance', 'Contract', 'Internship', 'Apprenticeship', 'Seasonal'];

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={experience?._id ? "Edit Experience" : "Add Experience"}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Job Title"
            icon={Briefcase}
            value={formData.jobTitle}
            onChange={(val) => setFormData({ ...formData, jobTitle: val })}
            placeholder="e.g. Senior Backend Engineer"
          />
          <InputField
            label="Company Name"
            icon={Building}
            value={formData.companyName}
            onChange={(val) => setFormData({ ...formData, companyName: val })}
            placeholder="e.g. Google"
          />
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 ml-1">Employment Type</label>
            <select
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:20px] bg-[right_1.5rem_center] bg-no-repeat"
            >
              {employmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <InputField
            label="Location"
            icon={MapPin}
            value={formData.location}
            onChange={(val) => setFormData({ ...formData, location: val })}
            placeholder="e.g. Bangalore, India"
          />
          <InputField
            label="Start Date"
            icon={Calendar}
            value={formData.startDate}
            onChange={(val) => setFormData({ ...formData, startDate: val })}
            type="date"
          />
          <InputField
            label="End Date"
            icon={Calendar}
            value={formData.endDate}
            onChange={(val) => setFormData({ ...formData, endDate: val })}
            type="date"
            disabled={formData.currentlyWorking}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, currentlyWorking: !formData.currentlyWorking, endDate: '' })}
            className={`w-12 h-6 rounded-full transition-all relative ${formData.currentlyWorking ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.currentlyWorking ? 'left-7' : 'left-1'}`} />
          </button>
          <span className="text-sm font-bold text-slate-700">I am currently working in this role</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 ml-1">Job Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              placeholder="Describe your core responsibilities..."
              className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 ml-1">Key Achievements</label>
            <textarea
              value={formData.keyAchievements}
              onChange={(e) => setFormData({ ...formData, keyAchievements: e.target.value })}
              rows="3"
              placeholder="Mention quantifiable impacts, projects or awards..."
              className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-100">
          {experience?._id && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-4 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
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
            className="flex-2 py-4 px-6 rounded-2xl font-bold text-white bg-indigo-600 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                {experience?._id ? "Update Experience" : "Add Experience"}
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
