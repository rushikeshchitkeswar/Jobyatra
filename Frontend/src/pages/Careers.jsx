import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';

const CareerOpening = ({ title, department, location, type }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div className="flex items-center gap-6 text-center md:text-left">
        <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
          <Briefcase size={28} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" /> {department}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> {location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {type}
            </span>
          </div>
        </div>
      </div>
      
      <button className="w-full md:w-auto px-8 py-3.5 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group whitespace-nowrap">
        Apply Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

const Careers = () => {
  const openings = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote / Mumbai",
      type: "Full-time"
    },
    {
      title: "Backend Engineer (Node.js)",
      department: "Engineering",
      location: "Bangalore, India",
      type: "Full-time"
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "Talent Acquisition Specialist",
      department: "People Ops",
      location: "Mumbai, India",
      type: "Full-time"
    }
  ];

  return (
    <PageLayout 
      title="Join the" 
      gradientText="JobYatra Team" 
      subtitle="We're on a mission to reshape the future of hiring. Come join our passionate team."
    >
      <div className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Inclusive Culture", desc: "We believe in diversity and making everyone feel at home." },
          { title: "Work from Anywhere", desc: "Choose your workspace - remote or our vibrant offices." },
          { title: "Growth & Learning", desc: "Generous budget for books, courses, and certifications." }
        ].map((benefit, idx) => (
          <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
            <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Current Openings</h2>
          <span className="bg-primary/10 text-primary text-sm font-bold px-4 py-2 rounded-full">
            {openings.length} Positions
          </span>
        </div>
        
        <div className="space-y-6">
          {openings.map((opening, idx) => (
            <CareerOpening key={idx} {...opening} />
          ))}
        </div>
      </div>

      <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Don't see a fit?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future roles.
          </p>
          <button className="px-10 py-5 rounded-2xl font-bold bg-gradient-jobyatra text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">
            Send General Application
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Careers;
