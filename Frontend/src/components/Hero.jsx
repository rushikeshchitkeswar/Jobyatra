import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroIllustration from '../assets/hero-illustration.png';
import LocationAutocomplete from './LocationAutocomplete';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (title) params.append('search', title);
        if (location) params.append('location', location);
        navigate(`/jobs?${params.toString()}`);
    };

    return (
        <section className="py-3 overflow-hidden bg-white">
            <div className="max-w-7xl mx-auto px-auto flex flex-col lg:flex-row items-center gap-10">
                <div className="flex-1 max-w-xl text-center lg:text-left">
                    <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 mb-6">
                        Find Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Dream Job</span> Today
                    </h1>
                    <p className="text-lg text-slate-500 leading-relaxed mb-10">
                        Search thousands of job opportunities from top companies and apply instantly to start your career journey.
                    </p>

                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row items-center bg-white border border-slate-200 rounded-2xl md:rounded-full p-2 shadow-xl shadow-slate-100 mb-10 gap-4 md:gap-0">
                        <div className="flex items-center px-4 flex-3 w-full group/search">
                            <Search className="text-slate-400 mr-3 group-hover/search:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Job Title or Keyword"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border-none outline-none w-full text-base font-bold text-slate-900 bg-transparent placeholder:text-slate-400"
                            />
                        </div>
                        <div className="hidden md:block w-px h-8 bg-slate-200 mx-4"></div>

                        <LocationAutocomplete
                            value={location}
                            onChange={setLocation}
                            placeholder="Location"
                        />

                        <button
                            onClick={handleSearch}
                            className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-1 rounded-xl md:rounded-full font-semibold text-base transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg shadow-indigo-100"
                        >
                            Search Jobs
                        </button>
                    </div>

                    <div className="flex items-center justify-center lg:justify-start gap-4">
                        {user?.role === 'recruiter' ? (
                            <button
                                onClick={() => navigate('/post-job')}
                                className="bg-slate-900 text-white px-7 py-3.5 rounded-lg font-semibold text-base transition-colors hover:bg-slate-800"
                            >
                                Post a Job
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/jobs')}
                                className="bg-indigo-600 text-white px-7 py-3.5 rounded-lg font-semibold text-base transition-colors hover:bg-indigo-700"
                            >
                                Browse Jobs
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/companies')}
                            className="text-slate-500 border border-slate-200 px-7 py-3.5 rounded-lg font-semibold text-base transition-all hover:bg-slate-50 hover:border-slate-300"
                        >
                            View Companies
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex justify-center">
                    <img src={heroIllustration} alt="Job Search Illustration" className="max-w-full h-auto" />
                </div>
            </div>
        </section>
    );
};

export default Hero;

