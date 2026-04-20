import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookmarkMinus, ExternalLink, MapPin, Briefcase, Loader2, Calendar } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SavedJobsSection() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSavedJobs = async () => {
    try {
      const response = await candidateService.getSavedJobs();
      if (response.success) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleToggleSave = async (e, jobId) => {
    e.stopPropagation();
    try {
      const response = await candidateService.toggleSaveJob(jobId);
      if (response.success) {
        // Remove from list if successfully un-saved
        setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
        toast.success(response.message || "Job removed from saved list");
      } else {
        toast.error(response.message || "Failed to remove job");
      }
    } catch (error) {
      console.error('Error toggling save job:', error);
      toast.error(typeof error === 'string' ? error : "Failed to remove job");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Saved Jobs</h3>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
          {jobs.length}
        </span>
      </div>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group block p-5 rounded-2xl border border-slate-100 hover:border-blue-100 bg-slate-50/50 hover:bg-blue-50/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer"
              onClick={() => navigate(`/jobs/${job._id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 p-2 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                  {job.logo ? (
                    <img src={job.logo} alt={job.company} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Briefcase className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <button 
                  onClick={(e) => handleToggleSave(e, job._id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove from saved"
                >
                  <BookmarkMinus className="w-5 h-5" />
                </button>
              </div>
              
              <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h4>
              <p className="text-sm font-medium text-slate-500 mb-4">{job.company}</p>
              
              <div className="flex flex-wrap gap-2 mb-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700">
                  {job.salary}
                </span>
              </div>

              {job.savedAt && (
                <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Calendar className="w-3 h-3" />
                  Saved on: {new Date(job.savedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              )}

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/jobs/${job._id}`);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
              >
                View Job Details
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookmarkMinus className="w-8 h-8 text-slate-300" />
          </div>
          <h4 className="text-slate-900 font-bold mb-1">No saved jobs</h4>
          <p className="text-slate-500 text-sm mb-6">Explore jobs and save them to apply later.</p>
          <button 
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Find Jobs
          </button>
        </div>
      )}
    </div>
  );
}
