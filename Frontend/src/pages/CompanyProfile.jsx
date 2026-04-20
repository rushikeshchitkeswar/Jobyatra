import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Briefcase, 
  Star, 
  ShieldCheck, 
  Zap, 
  Globe, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  Heart,
  Share2,
  Trophy,
  Coffee,
  Laptop
} from 'lucide-react';

const CompanyProfile = () => {
  const { companyName } = useParams();
  
  // Mock data fetching based on URL param
  const company = {
    name: companyName ? companyName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Google",
    industry: "Technology & Software",
    location: "Bangalore, India",
    size: "100k+ global employees",
    rating: 4.8,
    reviews: 1240,
    openJobs: 45,
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\"G\"_logo.svg",
    description: "Our mission is to organize the world's information and make it universally accessible and useful. We aim to organize the world's information and make it universally accessible and useful.",
    mission: "To provide access to the world's information in one click.",
    culture: "We're a community where experts in different fields can come together to solve complex problems and create meaningful change.",
    benefits: [
      { icon: <Heart className="text-red-500" />, title: "Premium Health", desc: "Comprehensive global coverage" },
      { icon: <Coffee className="text-secondary" />, title: "Free Meals", desc: "World-class office catering" },
      { icon: <Laptop className="text-primary" />, title: "Remote Work", desc: "Flexible workstation options" },
      { icon: <Trophy className="text-green-500" />, title: "Career Growth", desc: "Generous learning stipends" }
    ],
    jobs: [
        { title: "Senior Software Engineer", tags: ["Remote", "L5"], salary: "45-65 LPA" },
        { title: "Product Designer", tags: ["Mumbai", "Full-time"], salary: "30-45 LPA" },
        { title: "Growth Marketing Lead", tags: ["Remote", "Contract"], salary: "25-35 LPA" }
    ]
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-16 pb-20">
      
      {/* 1. Header Section */}
      <section className="relative h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-jobyatra opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30" />
        
        <div className="container mx-auto px-6 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-8 w-full">
            {/* Logo Container */}
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="w-32 h-32 rounded-[2rem] bg-white p-6 shadow-2xl border border-white/20 flex-shrink-0 -mb-12"
            >
              <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
            </motion.div>
            
            <div className="flex-grow text-white pb-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl md:text-5xl font-black mb-3">{company.name} {company.name === 'Google' && <CheckCircle2 size={32} className="inline text-blue-400 align-middle ml-2" />}</h1>
                <div className="flex flex-wrap gap-6 text-white/80 font-bold uppercase tracking-widest text-xs">
                  <span className="flex items-center gap-2"><Globe size={16} /> {company.industry}</span>
                  <span className="flex items-center gap-2"><MapPin size={16} /> {company.location}</span>
                  <span className="flex items-center gap-2 font-sans tracking-normal"><Star size={16} className="text-yellow-400 fill-yellow-400" /> {company.rating} ({company.reviews} reviews)</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4"
              >
                <button className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-black shadow-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2">
                   <Plus size={20} /> Follow
                </button>
                <button className="p-3.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl backdrop-blur-md transition-all">
                   <Share2 size={20} />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main content layout */}
      <div className="container mx-auto px-6 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* 3. Company Overview Section */}
            <motion.section 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Building size={24} className="text-primary" /> About {company.name}
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>{company.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-black text-slate-900 mb-2 uppercase tracking-widest text-xs">Mission</h4>
                    <p className="text-sm">{company.mission}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-black text-slate-900 mb-2 uppercase tracking-widest text-xs">Culture</h4>
                    <p className="text-sm">{company.culture}</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 4. Open Jobs Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-slate-900">Open Positions</h2>
                 <Link to="/jobs" className="text-primary font-bold flex items-center gap-2 hover:underline">
                    View All Jobs <ArrowRight size={18} />
                 </Link>
              </div>
              <div className="space-y-4">
                {company.jobs.map((job, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800">{job.title}</h3>
                        <div className="flex gap-4 mt-1">
                          {job.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-xs font-bold text-slate-400 border-r border-slate-200 pr-4 last:border-0">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 w-full md:w-auto">
                        <span className="text-slate-900 font-black whitespace-nowrap">{job.salary}</span>
                        <button className="flex-grow md:flex-grow-0 px-6 py-3 rounded-xl bg-slate-100 font-bold group-hover:bg-slate-900 group-hover:text-white transition-all">Apply Now</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 5. Benefits Section */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-8">Perks & Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {company.benefits.map((benefit, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 flex gap-6 group hover:translate-y-[-5px] transition-transform">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center p-4 border border-slate-100 group-hover:scale-110 transition-transform">
                      {React.cloneElement(benefit.icon, { size: 32 })}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 mb-1">{benefit.title}</h4>
                      <p className="text-sm text-slate-500">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Dynamic Sidebar */}
          <aside className="space-y-10">
            {/* Quick Stats */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
               <h3 className="text-xl font-black text-slate-900 mb-8">Company Stats</h3>
               <ul className="space-y-8">
                 <li className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Company Size</p>
                      <p className="text-slate-900 font-black">{company.size}</p>
                    </div>
                 </li>
                 <li className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary">
                      <Zap size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Response Rate</p>
                      <p className="text-slate-900 font-black">98% (High)</p>
                    </div>
                 </li>
                 <li className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-green-500/5 flex items-center justify-center text-green-600">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Verified Hiring</p>
                      <p className="text-slate-900 font-black">Elite Status</p>
                    </div>
                 </li>
               </ul>
               <button className="w-full mt-10 p-5 bg-slate-50 border border-slate-200 text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all flex justify-center items-center gap-2">
                 Visit Website <ExternalLink size={18} />
               </button>
            </div>

            {/* Recent Review Card */}
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
               <div className="relative z-10 text-center">
                  <div className="flex justify-center gap-1 mb-6 text-yellow-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="currentColor" />)}
                  </div>
                  <p className="text-lg italic font-medium leading-relaxed mb-8 opacity-80">
                    "JobYatra has been a game-changer for our hiring. The talent quality is exceptional."
                  </p>
                  <div className="flex items-center justify-center gap-4">
                     <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden">
                       <img src="https://i.pravatar.cc/150?u=techlead" alt="Lead" />
                     </div>
                     <div className="text-left">
                       <p className="font-black text-sm">Sarah Jenkins</p>
                       <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest">VP Engineering</p>
                     </div>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
