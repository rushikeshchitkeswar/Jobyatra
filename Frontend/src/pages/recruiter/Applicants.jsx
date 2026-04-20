import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle,
    Calendar,
    FileText,
    ExternalLink,
    MapPin,
    Star,
    Download,
    Mail,
    SlidersHorizontal,
    Briefcase,
    GraduationCap,
    Building2,
    ChevronDown,
    Sparkles,
    Clock
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useEffect } from 'react';

// Enhanced Dummy Applicants Data removed

// Dynamic requirements are now fetched from selectedJob


export default function Applicants() {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [applicants, setApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [selectedApplicants, setSelectedApplicants] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);

    // Filter States
    const [filters, setFilters] = useState({
        skills: [],
        experience: [0, 15], // Min to Max years
        education: [],
        location: [],
        status: [],
        noticePeriod: [],
        minMatchScore: 0,
        expectedSalary: [0, 100], // In Lakhs (normalizing values)
        saved: false
    });

    useEffect(() => {
        const fetchRecruiterJobs = async () => {
            try {
                const response = await apiService.getMyJobs();
                if (response.success && response.data.length > 0) {
                    setJobs(response.data);
                    setSelectedJobId(response.data[0]._id);
                    setSelectedJob(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching recruiter jobs:', error);
            }
        };
        fetchRecruiterJobs();
    }, []);

    useEffect(() => {
        if (selectedJobId && jobs.length > 0) {
            const job = jobs.find(j => j._id === selectedJobId);
            if (job) setSelectedJob(job);
        }
    }, [selectedJobId, jobs]);

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            try {
                const response = await apiService.getJobApplications(selectedJobId);
                if (response.success) {
                    const mapped = response.data.map(app => {
                        const candidateInfo = app.candidateId || {};

                        // Normalize experience string to number
                        let expVal = parseInt(app.yearsOfExperience) || 0;
                        if (isNaN(expVal)) expVal = 0;

                        // Normalize salary string to number (Handle formats like "12 LPA", "8,00,000")
                        let salVal = 0;
                        if (app.expectedSalary) {
                            const numericPart = app.expectedSalary.replace(/[^0-9.]/g, '');
                            salVal = parseFloat(numericPart) || 0;
                            // If the value is > 100,000, convert to LPA for range slider consistency [0-100]
                            if (salVal > 1000) salVal = salVal / 100000;
                        }

                        return {
                            id: app._id,
                            name: app.name || candidateInfo.name || 'Unknown',
                            role: app.currentRole || candidateInfo.role || 'Candidate',
                            appliedDate: new Date(app.appliedAt).toLocaleDateString(),
                            experience: app.yearsOfExperience || 'Not specified',
                            experienceValue: expVal,
                            salaryValue: salVal,
                            expectedSalary: app.expectedSalary || 'Not disclosed',
                            noticePeriod: app.noticePeriod || 'Immediate',
                            education: app.education?.[0]?.qualification || 'Not specified',
                            university: app.education?.[0]?.university || 'N/A',
                            company: app.currentCompany || 'N/A',
                            location: app.location || candidateInfo.location || 'N/A',
                            skills: app.primarySkills?.length > 0 ? app.primarySkills : (candidateInfo.skills || []),
                            status: app.status,
                            resumeUrl: app.resumeUrl,
                            email: app.email || candidateInfo.email,
                            avatar: candidateInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name || 'U')}&background=random`
                        };
                    });
                    setApplicants(mapped);
                }
            } catch (error) {
                console.error('Error fetching applications:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplications();
    }, [selectedJobId]);



    // Calculate Match Score based on selected Job's real Requirements
    const calculateMatchScore = (applicant) => {
        if (!selectedJob) return 0;

        let score = 0;
        const jobSkills = selectedJob.skills || [];
        const requiredExpStr = selectedJob.experience || 'Any';

        // 1. Skills Match (Max 60 points)
        if (jobSkills.length > 0) {
            const matchedSkills = applicant.skills.filter(skill =>
                jobSkills.some(req => req.toLowerCase() === skill.toLowerCase())
            );
            const skillScore = (matchedSkills.length / jobSkills.length) * 60;
            score += Math.min(skillScore, 60);
        } else {
            score += 30; // Neutral if no skills specified
        }

        // 2. Experience Match (Max 30 points)
        // Map job requirement string to range
        let minReq = 0;
        if (requiredExpStr.includes('1-3')) minReq = 1;
        else if (requiredExpStr.includes('3-5')) minReq = 3;
        else if (requiredExpStr.includes('5+')) minReq = 5;

        if (applicant.experienceValue >= minReq) {
            score += 30;
        } else if (applicant.experienceValue >= minReq - 1) {
            score += 15; // Close match
        }

        // 3. Location Match (Max 10 points)
        const jobLoc = selectedJob.location?.toLowerCase() || '';
        const appLoc = applicant.location?.toLowerCase() || '';
        if (jobLoc === 'remote' || appLoc.includes(jobLoc)) {
            score += 10;
        }

        return Math.round(score);
    };

    // Memoized matching and sorting
    const { processedApplicants, savedCount } = useMemo(() => {
        // 1. Calculate scores and map data
        let processed = applicants.map(app => ({
            ...app,
            matchScore: calculateMatchScore(app)
        }));

        // 2. Filter logic
        processed = processed.filter(app => {
            // Global Search
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                app.name.toLowerCase().includes(searchLower) ||
                app.skills.some(s => s.toLowerCase().includes(searchLower)) ||
                app.experience.toLowerCase().includes(searchLower);

            // Category Filters
            const matchesSkills = filters.skills.length === 0 ||
                filters.skills.some(f => app.skills.includes(f));

            const matchesExp = app.experienceValue >= filters.experience[0] &&
                app.experienceValue <= filters.experience[1];

            const matchesEdu = filters.education.length === 0 ||
                filters.education.some(f => app.education.includes(f));

            const matchesLoc = filters.location.length === 0 ||
                filters.location.includes(app.location);

            const matchesStatus = filters.status.length === 0 ||
                filters.status.includes(app.status);

            const matchesNotice = filters.noticePeriod.length === 0 ||
                filters.noticePeriod.includes(app.noticePeriod);

            const matchesScore = app.matchScore >= filters.minMatchScore;

            const matchesSalary = app.salaryValue === 0 || (
                app.salaryValue >= filters.expectedSalary[0] &&
                app.salaryValue <= filters.expectedSalary[1]
            );

            // Check if "Saved" filter is active
            const matchesSaved = filters.saved ? app.isSaved : true;

            return matchesSearch && matchesSkills && matchesExp && matchesEdu &&
                matchesLoc && matchesStatus && matchesSaved && matchesNotice &&
                matchesScore && matchesSalary;
        });

        // 3. Sort by Match Score Descending
        processed.sort((a, b) => b.matchScore - a.matchScore);

        const savedCountValue = applicants.filter(a => a.isSaved).length;

        return { processedApplicants: processed, savedCount: savedCountValue };
    }, [applicants, searchTerm, filters]);


    const toggleFilter = (category, value) => {
        setFilters(prev => {
            if (category === 'saved') {
                return { ...prev, saved: !prev.saved };
            }
            const current = prev[category] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const toggleSaveCandidate = (id) => {
        setApplicants(apps => apps.map(app =>
            app.id === id ? { ...app, isSaved: !app.isSaved } : app
        ));
    };

    const toggleSelectApplicant = (id) => {
        setSelectedApplicants(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedApplicants.length === processedApplicants.length) {
            setSelectedApplicants([]);
        } else {
            setSelectedApplicants(processedApplicants.map(a => a.id));
        }
    };

    const executeBulkAction = (status) => {
        setApplicants(apps => apps.map(app =>
            selectedApplicants.includes(app.id) ? { ...app, status } : app
        ));
        setSelectedApplicants([]);
    };

    const toggleMenu = (id) => {
        setActiveMenu(activeMenu === id ? null : id);
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await apiService.updateApplicationStatus(id, newStatus);
            setApplicants(apps => apps.map(app => app.id === id ? { ...app, status: newStatus } : app));
            setActiveMenu(null);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getMatchScoreStyles = (score) => {
        if (score >= 85) return { color: 'text-emerald-600', bg: 'bg-emerald-600', label: 'Excellent Match', ring: 'ring-emerald-100' };
        if (score >= 70) return { color: 'text-blue-600', bg: 'bg-blue-600', label: 'Good Match', ring: 'ring-blue-100' };
        if (score >= 50) return { color: 'text-amber-600', bg: 'bg-amber-600', label: 'Fair Match', ring: 'ring-amber-100' };
        return { color: 'text-rose-600', bg: 'bg-rose-600', label: 'Low Match', ring: 'ring-rose-100' };
    };

    // Enhanced Filter Options from DB fields
    const filterOptions = {
        skills: ['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'MongoDB', 'Docker', 'Figma'],
        location: ['Remote', 'Pune', 'Bangalore', 'Hyderabad', 'Delhi', 'Mumbai'],
        education: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BE', 'MBA', 'PhD'],
        status: ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Rejected'],
        noticePeriod: ['Immediate', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days'],
    };

    const [expandedCategories, setExpandedCategories] = useState(['location', 'status', 'noticePeriod']);

    const toggleCategory = (cat) => {
        setExpandedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    // Filter Sidebar Component
    const FilterSidebar = () => (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-y-auto max-h-[calc(100vh-140px)] sticky top-24 custom-scrollbar space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                    Filter Intelligence
                </h3>
                {(Object.values(filters).flat().some(v => Array.isArray(v) ? v.length > 0 : v !== 0 && v !== false)) && (
                    <button
                        onClick={() => setFilters({
                            skills: [], experience: [0, 15], education: [], location: [],
                            status: [], noticePeriod: [], minMatchScore: 0,
                            expectedSalary: [0, 100], saved: false
                        })}
                        className="text-xs font-bold text-blue-600 hover:underline"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="space-y-8">
                {/* Match Score Slider */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Min Match Score</h4>
                        <span className="text-xs font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">{filters.minMatchScore}%</span>
                    </div>
                    <input
                        type="range" min="0" max="95" step="5"
                        value={filters.minMatchScore}
                        onChange={(e) => setFilters({ ...filters, minMatchScore: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Experience Slider */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Experience (Years)</h4>
                        <span className="text-xs font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">{filters.experience[0]} - {filters.experience[1]}y</span>
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="number" min="0" max="15"
                            value={filters.experience[0]}
                            onChange={(e) => setFilters({ ...filters, experience: [parseInt(e.target.value) || 0, filters.experience[1]] })}
                            className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-300"
                        />
                        <input
                            type="number" min="0" max="25"
                            value={filters.experience[1]}
                            onChange={(e) => setFilters({ ...filters, experience: [filters.experience[0], parseInt(e.target.value) || 20] })}
                            className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-300"
                        />
                    </div>
                </div>

                {/* Expected Salary Slider */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Exp. Salary (LPA)</h4>
                        <span className="text-xs font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">{filters.expectedSalary[0]} - {filters.expectedSalary[1]}L</span>
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="number" min="0"
                            value={filters.expectedSalary[0]}
                            onChange={(e) => setFilters({ ...filters, expectedSalary: [parseFloat(e.target.value) || 0, filters.expectedSalary[1]] })}
                            className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-300"
                        />
                        <input
                            type="number" min="0"
                            value={filters.expectedSalary[1]}
                            onChange={(e) => setFilters({ ...filters, expectedSalary: [filters.expectedSalary[0], parseFloat(e.target.value) || 100] })}
                            className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-300"
                        />
                    </div>
                </div>

                {/* Saved Filter */}
                <button
                    onClick={() => setFilters({ ...filters, saved: !filters.saved })}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${filters.saved ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Star className={`w-5 h-5 ${filters.saved ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                        <span className="text-sm font-bold text-slate-700">Saved Applicants</span>
                    </div>
                    <span className="text-xs font-black text-slate-400">{savedCount}</span>
                </button>

                <div className="pt-4 space-y-6">
                    {Object.entries(filterOptions).map(([category, options]) => (
                        <div key={category} className="border-b border-slate-50 pb-6 last:border-0">
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between mb-4 group grow-0"
                            >
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                                    {category.replace(/([A-Z])/g, ' $1')}
                                </h4>
                                <ChevronDown className={`w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-transform ${expandedCategories.includes(category) ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {expandedCategories.includes(category) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden space-y-2.5"
                                    >
                                        {options.map(option => (
                                            <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                                                <div
                                                    onClick={() => toggleFilter(category === 'noticePeriod' ? 'noticePeriod' : category, option)}
                                                    className={`w-5 h-5 rounded-[0.5rem] border flex items-center justify-center transition-all ${(filters[category] || []).includes(option) ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 border-slate-100 group-hover:border-blue-400'
                                                        }`}
                                                >
                                                    {(filters[category] || []).includes(option) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{option}</span>
                                            </label>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="pb-24 lg:pb-10 relative">

            {/* Header & Advanced Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6 px-1 lg:px-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Applicant Intelligence</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Discover top talent with AI match scoring.</p>
                </div>
                <div className="w-full sm:shrink-0 sm:w-auto">
                    <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-bold text-slate-700 shadow-sm sm:min-w-[240px]"
                    >
                        {jobs.map(job => (
                            <option key={job._id} value={job._id}>{job.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center bg-white rounded-2xl border border-slate-200 shadow-md p-2 relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-blue-500" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, skill, university, past company, or experience..."
                    className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-slate-700 font-medium placeholder:font-normal placeholder:text-slate-400"
                />
                <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="lg:hidden ml-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600"
                >
                    <SlidersHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 relative items-start">

                {/* Desktop Filter Sidebar */}
                <div className="hidden lg:block w-72 shrink-0">
                    <FilterSidebar />
                </div>

                {/* Mobile Filter Drawer Setup ... (Omitted for brevity, standard framer-motion slide-in) */}
                <AnimatePresence>
                    {isMobileFiltersOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileFiltersOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden" />
                            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="fixed inset-y-0 left-0 w-[280px] bg-white z-[70] lg:hidden flex flex-col shadow-2xl">
                                <div className="flex justify-between items-center p-4 border-b">
                                    <h3 className="font-bold text-lg">Filters</h3>
                                    <button onClick={() => setIsMobileFiltersOpen(false)}><XCircle className="w-6 h-6 text-slate-400" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    <FilterSidebar />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Candidates List */}
                <div className="flex-1 w-full min-w-0 pb-16">

                    {/* Header Actions for List */}
                    <div className="flex items-center justify-between mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200 backdrop-blur-sm sticky top-[72px] lg:top-0 z-20">
                        <div className="flex items-center">
                            <label className="flex items-center space-x-3 cursor-pointer p-1">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedApplicants.length === processedApplicants.length && processedApplicants.length > 0 ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                    {selectedApplicants.length > 0 && <CheckCircle className={`w-3.5 h-3.5 ${selectedApplicants.length === processedApplicants.length ? 'text-white' : 'text-slate-400'}`} />}
                                </div>
                                <input type="checkbox" className="hidden" onChange={selectAll} checked={selectedApplicants.length === processedApplicants.length && processedApplicants.length > 0} />
                            </label>
                            <span className="text-sm font-semibold text-slate-600 ml-2">
                                {processedApplicants.length} {processedApplicants.length === 1 ? 'Candidate' : 'Candidates'} Found
                            </span>
                        </div>

                        {/* Sorting indicator text */}
                        <div className="hidden sm:flex items-center text-sm font-medium text-slate-500">
                            Ranked by Match Score
                        </div>
                    </div>

                    {/* Bulk Actions Floating Bar */}
                    <AnimatePresence>
                        {selectedApplicants.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center space-x-6 shrink-0"
                            >
                                <span className="font-bold border-r border-slate-700 pr-6">{selectedApplicants.length} Selected</span>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => executeBulkAction('Shortlisted')} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl text-sm font-bold transition-colors">Shortlist</button>
                                    <button onClick={() => executeBulkAction('Interview')} className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl text-sm font-bold transition-colors">Invite to Interview</button>
                                    <button onClick={() => executeBulkAction('Rejected')} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl text-sm font-bold transition-colors">Reject</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Candidates Grid/List */}
                    <div className="space-y-4">
                        <AnimatePresence>
                            {processedApplicants.map((app, index) => {
                                const scoreStyle = getMatchScoreStyles(app.matchScore);

                                return (
                                    <motion.div
                                        key={app.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                        className={`bg-white rounded-3xl border-2 ${selectedApplicants.includes(app.id) ? 'border-blue-500 shadow-xl ring-4 ring-blue-500/5' : 'border-slate-100 shadow-sm'} p-6 hover:shadow-2xl hover:border-blue-200 transition-all relative overflow-hidden group`}
                                    >
                                        {/* Rank & Score Badge */}
                                        <div className="absolute top-0 right-0 p-4 flex items-center gap-3">
                                            <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${scoreStyle.bg} text-white shadow-lg shadow-current/20`}>
                                                <Sparkles className="w-3.5 h-3.5" />
                                                {app.matchScore}% Match
                                            </div>
                                        </div>

                                        <div className="flex flex-col lg:flex-row gap-8">

                                            {/* Avatar & Selection Column */}
                                            <div className="flex lg:flex-col lg:items-center items-center gap-6 lg:w-32 shrink-0">
                                                <div className="relative group/avatar">
                                                    <img src={app.avatar} alt={app.name} className="w-20 h-20 rounded-[2rem] object-cover border-4 border-slate-50 shadow-inner group-hover/avatar:border-blue-100 transition-all" />
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); toggleSaveCandidate(app.id); }}
                                                        className={`absolute -top-2 -right-2 p-2 rounded-full shadow-lg border transition-all ${app.isSaved ? 'bg-amber-500 border-amber-600' : 'bg-white border-slate-100 hover:scale-110'
                                                            }`}
                                                    >
                                                        <Star className={`w-4 h-4 ${app.isSaved ? 'text-white fill-white' : 'text-slate-300'}`} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => toggleSelectApplicant(app.id)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedApplicants.includes(app.id)
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
                                                        }`}
                                                >
                                                    {selectedApplicants.includes(app.id) ? 'Selected' : 'Select'}
                                                </button>
                                            </div>

                                            {/* Central Info Column */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <Link to={`/recruiter/applicants/${app.id}`} className="text-2xl font-black text-slate-900 hover:text-blue-600 transition-colors tracking-tight">
                                                                {app.name}
                                                            </Link>
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                                                               ${app.status === 'Applied' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                    app.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                        app.status === 'Interview' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                                            app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                                'bg-slate-50 text-slate-700 border-slate-100'
                                                                }
                                                           `}>
                                                                {app.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-base font-bold text-slate-500 mt-1 flex items-center gap-2">
                                                            {app.role} <span className="text-slate-200">|</span> <span className="text-blue-600">{app.experience} Exp</span>
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        {app.resumeUrl && (
                                                            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
                                                                className="flex-1 sm:flex-none p-3 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-2xl border border-slate-100 transition-all active:scale-95 flex items-center justify-center"
                                                                title="Download Resume"
                                                            >
                                                                <Download className="w-5 h-5" />
                                                                <span className="ml-2 sm:hidden text-xs font-bold">Resume</span>
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => toggleMenu(app.id)}
                                                            className="p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all flex items-center justify-center"
                                                        >
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Recruitment Quick View Section */}
                                                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notice Period</p>
                                                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                            <Clock className="w-3.5 h-3.5 text-blue-500" /> {app.noticePeriod}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exp. Salary</p>
                                                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                            <Briefcase className="w-3.5 h-3.5 text-blue-500" /> {app.expectedSalary}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Education</p>
                                                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2 truncate">
                                                            <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> {app.education}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                            <MapPin className="w-3.5 h-3.5 text-blue-500" /> {app.location}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Skills Match */}
                                                <div className="flex flex-wrap gap-2 mt-6">
                                                    {app.skills.map(skill => {
                                                        const isMatched = selectedJob?.skills?.some(s => s.toLowerCase() === skill.toLowerCase());
                                                        return (
                                                            <span key={skill} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${isMatched
                                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                                    : 'bg-white text-slate-500 border border-slate-100'
                                                                }`}>
                                                                {skill}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {activeMenu === app.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-6 pt-6 border-t border-slate-50 flex flex-col sm:flex-row flex-wrap gap-3"
                                                >
                                                    <button onClick={() => updateStatus(app.id, 'Shortlisted')} className="px-4 py-3 sm:py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 w-full sm:w-auto">Shortlist</button>
                                                    <button onClick={() => updateStatus(app.id, 'Interview')} className="px-4 py-3 sm:py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all border border-amber-100 w-full sm:w-auto">Schedule Interview</button>
                                                    <button onClick={() => updateStatus(app.id, 'Rejected')} className="px-4 py-3 sm:py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 w-full sm:w-auto">Reject Candidate</button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}
