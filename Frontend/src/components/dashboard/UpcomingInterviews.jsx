import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, MapPin, Calendar, Clock, Bell, Building2,
  ExternalLink, ChevronRight, Loader2, CheckCircle2, User
} from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';

const TYPE_CONFIG = {
  Online:  { icon: Video,   color: 'text-blue-600',    bg: 'bg-blue-50',    label: 'Online',  border: 'border-blue-100' },
  Offline: { icon: MapPin,  color: 'text-purple-600',  bg: 'bg-purple-50',  label: 'In-Person', border: 'border-purple-100' },
};

const STATUS_CONFIG = {
  Scheduled:   { color: 'text-blue-600',    bg: 'bg-blue-50',    label: 'Scheduled'   },
  Completed:   { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed'   },
  Cancelled:   { color: 'text-rose-600',    bg: 'bg-rose-50',    label: 'Cancelled'   },
  Rescheduled: { color: 'text-amber-600',   bg: 'bg-amber-50',   label: 'Rescheduled' },
};

function InterviewCard({ interview, index }) {
  const [reminded, setReminded] = useState(false);
  const job = interview.jobId || {};
  const recruiter = interview.recruiterId || {};
  const typeConfig = TYPE_CONFIG[interview.interviewType] || TYPE_CONFIG.Online;
  const statusConfig = STATUS_CONFIG[interview.interviewStatus] || STATUS_CONFIG.Scheduled;
  const TypeIcon = typeConfig.icon;
  const interviewDate = new Date(interview.interviewDate);
  const isUpcoming = !isPast(interviewDate);
  const isToday_ = isToday(interviewDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`bg-white border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all duration-200 ${
        isToday_ ? 'border-blue-200 shadow-blue-50 shadow-sm' : 'border-slate-100'
      }`}
    >
      {isToday_ && (
        <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1 w-fit">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          Today's Interview
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Company logo */}
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {job.logo ? (
            <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-1.5" />
          ) : (
            <Building2 className="w-6 h-6 text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">{job.title || 'Interview'}</h4>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{job.company || recruiter.companyName || 'Company'}</p>
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg flex-shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.label}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-3">
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg ${typeConfig.bg} ${typeConfig.color}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeConfig.label}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {format(interviewDate, 'EEE, MMM dd yyyy')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {format(interviewDate, 'h:mm a')}
            </div>
            {recruiter.name && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <User className="w-3.5 h-3.5" />
                {recruiter.name}
              </div>
            )}
          </div>

          {isUpcoming && (
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {formatDistanceToNow(interviewDate, { addSuffix: true })}
            </p>
          )}

          {interview.notes && (
            <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
              📝 {interview.notes}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {interview.interviewStatus === 'Scheduled' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-slate-50">
          {interview.meetingLink ? (
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors"
            >
              <Video className="w-4 h-4" />
              Join Interview
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-400 text-xs sm:text-sm font-medium rounded-xl border border-slate-100 cursor-not-allowed">
              <Video className="w-4 h-4" />
              No link yet
            </div>
          )}
          <button
            onClick={() => setReminded(true)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              reminded
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {reminded ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            {reminded ? 'Reminded' : 'Remind Me'}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function UpcomingInterviews({ compact = false }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await candidateService.getInterviews();
        if (res.success) setInterviews(res.data);
      } catch (err) {
        console.error('Error fetching interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const filtered = interviews.filter(i => {
    if (filter === 'upcoming') return !isPast(new Date(i.interviewDate)) || isToday(new Date(i.interviewDate));
    if (filter === 'past') return isPast(new Date(i.interviewDate)) && !isToday(new Date(i.interviewDate));
    return true;
  });

  const displayList = compact ? filtered.slice(0, 3) : filtered;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex gap-2">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past',     label: 'Past'     },
            { id: 'all',      label: 'All'       },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                filter === f.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-blue-300" />
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1">No interviews yet</h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Keep applying! Your first interview invite will appear here.
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {displayList.map((interview, idx) => (
              <InterviewCard key={interview._id} interview={interview} index={idx} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
