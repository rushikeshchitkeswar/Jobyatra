import React, { useState, useEffect } from 'react';
import { Star, Code, Loader2, Save, Trash2, Globe } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import BaseModal from './BaseModal';
import toast from 'react-hot-toast';

const InputField = ({ label, icon: Icon, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-500 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-300"
      />
    </div>
  </div>
);

export function SkillModal({ isOpen, onClose, onSave, currentSkills = [] }) {
  const [formData, setFormData] = useState({ skillName: '', skillType: 'Technical', skillLevel: 'Intermediate' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.skillName) return;
    setLoading(true);
    try {
      // Backend expects the full array of skills for bulk update
      const formattedExisting = currentSkills.map(s => ({
        skillName: s.skillName,
        skillType: s.skillType,
        skillLevel: s.skillLevel
      }));

      const updatedSkills = [...formattedExisting, formData];
      
      const response = await candidateService.addSkill({ skills: updatedSkills });
      if (response.success) {
          // Pass the freshly updated list back to the parent for instant state sync
          // We use the response data if returned, otherwise our constructed list
          onSave(response.data || updatedSkills);
          setFormData({ skillName: '', skillType: 'Technical', skillLevel: 'Intermediate' });
          onClose();
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error(error.response?.data?.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Add New Skill">
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Skill Name"
          icon={Code}
          value={formData.skillName}
          onChange={(val) => setFormData({ ...formData, skillName: val })}
          placeholder="e.g. React.js"
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">Skill Type</label>
            <select
              value={formData.skillType}
              onChange={(e) => setFormData({ ...formData, skillType: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 appearance-none"
            >
              <option value="Technical">Technical</option>
              <option value="Soft">Soft Skill</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">Level</label>
            <select
              value={formData.skillLevel}
              onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 appearance-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !formData.skillName}
          className="w-full py-4 rounded-2xl font-bold text-white bg-indigo-600 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Add Skill
        </button>
      </form>
    </BaseModal>
  );
}

export function LanguageModal({ isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({ languageName: '', proficiencyLevel: 'Intermediate' });
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.languageName) return;
      setLoading(true);
      try {
        const response = await candidateService.addLanguage(formData);
        if (response.success) {
            onSave(response.data);
            setFormData({ languageName: '', proficiencyLevel: 'Intermediate' });
            onClose();
        }
      } catch (error) {
        console.error('Error adding language:', error);
        toast.error(error.response?.data?.message || 'Failed to add language');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="Add Language">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Language Name"
            icon={Globe}
            value={formData.languageName}
            onChange={(val) => setFormData({ ...formData, languageName: val })}
            placeholder="e.g. English"
          />
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">Proficiency</label>
            <select
              value={formData.proficiencyLevel}
              onChange={(e) => setFormData({ ...formData, proficiencyLevel: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 appearance-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Native">Native</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !formData.languageName}
            className="w-full py-4 rounded-2xl font-bold text-white bg-indigo-600 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Add Language
          </button>
        </form>
      </BaseModal>
    );
  }
