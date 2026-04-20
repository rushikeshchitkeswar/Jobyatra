import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const user1 = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150";
const user2 = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150";
const user3 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150";
const user4 = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150";

const testimonials = [
    {
        id: 1,
        name: "Rahul Sharma",
        role: "Frontend Developer",
        company: "Infosys",
        image: user1,
        review: "JobYatra made my job search super easy. Landed my first role in 3 weeks!",
        rating: 5,
        companyLogo: (
            <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold">Infosys</div>
        )
    },
    {
        id: 2,
        name: "Sneha Kapoor",
        role: "Software Engineer",
        company: "Google",
        image: user2,
        review: "I got multiple interviews with top companies. Highly recommended!",
        rating: 5,
        companyLogo: (
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                <svg viewBox="0 0 24 24" className="w-3 h-3"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span className="text-[10px] font-bold text-slate-600">Google</span>
            </div>
        )
    },
    {
        id: 3,
        name: "Amit Patel",
        role: "Data Analyst",
        company: "Microsoft",
        image: user3,
        review: "The best platform to kickstart your career. Simple & fast application process!",
        rating: 5,
        companyLogo: (
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M13 1h10v10H13z"/><path fill="#05a6f0" d="M1 13h10v10H1z"/><path fill="#ffba08" d="M13 13h10v10H13z"/></svg>
                <span className="text-[10px] font-bold text-slate-600">Microsoft</span>
            </div>
        )
    },
    {
        id: 4,
        name: "Priya Das",
        role: "UI/UX Designer",
        company: "Meta",
        image: user4,
        review: "The interface is so intuitive. I found a design role that matches my skills perfectly.",
        rating: 5,
        companyLogo: (
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="#0668E1"><path d="M16.92 6a4.83 4.83 0 0 0-3.6 1.5c-1.05 1.2-3.6 5.85-6.3 5.85a1.88 1.88 0 0 1-1.8-2.1c0-1.8 1.2-3.75 3-3.75a3.9 3.9 0 0 1 2.55 1.05l1.65-2.1A6.6 6.6 0 0 0 7.22 5C3.52 5 1 8.1 1 11.25a4.34 4.34 0 0 0 4.13 4.5 l.37.01c2.1 0 4.2-3.9 5.85-5.85a2.22 2.22 0 0 1 1.74-1.05c1.2 0 1.95.75 1.95 2.1 0 1.8-1.5 4.35-3.3 4.35a3.36 3.36 0 0 1-1.95-.75l-1.65 2.1A5.73 5.73 0 0 0 11.87 18c3.6 0 5.85-2.85 5.85-6.6a5.57 5.57 0 0 0-.8-2.85A4.65 4.65 0 0 0 16.92 6z"/></svg>
                <span className="text-[10px] font-bold text-slate-600">Meta</span>
            </div>
        )
    }
];

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % (testimonials.length - 2));
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + (testimonials.length - 2)) % (testimonials.length - 2));
    };

    return (
        <section className="py-20 bg-white overflow-visible">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2 
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-bold text-slate-900 mb-2"
                    >
                        What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Users Say</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-base text-slate-500 max-w-xl mx-auto"
                    >
                        Thousands of job seekers have successfully started their careers using JobYatra.
                    </motion.p>
                </div>

                <div className="relative pt-12 overflow-visible">
                    <div className="overflow-visible">
                        <motion.div 
                            className="flex gap-6 overflow-visible"
                            animate={{ x: `-${currentIndex * (100 / (window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1) + 1.5)}%` }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        >
                            {testimonials.map((t, idx) => (
                                <motion.div
                                    key={t.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    className="min-w-full md:min-w-[48%] lg:min-w-[31.5%] bg-white rounded-[1.5rem] p-6 pt-12 shadow-md shadow-slate-100 border border-slate-50 flex flex-col relative group transition-all duration-300 overflow-visible"
                                >
                                    {/* Overlapping Profile Image - Fixed Alignment */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                        <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl overflow-visible">
                                            <img 
                                                src={t.image} 
                                                alt={t.name} 
                                                className="w-full h-full rounded-full object-cover border-4 border-white block" 
                                            />
                                        </div>
                                    </div>

                                    {/* Star Rating */}
                                    <div className="flex justify-center gap-1 mb-4">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <Star key={i} size={16} fill="#FACC15" className="text-[#FACC15]" />
                                        ))}
                                    </div>

                                    {/* Review content */}
                                    <p className="text-slate-600 text-center text-base leading-relaxed mb-6 italic line-clamp-2">
                                        "{t.review}"
                                    </p>

                                    {/* Footer Info */}
                                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100">
                                                <img src={t.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{t.name}</h4>
                                                <p className="text-slate-400 text-[10px] font-medium uppercase">{t.role}</p>
                                            </div>
                                        </div>
                                        <div className="scale-90 opacity-80 group-hover:scale-100 group-hover:opacity-100 transition-all">
                                            {t.companyLogo}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex items-center justify-center gap-4 mt-10">
                        <button 
                            onClick={prev}
                            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex gap-1.5">
                            {[0, 1].map((i) => (
                                <div 
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-6 bg-indigo-600' : 'w-1.5 bg-indigo-100'}`}
                                />
                            ))}
                        </div>

                        <button 
                            onClick={next}
                            className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
