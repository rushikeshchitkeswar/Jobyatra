import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, ChevronRight, Briefcase, Loader2 } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const TrackingStages = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired'];

const stageMap = {
  'Applied': 0,
  'pending': 0,
  'Screening': 1,
  'Shortlisted': 2,
  'Interview': 3,
  'Offer': 4,
  'Hired': 5,
  'Rejected': -1 // Special case
};

export default function ApplicationTracking() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestApplication = async () => {
      try {
        const response = await candidateService.getAppliedJobs();
        if (response.success && response.data.length > 0) {
          // Get the most recent application
          setApplication(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching latest application:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestApplication();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm mb-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return null; // Don't show if no applications
  }

  const currentStageIndex = stageMap[application.status] ?? 0;
  const isRejected = application.status === 'Rejected';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm mb-8 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Active Application
            {!isRejected && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isRejected 
              ? 'This application has been closed' 
              : 'Track your progress for your most recent application'}
          </p>
        </div>
        
        <div 
          onClick={() => navigate(`/jobs/${application.jobId?._id}`)}
          className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-2xl w-full md:w-auto hover:bg-slate-100 transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex items-center justify-center overflow-hidden">
            {application.jobId?.logo ? (
              <img src={application.jobId.logo} alt={application.jobId.company} className="w-full h-full object-contain" />
            ) : (
              <Briefcase className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="flex-1 pr-4">
            <h4 className="text-base font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
              {application.jobId?.title || 'Unknown Role'}
            </h4>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{application.jobId?.company || 'Unknown Company'}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(application.createdAt), 'MMM dd, yyyy')}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Stepper Pipeline */}
      {!isRejected ? (
        <div className="relative z-10 px-2 sm:px-4">
          <div className="max-w-4xl mx-auto">
            {/* Desktop Stepper (Horizontal) */}
            <div className="hidden sm:flex justify-between relative mt-4">
              {/* Background Line */}
              <div className="absolute left-0 top-5 w-full h-1 bg-slate-100 rounded-full" />
              
              {/* Active Progress Line */}
              <div 
                className="absolute left-0 top-5 h-1 bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(currentStageIndex / (TrackingStages.length - 1)) * 100}%` }}
              />

              {TrackingStages.map((stage, index) => {
                const isCompleted = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <div key={stage} className="relative flex flex-col items-center group z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5, type: 'spring' }}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                        ${isCompleted 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-white border-slate-200 text-slate-400'}
                        ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}
                      `}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </motion.div>
                    <p className={`
                      mt-3 text-xs md:text-sm font-bold whitespace-nowrap transition-colors duration-300
                      ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'}
                    `}>
                      {stage}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Mobile Stepper (Vertical/Compact Grid) */}
            <div className="sm:hidden grid grid-cols-3 gap-y-8 gap-x-4">
               {TrackingStages.map((stage, index) => {
                const isCompleted = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <div key={stage} className="flex flex-col items-center">
                    <div className="relative">
                       {/* Connection handle (horizontal) */}
                       {index % 3 !== 2 && index < TrackingStages.length -1 && (
                         <div className={`absolute left-full top-1/2 -translate-y-1/2 w-full h-0.5 z-0 ${index < currentStageIndex ? 'bg-blue-600' : 'bg-slate-100'}`} />
                       )}
                       
                       <motion.div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] border-2 transition-all relative z-10
                          ${isCompleted 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-400'}
                          ${isCurrent ? 'ring-4 ring-blue-50 scale-110' : ''}
                        `}
                      >
                        {isCompleted ? '✓' : index + 1}
                      </motion.div>
                    </div>
                    <p className={`
                      mt-2 text-[10px] font-black uppercase tracking-tighter text-center
                      ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'}
                    `}>
                      {stage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-4 sm:h-8"></div>
        </div>
      ) : (
        <div className="relative z-10 p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center">
            <p className="text-rose-600 font-bold">This application was rejected. Keep trying!</p>
        </div>
      )}
    </motion.div>
  );
}
