import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import ScheduleInterviewModal from '../../components/recruiter/ScheduleInterviewModal';
import { 
  ArrowLeft,
  Download,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Linkedin,
  Github,
  BrainCircuit,
  Save,
  Loader2,
  ExternalLink
} from 'lucide-react';

export default function CandidateProfile() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for recruiter notes
  const [notes, setNotes] = useState('');
  const [isNotesSaved, setIsNotesSaved] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getApplicationById(id);
        if (response.success) {
          const app = response.data;
          const candidateInfo = app.candidateId || {};
          
          // Map backend data to local structure
          const mappedCandidate = {
            id: app._id,
            name: app.name || candidateInfo.name,
            role: app.currentRole || candidateInfo.role || 'Professional',
            location: app.location || candidateInfo.location || 'Not Specified',
            email: app.email || candidateInfo.email,
            phone: app.phone || 'Not Specified',
            website: app.portfolio || candidateInfo.portfolio || '',
            status: app.status,
            matchScore: Math.floor(Math.random() * 20) + 75, // Simulated AI score for now
            avatar: candidateInfo.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name || 'C')}&background=random`,
            summary: app.interestReason || app.strengthStatement || 'No summary provided.',
            skills: app.primarySkills?.length > 0 ? app.primarySkills : (candidateInfo.skills || []),
            experience: [
              {
                title: app.currentRole || 'Last Position',
                company: app.currentCompany || 'Not Specified',
                duration: `${app.yearsOfExperience || '0'} Years Experience`,
                description: app.responsibilities || 'No specific responsibilities listed in application.'
              }
            ],
            education: app.education?.map(edu => ({
              degree: edu.qualification,
              institution: edu.university,
              duration: edu.year || 'N/A'
            })) || [],
            projects: [], // Currently not captured in application form
            socialLinks: {
              linkedin: app.linkedin,
              github: app.github
            },
            resumeUrl: app.resumeUrl
          };
          
          setCandidate(mappedCandidate);
          setNotes(app.recruiterNotes || '');
        }
      } catch (err) {
        console.error('Error fetching candidate:', err);
        // Expose more detail in console for debugging
        if (err.response) {
            console.error('Backend returned error:', err.response.status, err.response.data);
        }
        setError('Failed to load candidate profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchCandidateData();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await apiService.updateApplicationStatus(id, newStatus);
      setCandidate(prev => ({ ...prev, status: newStatus }));
      alert(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleSaveNotes = () => {
      // Simulate saving to backend
      setIsNotesSaved(true);
      setTimeout(() => setIsNotesSaved(false), 2000);
  };



  return (
    <div className="pb-12 max-w-6xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <Link to="/recruiter/applicants" className="flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applicants
        </Link>
        <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => updateStatus('Rejected')}
              className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl hover:bg-red-100 transition shadow-sm text-sm"
            >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
            </button>
            <button 
              onClick={() => updateStatus('Shortlisted')}
              className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold rounded-xl hover:bg-emerald-100 transition shadow-sm text-sm"
            >
                <CheckCircle className="w-4 h-4 mr-2" />
                Shortlist
            </button>
            <button 
              onClick={() => setIsInterviewModalOpen(true)}
              className="flex items-center px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-500/20 text-sm"
            >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
            </button>
        </div>
      </div>

      <ScheduleInterviewModal 
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        candidate={candidate}
        application={candidate} // In this context, 'candidate' state holds mapped application data
        onScheduled={(newInterview) => {
          setCandidate(prev => ({ ...prev, status: 'Interview' }));
        }}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Fetching candidate intelligence...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-12 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-800 mb-2">{error}</h3>
            <p className="text-red-600 mb-6">We couldn't retrieve the details for this application.</p>
            <Link to="/recruiter/applicants" className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition">
                Return to List
            </Link>
        </div>
      ) : candidate && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Profile Card & AI Intelligence */}
            <div className="lg:col-span-4 space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
                
                <div className="relative pt-12">
                    <img src={candidate.avatar} alt={candidate.name} className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl mx-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    
                    <h2 className="text-2xl font-black text-slate-800 mt-5">{candidate.name}</h2>
                    <p className="text-sm font-bold text-blue-600 mt-1">{candidate.role}</p>
                    
                    <div className="flex items-center justify-center space-x-2 mt-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                            {candidate.status}
                        </span>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 text-left">
                    <div className="flex items-center text-sm font-medium text-slate-600 group/link">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 group-hover/link:bg-blue-50 transition-colors">
                            <Mail className="w-4 h-4 text-slate-400 group-hover/link:text-blue-500" />
                        </div>
                        <a href={`mailto:${candidate.email}`} className="truncate hover:text-blue-600 transition-colors">{candidate.email}</a>
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-600 group/link">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 group-hover/link:bg-blue-50 transition-colors">
                            <Phone className="w-4 h-4 text-slate-400 group-hover/link:text-blue-500" />
                        </div>
                        {candidate.phone}
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-600 group/link">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 group-hover/link:bg-blue-50 transition-colors">
                            <MapPin className="w-4 h-4 text-slate-400 group-hover/link:text-blue-500" />
                        </div>
                        {candidate.location}
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-600 group/link">
                         <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 group-hover/link:bg-blue-50 transition-colors">
                            <Globe className="w-4 h-4 text-slate-400 group-hover/link:text-blue-500" />
                        </div>
                        <a href={`https://${candidate.website}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">{candidate.website}</a>
                    </div>
                </div>

                <div className="mt-8 flex justify-center space-x-4">
                    <a href="#" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-900 hover:border-slate-900 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <Github className="w-5 h-5" />
                    </a>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    {candidate.resumeUrl ? (
                        <a 
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center px-4 py-3 bg-blue-50 border-2 border-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-100 hover:border-blue-200 transition-colors shadow-sm"
                        >
                            <FileText className="w-5 h-5 mr-2" />
                            View Resume
                        </a>
                    ) : (
                        <div className="text-center text-sm text-slate-400 italic">No resume uploaded</div>
                    )}
                </div>
            </div>

            {/* AI Resume Parsing Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none">
                    <BrainCircuit className="w-32 h-32 text-indigo-400" />
                </div>
                
                <h3 className="text-white font-bold flex items-center mb-4">
                    <BrainCircuit className="w-5 h-5 mr-2 text-indigo-400" />
                    AI Intelligence
                </h3>

                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 mb-6">
                    <div className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-1">Match Score</div>
                    <div className="flex items-end justify-between mb-2">
                        <div className="text-3xl font-black text-white">{candidate.matchScore}%</div>
                        <div className="text-emerald-400 text-sm font-bold">Excellent Fit</div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${candidate.matchScore}%`}} transition={{duration:1}} className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300"></motion.div>
                    </div>
                </div>

                <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3">Top Skills Detected</div>
                    <div className="flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 5).map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-indigo-500/20 text-indigo-100 border border-indigo-500/30 rounded-lg text-xs font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recruiter Notes */}
            <div className="bg-[#FFFDF0] rounded-3xl border border-amber-200/60 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-amber-900 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-amber-600" />
                        Private Notes
                    </h3>
                    {isNotesSaved && <span className="text-xs font-bold text-emerald-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Saved</span>}
                </div>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-transparent border-0 ring-0 p-0 text-amber-900/80 text-sm focus:ring-0 resize-y min-h-[120px] placeholder:text-amber-900/40 outline-none leading-relaxed"
                    placeholder="Add private notes about this candidate..."
                />
                <button 
                    onClick={handleSaveNotes}
                    className="mt-4 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-bold rounded-xl transition-colors w-full flex items-center justify-center"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Note
                </button>
            </div>

        </div>

        {/* Right Column: Detailed CV Info */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Professional Summary */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-slate-800 flex items-center mb-4">
                    <Star className="w-6 h-6 mr-3 text-blue-600" />
                    Professional Summary
                </h3>
                <p className="text-slate-600 leading-relaxed">
                    {candidate.summary}
                </p>
            </div>

            {/* Resume Skills Map */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-slate-800 flex items-center mb-6">
                    <CheckCircle className="w-6 h-6 mr-3 text-emerald-500" />
                    Candidate Profile Map
                </h3>
                <div className="flex flex-wrap gap-3">
                    {candidate.skills.map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-default">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-slate-800 flex items-center mb-8">
                    <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
                    Work Experience
                </h3>
                <div className="space-y-10">
                    {candidate.experience.map((exp, index) => (
                        <div key={index} className="relative pl-8 sm:pl-10 before:absolute before:left-0 before:top-2 before:w-4 before:h-4 before:bg-blue-600 before:rounded-full before:ring-4 before:ring-blue-100 after:absolute after:left-[7px] after:top-8 after:w-0.5 after:h-[120%] after:bg-slate-100 last:after:hidden">
                            <h4 className="text-lg font-bold text-slate-800">{exp.title}</h4>
                            <div className="flex flex-col sm:flex-row sm:items-center text-sm font-semibold mt-1 mb-3">
                                <span className="text-indigo-600">{exp.company}</span>
                                <span className="hidden sm:inline mx-3 text-slate-300">•</span>
                                <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{exp.duration}</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                                {exp.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-slate-800 flex items-center mb-8">
                    <GraduationCap className="w-6 h-6 mr-3 text-indigo-600" />
                    Education History
                </h3>
                <div className="space-y-6">
                    {candidate.education.map((edu, index) => (
                        <div key={index} className="flex items-start">
                            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mr-5 flex-shrink-0">
                                <GraduationCap className="w-7 h-7 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-800">{edu.degree}</h4>
                                <p className="font-semibold text-slate-600 mt-1">{edu.institution}</p>
                                <p className="text-sm font-medium text-slate-500 mt-1">{edu.duration}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
      )}
    </div>
  );
}
