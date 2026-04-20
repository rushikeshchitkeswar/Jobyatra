import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, ExternalLink, Briefcase } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { format } from 'date-fns';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Hired':
    case 'Offer':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Interview':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Shortlisted':
    case 'Screening':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Applied':
    case 'Pending':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Rejected':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function AppliedJobsSection() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await candidateService.getAppliedJobs();
        if (response.success) {
          setApplications(response.data);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8 animate-pulse">
        <div className="p-6 border-b border-slate-100 h-16 bg-slate-50/50"></div>
        <div className="p-8 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8"
    >
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900">Recent Applications</h3>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
            {applications.length}
          </span>
        </div>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        {applications.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Applied</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                          {app.jobId?.logo ? (
                            <img src={app.jobId.logo} alt={app.jobId.company} className="w-full h-full object-contain" />
                          ) : (
                            <Briefcase className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{app.jobId?.title || 'Unknown Role'}</p>
                          <p className="text-xs font-medium text-slate-500">{app.jobId?.company || 'Unknown Company'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {format(new Date(app.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1.5 ${getStatusBadge(app.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button className="p-2 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors" title="View Details">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={app._id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm shrink-0">
                        {app.jobId?.logo ? (
                          <img src={app.jobId.logo} alt={app.jobId.company} className="w-full h-full object-contain" />
                        ) : (
                          <Briefcase className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{app.jobId?.title || 'Unknown Role'}</p>
                        <p className="text-xs font-medium text-slate-500">{app.jobId?.company || 'Unknown Company'}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-900">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Applied</p>
                      <p className="text-xs font-bold text-slate-600">{format(new Date(app.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                    <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-1.5 ${getStatusBadge(app.status)}`}>
                      <span className="w-1 h-1 rounded-full bg-current opacity-75"></span>
                      {app.status}
                    </span>
                  </div>
                  
                  <button className="w-full py-3 bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-100 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-slate-900 font-bold mb-1">No applications yet</h4>
            <p className="text-slate-500 text-sm mb-6">Start applying for jobs to see them here.</p>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
