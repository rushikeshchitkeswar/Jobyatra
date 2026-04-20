import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Rocket, Target, Users, Award } from 'lucide-react';

const About = () => {
  const stats = [
    { label: "Active Jobs", value: "10K+" },
    { label: "Elite Recruiters", value: "500+" },
    { label: "Candidates Placed", value: "1M+" },
    { label: "Countries Served", value: "15+" }
  ];

  const values = [
    { 
      icon: <Users className="text-primary" />, 
      title: "People First", 
      desc: "We focus on human connections behind every CV and job posting." 
    },
    { 
      icon: <Target className="text-secondary" />, 
      title: "Pure Transparency", 
      desc: "Clear communication is the bridge between talent and opportunity." 
    },
    { 
      icon: <Rocket className="text-primary" />, 
      title: "Innovation Driven", 
      desc: "Using AI to match the right talent with the right culture." 
    },
    { 
      icon: <Award className="text-secondary" />, 
      title: "Excellence Always", 
      desc: "We set high standards for our platform and our community." 
    }
  ];

  return (
    <PageLayout 
      title="Empowering careers," 
      gradientText="connecting talent." 
      subtitle="JobYatra is more than a job portal. We are a bridge between dreams and reality for millions."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Journey</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Founded in 2024, JobYatra started with a simple belief: the right job can change a life. Traditional hiring was broken, slow, and impersonal. We set out to fix it.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Today, using advanced AI-matching and a community-first approach, we've helped over a million professionals find not just a job, but a career they love.
          </p>
          <button className="gradient-btn px-10 py-5 rounded-2xl font-bold shadow-xl shadow-primary/20">
            Join Our Mission
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-jobyatra opacity-10 blur-[100px] rounded-full" />
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop" 
            alt="Team working together" 
            className="rounded-[2.5rem] shadow-2xl relative z-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-4xl font-bold gradient-text mb-2">{stat.value}</p>
            <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">These principles guide every decision we make at JobYatra.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {values.map((value, idx) => (
          <div key={idx} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              {React.cloneElement(value.icon, { size: 32 })}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
            <p className="text-slate-600 leading-relaxed">{value.desc}</p>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default About;
