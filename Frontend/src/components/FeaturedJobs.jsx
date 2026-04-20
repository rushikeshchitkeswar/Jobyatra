import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, DollarSign, ChevronRight, Briefcase, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const FeaturedJobs = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await apiService.getJobs({ limit: 6, sort: 'newest' });
                if (response.success) {
                    setJobs(response.data);
                } else {
                    setError('Failed to load jobs');
                }
            } catch (err) {
                console.error('Error fetching featured jobs:', err);
                setError('Unable to fetch jobs at this time');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const getLogoColor = (companyName) => {
        const colors = [
            "bg-red-50 text-red-500",
            "bg-blue-50 text-blue-500",
            "bg-orange-50 text-orange-500",
            "bg-emerald-50 text-emerald-500",
            "bg-purple-50 text-purple-500",
            "bg-indigo-50 text-indigo-500",
            "bg-pink-50 text-pink-500",
            "bg-slate-100 text-slate-800"
        ];
        const index = companyName.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <section className="py-20 bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-10">
                <div className="text-center mb-16">
                    <motion.h2 
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-bold text-slate-900 mb-4"
                    >
                        Featured Jobs
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-slate-500"
                    >
                        Discover the latest job opportunities from top companies.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Fetching the latest opportunities...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-slate-800 font-bold text-xl mb-2">Oops! Something went wrong</p>
                        <p className="text-slate-500">{error}</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Briefcase className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium text-lg">No featured jobs found at the moment.</p>
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence>
                            {jobs.slice(0, 6).map((job) => (
                                <motion.div
                                    key={job._id}
                                    variants={cardVariants}
                                    whileHover={{ 
                                        y: -10, 
                                        scale: 1.02,
                                        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)"
                                    }}
                                    className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 group flex flex-col h-full"
                                >
                                    {/* Card Header: Company Logo & Title */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-xl ${getLogoColor(job.company)}`}>
                                            {job.company?.[0]?.toUpperCase() || 'J'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                {job.title}
                                            </h3>
                                            <div className="flex items-center text-slate-500 mt-1">
                                                <Building size={16} className="mr-1" />
                                                <span className="text-sm font-medium">{job.company}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Job Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center text-slate-500">
                                            <MapPin size={16} className="mr-2 text-indigo-500" />
                                            <span className="text-xs font-medium">{job.location}</span>
                                        </div>
                                        <div className="flex items-center text-slate-500">
                                            <Briefcase size={16} className="mr-2 text-purple-500" />
                                            <span className="text-xs font-medium">{job.experience}</span>
                                        </div>
                                        <div className="flex items-center text-slate-500 col-span-2">
                                            <DollarSign size={16} className="mr-2 text-emerald-500" />
                                            <span className="text-xs font-semibold text-slate-700">{job.salary}</span>
                                        </div>
                                    </div>

                                    {/* Skills Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6 flex-grow">
                                        {job.skills?.slice(0, 3).map((skill, index) => (
                                            <span 
                                                key={index} 
                                                className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {(job.skills?.length > 3) && (
                                            <span className="px-3 py-1 text-slate-400 text-[10px] font-bold">
                                                +{job.skills.length - 3} more
                                            </span>
                                        )}
                                    </div>

                                    {/* Card Footer: Posted Time & Apply Button */}
                                    <div className="mt-auto">
                                        <div className="flex items-center text-slate-400 mb-4">
                                            <Clock size={14} className="mr-1" />
                                            <span className="text-[10px] font-medium italic">
                                                Posted {formatDistanceToNow(new Date(job.postedDate || job.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    navigate('/login');
                                                } else {
                                                    navigate('/jobs');
                                                }
                                            }}
                                            className="w-full py-3 px-6 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 group/btn relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100"
                                        >
                                            <span className="relative z-10">Apply Now</span>
                                            <ChevronRight size={18} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default FeaturedJobs;
