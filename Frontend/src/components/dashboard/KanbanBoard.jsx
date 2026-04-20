import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MapPin, DollarSign, Calendar, MessageCircle,
  Loader2, Building2, ExternalLink, ChevronDown, Filter, X
} from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { format } from 'date-fns';

const STAGES = [
  { id: 'Saved',     label: 'Saved',              color: 'bg-slate-100 text-slate-600',  dot: 'bg-slate-400',   border: 'border-slate-200' },
  { id: 'Applied',   label: 'Applied',            color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500',    border: 'border-blue-200'  },
  { id: 'Screening', label: 'Under Review',        color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500',   border: 'border-amber-200' },
  { id: 'Shortlisted',label: 'Shortlisted',       color: 'bg-purple-100 text-purple-700',dot: 'bg-purple-500',  border: 'border-purple-200'},
  { id: 'Interview', label: 'Interview Scheduled', color: 'bg-cyan-100 text-cyan-700',    dot: 'bg-cyan-500',    border: 'border-cyan-200'  },
  { id: 'Offer',     label: 'Offer Received',      color: 'bg-emerald-100 text-emerald-700',dot:'bg-emerald-500',border: 'border-emerald-200'},
  { id: 'Rejected',  label: 'Rejected',            color: 'bg-rose-100 text-rose-700',    dot: 'bg-rose-500',    border: 'border-rose-200'  },
];

function JobCard({ app }) {
  const job = app.jobId || {};
  const hasMessage = app.status === 'Interview' || app.status === 'Offer';
  const stage = STAGES.find(s => s.id === app.status) || STAGES[1];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, shadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      className={`bg-white rounded-2xl p-4 border ${stage.border} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer select-none`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {job.logo ? (
            <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-1" />
          ) : (
            <Building2 className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 truncate">{job.title || 'Position'}</h4>
          <p className="text-xs text-slate-500 font-medium truncate">{job.company || 'Company'}</p>
        </div>
        {hasMessage && (
          <div className="relative flex-shrink-0" title="Recruiter message available">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        {job.location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <DollarSign className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{job.salary}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span>{app.appliedAt ? format(new Date(app.appliedAt), 'MMM dd, yyyy') : format(new Date(app.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Status badge */}
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${stage.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
        {stage.label}
      </div>
    </motion.div>
  );
}

function SavedJobCard({ job }) {
  const stage = STAGES[0];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-2xl p-4 border ${stage.border} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {job.logo ? (
            <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-1" />
          ) : (
            <Building2 className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 truncate">{job.title}</h4>
          <p className="text-xs text-slate-500 font-medium truncate">{job.company}</p>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
      </div>
      <div className="space-y-1.5 mb-3">
        {job.location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3 h-3" /><span className="truncate">{job.location}</span>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <DollarSign className="w-3 h-3" /><span className="truncate">{job.salary}</span>
          </div>
        )}
      </div>
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${stage.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
        Saved
      </div>
    </motion.div>
  );
}

function KanbanColumn({ stage, cards, isLoading }) {
  return (
    <div className="flex-shrink-0 w-64 xl:w-72 flex flex-col">
      {/* Column Header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${stage.color}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
          <span className="text-sm font-bold">{stage.label}</span>
        </div>
        <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full">
          {isLoading ? '…' : cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1">
        {isLoading ? (
          [1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-2">
              <Briefcase className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-xs text-slate-400 font-medium">No jobs here</p>
          </div>
        ) : (
          <AnimatePresence>
            {cards.map((card, idx) =>
              stage.id === 'Saved'
                ? <SavedJobCard key={card._id} job={card} />
                : <JobCard key={card._id} app={card} />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, savedRes] = await Promise.all([
          candidateService.getAppliedJobs(),
          candidateService.getSavedJobs()
        ]);
        if (appsRes.success) setApplications(appsRes.data);
        if (savedRes.success) setSavedJobs(savedRes.data);
      } catch (err) {
        console.error('Kanban fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getColumnCards = (stageId) => {
    if (stageId === 'Saved') return savedJobs;

    let apps = applications.filter(a => a.status === stageId);

    if (searchTerm) {
      apps = apps.filter(a =>
        a.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.jobId?.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return apps;
  };

  const totalApplications = applications.length;
  const interviewCount = applications.filter(a => a.status === 'Interview').length;
  const offerCount = applications.filter(a => a.status === 'Offer').length;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;

  return (
    <div className="space-y-4">
      {/* Board Stats */}
      <div className="flex flex-wrap gap-3 mb-2">
        {[
          { label: 'Total Applied', value: totalApplications, color: 'text-blue-600 bg-blue-50' },
          { label: 'Interviews', value: interviewCount, color: 'text-cyan-600 bg-cyan-50' },
          { label: 'Offers', value: offerCount, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Rejected', value: rejectedCount, color: 'text-red-600 bg-red-50' },
          { label: 'Saved', value: savedJobs.length, color: 'text-slate-600 bg-slate-50' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${s.color}`}>
            <span className="text-lg font-black">{loading ? '…' : s.value}</span>
            <span className="font-medium opacity-70">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search job title or company…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 font-medium hidden sm:block">← Scroll horizontally to see all stages</p>
      </div>

      {/* Kanban Scroll Container */}
      <div className="overflow-x-auto pb-4 -mx-1 px-1">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              cards={getColumnCards(stage.id)}
              isLoading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
