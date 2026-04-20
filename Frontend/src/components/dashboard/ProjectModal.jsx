import React, { useState, useEffect } from 'react';
import { Layout, FileText, Code, Github, ExternalLink, Calendar, Loader2, Save, Trash2 } from 'lucide-react';
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

export default function ProjectModal({ isOpen, onClose, project, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    technologiesUsed: '',
    githubLink: '',
    liveUrl: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        projectName: project.projectName || '',
        description: project.description || '',
        technologiesUsed: project.technologiesUsed ? project.technologiesUsed.join(', ') : '',
        githubLink: project.githubLink || '',
        liveUrl: project.liveUrl || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        projectName: '',
        description: '',
        technologiesUsed: '',
        githubLink: '',
        liveUrl: '',
        startDate: '',
        endDate: ''
      });
    }
  }, [project, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
        ...formData,
        technologiesUsed: formData.technologiesUsed.split(',').map(s => s.trim()).filter(s => s !== '')
    };
    try {
      if (project?._id) {
        const response = await candidateService.updateProject(project._id, payload);
        if (response.success) onSave(response.data);
      } else {
        const response = await candidateService.addProject(payload);
        if (response.success) onSave(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project?._id) return;
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    setLoading(true);
    try {
      const response = await candidateService.deleteProject(project._id);
      if (response.success) {
        onDelete(project._id);
        onClose();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={project?._id ? "Edit Project" : "Add Project"}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <InputField
              label="Project Name"
              icon={Layout}
              value={formData.projectName}
              onChange={(val) => setFormData({ ...formData, projectName: val })}
              placeholder="e.g. Personal Portfolio"
            />
          </div>
          <div className="md:col-span-2">
            <InputField
              label="Technologies Used"
              icon={Code}
              value={formData.technologiesUsed}
              onChange={(val) => setFormData({ ...formData, technologiesUsed: val })}
              placeholder="e.g. React, Node.js, MongoDB (comma separated)"
            />
          </div>
          <InputField
            label="GitHub Link"
            icon={Github}
            value={formData.githubLink}
            onChange={(val) => setFormData({ ...formData, githubLink: val })}
            placeholder="https://github.com/yourusername/project"
          />
          <InputField
            label="Live URL"
            icon={ExternalLink}
            value={formData.liveUrl}
            onChange={(val) => setFormData({ ...formData, liveUrl: val })}
            placeholder="https://yourproject.com"
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
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 ml-1">Project Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="5"
            placeholder="Mention key features, your roles and technical challenges overcome..."
            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none"
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-100">
          {project?._id && (
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
                {project?._id ? "Update Project" : "Add Project"}
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
