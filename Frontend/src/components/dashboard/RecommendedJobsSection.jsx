import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Briefcase, Loader2 } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { useNavigate } from 'react-router-dom';

export default function RecommendedJobsSection() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await candidateService.getRecommendedJobs();
        if (response.success) {
          setJobs(response.data);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-2xl border border-indigo-100 shadow-sm p-8 mb-8 flex items-center justify-center min-h-[150px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-2xl border border-indigo-100 shadow-sm p-6 mb-8 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100" />
            Recommended for You
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Based on your skills and profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {jobs.map((job, index) => (
          <motion.div
            key={job._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
            className="group flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/jobs/${job._id}`)}
          >
            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-2.5 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
              {job.logo ? (
                <img src={job.logo} alt={job.company} className="max-w-full max-h-full object-contain" />
              ) : (
                <Briefcase className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h4>
                  <p className="text-sm font-medium text-slate-500">{job.company} • {job.location}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    <Zap className="w-3.5 h-3.5 fill-indigo-500" />
                    {job.match || 50}% Match
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold">
                {job.skills && job.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end sm:justify-start sm:pl-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/jobs/${job._id}`);
                }}
                className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm"
              >
                <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
