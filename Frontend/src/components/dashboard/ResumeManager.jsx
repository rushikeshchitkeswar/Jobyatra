import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Trash2, Download, Star,
  CheckCircle2, Eye, Plus, Loader2, AlertCircle
} from 'lucide-react';
import api from '../../api/api';
import { format } from 'date-fns';

function ResumeCard({ resume, onDelete, isPrimary }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(resume._id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // CandidateResume schema: resumeName, resumeUrl, isDefault, fileSize, fileType
  const displayName = resume.resumeName || resume.name || 'Resume';
  const fileUrl    = resume.resumeUrl  || resume.url  || '';
  const isDefault  = resume.isDefault  || isPrimary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white border rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:shadow-md transition-all duration-200 ${
        isDefault ? 'border-blue-200 shadow-blue-50 shadow-sm' : 'border-slate-100'
      }`}
    >
      {/* File icon */}
      <div className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
        isDefault ? 'bg-blue-50' : 'bg-slate-50'
      }`}>
        <FileText className={`w-5 h-5 sm:w-6 sm:h-6 ${isDefault ? 'text-blue-500' : 'text-slate-400'}`} />
        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 mt-0.5 uppercase">
          {resume.fileType?.includes('pdf') ? 'PDF' : 'DOC'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {displayName}
            </h4>
            {isDefault && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md whitespace-nowrap flex-shrink-0">
                <Star className="w-2.5 h-2.5" />
                Primary
              </span>
            )}
          </div>
        </div>

        {resume.createdAt && (
          <p className="text-xs text-slate-400 font-medium mb-3">
            Uploaded {format(new Date(resume.createdAt), 'MMM dd, yyyy')}
            {resume.fileSize && ` · ${Math.round(resume.fileSize / 1024)} KB`}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors"
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              View
            </a>
          )}
          {fileUrl && (
            <a
              href={fileUrl}
              download={displayName}
              className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Download
            </a>
          )}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function UploadZone({ onUpload, uploading }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }
    onUpload(file);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => !uploading && fileRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
        dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white'
      }`}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />
      {uploading ? (
        <>
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
          <p className="text-sm font-semibold text-blue-600">Uploading resume…</p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-base font-bold text-slate-700 mb-1">
            {dragOver ? 'Drop your resume here' : 'Upload your resume'}
          </p>
          <p className="text-sm text-slate-400 mb-3">Drag & drop or click to browse</p>
          <p className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            PDF or DOCX · Max 5MB
          </p>
        </>
      )}
    </div>
  );
}

export default function ResumeManager() {
  const [resumes, setResumes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const fetchResumes = async () => {
    try {
      // Use dedicated resumes endpoint
      const res = await api.get('/candidate/profile/resumes');
      if (res.data.success) {
        setResumes(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchResumes(); }, []);

  const handleUpload = async (file) => {
    setUploading(true);
    setError('');
    try {
      // Since we don't have cloud storage yet, store a blob URL / base64 placeholder
      // In production this would be a cloud upload (S3, Cloudinary, etc.)
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await api.post('/candidate/profile/resume', {
            resumeName: file.name,
            resumeUrl: reader.result, // base64 data URL as placeholder
            fileSize: file.size,
            fileType: file.type
          });
          if (res.data.success) {
            setSuccess('Resume uploaded successfully!');
            await fetchResumes();
            setTimeout(() => setSuccess(''), 3000);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to upload resume.');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read file.');
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      const res = await api.delete(`/candidate/profile/resume/${id}`);
      if (res.data.success) {
        setResumes(prev => prev.filter(r => r._id !== id));
        setSuccess('Resume deleted.');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resume.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-800 mb-1">Resume Tips</p>
          <ul className="text-xs text-blue-600 space-y-0.5 list-disc list-inside">
            <li>Keep your resume under 1-2 pages</li>
            <li>Use a clean, ATS-friendly format (PDF)</li>
            <li>Quantify achievements with numbers where possible</li>
            <li>Your primary resume is used for all job applications</li>
          </ul>
        </div>
      </div>

      {/* Success / Error banners */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />{success}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4" />{error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload zone */}
      <UploadZone onUpload={handleUpload} uploading={uploading} />

      {/* List */}
      {resumes.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Your Resumes ({resumes.length})
          </h3>
          <AnimatePresence>
            <div className="space-y-3">
              {resumes.map((resume, idx) => (
                <ResumeCard
                  key={resume._id || idx}
                  resume={resume}
                  onDelete={handleDelete}
                  isPrimary={idx === 0}
                />
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}

      {resumes.length === 0 && !uploading && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-400 font-medium">No resumes uploaded yet. Upload your first one above.</p>
        </div>
      )}
    </div>
  );
}
