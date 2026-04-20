import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  PauseCircle, 
  Trash2, 
  Users, 
  Eye,
  ArrowUpRight,
  PlayCircle
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Dummy Jobs Data removed

export default function ManageJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await apiService.getMyJobs();
        setJobs(response.data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const toggleMenu = (id) => {
    if (activeMenu === id) setActiveMenu(null);
    else setActiveMenu(id);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await apiService.updateJob(id, { status: newStatus });
      if (response.success) {
        setJobs(jobs.map(job => (job._id || job.id) === id ? { ...job, status: newStatus } : job));
        setActiveMenu(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      const response = await apiService.deleteJob(id);
      if (response.success) {
        setJobs(jobs.filter(job => (job._id || job.id) !== id));
        setActiveMenu(null);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || job.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Job Postings</h1>
          <p className="text-slate-500 mt-1">View and manage all your active and closed job listings.</p>
        </div>
        <button 
          onClick={() => navigate('/recruiter/post-job')}
          className="mt-4 md:mt-0 flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-500/30"
        >
          <ArrowUpRight className="w-5 h-5 mr-2" />
          Post New Job
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search jobs by title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-slate-700 shadow-sm"
          />
        </div>
        
        <div className="flex space-x-2">
          {['All', 'Active', 'Paused', 'Closed'].map(status => (
             <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors shadow-sm ${
                  filter === status 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
             >
                {status}
             </button>
          ))}
        </div>
      </div>

      {/* Jobs List (Desktop Table View / Mobile Card View) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Applicants</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date Posted</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                        Loading your jobs...
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                            No jobs found matching your criteria.
                        </td>
                    </tr>
                ) : (
                    filteredJobs.map((job) => (
                      <motion.tr 
                        key={job._id || job.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold uppercase transition-transform group-hover:scale-110">
                              {job.title.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-slate-800">{job.title}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{job.type} • {job.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                            ${job.status === 'Closed' ? 'bg-slate-100 text-slate-600' : 
                              job.status === 'Paused' ? 'bg-amber-100 text-amber-700' : 
                              'bg-emerald-100 text-emerald-700'}`}
                          >
                            {(job.status === 'Active' || !job.status) && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>}
                            {job.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full group-hover:bg-blue-100 transition-colors cursor-pointer flex items-center">
                              {job.applicants || 0}
                              <Users className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                          {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium relative">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger" title="View Applicants">
                               <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Job">
                               <Edit3 className="w-4 h-4" />
                            </button>
                            
                            <div className="relative">
                              <button 
                                onClick={() => toggleMenu(job._id || job.id)}
                                className={`p-2 rounded-lg transition-colors ${activeMenu === (job._id || job.id) ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {/* Dropdown Menu */}
                              <AnimatePresence>
                                {activeMenu === (job._id || job.id) && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                      transition={{ duration: 0.1 }}
                                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 origin-top-right"
                                    >
                                      {job.status !== 'Active' && job.status && (
                                        <button onClick={() => handleStatusChange(job._id || job.id, 'Active')} className="flex items-center w-full px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 content-start text-left">
                                          <PlayCircle className="w-4 h-4 mr-2" /> Mark Active
                                        </button>
                                      )}
                                      {job.status !== 'Paused' && (
                                        <button onClick={() => handleStatusChange(job._id || job.id, 'Paused')} className="flex items-center w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 content-start text-left">
                                          <PauseCircle className="w-4 h-4 mr-2" /> Pause Hiring
                                        </button>
                                      )}
                                      <div className="h-px bg-slate-100 my-1"></div>
                                      <button onClick={() => handleDelete(job._id || job.id)} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 content-start text-left font-medium">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Job
                                      </button>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden divide-y divide-slate-100">
          <AnimatePresence>
            {isLoading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                  Loading your jobs...
                </div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No jobs found matching your criteria.
              </div>
            ) : (
                filteredJobs.map((job) => (
                  <motion.div 
                    key={job._id || job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold uppercase">
                          {job.title.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-bold text-slate-800">{job.title}</h3>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {job.type} • {job.location}
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => toggleMenu(job._id || job.id)}
                          className={`p-2 rounded-lg transition-colors ${activeMenu === (job._id || job.id) ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {/* Mobile Menu Dropdown */}
                        <AnimatePresence>
                          {activeMenu === (job._id || job.id) && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)}></div>
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 origin-top-right overflow-hidden"
                              >
                                {job.status !== 'Active' && job.status && (
                                  <button onClick={() => handleStatusChange(job._id || job.id, 'Active')} className="flex items-center w-full px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 text-left">
                                    <PlayCircle className="w-4 h-4 mr-3" /> Mark Active
                                  </button>
                                )}
                                {job.status !== 'Paused' && (
                                  <button onClick={() => handleStatusChange(job._id || job.id, 'Paused')} className="flex items-center w-full px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 text-left">
                                    <PauseCircle className="w-4 h-4 mr-3" /> Pause Hiring
                                  </button>
                                )}
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button onClick={() => handleDelete(job._id || job.id)} className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left font-semibold">
                                  <Trash2 className="w-4 h-4 mr-3" /> Delete Job
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                       <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                             job.status === 'Closed' ? 'bg-slate-100 text-slate-600' : 
                             job.status === 'Paused' ? 'bg-amber-100 text-amber-700' : 
                             'bg-emerald-100 text-emerald-700'
                          }`}>
                            {job.status || 'Active'}
                          </span>
                       </div>
                       <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Applicants</p>
                          <span className="text-xs font-bold text-blue-600 flex items-center">
                            {job.applicants || 0} <Users className="w-3 h-3 ml-1" />
                          </span>
                       </div>
                       <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Posted</p>
                          <span className="text-xs font-bold text-slate-600">
                            {job.postedDate ? new Date(job.postedDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                          </span>
                       </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                       <button className="flex-1 py-2.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-xl flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" /> View Details
                       </button>
                       <button className="flex-1 py-2.5 bg-slate-50 text-slate-600 text-[11px] font-bold rounded-xl flex items-center justify-center gap-2">
                          <Edit3 className="w-4 h-4" /> Edit
                       </button>
                    </div>
                  </motion.div>
                ))
            )}
          </AnimatePresence>
        </div>
      </div>
        
        {/* Pagination placeholder */}
        <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-700">{filteredJobs.length}</span> of <span className="font-semibold text-slate-700">{jobs.length}</span> jobs</span>
            <div className="flex space-x-1">
                <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
                <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-white bg-blue-600" >1</button>
                <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
            </div>
        </div>
      </div>
  );
}
