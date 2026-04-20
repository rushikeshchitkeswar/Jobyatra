import React, { useState, useEffect } from 'react';
import { GraduationCap, School, BookOpen, Calendar, MapPin, Loader2, Save, Trash2 } from 'lucide-react';
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

export default function EducationModal({ isOpen, onClose, education, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    degree: '',
    fieldOfStudy: '',
    school: '',
    location: '',
    startDate: '',
    endDate: '',
    grade: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (education) {
      setFormData({
        degree: education.degree || '',
        fieldOfStudy: education.fieldOfStudy || '',
        school: education.school || '',
        location: education.location || '',
        startDate: education.startDate ? new Date(education.startDate).toISOString().split('T')[0] : '',
        endDate: education.endDate ? new Date(education.endDate).toISOString().split('T')[0] : '',
        grade: education.grade || '',
        description: education.description || ''
      });
    } else {
      setFormData({
        degree: '',
        fieldOfStudy: '',
        school: '',
        location: '',
        startDate: '',
        endDate: '',
        grade: '',
        description: ''
      });
    }
  }, [education, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (education?._id) {
        const response = await candidateService.updateEducation(education._id, formData);
        if (response.success) onSave(response.data);
      } else {
        const response = await candidateService.addEducation(formData);
        if (response.success) onSave(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving education:', error);
      toast.error(error.response?.data?.message || 'Failed to save education entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!education?._id) return;
    if (!window.confirm('Are you sure you want to delete this education entry?')) return;
    
    setLoading(true);
    try {
      const response = await candidateService.deleteEducation(education._id);
      if (response.success) {
        onDelete(education._id);
        onClose();
      }
    } catch (error) {
      console.error('Error deleting education:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={education?._id ? "Edit Education" : "Add Education"}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Degree / Qualification"
            icon={GraduationCap}
            value={formData.degree}
            onChange={(val) => setFormData({ ...formData, degree: val })}
            placeholder="e.g. B.Tech"
          />
          <InputField
            label="Field of Study"
            icon={BookOpen}
            value={formData.fieldOfStudy}
            onChange={(val) => setFormData({ ...formData, fieldOfStudy: val })}
            placeholder="e.g. Computer Science"
          />
          <div className="md:col-span-2">
            <InputField
              label="University / Institution"
              icon={School}
              value={formData.school}
              onChange={(val) => setFormData({ ...formData, school: val })}
              placeholder="e.g. Mumbai University"
            />
          </div>
          <InputField
            label="Location"
            icon={MapPin}
            value={formData.location}
            onChange={(val) => setFormData({ ...formData, location: val })}
            placeholder="e.g. Mumbai, India"
          />
          <InputField
            label="Grade / CGPA"
            icon={Save}
            value={formData.grade}
            onChange={(val) => setFormData({ ...formData, grade: val })}
            placeholder="e.g. 9.2 CGPA"
          />
          <InputField
            label="Start Date"
            icon={Calendar}
            value={formData.startDate}
            onChange={(val) => setFormData({ ...formData, startDate: val })}
            type="date"
          />
          <InputField
            label="End Date (Expected)"
            icon={Calendar}
            value={formData.endDate}
            onChange={(val) => setFormData({ ...formData, endDate: val })}
            type="date"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 ml-1">Key Learnings / Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="4"
            placeholder="Describe your school projects, achievements, etc."
            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none"
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-100">
          {education?._id && (
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
                {education?._id ? "Update Entry" : "Add Entry"}
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
