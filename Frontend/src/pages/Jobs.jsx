import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  ChevronDown,
  Star,
  Clock,
  X,
  Save,
  CheckCircle2,
  Zap,
  TrendingUp,
  LayoutGrid,
  List,
  RefreshCcw,
  ArrowUpDown,
  Loader2,
  ChevronRight
} from 'lucide-react';
// import { jobsData } from '../data/jobsData'; // Removed static data
import { apiService } from '../services/apiService';
import { candidateService } from '../services/candidateService';
import ApplicationFormModal from '../components/ApplicationFormModal';
import LocationAutocomplete from '../components/LocationAutocomplete';
import useDebounce from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const formatPostedTime = (date) => {
  if (!date) return 'Just now';
  const now = new Date();
  const posted = new Date(date);
  const diffInMs = now - posted;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// --- Sub-components ---

const Badge = ({ children, color = "primary" }) => {
  const colors = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    green: "bg-green-500/10 text-green-600",
    blue: "bg-blue-500/10 text-blue-600",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors[color] || colors.primary}`}>
      {children}
    </span>
  );
};

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-6 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group"
      >
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">{title}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={18} className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterContent = ({ salaryRange, setSalaryRange, onReset, selectedType, onToggleType, experienceLevel, setExperienceLevel, selectedSkills, onToggleSkill }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <Filter size={24} className="text-primary" /> Filters
        </h3>
        <button
          onClick={onReset}
          className="text-sm font-bold text-primary hover:text-primary-dark transition-colors"
        >
          Reset All
        </button>
      </div>

      <FilterSection title="Job Type">
        {['Full Time', 'Part Time', 'Internship', 'Contract', 'Remote'].map((type, idx) => (
          <label key={idx} className="flex items-center gap-4 mb-4 cursor-pointer group last:mb-0">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <input
                type="checkbox"
                className="peer hidden"
                checked={selectedType.includes(type)}
                onChange={() => onToggleType(type)}
              />
              <div className="w-6 h-6 border-2 border-slate-200 rounded-lg group-hover:border-primary peer-checked:border-primary peer-checked:bg-primary transition-all duration-300 shadow-sm" />
              <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <span className="text-slate-600 font-bold group-hover:text-primary transition-colors">{type}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Experience Level">
        {['Any', 'Fresher', '1-3 Years', '3-5 Years', '5+ Years'].map((level, idx) => (
          <label key={idx} className="flex items-center gap-4 mb-4 cursor-pointer group last:mb-0">
            <input
              type="radio"
              name="exp"
              className="w-5 h-5 accent-primary border-slate-200"
              checked={experienceLevel === level}
              onChange={() => setExperienceLevel(level)}
            />
            <span className="text-slate-600 font-bold group-hover:text-primary transition-colors">{level}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Expected Salary (LPA)">
        <div className="px-2 pt-4">
          <input
            type="range"
            min="0"
            max="50"
            value={salaryRange}
            onChange={(e) => setSalaryRange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-black text-slate-400">0 LPA</span>
            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold">At least {salaryRange} LPA</span>
            <span className="text-xs font-black text-slate-400">50 LPA</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Skills Filter">
        <div className="flex flex-wrap gap-2 pt-2">
          {['React', 'Node.js', 'Figma', 'Python', 'AWS', 'Go', 'Docker', 'TypeScript', 'SQL'].map((skill, idx) => (
            <button
              key={idx}
              onClick={() => onToggleSkill(skill)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm ${selectedSkills.includes(skill) ? 'border-primary bg-primary text-white' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-primary hover:text-primary hover:bg-white'}`}
            >
              {skill}
            </button>
          ))}
        </div>
      </FilterSection>
    </>
  );
};

