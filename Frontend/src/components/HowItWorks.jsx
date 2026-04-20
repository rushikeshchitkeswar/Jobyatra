import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Send, Briefcase } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "Create Account",
        description: "Sign up and create your professional profile in minutes.",
        icon: UserPlus,
        color: "from-blue-500 to-indigo-600",
        delay: 0
    },
    {
        id: 2,
        title: "Search Jobs",
        description: "Explore thousands of job opportunities from top companies.",
        icon: Search,
        color: "from-indigo-500 to-purple-600",
        delay: 0.2
    },
    {
        id: 3,
        title: "Apply for Jobs",
        description: "Apply instantly to jobs that match your skills and interests.",
        icon: Send,
        color: "from-purple-500 to-pink-600",
        delay: 0.4
    },
    {
        id: 4,
        title: "Get Hired",
        description: "Connect with recruiters and start your career journey.",
        icon: Briefcase,
        color: "from-indigo-600 to-blue-700",
        delay: 0.6
    }
];

const HowItWorks = () => {
    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl -ml-32 -mt-32"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl -mr-32 -mb-32"></div>

            <div className="max-w-7xl mx-auto px-10">
                <div className="text-center mb-20">
                    <motion.h2 
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-bold text-slate-900 mb-4"
                    >
                        How <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">JobYatra</span> Works
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-slate-500 max-w-2xl mx-auto"
                    >
                        Follow these simple steps to land your dream job.
                    </motion.p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 -translate-y-16 z-0"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: step.delay }}
                                    whileHover={{ y: -10 }}
                                    className="group"
                                >
                                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center h-full transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/50">
                                        {/* Icon Container */}
                                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300 relative`}>
                                            <Icon size={32} />
                                            {/* Number Badge */}
                                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm shadow-md border border-slate-50">
                                                {step.id}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
