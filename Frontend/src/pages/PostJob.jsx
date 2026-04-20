import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { FileText, Send, Building, Target, Search, Users, ShieldCheck, Zap } from 'lucide-react';

const PostJob = () => {
  return (
    <PageLayout 
      title="Hire top" 
      gradientText="global talent" 
      subtitle="Reach millions of qualified professionals and find the perfect match for your team."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-10 flex items-center gap-3">
              <FileText className="text-primary" /> Post a Job Opening
            </h2>
            
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Job Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Job Category</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none">
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Job Type</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none">
                    <option>Full-time</option>
                    <option>Remote</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mumbai or Remote"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Salary Range</label>
                  <input 
                    type="text" 
                    placeholder="e.g. $80k - $120k"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Job Description</label>
                <textarea 
                  rows="8" 
                  placeholder="Describe the role and responsibilities..."
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full gradient-btn py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all text-lg group"
              >
                Publish Job Listing <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 text-white shadow-xl shadow-slate-200">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Zap className="text-primary" /> Why JobYatra?
            </h3>
            <ul className="space-y-8">
              <li className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10">
                  <Search size={24} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Smart Matching</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Our AI matches you with candidates that fit your culture and requirements.</p>
                </div>
              </li>
              <li className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-secondary border border-white/10">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Elite Talent Pool</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Reach over 1M+ vetted professionals actively looking for new opportunities.</p>
                </div>
              </li>
              <li className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-green-500 border border-white/10">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Verified Profiles</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">We verify skills and experience to save you time in the screening process.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-jobyatra p-10 rounded-[2.5rem] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Enterprise Plus</h3>
              <p className="text-white/80 mb-8 leading-relaxed">Looking for mass hiring solutions? Our premium package offers unlimited postings and priority support.</p>
              <button className="w-full bg-white text-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PostJob;