const MobileFilterBar = ({ onOpenFilters, isRemote, setIsRemote, sortBy, setSortBy, experienceLevel, setExperienceLevel }) => {
  return (
    <div className="lg:hidden mb-10 -mx-6 px-6 overflow-x-auto no-scrollbar flex items-center gap-3 py-2">
      <button
        onClick={onOpenFilters}
        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm font-bold text-slate-700 whitespace-nowrap active:scale-95 transition-all hover:border-primary"
      >
        <Filter size={18} className="text-primary" /> Filter
      </button>

      <div className="h-8 w-px bg-slate-200 shrink-0" />

      {/* Quick Sort Toggle */}
      <button
        onClick={() => setSortBy(sortBy === 'latest' ? 'salary' : 'latest')}
        className={`flex items-center gap-2 px-5 py-3 border rounded-2xl shadow-sm font-bold whitespace-nowrap active:scale-95 transition-all ${sortBy === 'salary' ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-700'}`}
      >
        <ArrowUpDown size={18} /> {sortBy === 'salary' ? 'Highly Paid' : 'Latest'}
      </button>

      {/* Remote Toggle */}
      <button
        onClick={() => setIsRemote(!isRemote)}
        className={`flex items-center gap-2 px-5 py-3 border rounded-2xl shadow-sm font-bold whitespace-nowrap active:scale-95 transition-all ${isRemote ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-700'}`}
      >
        <Zap size={18} /> Remote
      </button>

      {/* Experience Shortcut (Simple cycle) */}
      <button
        onClick={() => {
          const levels = ['Any', 'Fresher', '1-3 Years', '3-5 Years', '5+ Years'];
          const currentIndex = levels.indexOf(experienceLevel);
          const nextIndex = (currentIndex + 1) % levels.length;
          setExperienceLevel(levels[nextIndex]);
        }}
        className={`flex items-center gap-2 px-5 py-3 border rounded-2xl shadow-sm font-bold whitespace-nowrap active:scale-95 transition-all ${experienceLevel !== 'Any' ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-700'}`}
      >
        <Briefcase size={18} /> {experienceLevel === 'Any' ? 'Experience' : experienceLevel}
      </button>
    </div>
  );
};

const FilterDrawer = ({ isOpen, onClose, salaryRange, setSalaryRange, onReset, selectedType, onToggleType, experienceLevel, setExperienceLevel, selectedSkills, onToggleSkill }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-full max-w-[320px] bg-white z-[120] lg:hidden shadow-2xl flex flex-col rounded-r-[2.5rem] overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-xl font-black text-slate-900">Filters</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-grow overflow-y-auto px-6 py-4 custom-scrollbar">
              <FilterContent
                salaryRange={salaryRange}
                setSalaryRange={setSalaryRange}
                onReset={onReset}
                selectedType={selectedType}
                onToggleType={onToggleType}
                experienceLevel={experienceLevel}
                setExperienceLevel={setExperienceLevel}
                selectedSkills={selectedSkills}
                onToggleSkill={onToggleSkill}
              />
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
              <button
                onClick={onReset}
                className="flex-1 py-4 px-2 rounded-2xl font-bold text-sm text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 transition-all"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="flex-2 gradient-btn py-4 px-8 rounded-2xl font-bold text-sm text-white shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const JobSkeleton = () => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden animate-pulse">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 shadow-inner" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-100 rounded" />
          <div className="h-4 w-24 bg-slate-50 rounded" />
        </div>
      </div>
      <div className="w-10 h-10 bg-slate-50 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-4 w-full bg-slate-50 rounded" />
      ))}
    </div>
    <div className="flex flex-wrap gap-2 mb-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-6 w-16 bg-slate-50 rounded-lg" />
      ))}
    </div>
    <div className="mt-auto flex items-center justify-between gap-4">
      <div className="h-6 w-20 bg-slate-50 rounded-full" />
      <div className="h-10 flex-grow bg-slate-100 rounded-xl" />
    </div>
  </div>
);

