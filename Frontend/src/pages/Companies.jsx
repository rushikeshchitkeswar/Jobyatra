import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Building, Briefcase, ExternalLink, ArrowRight, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const CompanyCard = ({ company, featured = false }) => {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className={`relative group bg-white p-8 rounded-[2.5rem] border ${featured ? 'border-primary/20 bg-gradient-to-br from-white to-primary/5' : 'border-slate-100'} shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center gap-6 mb-8 relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center p-4 border border-slate-100 shadow-inner group-hover:rotate-3 transition-transform">
          <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="flex-grow">
          <h3 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
            {company.name}
            {featured && <Star size={18} className="text-yellow-400 fill-yellow-400" />}
          </h3>
          <div className="flex flex-wrap gap-3">
             <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{company.industry}</span>
             <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-tighter">{company.size}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <MapPin size={16} className="text-primary/60" /> {company.location}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Briefcase size={16} className="text-secondary/60" /> {company.openJobs} Open Jobs
        </div>
        {featured && (
          <div className="col-span-2 flex items-center gap-2 text-slate-400 text-xs italic mt-2">
            <Users size={14} /> "Great culture and work-life balance"
          </div>
        )}
      </div>

      <div className="mt-auto flex gap-3 relative z-10">
        <Link 
          to={`/companies/${company.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="flex-grow gradient-btn py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all text-white"
        >
          View Company <ArrowRight size={18} />
        </Link>
      </div>
    </motion.div>
  );
};

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const companiesList = [
    {
      name: "Google",
      industry: "Technology",
      location: "Bangalore",
      size: "10k+ Employees",
      openJobs: 45,
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\"G\"_logo.svg",
      featured: true
    },
    {
      name: "Microsoft",
      industry: "Software",
      location: "Hyderabad",
      size: "10k+ Employees",
      openJobs: 32,
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
      featured: true
    },
    {
      name: "Amazon",
      industry: "E-commerce",
      location: "Pune",
      size: "10k+ Employees",
      openJobs: 28,
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      featured: true
    },
    {
        name: "Netflix",
        industry: "Entertainment",
        location: "Mumbai",
        size: "5k+ Employees",
        openJobs: 12,
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
        featured: false
    },
    {
        name: "Meta",
        industry: "Social Media",
        location: "Remote",
        size: "10k+ Employees",
        openJobs: 18,
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
        featured: false
    },
    {
        name: "Spotify",
        industry: "Digital Media",
        location: "Bangalore",
        size: "2k+ Employees",
        openJobs: 9,
        logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_with_text.svg",
        featured: false
    }
  ];

  const featuredCompanies = companiesList.filter(c => c.featured);
  const filteredCompanies = companiesList.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <PageLayout
      title="Discover Companies"
      gradientText="Hiring Now"
      subtitle="Explore leading companies, learn about their culture, and find your next career opportunity with top brands worldwide."
    >
      {/* Search Section */}
      <div className="max-w-4xl mx-auto mb-24 -mt-8 relative z-20">
        <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 transition-all group focus-within:shadow-primary/10">
          <div className="flex-grow flex items-center gap-4 px-6">
            <Search size={24} className="text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by company name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 text-lg font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
            />
          </div>
          <button className="gradient-btn px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-white">
            Search
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-8">
           {['Technology', 'Design', 'Fintech', 'Health'].map((cat, idx) => (
             <button key={idx} className="px-6 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-bold text-sm hover:border-primary hover:text-primary hover:bg-white transition-all">
               {cat}
             </button>
           ))}
        </div>
      </div>

      {/* Featured Companies */}
      {!searchTerm && (
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-1.5 h-8 bg-gradient-jobyatra rounded-full" />
            <h2 className="text-3xl font-black text-slate-900">Featured <span className="gradient-text">Brands</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredCompanies.map((company, idx) => (
              <CompanyCard key={idx} company={company} featured />
            ))}
          </div>
        </section>
      )}

      {/* Directory Section */}
      <section>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-8 bg-slate-900 rounded-full" />
             <h2 className="text-3xl font-black text-slate-900">Company Directory</h2>
          </div>
          <select className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-700 outline-none focus:border-primary">
            <option>Top Rated</option>
            <option>Most Jobs</option>
            <option>Newest</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {filteredCompanies.map((company, idx) => (
             <CompanyCard key={idx} company={company} />
           ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-32 p-16 bg-slate-900 rounded-[4rem] text-center text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] group-hover:scale-150 transition-transform duration-1000" />
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-6">Are you hiring talent?</h2>
          <p className="text-white/60 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of world-class companies finding their future workforce on JobYatra.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/post-job" className="gradient-btn px-12 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-primary/40 hover:scale-105 transition-all text-white">
              Create Partner Account
            </Link>
            <button className="px-12 py-5 rounded-2xl border border-slate-700 bg-slate-800 font-black text-lg hover:bg-slate-700 transition-all text-white">
              View Solutions
            </button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Companies;
