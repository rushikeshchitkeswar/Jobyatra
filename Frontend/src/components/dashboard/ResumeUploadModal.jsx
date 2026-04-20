import React, { useState } from 'react';
import { FileText, Upload, Trash2, CheckCircle2, Loader2, Save, X } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import BaseModal from './BaseModal';

export default function ResumeUploadModal({ isOpen, onClose, onSave }) {
  const [resumeName, setResumeName] = useState('');
  const [file, setFile] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      setFile(selectedFile);
      setResumeName(selectedFile.name.split('.')[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('resumeName', resumeName);
    formData.append('isDefault', isDefault);

    try {
      const response = await candidateService.uploadResume(formData);
      if (response.success) {
        onSave(response.data);
        onClose();
        resetForm();
      }
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError(err.message || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResumeName('');
    setIsDefault(false);
    setError(null);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Upload Professional Resume">
      <form onSubmit={handleSubmit} className="space-y-8">
        {!file ? (
          <div className="group relative border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 bg-slate-50 flex flex-col items-center justify-center hover:bg-white hover:border-indigo-600/40 hover:shadow-2xl hover:shadow-indigo-600/5 transition-all cursor-pointer">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-6 border border-slate-50">
              <Upload size={32} />
            </div>
            <p className="text-lg font-black text-slate-800 mb-1">Click or Drag Resume</p>
            <p className="text-sm font-medium text-slate-400">PDF, DOC, DOCX up to 5MB</p>
          </div>
        ) : (
          <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-center justify-between relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => setFile(null)} className="p-2 bg-white rounded-xl text-red-500 shadow-sm border border-red-50 hover:scale-110 active:scale-95 transition-all">
                    <X size={16} />
                </button>
             </div>
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-50">
                  <FileText size={28} />
                </div>
                <div>
                   <p className="font-black text-indigo-900 truncate max-w-[200px]">{file.name}</p>
                   <p className="text-xs font-bold text-indigo-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
             </div>
             <CheckCircle2 size={32} className="text-indigo-600" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-500 font-bold text-sm rounded-2xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {file && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 ml-1">Resume Label (e.g. Full Stack Developer)</label>
              <input
                type="text"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-900"
                placeholder="Name your resume"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDefault(!isDefault)}
                className={`w-12 h-6 rounded-full transition-all relative ${isDefault ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDefault ? 'left-7' : 'left-1'}`} />
              </button>
              <span className="text-sm font-bold text-slate-700">Set as primary resume</span>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !file}
            className="flex-2 py-4 px-6 rounded-2xl font-bold text-white bg-indigo-600 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Upload Resume
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
