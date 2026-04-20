import React, { useState, useEffect } from 'react';
import { Award, Calendar, Loader2, Save, Trash2, Globe, FileText } from 'lucide-react';
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

export default function CertificationModal({ isOpen, onClose, certification, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    certificationName: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (certification) {
      setFormData({
        certificationName: certification.certificationName || '',
        issuingOrganization: certification.issuingOrganization || '',
        issueDate: certification.issueDate ? new Date(certification.issueDate).toISOString().split('T')[0] : '',
        expiryDate: certification.expiryDate ? new Date(certification.expiryDate).toISOString().split('T')[0] : '',
        credentialId: certification.credentialId || '',
        credentialUrl: certification.credentialUrl || ''
      });
    } else {
      setFormData({
        certificationName: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: ''
      });
    }
  }, [certification, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (certification?._id) {
        // Update logic (if supported by service/backend) - currently assuming add/delete for simplicity
        const response = await candidateService.addCertification(formData);
        if (response.success) onSave(response.data);
      } else {
        const response = await candidateService.addCertification(formData);
        if (response.success) onSave(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving certification:', error);
      toast.error(error.response?.data?.message || 'Failed to save certification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!certification?._id) return;
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    
    setLoading(true);
    try {
      const response = await candidateService.deleteCertification(certification._id);
      if (response.success) {
        onDelete(certification._id);
        onClose();
      }
    } catch (error) {
      console.error('Error deleting certification:', error);
      toast.error('Failed to delete certification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={certification?._id ? "Edit Certification" : "Add Certification"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <InputField
            label="Certification Name"
            icon={Award}
            value={formData.certificationName}
            onChange={(val) => setFormData({ ...formData, certificationName: val })}
            placeholder="e.g. AWS Certified Solutions Architect"
          />
          <InputField
            label="Issuing Organization"
            icon={Globe}
            value={formData.issuingOrganization}
            onChange={(val) => setFormData({ ...formData, issuingOrganization: val })}
            placeholder="e.g. Amazon Web Services"
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Issue Date"
              icon={Calendar}
              value={formData.issueDate}
              onChange={(val) => setFormData({ ...formData, issueDate: val })}
              type="date"
            />
            <InputField
              label="Expiry Date"
              icon={Calendar}
              value={formData.expiryDate}
              onChange={(val) => setFormData({ ...formData, expiryDate: val })}
              type="date"
            />
          </div>
          <InputField
            label="Credential ID"
            icon={FileText}
            value={formData.credentialId}
            onChange={(val) => setFormData({ ...formData, credentialId: val })}
            placeholder="e.g. ABC-123-XYZ"
          />
          <InputField
            label="Credential URL"
            icon={Globe}
            value={formData.credentialUrl}
            onChange={(val) => setFormData({ ...formData, credentialUrl: val })}
            placeholder="https://verify.example.com/id"
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-100">
          {certification?._id && (
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
                {certification?._id ? "Update Certification" : "Add Certification"}
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
