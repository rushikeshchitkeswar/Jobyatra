import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  Users,
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit3,
  Link as LinkIcon
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useEffect } from 'react';

const upcomingInterviews = [
  {
    id: 1,
    candidate: 'Rushikesh',
    role: 'Senior Frontend Engineer',
    date: 'Oct 24, 2026',
    time: '10:00 AM - 11:00 AM',
    mode: 'Google Meet',
    link: 'meet.google.com/abc-xyz-123',
    status: 'Scheduled',
    interviewer: 'Sarah Jenkins',
    avatar: 'https://i.pravatar.cc/150?u=rushi'
  },
  {
    id: 2,
    candidate: 'Amit',
    role: 'Senior Frontend Engineer',
    date: 'Oct 24, 2026',
    time: '02:00 PM - 03:00 PM',
    mode: 'Zoom',
    link: 'zoom.us/j/123456789',
    status: 'Scheduled',
    interviewer: 'David Chen',
    avatar: 'https://i.pravatar.cc/150?u=amit'
  },
  {
    id: 3,
    candidate: 'Rahul',
    role: 'Backend Developer',
    date: 'Oct 25, 2026',
    time: '11:30 AM - 12:30 PM',
    mode: 'In-person',
    location: 'TechCorp HQ, Block C',
    status: 'Pending Confirmation',
    interviewer: 'Sarah Jenkins',
    avatar: 'https://i.pravatar.cc/150?u=rahul'
  }
];

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getMyInterviews();
      if (response.success) {
        // Map backend interview to frontend structure
        const mapped = response.data.map(int => ({
          id: int._id,
          candidate: int.studentId?.name || 'Unknown',
          role: int.jobId?.title || 'Unknown Role',
          date: new Date(int.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawDate: int.interviewDate,
          time: new Date(int.interviewDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          mode: int.interviewType,
          link: int.meetingLink,
          location: int.location,
          status: int.interviewStatus,
          interviewer: 'You',
          avatar: int.studentId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(int.studentId?.name || 'C')}&background=random`
        }));
        setInterviews(mapped);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [refreshTrigger]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await apiService.updateInterview(id, { interviewStatus: newStatus });
      if (response.success) {
        setRefreshTrigger(prev => prev + 1);
        setActiveMenu(null);
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this interview?')) return;
    try {
      const response = await apiService.deleteInterview(id);
      if (response.success) {
        setRefreshTrigger(prev => prev + 1);
        setActiveMenu(null);
      }
    } catch (error) {
      alert('Failed to delete interview');
    }
  };

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Interview Scheduling</h1>
          <p className="text-slate-500 mt-1">Manage upcoming interviews and coordinate with candidates.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 md:mt-0 flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-500/30"
        >
          <Plus className="w-5 h-5 mr-2" />
          Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Calendar / List Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800">Upcoming Interviews</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-slate-50 rounded w-3/4" />
                      <div className="h-4 bg-slate-50 rounded w-1/2" />
                      <div className="h-10 bg-slate-50 rounded w-full mt-4" />
                    </div>
                  </div>
                </div>
              ))
            ) : interviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">No interviews scheduled</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-1">You haven't scheduled any interviews yet. Start by selecting a candidate from your applications.</p>
              </div>
            ) : (
              interviews.map(interview => (
                <motion.div 
                  key={interview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 relative"
                >
                  {/* Date/Time Block */}
                  <div className="flex sm:flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-full sm:min-w-[120px] flex-row sm:gap-1 gap-4">
                    <div className="flex items-center sm:flex-col gap-2 sm:gap-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {interview.date.split(' ')[0]} {/* Month */}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-blue-600">
                        {interview.date.split(' ')[1].replace(',', '')} {/* Day */}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 flex items-center text-center bg-white sm:bg-transparent px-2 py-1 rounded-lg sm:p-0 shadow-sm sm:shadow-none">
                      <Clock className="w-3 h-3 mr-1 text-blue-500" />
                      {interview.time}
                    </span>
                  </div>

                  {/* Details Block */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2 mt-1">
                      <div className="flex items-center gap-4">
                        <img src={interview.avatar} alt={interview.candidate} className="w-10 h-10 rounded-full border border-slate-200" />
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 flex items-center flex-wrap gap-2 text-wrap">
                            Interview with {interview.candidate}
                            {interview.status === 'Scheduled' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide border border-blue-200">Scheduled</span>
                            ) : interview.status === 'Completed' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide border border-emerald-200">Completed</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wide border border-rose-200">{interview.status}</span>
                            )}
                          </h3>
                          <p className="text-sm font-medium text-slate-600">{interview.role}</p>
                        </div>
                      </div>
                      
                      <div className="relative shrink-0">
                        <button 
                          onClick={() => toggleMenu(interview.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        <AnimatePresence>
                          {activeMenu === interview.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 overflow-hidden"
                              >
                                <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50"><Edit3 className="w-4 h-4 mr-2" /> Edit Details</button>
                                {interview.status !== 'Completed' && (
                                  <button onClick={() => handleStatusUpdate(interview.id, 'Completed')} className="flex items-center w-full px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors border-b border-slate-50"><CheckCircle className="w-4 h-4 mr-2" /> Mark Completed</button>
                                )}
                                <button onClick={() => handleDelete(interview.id)} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"><XCircle className="w-4 h-4 mr-2" /> Cancel Interview</button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center text-sm text-slate-600">
                        <Users className="w-4 h-4 mr-2.5 text-slate-400" />
                        Interviewer: <span className="font-medium text-slate-800 ml-1">{interview.interviewer}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        {interview.mode === 'In-person' ? (
                          <MapPin className="w-4 h-4 mr-2.5 text-slate-400" />
                        ) : (
                          <Video className="w-4 h-4 mr-2.5 text-slate-400" />
                        )}
                        Platform: <span className="font-medium text-slate-800 ml-1">{interview.mode}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
                      {interview.link && (
                        <a href={interview.link.startsWith('http') ? interview.link : `https://${interview.link}`} target="_blank" rel="noreferrer" className="flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all border border-blue-100 w-full sm:w-auto active:scale-[0.98]">
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Join Meeting
                        </a>
                      )}
                      {interview.location && (
                        <div className="flex items-center justify-center text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl w-full sm:w-auto">
                          <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                          {interview.location}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Mini Calendar & Stats */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 line-clamp-none">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-slate-800">
                 {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
               </h3>
               <div className="flex space-x-1">
                 <button className="p-1 hover:bg-slate-100 rounded text-slate-500">&lt;</button>
                 <button className="p-1 hover:bg-slate-100 rounded text-slate-500">&gt;</button>
               </div>
             </div>
             
             <div className="grid grid-cols-7 gap-1 text-center mb-2">
               {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                 <div key={i} className="text-xs font-semibold text-slate-400 py-1">{d}</div>
               ))}
             </div>
             
             <div className="grid grid-cols-7 gap-1 text-center text-sm">
               {/* Simplified dynamic calendar dots */}
               {Array.from({length: 31}, (_, i) => {
                 const date = i + 1;
                 const hasInterview = interviews.some(int => new Date(int.rawDate).getDate() === date);
                 const isToday = new Date().getDate() === date;
                 return (
                   <button 
                     key={date} 
                     className={`py-1.5 rounded-md hover:bg-slate-100 font-medium transition-colors relative ${
                       hasInterview ? 'text-blue-700 font-bold' : 'text-slate-700'
                     } ${isToday ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                   >
                     {date}
                     {hasInterview && !isToday && (
                       <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                     )}
                   </button>
                 );
               })}
             </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <CalendarIcon className="w-32 h-32" />
            </div>
            <h3 className="text-lg font-bold mb-1 relative z-10">Connect Calendar</h3>
            <p className="text-indigo-100 text-sm mb-4 relative z-10">Sync your Google Workspace or Outlook calendar to avoid double bookings.</p>
            <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow relative z-10 w-full">
              Sync Calendar Now
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
