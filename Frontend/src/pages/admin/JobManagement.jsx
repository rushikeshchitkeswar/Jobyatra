import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Building2, 
  Users, 
  CalendarClock, 
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        // In this system, we can use the getUsers but for jobs we have separate endpoints
        // I'll use the getMyJobs logic but tailored for admin if I added an admin all jobs endpoint
      });
      
      // Since I added getStats but not a dedicated 'Admin All Jobs' list yet (other than using public /jobs)
      // I'll use the public jobs API with status=all as implemented in adminService
      const jobsRes = await adminService.getJobs({ 
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setJobs(jobsRes.data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await adminService.deleteJob(id);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
      await adminService.updateJobStatus(id, { status: newStatus });
      toast.success(`Job marked as ${newStatus}`);
      fetchJobs();
    } catch (error) {
      toast.error('Failed to update job status');
    } finally {
      setActiveMenu(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-500 mt-1">Monitor, approve, and manage all job postings.</p>
        </div>
        <button 
          onClick={fetchJobs}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Flagged">Flagged</option>
            </select>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto custom-scrollbar">
          <div className="inline-block min-w-full align-middle">
            {loading && jobs.length === 0 ? (
              <div className="flex items-center justify-center p-20">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-bold uppercase text-[10px] tracking-wider text-gray-500">
                    <th className="px-6 py-4 text-left whitespace-nowrap">Job Details</th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">Company</th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                {jobs.map((job, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    key={job._id} 
                    className="hover:bg-gray-50/50 transition-colors group bg-white"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-base mb-1 group-hover:text-indigo-600 transition-colors cursor-pointer">
                        {job.title}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-600 shrink-0 uppercase">
                          {job.company.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-700">{job.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.status === 'Active' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                      {job.status === 'Closed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200">
                          <XCircle className="w-3.5 h-3.5" /> Closed
                        </span>
                      )}
                      {job.status === 'Flagged' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-red-700 bg-red-50 border border-red-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Flagged
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === job._id ? null : job._id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeMenu === job._id && (
                        <div className="absolute right-8 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 text-left">
                          <button 
                            onClick={() => handleToggleStatus(job._id, job.status)}
                            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            {job.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} 
                            {job.status === 'Active' ? 'Close Job' : 'Activate Job'}
                          </button>
                          <div className="h-px bg-gray-100 my-1"></div>
                          <button 
                            onClick={() => handleDeleteJob(job._id)}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete Job
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {jobs.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">No jobs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default JobManagement;