const JobCard = ({ job, onClick, isRecommended = false, initialSaved = false }) => {
  const [isSaved, setIsSaved] = useState(initialSaved);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const jobId = job.id || job._id;
    console.log("DEBUG: Save icon clicked for Job ID:", jobId);

    try {
      // console.log("DEBUG: Sending toggleSaveJob request for Job ID:", jobId);
      const response = await candidateService.toggleSaveJob(jobId);
      // console.log("DEBUG: API Response received:", response);

      if (response.success) {
        setIsSaved(response.isSaved);
        toast.success(response.message || (response.isSaved ? "Job saved successfully!" : "Job removed from saved"));
      } else {
        toast.error(response.message || "Failed to update saved job");
      }
    } catch (error) {
      console.error('DEBUG: Error toggling save job:', error);
      toast.error(typeof error === 'string' ? error : "Something went wrong. Please try again.");
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -8, scale: 1.01 }}
      className={`relative group bg-white p-6 rounded-[2rem] border ${isRecommended ? 'border-primary/20 shadow-primary/5' : 'border-slate-100'} shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer overflow-hidden`}
      onClick={() => onClick(job)}
    >
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />

      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center p-3 border border-slate-100 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <img src={job.logo} alt={job.company} className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight group-hover:text-primary transition-colors">{job.title}</h3>
              <p className="text-slate-500 font-medium flex items-center gap-1.5">{job.company} {job.verified && <CheckCircle2 size={14} className="text-blue-500" />}</p>
            </div>
          </div>
          <button
            onClick={handleToggleSave}
            className={`p-3 rounded-xl transition-all ${isSaved ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-slate-100'}`}
          >
            <Save size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <MapPin size={16} className="text-primary/60" /> {job.location}
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Briefcase size={16} className="text-secondary/60" /> {job.experience}
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
            {job.salary}
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Clock size={16} className="text-green-500/60" /> {formatPostedTime(job.postedDate)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {job.skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold border border-slate-100">
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs font-semibold">
              +{job.skills.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4">
          <Badge color={job.type === 'Full Time' ? 'primary' : job.type === 'Remote' ? 'green' : 'secondary'}>
            {job.type}
          </Badge>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(job, true); // Pass true to indicate direct application attempt
            }}
            className="flex-grow gradient-btn py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-100 active:scale-95 transition-all text-white"
          >
            Apply Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const JobDetailsModal = ({ job, onClose, onApply }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!job) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        className="relative bg-white w-full max-w-4xl h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* New Header: Logo/Title left, X right */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white p-3 shadow-lg border border-slate-100">
              <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">{job.title}</h2>
              <p className="text-slate-500 font-bold text-sm tracking-wide">{job.company} • {job.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all active:scale-95 shadow-sm border border-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto px-10 py-10 space-y-12 custom-scrollbar">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Salary Range</p>
              <p className="text-slate-900 font-black">{job.salary}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Experience</p>
              <p className="text-slate-900 font-black">{job.experience}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Employment</p>
              <p className="text-slate-900 font-black">{job.type}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Deadline</p>
              <p className="text-slate-900 font-black font-sans">{job.deadline || 'No deadline'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-primary rounded-full" /> Job Description
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium text-lg">
              {job.description}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-secondary rounded-full" /> Key Responsibilities
            </h3>
            <ul className="space-y-6">
              {job.responsibilities.map((item, idx) => (
                <li key={idx} className="flex gap-4 p-5 bg-white border border-slate-100 rounded-2xl text-slate-600 leading-relaxed font-medium shadow-sm hover:shadow-md transition-all">
                  <CheckCircle2 size={24} className="text-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-green-500 rounded-full" /> Domain Requirements
            </h3>
            <div className="flex flex-wrap gap-3">
              {job.requirements.map((req, idx) => (
                <span key={idx} className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-black text-sm shadow-sm hover:border-primary/20 transition-all">
                  {req}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer: Professional CTA Area */}
        <div className="p-8 border-t border-slate-100 bg-white/80 backdrop-blur-md sticky bottom-0 z-20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="hidden md:block">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Ready to join the team?</p>
            <h4 className="text-slate-900 font-black">Submit your application today</h4>
          </div>
          <button
            onClick={onApply}
            className="w-full md:w-auto px-16 py-6 rounded-3xl font-black text-xl text-white shadow-2xl shadow-primary/30 active:scale-95 transition-all gradient-btn flex items-center justify-center gap-4 group"
          >
            Apply For This Position
            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Component ---

const Jobs = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedJob, setSelectedJob] = useState(null);
  const [isAppFormOpen, setIsAppFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const jobsPerPage = 8;

  // Local state for inputs to avoid immediate re-renders/fetches
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || "");
  const [localLocation, setLocalLocation] = useState(searchParams.get('location') || "");

  // Debounce the local inputs
  const debouncedSearch = useDebounce(localSearch, 500);
  const debouncedLocation = useDebounce(localLocation, 500);

  // Sync SearchParams with UI State
  const searchQuery = searchParams.get('search') || "";
  const locationQuery = searchParams.get('location') || "";
  const salaryRange = parseInt(searchParams.get('salary')) || 0;
  const isRemote = searchParams.get('remote') === 'true';
  const experienceLevel = searchParams.get('experience') || "Any";
  const selectedType = searchParams.get('type') ? searchParams.get('type').split(',') : [];
  const selectedSkills = searchParams.get('skills') ? searchParams.get('skills').split(',') : [];
  const sortBy = searchParams.get('sort') || "latest";

  // Effect to update searchParams when debounced values change
  useEffect(() => {
    updateFilters({ search: debouncedSearch, location: debouncedLocation });
  }, [debouncedSearch, debouncedLocation]);

  // Effect to sync local state if searchParams change externally (e.g. Back button or Reset)
  useEffect(() => {
    if (searchQuery !== localSearch) setLocalSearch(searchQuery);
    if (locationQuery !== localLocation) setLocalLocation(locationQuery);
  }, [searchQuery, locationQuery]);

  // Fetch Stats and Saved Jobs only ONCE on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const stats = await candidateService.getDashboardStats().catch(() => null);
        if (stats?.success) {
          const savedRes = await candidateService.getSavedJobs().catch(() => ({ data: [] }));
          setSavedJobIds(savedRes.data?.map(j => j._id) || []);
        }
      } catch (error) {
        console.warn("Could not fetch user data for jobs page", error);
      }
    };
    fetchUserData();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: searchQuery,
        location: locationQuery,
        salary: salaryRange,
        remote: isRemote,
        experience: experienceLevel,
        type: selectedType.join(','),
        skills: selectedSkills.join(','),
        sort: sortBy
      };

      const response = await apiService.getJobs(params);
      setJobs(response.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    setCurrentPage(1);
  }, [searchParams]);

  const updateFilters = (newFilters) => {
    setSearchParams(prev => {
      const current = Object.fromEntries(prev.entries());
      const updated = { ...current, ...newFilters };

      // Remove empty values to keep URL clean
      Object.keys(updated).forEach(key => {
        if (!updated[key] || updated[key] === 'Any' || (Array.isArray(updated[key]) && updated[key].length === 0)) {
          delete updated[key];
        }
      });

      return updated;
    });
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handleToggleType = (type) => {
    const newTypes = selectedType.includes(type)
      ? selectedType.filter(t => t !== type)
      : [...selectedType, type];
    updateFilters({ type: newTypes.join(',') });
  };

  const handleToggleSkill = (skill) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    updateFilters({ skills: newSkills.join(',') });
  };

  const recommendedJobs = useMemo(() => jobs.slice(0, 3), [jobs]);

  // Pagination Logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setTimeout(() => {
      document.getElementById('all-jobs-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 10);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 pt-24 font-sans text-slate-900">

      {/* 1. Hero / Job Search Section */}
      <section className="relative pt-0 pb-8 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-10 leading-tight tracking-tight"
          >
            Find Your Next <span className="gradient-text">Career Opportunity</span>
          </motion.h1>

          {/* Search Bar Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-6xl mx-auto p-4 md:p-4 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 flex flex-col xl:flex-row items-center gap-4 transition-all hover:shadow-primary/5 group"
          >
            <div className="flex-grow flex items-center gap-4 px-6 w-full group/field">
              <Search size={22} className="text-slate-400 group-hover/field:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                className="w-full py-4 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>

            <div className="hidden xl:block h-10 w-px bg-slate-200" />


            <LocationAutocomplete
              value={localLocation}
              onChange={(val) => setLocalLocation(val)}
              placeholder="City, state, or remote..."
            />

            <div className="hidden xl:block h-10 w-px bg-slate-200" />

            {/* Experience Dropdown (Simplified for UI) */}
            <div
              onClick={() => {
                const levels = ['Any', 'Fresher', '1-3 Years', '3-5 Years', '5+ Years'];
                const currentIndex = levels.indexOf(experienceLevel);
                const nextIndex = (currentIndex + 1) % levels.length;
                updateFilters({ experience: levels[nextIndex] });
              }}
              className="flex-grow flex items-center gap-4 px-6 w-full cursor-pointer hover:bg-slate-50 rounded-2xl transition-colors py-2"
            >
              <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                <Briefcase size={22} className="text-slate-400" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Experience</p>
                <p className="text-sm font-bold text-slate-900">{experienceLevel || 'Any Level'}</p>
              </div>
              <ChevronDown size={14} className="ml-auto text-slate-400" />
            </div>

            <div className="hidden xl:block h-10 w-px bg-slate-200" />

            {/* Remote Toggle */}
            <div className="flex-shrink-0 flex items-center gap-3 px-6 h-14 bg-slate-50 rounded-2xl group/toggle transition-all hover:bg-white border border-transparent hover:border-slate-100">
              <span className="text-sm font-bold text-slate-600">Remote</span>
              <button
                onClick={() => updateFilters({ remote: !isRemote })}
                className={`w-12 h-6 rounded-full p-1 transition-all ${isRemote ? 'bg-primary' : 'bg-slate-300'}`}
              >
                <motion.div
                  animate={{ x: isRemote ? 24 : 0 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <button
              onClick={() => {
                document.getElementById('job-listings-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full l:w-auto gradient-btn px-7 py-3 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 text-white"
            >
              Search Jobs
            </button>
          </motion.div>
        </div>
      </section>

      <section id="job-listings-section" className="container mx-auto px-6 py-12">
        <MobileFilterBar
          onOpenFilters={() => setIsFiltersOpen(true)}
          isRemote={isRemote}
          setIsRemote={(val) => updateFilters({ remote: val })}
          sortBy={sortBy}
          setSortBy={(val) => updateFilters({ sort: val })}
          experienceLevel={experienceLevel}
          setExperienceLevel={(val) => updateFilters({ experience: val })}
        />

        {/* 2. MAIN PAGE LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start relative">

          {/* 3. FILTER SIDEBAR (Desktop Only) */}
          <aside className="hidden lg:block w-[300px] xl:w-[350px] flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar rounded-[3rem] z-20">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <FilterContent
                salaryRange={salaryRange}
                setSalaryRange={(val) => updateFilters({ salary: val })}
                onReset={handleResetFilters}
                selectedType={selectedType}
                onToggleType={handleToggleType}
                experienceLevel={experienceLevel}
                setExperienceLevel={(val) => updateFilters({ experience: val })}
                selectedSkills={selectedSkills}
                onToggleSkill={handleToggleSkill}
              />

              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-1000" />
                  <div className="relative z-10 text-center">
                    <h4 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
                      <Zap className="text-secondary" /> Premium Pro
                    </h4>
                    <p className="text-white/60 text-xs leading-relaxed mb-6 italic">Unlock hidden job listings & get direct referral codes.</p>
                    <button className="w-full bg-white text-slate-900 font-black text-sm py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">Upgrade Now</button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* 4. JOB LISTINGS SECTION */}
          <main className="flex-grow">

            {/* 9. RECOMMENDED JOBS */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-8 bg-gradient-jobyatra rounded-full" />
                <h2 className="text-3xl font-black text-slate-900">Recommended <span className="gradient-text">For You</span></h2>
                <TrendingUp size={24} className="text-primary ml-2 animate-bounce" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {recommendedJobs.map((job) => (
                  <JobCard key={job._id} job={job} onClick={setSelectedJob} isRecommended />
                ))}
              </div>
            </div>

            {/* 5. SORTING & LIST VIEW */}
            <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">All Job Openings</h2>
                <p className="text-slate-400 font-bold text-sm tracking-wide">{jobs.length} Jobs Available found</p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* View Toggle */}
                <div className="flex bg-white/50 p-1 rounded-2xl border border-slate-200 shadow-sm">
                  <button className="p-3 rounded-xl bg-white shadow-md text-primary transition-all">
                    <LayoutGrid size={20} />
                  </button>
                  <button className="p-3 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                    <List size={20} />
                  </button>
                </div>

                {/* Sorting Dropdown */}
                <div className="relative flex-grow md:flex-grow-0">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="w-full flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-primary transition-colors group"
                  >
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Sort By:</span>
                    <span className="font-bold text-slate-900 whitespace-nowrap">{sortBy === 'latest' ? 'Latest First' : 'Highest Salary'}</span>
                    <ChevronDown size={18} className={`text-slate-400 group-hover:text-primary transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[50]"
                      >
                        {[
                          { label: 'Latest First', value: 'latest' },
                          { label: 'Highest Salary', value: 'salary' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => { updateFilters({ sort: option.value }); setIsSortOpen(false); }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${sortBy === option.value ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div id="all-jobs-view" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 relative min-h-[400px]">
              <AnimatePresence mode='popLayout'>
                {isLoading ? (
                  Array(jobsPerPage).fill(0).map((_, i) => (
                    <JobSkeleton key={i} />
                  ))
                ) : currentJobs.length > 0 ? (
                  currentJobs.map((job) => (
                    <JobCard
                      key={job._id || job.id}
                      job={{
                        ...job,
                        id: job._id || job.id,
                        posted: formatPostedTime(job.postedDate)
                      }}
                      onClick={(job, directApply = false) => {
                        if (!isAuthenticated) {
                          navigate('/login');
                          return;
                        }
                        setSelectedJob(job);
                        if (directApply) setIsAppFormOpen(true);
                      }}
                      initialSaved={savedJobIds.includes(job._id || job.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No jobs available right now</h3>
                    <p className="text-slate-500 font-medium">Please check back later.</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-8 text-primary font-bold hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* 7. PAGINATION */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:text-primary hover:border-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={18} className="rotate-90" />
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="sm:hidden flex items-center justify-center w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:text-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="hidden sm:flex items-center justify-center gap-3">
                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-14 h-14 rounded-2xl font-black transition-all ${currentPage === page ? 'bg-primary text-white shadow-xl shadow-primary/30 border-primary' : 'bg-white text-slate-400 border border-slate-200 hover:text-primary hover:border-primary shadow-sm hover:shadow-md'}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <div className="sm:hidden text-slate-500 font-bold">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:text-primary hover:border-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronDown size={18} className="-rotate-90" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="sm:hidden flex items-center justify-center w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:text-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* 6. JOB DETAILS MODAL */}
      <AnimatePresence>
        {selectedJob && !isAppFormOpen && (
          <JobDetailsModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onApply={() => {
              if (!isAuthenticated) {
                navigate('/login');
              } else {
                setIsAppFormOpen(true);
              }
            }}
          />
        )}
      </AnimatePresence>

      <ApplicationFormModal
        isOpen={isAppFormOpen}
        onClose={() => setIsAppFormOpen(false)}
        job={selectedJob || {}}
      />

      {/* 8. FILTER DRAWER (Mobile/Tablet Only) */}
      <FilterDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        salaryRange={salaryRange}
        setSalaryRange={(val) => updateFilters({ salary: val })}
        onReset={handleResetFilters}
        selectedType={selectedType}
        onToggleType={handleToggleType}
        experienceLevel={experienceLevel}
        setExperienceLevel={(val) => updateFilters({ experience: val })}
        selectedSkills={selectedSkills}
        onToggleSkill={handleToggleSkill}
      />
    </div>
  );
};

export default Jobs;
